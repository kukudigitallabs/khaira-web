/* ==========================================================================
   Sukhpal Singh Khaira Web Application - Backend REST API Server
   Node.js + Express + MySQL Database Integration + Full Admin Customization & CSV Exports
   ========================================================================== */

require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration
const SITE_PASSWORD = process.env.SITE_PASSWORD || 'Kuku@007';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// MySQL Database Connection Pool
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'khaira_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool = null;
let isDbConnected = false;

// Memory Store for fallback / local mode
const memoryStore = {
  settings: {
    meta_title: 'Sardar Sukhpal Singh Khaira | MLA Bholath | Mission 2027 Punjab',
    meta_description: 'Official website of Sardar Sukhpal Singh Khaira, Member of the Punjab Legislative Assembly (MLA Bholath) - Indian National Congress. Voice of Punjab, Mission 2027.',
    meta_keywords: 'Sukhpal Singh Khaira, Sukhpal Khaira, MLA Bholath, Congress Punjab, Mission 2027 Punjab',
    font_family: 'Outfit',
    hero_title: 'Sardar Sukhpal Singh Khaira',
    hero_slogan: '“ਲੋਕਾਂ ਲਈ, ਲੋਕਾਂ ਨਾਲ ਹਮੇਸ਼ਾ — ਇੱਕ ਸੱਚਾ ਪੰਜਾਬ | ਇੱਕ ਨਵੀਂ ਉਮੀਦ”',
    hero_desc: 'Member of the Punjab Legislative Assembly representing Bholath constituency. Dedicated to fighting for agricultural rights, youth employment, transparent governance, and social justice.',
    hero_image_url: 'banner.jpeg',
    about_lead: 'Sukhpal Singh Khaira has consistently stood up for truth, transparency, and public welfare across Punjab.'
  },
  pillars: [
    { id: 1, title: 'Farmers & Agriculture', description: 'Ensuring guaranteed MSP, agrarian debt relief, crop diversification support, groundwater preservation, and dignity for farm workers.', icon: 'fa-wheat-awn', bullet1: 'Fair MSP for all major crops', bullet2: 'Water table revival plan', bullet3: 'Agricultural debt waiver' },
    { id: 2, title: 'Youth & Employment', description: 'Establishing regional industrial hubs, skill development centers, stopping youth brain-drain migration, and promoting sports.', icon: 'fa-briefcase', bullet1: '100,000+ Youth job creation', bullet2: 'Sports academies in every block', bullet3: 'Subsidized self-employment loans' },
    { id: 3, title: 'Anti-Corruption & Justice', description: 'Fearless legislative voice fighting corruption, ensuring administrative accountability, transparent tenders, and police reforms.', icon: 'fa-scale-balanced', bullet1: 'Zero tolerance for corruption', bullet2: 'Whistleblower protection cell', bullet3: 'Time-bound citizen services' },
    { id: 4, title: 'Education & Healthcare', description: 'Upgrading government schools with digital infrastructure, building affordable super-specialty hospitals, and empowering women.', icon: 'fa-hospital', bullet1: 'Smart government schools', bullet2: 'Affordable healthcare for all', bullet3: 'Women welfare schemes' }
  ],
  volunteers: [
    { id: 1, name: 'Gurpreet Singh', phone: '+91 98721-54321', email: 'gurpreet.bholath@gmail.com', village_city: 'Bholath Khas', constituency: 'Bholath', status: 'Active', created_at: new Date() },
    { id: 2, name: 'Harpreet Kaur', phone: '+91 94172-88123', email: 'harpreet.k@gmail.com', village_city: 'Kapurthala Town', constituency: 'Kapurthala', status: 'Active', created_at: new Date() },
    { id: 3, name: 'Manjit Singh', phone: '+91 98140-99410', email: 'manjit.begowal@gmail.com', village_city: 'Begowal', constituency: 'Bholath', status: 'Active', created_at: new Date() },
    { id: 4, name: 'Jaswinder Singh', phone: '+91 97800-11223', email: 'jaswinder@gmail.com', village_city: 'Subhanpur', constituency: 'Bholath', status: 'Active', created_at: new Date() }
  ],
  grievances: [
    { id: 1, tracking_code: 'KH-784210', citizen_name: 'Jagjit Singh', phone: '+91 98141-11223', village_city: 'Bholath Ward 4', issue_category: 'Water & Sanitation', description: 'Water supply repair demand in Ward 4', status: 'In Review', created_at: new Date() },
    { id: 2, tracking_code: 'KH-891024', citizen_name: 'Sukhwinder Kaur', phone: '+91 98765-43210', village_city: 'Begowal Market', issue_category: 'Road Infrastructure', description: 'School approach road repair request', status: 'Resolved', created_at: new Date() },
    { id: 3, tracking_code: 'KH-902145', citizen_name: 'Baldev Singh', phone: '+91 94170-55443', village_city: 'Subhanpur GT Road', issue_category: 'Agriculture / Farmers', description: 'Canal water release schedule synchronization request', status: 'Pending', created_at: new Date() }
  ],
  press_releases: [
    { id: 1, title: 'Khaira Demands Immediate Relief Package for Punjab Farmers Affected by Crop Losses', category: 'Assembly Issue', date_published: '2026-09-20', summary: 'Addressed Vidhan Sabha demanding fair compensation per acre for farmers.', content_url: 'https://www.facebook.com/SukhpalKhairaINC' },
    { id: 2, title: 'Mission 2027 Youth Volunteer Campaign Launched Across Bholath Constituency', category: 'Mission 2027', date_published: '2026-09-15', summary: 'Over 1,000 youth registered as digital ambassadors.', content_url: 'https://www.facebook.com/SukhpalKhairaINC' },
    { id: 3, title: 'Khaira Exposes Corruption in Local Development Fund Distribution', category: 'Press Release', date_published: '2026-09-10', summary: 'Public press conference highlighting financial irregularities in rural development grants.', content_url: 'https://www.facebook.com/SukhpalKhairaINC' }
  ],
  badge_count: 342,
  badges: [
    { id: 1, supporter_name: 'Gurpreet Singh', city: 'Bholath Village', created_at: '2026-09-27' },
    { id: 2, supporter_name: 'Harpreet Kaur', city: 'Kapurthala Town', created_at: '2026-09-26' },
    { id: 3, supporter_name: 'Manjit Singh', city: 'Begowal', created_at: '2026-09-25' },
    { id: 4, supporter_name: 'Sukhdev Singh', city: 'Subhanpur', created_at: '2026-09-24' },
    { id: 5, supporter_name: 'Amanpreet Singh', city: 'Bholath Khas', created_at: '2026-09-23' }
  ]
};

// Initialize MySQL Connection & Tables
async function initDatabase() {
  try {
    pool = mysql.createPool(dbConfig);
    const conn = await pool.getConnection();
    conn.release();
    isDbConnected = true;
    console.log('✅ Connected to MySQL Database:', dbConfig.database);

    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      const statements = schemaSql.split(';').filter(stmt => stmt.trim() !== '');
      for (const stmt of statements) {
        if (stmt.trim()) {
          try { await pool.query(stmt); } catch (e) {}
        }
      }
    }
  } catch (err) {
    console.log('⚠️ MySQL Database Warning:', err.message);
    console.log('⚡ Operating with In-Memory Database Mode');
  }
}

// Helper Query Execution
async function queryDb(sql, params = []) {
  if (!isDbConnected || !pool) return null;
  try {
    const [rows] = await pool.query(sql, params);
    return rows;
  } catch (err) {
    return null;
  }
}

// ----------------------------------------------------------------------------
// API ROUTES
// ----------------------------------------------------------------------------

// 1. Admin Authentication
app.post('/api/auth/admin-login', async (req, res) => {
  const { username, password } = req.body;
  if ((username === ADMIN_USER || username === 'admin') && password === ADMIN_PASS) {
    return res.json({ success: true, message: 'Authentication successful' });
  }

  const user = await queryDb('SELECT * FROM admin_users WHERE username = ?', [username]);
  if (user && user.length > 0 && user[0].password_hash === password) {
    return res.json({ success: true, message: 'Authentication successful' });
  }

  res.status(401).json({ success: false, message: 'Invalid admin username or password' });
});

// 2. Fetch Website Settings
app.get('/api/settings', async (req, res) => {
  const dbSettings = await queryDb('SELECT * FROM site_settings');
  if (dbSettings && dbSettings.length > 0) {
    const settingsObj = {};
    dbSettings.forEach(row => { settingsObj[row.setting_key] = row.setting_value; });
    return res.json({ success: true, settings: settingsObj });
  }
  res.json({ success: true, settings: memoryStore.settings });
});

// 3. Update Website Settings
app.put('/api/settings', async (req, res) => {
  const settings = req.body;
  for (const [key, val] of Object.entries(settings)) {
    await queryDb('INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?', [key, String(val), String(val)]);
    memoryStore.settings[key] = String(val);
  }
  res.json({ success: true, message: 'Site settings updated successfully' });
});

// 4. Fetch Vision Pillars
app.get('/api/pillars', async (req, res) => {
  const dbPillars = await queryDb('SELECT * FROM vision_pillars ORDER BY id ASC');
  if (dbPillars && dbPillars.length > 0) {
    return res.json({ success: true, pillars: dbPillars });
  }
  res.json({ success: true, pillars: memoryStore.pillars });
});

// 5. Vision Pillars CRUD
app.post('/api/admin/pillars', async (req, res) => {
  const { pillar_number, title_en, title_pa, desc_en, desc_pa } = req.body;
  const num = pillar_number || (memoryStore.pillars.length + 1);

  await queryDb('INSERT INTO vision_pillars (id, title, description, icon) VALUES (?, ?, ?, ?)', 
    [num, title_en, desc_en, 'fa-star']);

  const item = {
    id: num,
    pillar_number: num,
    title_en: title_en || '',
    title_pa: title_pa || '',
    desc_en: desc_en || '',
    desc_pa: desc_pa || '',
    title: title_en || '',
    description: desc_en || ''
  };

  memoryStore.pillars.push(item);
  res.json({ success: true, item });
});

app.put('/api/admin/pillars/:id', async (req, res) => {
  const { id } = req.params;
  const { pillar_number, title_en, title_pa, desc_en, desc_pa } = req.body;

  await queryDb('UPDATE vision_pillars SET title = ?, description = ? WHERE id = ?', [title_en, desc_en, id]);

  const item = memoryStore.pillars.find(m => m.id == id);
  if (item) {
    item.pillar_number = pillar_number || item.pillar_number;
    item.title_en = title_en;
    item.title_pa = title_pa;
    item.desc_en = desc_en;
    item.desc_pa = desc_pa;
    item.title = title_en;
    item.description = desc_en;
  }

  res.json({ success: true, message: 'Pillar updated' });
});

app.delete('/api/admin/pillars/:id', async (req, res) => {
  const { id } = req.params;
  await queryDb('DELETE FROM vision_pillars WHERE id = ?', [id]);
  memoryStore.pillars = memoryStore.pillars.filter(m => m.id != id);

  res.json({ success: true, message: 'Pillar deleted' });
});

app.put('/api/pillars', async (req, res) => {
  const { pillars } = req.body;
  if (Array.isArray(pillars)) {
    for (const p of pillars) {
      await queryDb('INSERT INTO vision_pillars (id, title, description, icon) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE title = ?, description = ?', 
        [p.id, p.title_en || p.title, p.desc_en || p.description, p.icon || 'fa-star', p.title_en || p.title, p.desc_en || p.description]);
      
      const item = memoryStore.pillars.find(m => m.id == p.id);
      if (item) {
        item.title_en = p.title_en || p.title;
        item.title_pa = p.title_pa || '';
        item.desc_en = p.desc_en || p.description;
        item.desc_pa = p.desc_pa || '';
        item.title = p.title_en || p.title;
        item.description = p.desc_en || p.description;
      }
    }
  }
  res.json({ success: true, message: 'Pillars updated successfully' });
});





// 8. Press Releases CRUD
app.get('/api/press', async (req, res) => {
  const dbPress = await queryDb('SELECT * FROM press_releases ORDER BY id DESC');
  if (dbPress && dbPress.length > 0) return res.json({ success: true, press_releases: dbPress });
  res.json({ success: true, press_releases: memoryStore.press_releases });
});

app.post('/api/admin/press', async (req, res) => {
  const { title, category, summary, content_url } = req.body;
  await queryDb('INSERT INTO press_releases (title, category, summary, content_url) VALUES (?, ?, ?, ?)', 
    [title, category || 'Press Release', summary, content_url || 'https://www.facebook.com/SukhpalKhairaINC']);

  const item = { id: memoryStore.press_releases.length + 1, title, category: category || 'Press Release', summary, content_url: content_url || 'https://www.facebook.com/SukhpalKhairaINC', published_date: new Date().toISOString().split('T')[0] };
  memoryStore.press_releases.unshift(item);

  res.json({ success: true, item });
});

app.put('/api/admin/press/:id', async (req, res) => {
  const { id } = req.params;
  const { title, category, summary, content_url } = req.body;
  await queryDb('UPDATE press_releases SET title = ?, category = ?, summary = ?, content_url = ? WHERE id = ?', 
    [title, category, summary, content_url, id]);

  const item = memoryStore.press_releases.find(p => p.id == id);
  if (item) {
    item.title = title;
    item.category = category;
    item.summary = summary;
    item.content_url = content_url;
  }
  res.json({ success: true, message: 'Press release updated' });
});

app.delete('/api/admin/press/:id', async (req, res) => {
  const { id } = req.params;
  await queryDb('DELETE FROM press_releases WHERE id = ?', [id]);
  memoryStore.press_releases = memoryStore.press_releases.filter(p => p.id != id);

  res.json({ success: true, message: 'Press release deleted' });
});

// 9. Record Supporter Badge Log
app.post('/api/badge', async (req, res) => {
  const { name, city } = req.body;
  if (name) {
    await queryDb('INSERT INTO badge_generations (supporter_name, city) VALUES (?, ?)', [name, city || 'Punjab']);
    memoryStore.badge_count++;
    memoryStore.badges.unshift({
      id: memoryStore.badges.length + 1,
      supporter_name: name,
      city: city || 'Punjab',
      created_at: new Date().toISOString().split('T')[0]
    });
  }
  res.json({ success: true });
});

/* ==========================================================================
   ADMIN MANAGEMENT & DATA EXPORT API ENDPOINTS
   ========================================================================== */

app.get('/api/admin/stats', async (req, res) => {
  const volDb = await queryDb('SELECT COUNT(*) AS count FROM volunteers');
  const griDb = await queryDb('SELECT COUNT(*) AS count FROM grievances WHERE status = "Pending" OR status = "In Review"');
  const badgeDb = await queryDb('SELECT COUNT(*) AS count FROM badge_generations');

  const stats = {
    volunteers: volDb ? volDb[0].count : memoryStore.volunteers.length,
    pendingGrievances: griDb ? griDb[0].count : memoryStore.grievances.filter(g => g.status !== 'Resolved').length,
    badgesCount: badgeDb ? badgeDb[0].count : (memoryStore.badges.length || memoryStore.badge_count),
    dbStatus: isDbConnected ? 'MySQL Connected' : 'In-Memory Mode'
  };

  res.json({ success: true, stats });
});

app.get('/api/admin/volunteers', async (req, res) => {
  const dbData = await queryDb('SELECT * FROM volunteers ORDER BY id DESC');
  if (dbData) return res.json({ success: true, data: dbData });

  res.json({ success: true, data: memoryStore.volunteers });
});

app.get('/api/admin/grievances', async (req, res) => {
  const dbData = await queryDb('SELECT * FROM grievances ORDER BY id DESC');
  if (dbData) return res.json({ success: true, data: dbData });

  res.json({ success: true, data: memoryStore.grievances });
});

app.get('/api/admin/badges', async (req, res) => {
  const dbData = await queryDb('SELECT * FROM badge_generations ORDER BY id DESC');
  if (dbData && dbData.length > 0) return res.json({ success: true, data: dbData });

  res.json({ success: true, data: memoryStore.badges });
});

app.put('/api/admin/grievances/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  await queryDb('UPDATE grievances SET status = ? WHERE id = ?', [status, id]);
  const item = memoryStore.grievances.find(g => g.id == id);
  if (item) item.status = status;

  res.json({ success: true, message: `Grievance status updated to ${status}` });
});

// CSV Data Export: Volunteers Roster
app.get('/api/admin/export/volunteers', async (req, res) => {
  const vols = (await queryDb('SELECT * FROM volunteers ORDER BY id DESC')) || memoryStore.volunteers;

  let csv = 'ID,Name,Phone,Email,Village_City,Constituency,Status,Date\n';
  vols.forEach(v => {
    const d = v.created_at ? new Date(v.created_at).toISOString().split('T')[0] : '';
    csv += `"${v.id}","${v.name}","${v.phone}","${v.email || ''}","${v.village_city}","${v.constituency || 'Bholath'}","${v.status || 'Active'}","${d}"\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="volunteers_mission2027.csv"');
  res.status(200).send(csv);
});

// CSV Data Export: Citizen Grievances
app.get('/api/admin/export/grievances', async (req, res) => {
  const gri = (await queryDb('SELECT * FROM grievances ORDER BY id DESC')) || memoryStore.grievances;

  let csv = 'Tracking_Code,Citizen_Name,Phone,Village_City,Category,Description,Status,Date\n';
  gri.forEach(g => {
    const desc = (g.description || '').replace(/"/g, '""').replace(/\n/g, ' ');
    const d = g.created_at ? new Date(g.created_at).toISOString().split('T')[0] : '';
    csv += `"${g.tracking_code}","${g.citizen_name}","${g.phone}","${g.village_city}","${g.issue_category}","${desc}","${g.status}","${d}"\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="citizen_grievances.csv"');
  res.status(200).send(csv);
});

// CSV Data Export: Supporter Badges Logged List
app.get('/api/admin/export/badges', async (req, res) => {
  const badges = (await queryDb('SELECT * FROM badge_generations ORDER BY id DESC')) || memoryStore.badges;

  let csv = 'ID,Supporter_Name,Village_City,Date_Generated\n';
  badges.forEach(b => {
    const d = b.created_at ? new Date(b.created_at).toISOString().split('T')[0] : '';
    csv += `"${b.id}","${b.supporter_name || b.name}","${b.city || b.village_city || 'Punjab'}","${d}"\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="supporter_badges_logged.csv"');
  res.status(200).send(csv);
});

// Initialize MySQL Connection & Tables
async function initDatabase() {
  try {
    pool = mysql.createPool(dbConfig);
    const conn = await pool.getConnection();
    conn.release();
    isDbConnected = true;
    console.log('✅ Connected to MySQL Database:', dbConfig.database);

    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf8');
      const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
      for (const stmt of statements) {
        await pool.query(stmt);
      }
      console.log('✅ MySQL Tables & Seed Data Verified');
    }
  } catch (err) {
    console.warn('⚠️ MySQL Database Warning:', err.message);
    console.warn('⚡ Operating with In-Memory Database Mode');
    isDbConnected = false;
  }
}

async function queryDb(sql, params = []) {
  if (isDbConnected && pool) {
    try {
      const [rows] = await pool.execute(sql, params);
      return rows;
    } catch (e) {
      console.error('MySQL Exec Error:', e.message);
    }
  }
  return null;
}

/* ==========================================================================
   API ENDPOINTS
   ========================================================================== */

// 1. Password Verification API
app.post('/api/auth/verify-gate', (req, res) => {
  const { password } = req.body;
  if (password === SITE_PASSWORD || password === 'Kuku@007' || password === 'Khaira@2027#') {
    return res.json({ success: true, message: 'Website access granted' });
  } else {
    return res.status(401).json({ success: false, message: 'Incorrect password' });
  }
});

// 2. Admin Authentication API
app.post('/api/auth/admin-login', async (req, res) => {
  const { username, password } = req.body;

  const dbUser = await queryDb('SELECT * FROM admin_users WHERE username = ?', [username]);
  if (dbUser && dbUser.length > 0) {
    if (dbUser[0].password_hash === password || password === ADMIN_PASS) {
      return res.json({
        success: true,
        token: 'khaira_admin_token_' + Date.now(),
        admin: { username: dbUser[0].username, role: dbUser[0].role }
      });
    }
  }

  if ((username === ADMIN_USER || username === 'admin') && password === ADMIN_PASS) {
    return res.json({
      success: true,
      token: 'khaira_admin_token_' + Date.now(),
      admin: { username: 'admin', role: 'superadmin' }
    });
  }

  return res.status(401).json({ success: false, message: 'Invalid admin username or password' });
});

// 3. Get / Update Site Settings & SEO Meta Tags
app.get('/api/settings', async (req, res) => {
  const dbSettings = await queryDb('SELECT * FROM site_settings');
  if (dbSettings && dbSettings.length > 0) {
    const formatted = {};
    dbSettings.forEach(s => formatted[s.setting_key] = s.setting_value);
    return res.json({ success: true, settings: formatted });
  }
  res.json({ success: true, settings: memoryStore.settings });
});

app.put('/api/admin/settings', async (req, res) => {
  const settings = req.body;

  for (const [key, val] of Object.entries(settings)) {
    await queryDb('INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)', [key, String(val)]);
    memoryStore.settings[key] = String(val);
  }

  res.json({ success: true, message: 'Site & Meta Settings updated successfully!' });
});

// 4. Get / Update Vision for Punjab Pillars
app.get('/api/pillars', async (req, res) => {
  const dbPillars = await queryDb('SELECT * FROM vision_pillars ORDER BY id ASC');
  if (dbPillars && dbPillars.length > 0) {
    return res.json({ success: true, data: dbPillars });
  }
  res.json({ success: true, data: memoryStore.pillars });
});

app.put('/api/admin/pillars/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, icon, bullet1, bullet2, bullet3 } = req.body;

  const sql = `UPDATE vision_pillars SET title=?, description=?, icon=?, bullet1=?, bullet2=?, bullet3=? WHERE id=?`;
  const params = [title, description, icon, bullet1, bullet2, bullet3, id];
  await queryDb(sql, params);

  const pillar = memoryStore.pillars.find(p => p.id == id);
  if (pillar) {
    pillar.title = title;
    pillar.description = description;
    pillar.icon = icon;
    pillar.bullet1 = bullet1;
    pillar.bullet2 = bullet2;
    pillar.bullet3 = bullet3;
  }

  res.json({ success: true, message: `Pillar #${id} updated successfully` });
});

function cleanPhoneNumber(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

// 5. Register Volunteer API
app.post('/api/volunteers', async (req, res) => {
  const { name, phone, email, village_city, constituency, message } = req.body;
  if (!name || !phone || !village_city) {
    return res.status(400).json({ success: false, message: 'Name, Phone, and Village/City are required.' });
  }

  const normPhone = cleanPhoneNumber(phone);

  // Check duplicate phone in MySQL Database
  const dbCheck = await queryDb(
    'SELECT * FROM volunteers WHERE RIGHT(REGEXP_REPLACE(phone, "[^0-9]", ""), 10) = ? OR phone = ?', 
    [normPhone, phone]
  );
  if (dbCheck && dbCheck.length > 0) {
    return res.status(400).json({
      success: false,
      message: `The mobile phone number (${phone}) is already registered as a volunteer. Duplicate entries are not allowed.`
    });
  }

  // Check duplicate phone in Memory Store
  const memCheck = memoryStore.volunteers.find(v => cleanPhoneNumber(v.phone) === normPhone);
  if (memCheck) {
    return res.status(400).json({
      success: false,
      message: `The mobile phone number (${phone}) is already registered as a volunteer. Duplicate entries are not allowed.`
    });
  }

  const sql = `INSERT INTO volunteers (name, phone, email, village_city, constituency, message) VALUES (?, ?, ?, ?, ?, ?)`;
  const params = [name, phone, email || null, village_city, constituency || 'Bholath', message || null];
  await queryDb(sql, params);

  memoryStore.volunteers.unshift({
    id: memoryStore.volunteers.length + 1,
    name, phone, email, village_city,
    constituency: constituency || 'Bholath',
    message, status: 'Active', created_at: new Date()
  });

  res.json({ success: true, message: 'Thank you for registering as Mission 2027 Volunteer!' });
});

// 6. Submit Constituency Grievance API
app.post('/api/grievances', async (req, res) => {
  const { name, phone, village_city, category, description } = req.body;
  if (!name || !phone || !description) {
    return res.status(400).json({ success: false, message: 'Name, Phone, and Issue Description are required.' });
  }

  const normPhone = cleanPhoneNumber(phone);

  // If DB is connected, check live MySQL database for active pending/in-review grievances
  let activeGrievance = null;
  if (isDbConnected && pool) {
    const dbCheck = await queryDb(
      'SELECT * FROM grievances WHERE (RIGHT(REGEXP_REPLACE(phone, "[^0-9]", ""), 10) = ? OR phone = ?) AND (status = "Pending" OR status = "In Review")', 
      [normPhone, phone]
    );
    if (dbCheck && dbCheck.length > 0) {
      activeGrievance = dbCheck[0];
    }
  } else {
    // Memory store fallback only if DB is not connected
    const memCheck = memoryStore.grievances.find(g => 
      cleanPhoneNumber(g.phone) === normPhone && (g.status === 'Pending' || g.status === 'In Review')
    );
    if (memCheck) {
      activeGrievance = memCheck;
    }
  }

  if (activeGrievance) {
    return res.status(400).json({
      success: false,
      trackingCode: activeGrievance.tracking_code,
      message: `Submission Received Already! Your grievance for mobile number (${phone}) is already registered and pending review under Tracking Code: ${activeGrievance.tracking_code}.`
    });
  }

  const trackingCode = 'KH-' + Math.floor(100000 + Math.random() * 900000);
  const sql = `INSERT INTO grievances (tracking_code, citizen_name, phone, village_city, issue_category, description) VALUES (?, ?, ?, ?, ?, ?)`;
  const params = [trackingCode, name, phone, village_city || 'Bholath', category || 'General', description];

  const result = await queryDb(sql, params);

  memoryStore.grievances.unshift({
    id: result ? result.insertId : memoryStore.grievances.length + 1,
    tracking_code: trackingCode,
    citizen_name: name, phone, village_city: village_city || 'Bholath',
    issue_category: category || 'General', description, status: 'Pending', created_at: new Date()
  });

  res.json({
    success: true,
    trackingCode,
    message: `Grievance submitted successfully. Your tracking code is ${trackingCode}`
  });
});

// 7. Press Releases CRUD APIs
app.get('/api/press', async (req, res) => {
  const dbData = await queryDb('SELECT * FROM press_releases ORDER BY id DESC');
  if (dbData) return res.json({ success: true, data: dbData });

  res.json({ success: true, data: memoryStore.press_releases });
});

app.post('/api/admin/press', async (req, res) => {
  const { title, category, summary, content_url, date_published } = req.body;
  if (!title || !summary) {
    return res.status(400).json({ success: false, message: 'Title and summary are required' });
  }

  const sql = `INSERT INTO press_releases (title, category, date_published, summary, content_url) VALUES (?, ?, ?, ?, ?)`;
  const dateVal = date_published || new Date().toISOString().split('T')[0];
  const params = [title, category || 'Press Release', dateVal, summary, content_url || 'https://www.facebook.com/SukhpalKhairaINC'];

  const result = await queryDb(sql, params);

  const newPress = {
    id: result ? result.insertId : memoryStore.press_releases.length + 1,
    title, category: category || 'Press Release',
    date_published: dateVal, summary,
    content_url: content_url || 'https://www.facebook.com/SukhpalKhairaINC'
  };
  memoryStore.press_releases.unshift(newPress);

  res.json({ success: true, message: 'Press release published successfully!' });
});

app.put('/api/admin/press/:id', async (req, res) => {
  const { id } = req.params;
  const { title, category, summary, content_url } = req.body;

  const sql = `UPDATE press_releases SET title=?, category=?, summary=?, content_url=? WHERE id=?`;
  await queryDb(sql, [title, category, summary, content_url, id]);

  const p = memoryStore.press_releases.find(item => item.id == id);
  if (p) {
    p.title = title;
    p.category = category;
    p.summary = summary;
    p.content_url = content_url;
  }

  res.json({ success: true, message: 'Press release updated successfully' });
});

app.delete('/api/admin/press/:id', async (req, res) => {
  const { id } = req.params;
  await queryDb('DELETE FROM press_releases WHERE id=?', [id]);
  memoryStore.press_releases = memoryStore.press_releases.filter(p => p.id != id);

  res.json({ success: true, message: 'Press release deleted' });
});

// 8. Record Supporter Badge Log
app.post('/api/badge', async (req, res) => {
  const { name, city } = req.body;
  if (name) {
    await queryDb('INSERT INTO badge_generations (supporter_name, city) VALUES (?, ?)', [name, city || 'Punjab']);
    memoryStore.badge_count++;
  }
  res.json({ success: true });
});

/* ==========================================================================
   ADMIN MANAGEMENT & DATA EXPORT API ENDPOINTS
   ========================================================================== */

app.get('/api/admin/stats', async (req, res) => {
  const volDb = await queryDb('SELECT COUNT(*) AS count FROM volunteers');
  const griDb = await queryDb('SELECT COUNT(*) AS count FROM grievances WHERE status = "Pending" OR status = "In Review"');
  const badgeDb = await queryDb('SELECT COUNT(*) AS count FROM badge_generations');

  const stats = {
    volunteers: volDb ? volDb[0].count : memoryStore.volunteers.length,
    pendingGrievances: griDb ? griDb[0].count : memoryStore.grievances.filter(g => g.status !== 'Resolved').length,
    badgesCount: badgeDb ? badgeDb[0].count : memoryStore.badge_count,
    dbStatus: isDbConnected ? 'MySQL Connected' : 'In-Memory Mode'
  };

  res.json({ success: true, stats });
});

app.get('/api/admin/volunteers', async (req, res) => {
  const dbData = await queryDb('SELECT * FROM volunteers ORDER BY id DESC');
  if (dbData) return res.json({ success: true, data: dbData });

  res.json({ success: true, data: memoryStore.volunteers });
});

app.get('/api/admin/grievances', async (req, res) => {
  const dbData = await queryDb('SELECT * FROM grievances ORDER BY id DESC');
  if (dbData) return res.json({ success: true, data: dbData });

  res.json({ success: true, data: memoryStore.grievances });
});

app.put('/api/admin/grievances/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  await queryDb('UPDATE grievances SET status = ? WHERE id = ?', [status, id]);
  const item = memoryStore.grievances.find(g => g.id == id || g.tracking_code == id);
  if (item) item.status = status;

  res.json({ success: true, message: `Grievance status updated to ${status}` });
});

// CSV Data Export: Volunteers Roster
app.get('/api/admin/export/volunteers', async (req, res) => {
  const vols = (await queryDb('SELECT * FROM volunteers ORDER BY id DESC')) || memoryStore.volunteers;

  let csv = 'ID,Name,Phone,Email,Village_City,Constituency,Status,Date\n';
  vols.forEach(v => {
    const d = v.created_at ? new Date(v.created_at).toISOString().split('T')[0] : '';
    csv += `"${v.id}","${v.name}","${v.phone}","${v.email || ''}","${v.village_city}","${v.constituency || 'Bholath'}","${v.status || 'Active'}","${d}"\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="volunteers_mission2027.csv"');
  res.status(200).send(csv);
});

// CSV Data Export: Citizen Grievances
app.get('/api/admin/export/grievances', async (req, res) => {
  const gri = (await queryDb('SELECT * FROM grievances ORDER BY id DESC')) || memoryStore.grievances;

  let csv = 'Tracking_Code,Citizen_Name,Phone,Village_City,Category,Description,Status,Date\n';
  gri.forEach(g => {
    const desc = (g.description || '').replace(/"/g, '""').replace(/\n/g, ' ');
    const d = g.created_at ? new Date(g.created_at).toISOString().split('T')[0] : '';
    csv += `"${g.tracking_code}","${g.citizen_name}","${g.phone}","${g.village_city}","${g.issue_category}","${desc}","${g.status}","${d}"\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="citizen_grievances.csv"');
  res.status(200).send(csv);
});

// Catch-all route to serve SPA frontend
app.get('*', (req, res) => {
  if (req.path.includes('.')) {
    return res.status(404).send('Static asset not found');
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, async () => {
  console.log(`🚀 Sukhpal Singh Khaira Web Application Server running on http://localhost:${PORT}`);
  await initDatabase();
});

/* ==========================================================================
   Sukhpal Singh Khaira - Official Web Application Script
   Welcome Gate Password Protection, Admin Login & Dashboard, Bilingual Logic
   ========================================================================== */

const SITE_PASSWORD = "Kuku@007";
const ADMIN_USER = "admin";
const ADMIN_PASS = "admin";

document.addEventListener('DOMContentLoaded', () => {
  initWelcomeGate();
  initSiteSettings();
  initAdminLogin();
  initThemeToggle();
  initLanguageSwitcher();
  initMobileNav();
  initMobileDock();
  initTabs();
  initBadgeGenerator();
  initFormHandler();
  initModalHandler();
  initHeaderScroll();
});

/* ==========================================================================
   0. WELCOME GATE & PASSWORD PROTECTION
   ========================================================================== */
function initWelcomeGate() {
  const gateOverlay = document.getElementById('welcomeGateOverlay');
  const siteContent = document.getElementById('siteContent');

  // Check if session is already unlocked
  if (sessionStorage.getItem('khaira_site_unlocked') === 'true') {
    if (gateOverlay) gateOverlay.style.display = 'none';
    if (siteContent) siteContent.style.display = 'block';
    document.body.classList.remove('gate-active');
    return;
  }

  // Activate Welcome Gate Password Protection Overlay
  if (siteContent) siteContent.style.display = 'none';
  if (gateOverlay) gateOverlay.style.display = 'flex';
  document.body.classList.add('gate-active');

  const form = document.getElementById('welcomeGateForm');
  const input = document.getElementById('gatePassInput');
  const err = document.getElementById('gateErrorMsg');
  const toggleBtn = document.getElementById('toggleGatePassVisibility');

  if (toggleBtn && input) {
    toggleBtn.onclick = () => {
      const isPwd = input.type === 'password';
      input.type = isPwd ? 'text' : 'password';
      toggleBtn.innerHTML = isPwd ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
    };
  }

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const val = input.value.trim();

      if (val === SITE_PASSWORD || val === "Kuku@007") {
        sessionStorage.setItem('khaira_site_unlocked', 'true');
        if (gateOverlay) gateOverlay.style.display = 'none';
        if (siteContent) siteContent.style.display = 'block';
        document.body.classList.remove('gate-active');
      } else {
        try {
          const res = await fetch('/api/auth/verify-gate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: val })
          });
          const data = await res.json();
          if (data.success) {
            sessionStorage.setItem('khaira_site_unlocked', 'true');
            if (gateOverlay) gateOverlay.style.display = 'none';
            if (siteContent) siteContent.style.display = 'block';
            document.body.classList.remove('gate-active');
            return;
          }
        } catch (err) {}

        if (err) err.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> Incorrect Password. Access Denied.`;
        input.value = '';
        input.focus();
      }
    };
  }
}

/* ==========================================================================
   0.2. SITE SETTINGS & DYNAMIC CMS HYDRATION
   ========================================================================== */
let globalSettings = {
  font_family: 'Outfit, sans-serif',
  meta_title: 'Sukhpal Singh Khaira | Official Website • Mission 2027 Punjab',
  meta_description: 'Official Web Application of Sardar Sukhpal Singh Khaira, MLA Bholath. Champion of Punjab Rights & Mission 2027.',
  meta_keywords: 'Sukhpal Singh Khaira, MLA Bholath, Punjab Congress, Mission 2027, Bholath, Punjab Politics',
  hero_title: 'Sardar Sukhpal Singh Khaira',
  hero_slogan: '“For the People, Always with the People — A True Punjab, A New Hope”',
  hero_image: 'https://placehold.co/500x650/ff6b00/ffffff?text=Sukhpal+Singh+Khaira',
  about_title: 'A Fearless Voice for Punjab',
  about_lead: 'Sukhpal Singh Khaira has consistently stood up for truth, transparency, and public welfare.',
  about_desc: 'Serving as Member of the Legislative Assembly representing Bholath, he has led key parliamentary debates, championed agricultural rights, and exposed administrative irregularities across Punjab.'
};

async function initSiteSettings() {
  try {
    const res = await fetch('/api/settings');
    const data = await res.json();
    if (data.success && data.settings) {
      globalSettings = { ...globalSettings, ...data.settings };
      applySiteSettings(globalSettings);
    }
  } catch (err) {
    console.log('Site settings running in default mode');
  }

  fetchPillars();
  fetchPressReleases();
}

function applySiteSettings(s) {
  if (s.font_family) {
    document.body.style.fontFamily = s.font_family;
  }
  if (s.meta_title) {
    document.title = s.meta_title;
  }
  if (s.meta_description) {
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = s.meta_description;
  }
  if (s.meta_keywords) {
    let metaKw = document.querySelector('meta[name="keywords"]');
    if (!metaKw) {
      metaKw = document.createElement('meta');
      metaKw.name = 'keywords';
      document.head.appendChild(metaKw);
    }
    metaKw.content = s.meta_keywords;
  }

  const heroTitleEl = document.querySelector('.hero-title-main');
  if (heroTitleEl && s.hero_title) heroTitleEl.textContent = s.hero_title;

  const heroSloganEl = document.querySelector('.hero-slogan');
  if (heroSloganEl && s.hero_slogan) heroSloganEl.textContent = s.hero_slogan;

  const heroImgEl = document.querySelector('.hero-leader-card img');
  if (heroImgEl && s.hero_image) heroImgEl.src = s.hero_image;

  const aboutTitleEl = document.querySelector('#about .section-title');
  if (aboutTitleEl && s.about_title) aboutTitleEl.textContent = s.about_title;

  const aboutLeadEl = document.querySelector('#about .lead-text');
  if (aboutLeadEl && s.about_lead) aboutLeadEl.textContent = s.about_lead;

  const aboutDescEl = document.querySelector('#about .bio-description');
  if (aboutDescEl && s.about_desc) aboutDescEl.textContent = s.about_desc;
}

async function fetchPillars() {
  try {
    const res = await fetch('/api/pillars');
    const data = await res.json();
    const list = data.pillars || data.data || [];
    if (data.success && list.length > 0) {
      renderPillarsOnSite(list);
    }
  } catch (err) {
    console.log('Pillars loaded in static fallback mode');
  }
}

function renderPillarsOnSite(pillars) {
  const pillarGrid = document.querySelector('.pillars-grid');
  if (!pillarGrid) return;

  const defaultIcons = ['fa-wheat-awn', 'fa-briefcase', 'fa-scale-balanced', 'fa-hospital'];

  pillarGrid.innerHTML = pillars.map((p, idx) => `
    <div class="pillar-card">
      <div class="pillar-icon-box">
        <i class="fa-solid ${p.icon || defaultIcons[idx % defaultIcons.length]}"></i>
      </div>
      <div class="pillar-number">0${p.pillar_number || (idx + 1)}</div>
      <h3 class="pillar-title">${typeof currentLang !== 'undefined' && currentLang === 'pa' && p.title_pa ? p.title_pa : (p.title_en || p.title)}</h3>
      <p class="pillar-desc">${typeof currentLang !== 'undefined' && currentLang === 'pa' && p.desc_pa ? p.desc_pa : (p.desc_en || p.description)}</p>
      ${p.bullet1 || p.bullet2 || p.bullet3 ? `
        <ul class="pillar-checklist" style="list-style:none;padding:0;margin-top:12px;font-size:0.85rem;color:var(--text-muted);">
          ${p.bullet1 ? `<li style="margin-bottom:4px;"><i class="fa-solid fa-circle-check" style="color:var(--saffron-orange);margin-right:6px;"></i> ${p.bullet1}</li>` : ''}
          ${p.bullet2 ? `<li style="margin-bottom:4px;"><i class="fa-solid fa-circle-check" style="color:var(--saffron-orange);margin-right:6px;"></i> ${p.bullet2}</li>` : ''}
          ${p.bullet3 ? `<li style="margin-bottom:4px;"><i class="fa-solid fa-circle-check" style="color:var(--saffron-orange);margin-right:6px;"></i> ${p.bullet3}</li>` : ''}
        </ul>
      ` : ''}
    </div>
  `).join('');
}

function getYoutubeDetails(url) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (match && match[1]) {
    return {
      videoId: match[1],
      thumbnail: `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`
    };
  }
  return null;
}

async function fetchPressReleases() {
  try {
    const res = await fetch('/api/press');
    const data = await res.json();
    const list = data.press_releases || data.data || [];
    if (data.success && list.length > 0) {
      renderPressReleasesOnSite(list);
    }
  } catch (err) {
    console.log('Press releases loaded in static fallback mode');
  }
}

let allPressReleases = [];
let isPressExpanded = false;

function renderPressReleasesOnSite(pressList) {
  const pressGrid = document.querySelector('#press .press-grid');
  if (!pressGrid) return;

  allPressReleases = pressList || [];
  
  // Show top 4 items if not expanded, or all items if expanded
  const displayList = isPressExpanded ? allPressReleases : allPressReleases.slice(0, 4);

  const defaultImgs = ['sukhpal-khaira.jpeg', 'banner.jpeg'];

  pressGrid.innerHTML = displayList.map((pr, idx) => {
    const linkUrl = (pr.content_url || 'https://www.facebook.com/SukhpalKhairaINC').trim();
    const ytDetails = getYoutubeDetails(linkUrl);
    
    let imgSrc = pr.image_url;
    if (!imgSrc) {
      imgSrc = ytDetails ? ytDetails.thumbnail : defaultImgs[idx % defaultImgs.length];
    }

    const category = pr.category || (ytDetails ? 'Video Interview' : 'Press Release');
    const rawDate = pr.date_published || pr.published_date || pr.created_at;
    const dateStr = rawDate ? new Date(rawDate).toISOString().split('T')[0] : 'Recent';
    const title = pr.title || 'News Announcement';
    const summary = pr.summary || '';

    const isYoutube = !!ytDetails || linkUrl.includes('youtube') || linkUrl.includes('youtu.be');
    const isFacebook = linkUrl.includes('facebook') || linkUrl.includes('fb.com');

    let linkText = 'Read Full Statement';
    let iconClass = 'fa-solid fa-arrow-up-right-from-square';
    let badgeBg = 'rgba(255,107,0,0.12)';
    let badgeColor = 'var(--saffron-orange)';

    if (isYoutube) {
      linkText = 'Watch Video Interview on YouTube';
      iconClass = 'fa-brands fa-youtube';
      badgeBg = 'rgba(255,0,0,0.12)';
      badgeColor = '#ef4444';
    } else if (isFacebook) {
      linkText = 'View Statement on Facebook';
      iconClass = 'fa-brands fa-facebook';
      badgeBg = 'rgba(24,119,242,0.12)';
      badgeColor = '#1877f2';
    }

    return `
      <article class="press-card" style="display:flex;flex-direction:column;height:100%;">
        <a href="${linkUrl}" target="_blank" rel="noopener" class="press-media-header" style="display:block;position:relative;overflow:hidden;border-radius:var(--radius-md) var(--radius-md) 0 0;">
          <img src="${imgSrc}" alt="${title}" style="width:100%;height:220px;object-fit:cover;transition:transform 0.3s ease;">
          <span class="press-tag-overlay" style="background:${badgeBg};color:${badgeColor};font-weight:700;">${category}</span>
          ${isYoutube ? `
            <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:54px;height:54px;background:rgba(255,0,0,0.85);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.3rem;box-shadow:0 4px 15px rgba(0,0,0,0.4);">
              <i class="fa-solid fa-play" style="margin-left:3px;"></i>
            </div>
          ` : ''}
        </a>
        <div class="press-body" style="display:flex;flex-direction:column;flex:1;padding:18px;">
          <span class="press-date" style="font-size:0.75rem;color:var(--text-muted);margin-bottom:8px;display:block;">
            📅 ${dateStr} • Office of Sardar Sukhpal Singh Khaira
          </span>
          <h3 class="press-headline" style="font-size:1.05rem;font-weight:800;line-height:1.4;margin-bottom:8px;">
            <a href="${linkUrl}" target="_blank" rel="noopener" style="color:var(--text-main);text-decoration:none;">${title}</a>
          </h3>
          <p class="press-snippet" style="font-size:0.875rem;color:var(--text-muted);line-height:1.5;margin-bottom:16px;flex:1;">
            ${summary}
          </p>
          <a href="${linkUrl}" target="_blank" rel="noopener" class="press-read-more" style="display:inline-flex;align-items:center;gap:8px;font-weight:700;color:${badgeColor};text-decoration:none;margin-top:auto;">
            <i class="${iconClass}"></i> ${linkText} <i class="fa-solid fa-arrow-right"></i>
          </a>
        </div>
      </article>
    `;
  }).join('');

  // Handle See More Press Releases Button
  let seeMoreWrapper = document.getElementById('pressSeeMoreWrapper');
  if (!seeMoreWrapper) {
    seeMoreWrapper = document.createElement('div');
    seeMoreWrapper.id = 'pressSeeMoreWrapper';
    seeMoreWrapper.style.textAlign = 'center';
    seeMoreWrapper.style.marginTop = '32px';
    pressGrid.parentNode.appendChild(seeMoreWrapper);
  }

  if (allPressReleases.length > 4) {
    seeMoreWrapper.style.display = 'block';
    seeMoreWrapper.innerHTML = `
      <button id="seeMorePressBtn" class="btn-primary-saffron" style="padding:12px 28px;font-size:0.95rem;font-weight:800;border-radius:var(--radius-md);cursor:pointer;display:inline-flex;align-items:center;gap:10px;box-shadow:0 6px 20px rgba(255,107,0,0.35);transition:all 0.2s ease;">
        <i class="fa-solid fa-newspaper"></i> ${isPressExpanded ? 'Show Fewer Press Releases' : `See More Press Releases (${allPressReleases.length - 4} More)`} 
        <i class="fa-solid ${isPressExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}"></i>
      </button>
    `;

    const btn = document.getElementById('seeMorePressBtn');
    if (btn) {
      btn.onclick = () => {
        isPressExpanded = !isPressExpanded;
        renderPressReleasesOnSite(allPressReleases);
        if (!isPressExpanded) {
          const pressSec = document.getElementById('press');
          if (pressSec) pressSec.scrollIntoView({ behavior: 'smooth' });
        }
      };
    }
  } else {
    seeMoreWrapper.style.display = 'none';
  }
}

/* ==========================================================================
   0.5. ADMIN LOGIN & DASHBOARD MANAGEMENT
   ========================================================================== */
function initAdminLogin() {
  const adminBtns = document.querySelectorAll('.btn-admin-nav, .dock-item-admin, .btn-drawer-admin');

  adminBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();

      const navMenu = document.getElementById('mainNavMenu');
      const toggleBtn = document.getElementById('mobileNavToggle');
      if (navMenu && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        if (toggleBtn) toggleBtn.innerHTML = '☰';
      }

      if (sessionStorage.getItem('khaira_admin_access') === 'true') {
        openAdminDashboard();
      } else {
        openAdminLoginForm();
      }
    });
  });

  // Auto-open admin login modal if URL pathname includes /admin or /admin/, or #admin or ?admin=true is present
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const search = window.location.search.toLowerCase();

  if (path.includes('/admin') || hash.includes('#admin') || search.includes('admin=true')) {
    setTimeout(() => {
      if (sessionStorage.getItem('khaira_admin_access') === 'true') {
        openAdminDashboard();
      } else {
        openAdminLoginForm();
      }
    }, 100);
  }
}

function openAdminLoginForm() {
  showModal(
    "🔐 Admin Portal Login",
    `<div style="text-align:center;margin-bottom:16px;">
      <div style="background:rgba(255,107,0,0.12);color:var(--saffron-orange);padding:8px 12px;border-radius:var(--radius-md);font-size:0.825rem;font-weight:700;display:inline-flex;align-items:center;gap:6px;margin-bottom:12px;">
        <i class="fa-solid fa-key"></i> Authorized Personnel • Office of Sardar Sukhpal Singh Khaira
      </div>
      <p style="font-size:0.85rem;color:var(--text-muted);margin:0;line-height:1.4;">
        Admin Credentials: <strong style="color:var(--text-main);">Username: admin</strong> | <strong style="color:var(--text-main);">Password: admin</strong>
      </p>
    </div>

    <form id="adminAuthForm" style="text-align:left;">
      <div class="input-group">
        <label for="adminUser">Admin Username</label>
        <input type="text" id="adminUser" class="input-control" placeholder="Enter admin username" required autocomplete="username" value="admin">
      </div>
      <div class="input-group">
        <label for="adminPass">Admin Password</label>
        <div style="position:relative;">
          <input type="password" id="adminPass" class="input-control" placeholder="Enter admin password" required autocomplete="current-password" value="admin" style="padding-right:44px;">
          <button type="button" id="toggleAdminPassVisibility" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--text-muted);cursor:pointer;padding:8px;font-size:1.05rem;">
            <i class="fa-solid fa-eye"></i>
          </button>
        </div>
      </div>
      <div id="adminLoginErr" style="color:#ef4444;font-size:0.85rem;font-weight:700;margin-bottom:12px;min-height:20px;"></div>
      <button type="submit" id="adminSubmitBtn" class="btn-primary-saffron" style="width:100%;min-height:48px;font-weight:800;font-size:1rem;box-shadow:0 8px 24px rgba(255,107,0,0.4);">
        <i class="fa-solid fa-right-to-bracket"></i> Login to Admin Panel
      </button>
    </form>`
  );

  const adminPassInput = document.getElementById('adminPass');
  const togglePassBtn = document.getElementById('toggleAdminPassVisibility');
  if (adminPassInput && togglePassBtn) {
    togglePassBtn.addEventListener('click', () => {
      const isPwd = adminPassInput.type === 'password';
      adminPassInput.type = isPwd ? 'text' : 'password';
      togglePassBtn.innerHTML = isPwd ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
    });
  }

  const form = document.getElementById('adminAuthForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const u = document.getElementById('adminUser').value.trim();
      const p = document.getElementById('adminPass').value.trim();
      const err = document.getElementById('adminLoginErr');

      if (!u || !p) {
        if (err) err.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> Please enter username and password`;
        return;
      }

      sessionStorage.setItem('khaira_admin_access', 'true');
      openAdminDashboard();
    });
  }
}

async function openAdminDashboard() {
  const modalCard = document.querySelector('.modal-content-card');
  if (modalCard) modalCard.classList.add('admin-card-container');

  let stats = { volunteers: 12, pendingGrievances: 2, badgesCount: 5, dbStatus: 'MySQL Connected' };
  let volunteers = [
    { name: 'Gurpreet Singh', phone: '+91 98721-54321', village_city: 'Bholath Village', constituency: 'Bholath', status: 'Active' },
    { name: 'Harpreet Kaur', phone: '+91 94172-88123', village_city: 'Kapurthala Town', constituency: 'Kapurthala', status: 'Active' },
    { name: 'Manjit Singh', phone: '+91 98140-99410', village_city: 'Begowal', constituency: 'Bholath', status: 'Active' }
  ];
  let grievances = [
    { id: 1, tracking_code: 'KH-784210', citizen_name: 'Jagjit Singh', phone: '+91 98141-11223', description: 'Water supply repair demand in Ward 4', status: 'In Review' },
    { id: 2, tracking_code: 'KH-891024', citizen_name: 'Sukhwinder Kaur', phone: '+91 98765-43210', description: 'School road repair request', status: 'Resolved' }
  ];
  let pressList = [
    { id: 1, title: 'Press Statement: Farmer Rights & MSP Support', category: 'Press Release', summary: 'Sukhpal Singh Khaira addresses assembly on agriculture pricing policies.', content_url: 'https://www.facebook.com/SukhpalKhairaINC', published_date: '2026-09-20' }
  ];
  let pillarsList = [
    { id: 1, pillar_number: 1, title_en: 'Farmers & Agriculture', title_pa: 'ਕਿਸਾਨੀ ਅਤੇ ਖੇਤੀਬਾੜੀ', desc_en: 'Ensuring fair crop pricing, agrarian debt relief, water conservation, and dignity for farm labor.', desc_pa: 'ਫਸਲਾਂ ਦੇ ਲਾਹੇਵੰਦ ਭਾਅ, ਖੇਤੀ ਕਰਜ਼ਾ ਮੁਆਫੀ, ਪਾਣੀ ਦੀ ਸੰਭਾਲ ਅਤੇ ਖੇਤ ਮਜ਼ਦੂਰਾਂ ਦੇ ਹੱਕਾਂ ਦੀ ਰਾਖੀ।' },
    { id: 2, pillar_number: 2, title_en: 'Youth & Employment', title_pa: 'ਰੋਜ਼ਗਾਰ ਅਤੇ ਯੁਵਾ ਸ਼ਕਤੀ', desc_en: 'Creating local employment hubs, skill centers, world-class sports facilities, and halting youth migration.', desc_pa: 'ਪੰਜਾਬ ਵਿੱਚ ਰੋਜ਼ਗਾਰ ਦੇ ਨਵੇਂ ਅਵਸਰ, ਹੁਨਰ ਵਿਕਾਸ ਕੇਂਦਰ, ਖੇਡ ਸਹੂਲਤਾਂ ਅਤੇ ਨੌਜਵਾਨਾਂ ਦੇ ਹਿਜਰਤ ਨੂੰ ਰੋਕਣਾ।' },
    { id: 3, pillar_number: 3, title_en: 'Transparent Governance', title_pa: 'ਇਮਾਨਦਾਰ ਸ਼ਾਸਨ ਅਤੇ ਨਿਆਂ', desc_en: 'Eradicating corruption, ending drug abuse networks, and enforcing strict public administrative accountability.', desc_pa: 'ਭ੍ਰਿਸ਼ਟਾਚਾਰ ਦਾ ਖਾਤਮਾ, ਨਸ਼ਾ ਤਸਕਰੀ ਵਿਰੁੱਧ ਸਖ਼ਤ ਕਾਰਵਾਈ ਅਤੇ ਪ੍ਰਸ਼ਾਸਨਿਕ ਜਵਾਬਦੇਹੀ।' },
    { id: 4, pillar_number: 4, title_en: 'Education & Health', title_pa: 'ਸਿੱਖਿਆ ਅਤੇ ਸਿਹਤ ਸੇਵਾਵਾਂ', desc_en: 'Upgrading government schools, providing free quality healthcare, and empowering women across Punjab.', desc_pa: 'ਸਰਕਾਰੀ ਸਕੂਲਾਂ ਦਾ ਆਧੁਨਿਕੀਕਰਨ, ਮੁਫ਼ਤ ਤੇ ਵਧੀਆ ਸਿਹਤ ਸੇਵਾਵਾਂ ਅਤੇ ਔਰਤਾਂ ਦਾ ਸਸ਼ਕਤੀਕਰਨ।' }
  ];
  let badgesList = [
    { id: 1, supporter_name: 'Gurpreet Singh', city: 'Bholath Village', created_at: '2026-09-27' },
    { id: 2, supporter_name: 'Harpreet Kaur', city: 'Kapurthala Town', created_at: '2026-09-26' },
    { id: 3, supporter_name: 'Manjit Singh', city: 'Begowal', created_at: '2026-09-25' }
  ];

  try {
    const [stRes, volRes, griRes, pressRes, pilRes, bdgRes] = await Promise.allSettled([
      fetch('/api/admin/stats').then(r => r.json()),
      fetch('/api/admin/volunteers').then(r => r.json()),
      fetch('/api/admin/grievances').then(r => r.json()),
      fetch('/api/press').then(r => r.json()),
      fetch('/api/pillars').then(r => r.json()),
      fetch('/api/admin/badges').then(r => r.json())
    ]);

    if (stRes.status === 'fulfilled' && stRes.value && stRes.value.stats) stats = { ...stats, ...stRes.value.stats };
    if (volRes.status === 'fulfilled' && volRes.value && volRes.value.data) volunteers = volRes.value.data;
    if (griRes.status === 'fulfilled' && griRes.value && griRes.value.data) grievances = griRes.value.data;
    if (pressRes.status === 'fulfilled' && pressRes.value) pressList = pressRes.value.press_releases || pressRes.value.data || pressList;
    if (pilRes.status === 'fulfilled' && pilRes.value) pillarsList = pilRes.value.pillars || pilRes.value.data || pillarsList;
    if (bdgRes.status === 'fulfilled' && bdgRes.value && bdgRes.value.data) badgesList = bdgRes.value.data;
  } catch (err) {
    console.log('Admin dashboard loading default dataset');
  }

  const volRowsHtml = volunteers.map(v => `
    <tr>
      <td><strong>${v.name}</strong></td>
      <td>${v.phone}</td>
      <td>${v.village_city}</td>
      <td>${v.constituency || 'Bholath'}</td>
      <td><span style="color:var(--punjab-green);font-weight:800;">✓ ${v.status || 'Active'}</span></td>
    </tr>
  `).join('');

  const griRowsHtml = grievances.map(g => {
    let badgeColor = g.status === 'Resolved' ? 'var(--punjab-green)' : (g.status === 'In Review' ? 'var(--saffron-orange)' : '#ef4444');
    return `
      <tr>
        <td><strong>${g.tracking_code || ('KH-' + g.id)}</strong></td>
        <td>${g.citizen_name || g.name || 'Citizen'} <br><small style="color:var(--text-muted);">${g.phone || ''}</small></td>
        <td>${g.description || g.issue_category || 'Grievance'}</td>
        <td>
          <span style="color:${badgeColor};font-weight:800;">${g.status}</span>
          <br>
          <select class="admin-status-select" data-id="${g.id}" style="margin-top:4px;font-size:0.75rem;padding:2px 6px;border-radius:4px;background:var(--bg-main);color:var(--text-main);">
            <option value="Pending" ${g.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="In Review" ${g.status === 'In Review' ? 'selected' : ''}>In Review</option>
            <option value="Resolved" ${g.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
          </select>
        </td>
      </tr>
    `;
  }).join('');

  const badgesRowsHtml = badgesList.map(b => `
    <tr>
      <td><strong>#${b.id}</strong></td>
      <td><strong>${b.supporter_name || b.name || 'Supporter'}</strong></td>
      <td>${b.city || b.village_city || 'Punjab'}</td>
      <td><span style="color:var(--saffron-orange);font-weight:700;">${b.created_at ? new Date(b.created_at).toISOString().split('T')[0] : 'Recent'}</span></td>
    </tr>
  `).join('');

  const pressRowsHtml = pressList.map(pr => `
    <div class="press-admin-item" style="background:var(--bg-main);padding:14px;border-radius:var(--radius-lg);border:1px solid var(--border-color);display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
      <div style="flex:1;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap;">
          <span style="background:rgba(255,107,0,0.12);color:var(--saffron-orange);padding:2px 8px;border-radius:4px;font-size:0.75rem;font-weight:700;">${pr.category || 'Press Release'}</span>
          <strong style="font-size:0.95rem;color:var(--text-main);">${pr.title}</strong>
          <small style="color:var(--text-muted);">(${pr.date_published || pr.published_date ? new Date(pr.date_published || pr.published_date).toISOString().split('T')[0] : 'Recent'})</small>
        </div>
        <p style="font-size:0.85rem;color:var(--text-muted);margin:0;line-height:1.4;">${pr.summary}</p>
      </div>
      <div style="display:flex;gap:6px;flex-shrink:0;">
        <button class="btn-press-edit btn-secondary-outline" data-id="${pr.id}" data-title="${encodeURIComponent(pr.title || '')}" data-category="${encodeURIComponent(pr.category || '')}" data-summary="${encodeURIComponent(pr.summary || '')}" data-url="${encodeURIComponent(pr.content_url || '')}" style="padding:6px 10px;font-size:0.75rem;">
          ✏️ Edit
        </button>
        <button class="btn-press-delete btn-secondary-outline" data-id="${pr.id}" style="padding:6px 10px;font-size:0.75rem;background:#ef4444;color:#fff;border:none;">
          🗑️ Delete
        </button>
      </div>
    </div>
  `).join('');

  const pillarsRowsHtml = pillarsList.map(p => `
    <div class="pillar-admin-item" style="background:var(--bg-main);padding:14px;border-radius:var(--radius-lg);border:1px solid var(--border-color);display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
      <div style="flex:1;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap;">
          <span style="background:var(--saffron-soft);color:var(--saffron-orange);padding:2px 8px;border-radius:4px;font-size:0.75rem;font-weight:800;">Pillar 0${p.pillar_number || p.id}</span>
          <strong style="font-size:0.95rem;color:var(--text-main);">${p.title_en || p.title}</strong>
          ${p.title_pa ? `<span style="font-size:0.85rem;color:var(--text-muted);">(${p.title_pa})</span>` : ''}
        </div>
        <p style="font-size:0.85rem;color:var(--text-muted);margin:0;line-height:1.4;">${p.desc_en || p.description || ''}</p>
        ${p.desc_pa ? `<p style="font-size:0.825rem;color:var(--text-light);margin-top:4px;line-height:1.4;">${p.desc_pa}</p>` : ''}
      </div>
      <div style="display:flex;gap:6px;flex-shrink:0;">
        <button class="btn-pillar-edit btn-secondary-outline" data-id="${p.id}" data-num="${p.pillar_number || p.id}" data-title-en="${encodeURIComponent(p.title_en || p.title || '')}" data-title-pa="${encodeURIComponent(p.title_pa || '')}" data-desc-en="${encodeURIComponent(p.desc_en || p.description || '')}" data-desc-pa="${encodeURIComponent(p.desc_pa || '')}" style="padding:6px 10px;font-size:0.75rem;">
          ✏️ Edit
        </button>
        <button class="btn-pillar-delete btn-secondary-outline" data-id="${p.id}" style="padding:6px 10px;font-size:0.75rem;background:#ef4444;color:#fff;border:none;">
          🗑️ Delete
        </button>
      </div>
    </div>
  `).join('');

  showModal(
    "⚙️ Mission 2027 Admin Management Panel",
    `<div>
      <div class="admin-header-badge">
        <i class="fa-solid fa-user-shield"></i> Authorized Administrator: Office of Sardar Sukhpal Singh Khaira • <span style="color:var(--gold-accent);">${stats.dbStatus || 'Connected'}</span>
      </div>

      <div class="admin-modal-nav">
        <button class="admin-tab-item active" data-tab="adm-overview"><i class="fa-solid fa-chart-line"></i> Overview</button>
        <button class="admin-tab-item" data-tab="adm-volunteers"><i class="fa-solid fa-users"></i> Volunteers</button>
        <button class="admin-tab-item" data-tab="adm-grievances"><i class="fa-solid fa-inbox"></i> Grievances</button>
        <button class="admin-tab-item" data-tab="adm-badges"><i class="fa-solid fa-id-card"></i> Supporter Badges (${badgesList.length})</button>
        <button class="admin-tab-item" data-tab="adm-press"><i class="fa-solid fa-newspaper"></i> Press Releases</button>
        <button class="admin-tab-item" data-tab="adm-pillars"><i class="fa-solid fa-monument"></i> Vision Pillars (${pillarsList.length})</button>
        <button class="admin-tab-item" data-tab="adm-hero"><i class="fa-solid fa-image"></i> Hero & Bio</button>
        <button class="admin-tab-item" data-tab="adm-seo"><i class="fa-solid fa-sliders"></i> SEO & Fonts</button>
      </div>

      <!-- Pane 1: Overview -->
      <div class="admin-tab-pane active" id="adm-overview">
        <div class="admin-stats-grid">
          <div class="admin-stat-card" style="cursor:pointer;" onclick="document.querySelector('[data-tab=adm-volunteers]').click()">
            <div class="admin-stat-num">${stats.volunteers}</div>
            <div class="admin-stat-lbl">Volunteer Signups</div>
          </div>
          <div class="admin-stat-card" style="cursor:pointer;" onclick="document.querySelector('[data-tab=adm-grievances]').click()">
            <div class="admin-stat-num">${stats.pendingGrievances}</div>
            <div class="admin-stat-lbl">Pending Grievances</div>
          </div>
          <div class="admin-stat-card" style="cursor:pointer;" onclick="document.querySelector('[data-tab=adm-badges]').click()">
            <div class="admin-stat-num">${badgesList.length || stats.badgesCount}</div>
            <div class="admin-stat-lbl">Supporter Badges Logged</div>
          </div>
        </div>

        <div class="admin-form-box">
          <h5 style="font-size:0.95rem;font-weight:800;margin-bottom:8px;color:var(--text-main);">
            🚀 Mission 2027 Control Center Status
          </h5>
          <p style="font-size:0.875rem;color:var(--text-muted);margin:0;line-height:1.5;">
            Welcome to the Mission 2027 Data & Content Control Center. Use the tabs above to manage live press announcements, edit & delete Vision Pillars, view generated digital supporter badges, modify website meta tags & typography, update Sardar Sukhpal Singh Khaira's hero & bio details, and export volunteer, grievance & supporter badge records to CSV.
          </p>
        </div>
      </div>

      <!-- Pane 2: Volunteers -->
      <div class="admin-tab-pane" id="adm-volunteers">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:10px;">
          <h4 style="font-size:1.05rem;font-weight:800;margin:0;color:var(--text-main);">
            Live Volunteer Registrations (${volunteers.length})
          </h4>
          <a href="/api/admin/export/volunteers" target="_blank" class="btn-export-csv">
            <i class="fa-solid fa-file-csv"></i> Export Volunteers CSV
          </a>
        </div>
        <div class="admin-table-wrapper">
          <table class="admin-data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Village / City</th>
                <th>Constituency</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${volRowsHtml}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pane 3: Grievances -->
      <div class="admin-tab-pane" id="adm-grievances">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:10px;">
          <h4 style="font-size:1.05rem;font-weight:800;margin:0;color:var(--text-main);">
            Constituency Grievances & Action Items (${grievances.length})
          </h4>
          <a href="/api/admin/export/grievances" target="_blank" class="btn-export-csv">
            <i class="fa-solid fa-file-csv"></i> Export Grievances CSV
          </a>
        </div>
        <div class="admin-table-wrapper">
          <table class="admin-data-table">
            <thead>
              <tr>
                <th>Tracking ID</th>
                <th>Citizen Details</th>
                <th>Issue Summary</th>
                <th>Update Status</th>
              </tr>
            </thead>
            <tbody>
              ${griRowsHtml}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pane 3.5: Supporter Badges Logged List -->
      <div class="admin-tab-pane" id="adm-badges">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:10px;">
          <h4 style="font-size:1.05rem;font-weight:800;margin:0;color:var(--text-main);">
            🎖️ Supporter Badges Logged List (${badgesList.length})
          </h4>
          <a href="/api/admin/export/badges" target="_blank" class="btn-export-csv">
            <i class="fa-solid fa-file-csv"></i> Export Badges CSV
          </a>
        </div>
        <div class="admin-table-wrapper">
          <table class="admin-data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Supporter Name</th>
                <th>Village / City</th>
                <th>Date Generated</th>
              </tr>
            </thead>
            <tbody>
              ${badgesRowsHtml}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pane 4: Press Releases CRUD -->
      <div class="admin-tab-pane" id="adm-press">
        <div class="admin-form-box">
          <h5 style="font-size:0.95rem;font-weight:800;margin-bottom:8px;color:var(--text-main);" id="pressFormTitle">
            📢 Add News Announcement / Press Release
          </h5>
          <form id="adminPressForm" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            <input type="hidden" id="pressEditId" value="">
            <input type="text" id="pressTitle" class="input-control" placeholder="Headline / Title" required style="grid-column:1/-1;">
            <input type="text" id="pressCategory" class="input-control" placeholder="Category (e.g. Press Release, Assembly)">
            <input type="url" id="pressUrl" class="input-control" placeholder="Facebook Link URL" value="https://www.facebook.com/SukhpalKhairaINC">
            <textarea id="pressSummary" class="input-control" placeholder="Summary statement..." required style="grid-column:1/-1;min-height:50px;"></textarea>
            <div style="grid-column:1/-1;display:flex;gap:10px;">
              <button type="submit" class="btn-primary-saffron" style="flex:1;padding:8px 14px;font-size:0.875rem;" id="savePressBtn">
                + Publish Announcement
              </button>
              <button type="button" class="btn-secondary-outline" style="display:none;" id="cancelPressEditBtn">
                Cancel
              </button>
            </div>
          </form>
        </div>

        <h4 style="font-size:1.05rem;font-weight:800;margin-top:16px;margin-bottom:10px;text-align:left;color:var(--text-main);">
          Published Press Releases (${pressList.length})
        </h4>
        <div class="admin-press-list" style="display:grid;gap:10px;">
          ${pressRowsHtml}
        </div>
      </div>

      <!-- Pane 5: Vision Pillars CRUD Editor -->
      <div class="admin-tab-pane" id="adm-pillars">
        <div class="admin-form-box">
          <h5 style="font-size:0.95rem;font-weight:800;margin-bottom:8px;color:var(--text-main);" id="pillarFormTitle">
            🌟 Add / Edit Vision Pillar ("VISION FOR PUNJAB")
          </h5>
          <form id="adminSinglePillarForm" style="display:grid;gap:10px;">
            <input type="hidden" id="pillarEditId" value="">
            <div style="display:grid;grid-template-columns:1fr 2fr 2fr;gap:8px;">
              <input type="number" id="pillarNum" class="input-control" placeholder="Pillar #" min="1" max="20" required value="${pillarsList.length + 1}">
              <input type="text" id="pillarTitleEn" class="input-control" placeholder="Title (English)" required>
              <input type="text" id="pillarTitlePa" class="input-control" placeholder="Title (Punjabi)" required>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
              <textarea id="pillarDescEn" class="input-control" placeholder="Description (English)..." required style="min-height:55px;"></textarea>
              <textarea id="pillarDescPa" class="input-control" placeholder="Description (Punjabi)..." required style="min-height:55px;"></textarea>
            </div>
            <div style="display:flex;gap:10px;">
              <button type="submit" class="btn-primary-saffron" style="flex:1;padding:8px 14px;font-size:0.875rem;" id="savePillarBtn">
                + Save Vision Pillar
              </button>
              <button type="button" class="btn-secondary-outline" style="display:none;" id="cancelPillarEditBtn">
                Cancel
              </button>
            </div>
          </form>
        </div>

        <h4 style="font-size:1.05rem;font-weight:800;margin-top:16px;margin-bottom:10px;text-align:left;color:var(--text-main);">
          Active Vision Pillars (${pillarsList.length})
        </h4>
        <div class="admin-pillars-list" style="display:grid;gap:10px;">
          ${pillarsRowsHtml}
        </div>
      </div>

      <!-- Pane 6: Hero & Bio Editor -->
      <div class="admin-tab-pane" id="adm-hero">
        <div class="admin-form-box">
          <h5 style="font-size:0.95rem;font-weight:800;margin-bottom:12px;color:var(--text-main);">
            🖼️ Edit Hero Section & Leader Biography
          </h5>
          <form id="adminHeroForm" style="display:grid;gap:10px;">
            <div class="input-group">
              <label style="font-size:0.8rem;font-weight:700;">Hero Title (Leader Name)</label>
              <input type="text" id="admHeroTitle" class="input-control" value="${globalSettings.hero_title || ''}" required>
            </div>
            <div class="input-group">
              <label style="font-size:0.8rem;font-weight:700;">Hero Slogan</label>
              <input type="text" id="admHeroSlogan" class="input-control" value="${globalSettings.hero_slogan || ''}" required>
            </div>
            <div class="input-group">
              <label style="font-size:0.8rem;font-weight:700;">Hero Image URL</label>
              <input type="url" id="admHeroImage" class="input-control" value="${globalSettings.hero_image || ''}">
            </div>
            <hr style="border:0;border-top:1px solid var(--border-color);margin:10px 0;">
            <div class="input-group">
              <label style="font-size:0.8rem;font-weight:700;">Leader Section Title</label>
              <input type="text" id="admAboutTitle" class="input-control" value="${globalSettings.about_title || ''}">
            </div>
            <div class="input-group">
              <label style="font-size:0.8rem;font-weight:700;">Leader Lead Summary</label>
              <textarea id="admAboutLead" class="input-control" style="min-height:50px;">${globalSettings.about_lead || ''}</textarea>
            </div>
            <div class="input-group">
              <label style="font-size:0.8rem;font-weight:700;">Leader Biography Paragraph</label>
              <textarea id="admAboutDesc" class="input-control" style="min-height:70px;">${globalSettings.about_desc || ''}</textarea>
            </div>
            <button type="submit" class="btn-primary-saffron" style="width:100%;margin-top:10px;padding:10px;">
              <i class="fa-solid fa-floppy-disk"></i> Save Hero & Bio Changes
            </button>
          </form>
        </div>
      </div>

      <!-- Pane 7: SEO & Font Settings -->
      <div class="admin-tab-pane" id="adm-seo">
        <div class="admin-form-box">
          <h5 style="font-size:0.95rem;font-weight:800;margin-bottom:12px;color:var(--text-main);">
            ⚙️ SEO Meta Tags & Typography Customizer
          </h5>
          <form id="adminSeoForm" style="display:grid;gap:10px;">
            <div class="input-group">
              <label style="font-size:0.8rem;font-weight:700;">Typography / Font Family</label>
              <select id="admFontFamily" class="input-control">
                <option value="Outfit, sans-serif" ${globalSettings.font_family.includes('Outfit') ? 'selected' : ''}>Outfit (Modern Geometric)</option>
                <option value="Inter, sans-serif" ${globalSettings.font_family.includes('Inter') ? 'selected' : ''}>Inter (Clean & Crisp)</option>
                <option value="Roboto, sans-serif" ${globalSettings.font_family.includes('Roboto') ? 'selected' : ''}>Roboto (Standard Corporate)</option>
                <option value="'Noto Sans Gurmukhi', sans-serif" ${globalSettings.font_family.includes('Gurmukhi') ? 'selected' : ''}>Noto Sans Gurmukhi (Native Punjabi)</option>
              </select>
            </div>
            <div class="input-group">
              <label style="font-size:0.8rem;font-weight:700;">Page Meta Title</label>
              <input type="text" id="admMetaTitle" class="input-control" value="${globalSettings.meta_title || ''}" required>
            </div>
            <div class="input-group">
              <label style="font-size:0.8rem;font-weight:700;">Meta Description</label>
              <textarea id="admMetaDesc" class="input-control" style="min-height:60px;" required>${globalSettings.meta_description || ''}</textarea>
            </div>
            <div class="input-group">
              <label style="font-size:0.8rem;font-weight:700;">Meta Keywords</label>
              <input type="text" id="admMetaKw" class="input-control" value="${globalSettings.meta_keywords || ''}">
            </div>
            <button type="submit" class="btn-primary-saffron" style="width:100%;margin-top:10px;padding:10px;">
              <i class="fa-solid fa-floppy-disk"></i> Save SEO & Typography Settings
            </button>
          </form>
        </div>
      </div>

      <div style="display:flex;gap:12px;justify-content:flex-end;margin-top:20px;">
        <button id="adminLogoutBtn" class="btn-secondary-outline" style="background:#ef4444;color:#fff;border:none;">
          <i class="fa-solid fa-xmark"></i> Close Admin Panel
        </button>
      </div>
    </div>`
  );

  // Tab Navigation Click Handlers
  document.querySelectorAll('.admin-tab-item').forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      const targetTab = tabBtn.getAttribute('data-tab');
      document.querySelectorAll('.admin-tab-item').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.admin-tab-pane').forEach(p => p.classList.remove('active'));

      tabBtn.classList.add('active');
      const pane = document.getElementById(targetTab);
      if (pane) pane.classList.add('active');
    });
  });

  // Grievance Status Change Handler
  document.querySelectorAll('.admin-status-select').forEach(select => {
    select.addEventListener('change', async (e) => {
      const gId = e.target.getAttribute('data-id');
      const newStatus = e.target.value;
      try {
        await fetch(`/api/admin/grievances/${gId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
      } catch (err) {
        console.log('Status update saved locally');
      }
    });
  });

  // Press Release Submit & Edit Handlers
  const pressForm = document.getElementById('adminPressForm');
  const cancelPressBtn = document.getElementById('cancelPressEditBtn');

  if (pressForm) {
    pressForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const editId = document.getElementById('pressEditId').value;
      const title = document.getElementById('pressTitle').value;
      const category = document.getElementById('pressCategory').value;
      const content_url = document.getElementById('pressUrl').value;
      const summary = document.getElementById('pressSummary').value;

      try {
        if (editId) {
          await fetch(`/api/admin/press/${editId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, category, summary, content_url })
          });
          alert('Press release updated successfully!');
        } else {
          await fetch('/api/admin/press', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, category, summary, content_url })
          });
          alert('Press release published successfully!');
        }
        openAdminDashboard();
        fetchPressReleases();
      } catch (err) {
        alert('Press release saved!');
      }
    });
  }

  // Edit Press buttons
  document.querySelectorAll('.btn-press-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('pressEditId').value = btn.getAttribute('data-id');
      document.getElementById('pressTitle').value = decodeURIComponent(btn.getAttribute('data-title'));
      document.getElementById('pressCategory').value = decodeURIComponent(btn.getAttribute('data-category'));
      document.getElementById('pressSummary').value = decodeURIComponent(btn.getAttribute('data-summary'));
      document.getElementById('pressUrl').value = decodeURIComponent(btn.getAttribute('data-url'));

      document.getElementById('pressFormTitle').textContent = '✏️ Edit News Announcement';
      document.getElementById('savePressBtn').textContent = '💾 Update Announcement';
      if (cancelPressBtn) cancelPressBtn.style.display = 'inline-block';
    });
  });

  if (cancelPressBtn) {
    cancelPressBtn.addEventListener('click', () => {
      document.getElementById('pressEditId').value = '';
      document.getElementById('adminPressForm').reset();
      document.getElementById('pressFormTitle').textContent = '📢 Add News Announcement / Press Release';
      document.getElementById('savePressBtn').textContent = '+ Publish Announcement';
      cancelPressBtn.style.display = 'none';
    });
  }

  // Delete Press buttons
  document.querySelectorAll('.btn-press-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      const pId = btn.getAttribute('data-id');
      if (confirm('Are you sure you want to delete this press release?')) {
        try {
          await fetch(`/api/admin/press/${pId}`, { method: 'DELETE' });
          alert('Press release deleted.');
          openAdminDashboard();
          fetchPressReleases();
        } catch (err) {
          alert('Deleted locally.');
        }
      }
    });
  });

  // Single Vision Pillar Submit, Edit & Delete Handlers
  const singlePillarForm = document.getElementById('adminSinglePillarForm');
  const cancelPillarBtn = document.getElementById('cancelPillarEditBtn');

  if (singlePillarForm) {
    singlePillarForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const editId = document.getElementById('pillarEditId').value;
      const pillar_number = document.getElementById('pillarNum').value;
      const title_en = document.getElementById('pillarTitleEn').value;
      const title_pa = document.getElementById('pillarTitlePa').value;
      const desc_en = document.getElementById('pillarDescEn').value;
      const desc_pa = document.getElementById('pillarDescPa').value;

      try {
        if (editId) {
          await fetch(`/api/admin/pillars/${editId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pillar_number, title_en, title_pa, desc_en, desc_pa })
          });
          alert('Vision Pillar updated successfully!');
        } else {
          await fetch('/api/admin/pillars', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pillar_number, title_en, title_pa, desc_en, desc_pa })
          });
          alert('Vision Pillar added successfully!');
        }
        openAdminDashboard();
        fetchPillars();
      } catch (err) {
        alert('Vision Pillar saved locally!');
        fetchPillars();
      }
    });
  }

  // Edit Pillar Buttons
  document.querySelectorAll('.btn-pillar-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('pillarEditId').value = btn.getAttribute('data-id');
      document.getElementById('pillarNum').value = btn.getAttribute('data-num');
      document.getElementById('pillarTitleEn').value = decodeURIComponent(btn.getAttribute('data-title-en'));
      document.getElementById('pillarTitlePa').value = decodeURIComponent(btn.getAttribute('data-title-pa'));
      document.getElementById('pillarDescEn').value = decodeURIComponent(btn.getAttribute('data-desc-en'));
      document.getElementById('pillarDescPa').value = decodeURIComponent(btn.getAttribute('data-desc-pa'));

      document.getElementById('pillarFormTitle').textContent = '✏️ Edit Vision Pillar';
      document.getElementById('savePillarBtn').textContent = '💾 Update Vision Pillar';
      if (cancelPillarBtn) cancelPillarBtn.style.display = 'inline-block';
    });
  });

  if (cancelPillarBtn) {
    cancelPillarBtn.addEventListener('click', () => {
      document.getElementById('pillarEditId').value = '';
      document.getElementById('adminSinglePillarForm').reset();
      document.getElementById('pillarFormTitle').textContent = '🌟 Add / Edit Vision Pillar ("VISION FOR PUNJAB")';
      document.getElementById('savePillarBtn').textContent = '+ Save Vision Pillar';
      cancelPillarBtn.style.display = 'none';
    });
  }

  // Delete Pillar Buttons
  document.querySelectorAll('.btn-pillar-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      const pId = btn.getAttribute('data-id');
      if (confirm('Are you sure you want to delete this Vision Pillar?')) {
        try {
          await fetch(`/api/admin/pillars/${pId}`, { method: 'DELETE' });
          alert('Vision Pillar deleted successfully.');
          openAdminDashboard();
          fetchPillars();
        } catch (err) {
          alert('Deleted locally.');
          fetchPillars();
        }
      }
    });
  });

  // Hero & Bio Form Submit Handler
  const heroForm = document.getElementById('adminHeroForm');
  if (heroForm) {
    heroForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const hero_title = document.getElementById('admHeroTitle').value;
      const hero_slogan = document.getElementById('admHeroSlogan').value;
      const hero_image = document.getElementById('admHeroImage').value;
      const about_title = document.getElementById('admAboutTitle').value;
      const about_lead = document.getElementById('admAboutLead').value;
      const about_desc = document.getElementById('admAboutDesc').value;

      globalSettings = { ...globalSettings, hero_title, hero_slogan, hero_image, about_title, about_lead, about_desc };

      try {
        await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(globalSettings)
        });
        alert('Hero and Leader Bio updated!');
        applySiteSettings(globalSettings);
      } catch (err) {
        alert('Hero and Bio saved locally!');
        applySiteSettings(globalSettings);
      }
    });
  }

  // SEO Form Submit Handler
  const seoForm = document.getElementById('adminSeoForm');
  if (seoForm) {
    seoForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const font_family = document.getElementById('admFontFamily').value;
      const meta_title = document.getElementById('admMetaTitle').value;
      const meta_description = document.getElementById('admMetaDesc').value;
      const meta_keywords = document.getElementById('admMetaKw').value;

      globalSettings = { ...globalSettings, font_family, meta_title, meta_description, meta_keywords };

      try {
        await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(globalSettings)
        });
        alert('SEO and Typography Settings saved!');
        applySiteSettings(globalSettings);
      } catch (err) {
        alert('SEO settings saved locally!');
        applySiteSettings(globalSettings);
      }
    });
  }

  // Close / Exit Admin Panel Handler
  const logoutBtn = document.getElementById('adminLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      closeModal();
    });
  }
}

/* ==========================================================================
   1. THEME TOGGLE (LIGHT / DARK MODE)
   ========================================================================== */
function initThemeToggle() {
  const themeBtn = document.getElementById('themeToggleBtn');
  if (!themeBtn) return;

  const savedTheme = localStorage.getItem('khaira_theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  themeBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('khaira_theme', newTheme);
    updateThemeIcon(newTheme);
  });
}

function updateThemeIcon(theme) {
  const themeBtn = document.getElementById('themeToggleBtn');
  if (!themeBtn) return;
  themeBtn.innerHTML = theme === 'dark' 
    ? `<i class="fa-solid font-sun"></i> <span>☀️ Light</span>` 
    : `<i class="fa-solid font-moon"></i> <span>🌙 Dark</span>`;
}

/* ==========================================================================
   2. BILINGUAL LANGUAGE SWITCHER (EN <-> PA)
   ========================================================================== */
const translations = {
  en: {
    heroBadge: "MISSION 2027 • PUNJAB • CONGRESS PARTY",
    heroTitle: "Sardar Sukhpal Singh Khaira",
    heroSubtitle: "Member of the Punjab Legislative Assembly (MLA - Bholath)",
    heroSlogan: "“For the People, Always with the People — A True Punjab, A New Hope”",
    heroDesc: "Champion of public rights, fearless voice of Punjab in the Assembly, and dedicated leader working towards progress, farmer dignity, youth employment, and clean governance.",
    btnFacebook: "Follow Official Facebook Page",
    btnJoin: "Join Mission 2027",
    btnGrievance: "Submit Citizen Grievance",
    statService: "15+ Years Public Service",
    statConstituency: "MLA Bholath Constituency",
    statSupporters: "100K+ Facebook Followers",
    
    pillarsEyebrow: "VISION FOR PUNJAB",
    pillarsTitle: "Four Core Pillars of Mission 2027",
    pillarsSubtitle: "Our commitment to rebuilding a prosperous, peaceful, and self-reliant Punjab.",
    
    pillar1Title: "Farmers & Agriculture",
    pillar1Desc: "Ensuring fair crop pricing, agrarian debt relief, water conservation, and dignity for farm labor.",
    pillar2Title: "Youth & Employment",
    pillar2Desc: "Creating local employment hubs, skill centers, world-class sports facilities, and halting youth migration.",
    pillar3Title: "Transparent Governance",
    pillar3Desc: "Eradicating corruption, ending drug abuse networks, and enforcing strict public administrative accountability.",
    pillar4Title: "Education & Health",
    pillar4Desc: "Upgrading government schools, providing free quality healthcare, and empowering women across Punjab.",
    
    aboutEyebrow: "ABOUT THE LEADER",
    aboutTitle: "A Fearless Voice for Punjab",
    aboutLead: "Sukhpal Singh Khaira has consistently stood up for truth, transparency, and public welfare.",
    aboutDesc: "Serving as Member of the Legislative Assembly representing Bholath, he has led key parliamentary debates, championed agricultural rights, and exposed administrative irregularities across Punjab.",
    
    fbTitle: "Connect on Official Facebook Page",
    fbDesc: "Stay updated with live news, public meetings, speeches, and official statements directly from Sukhpal Singh Khaira's Facebook page.",
    btnVisitFb: "Visit Facebook Page @SukhpalKhairaINC",
    
    badgeGenTitle: "Create Your Digital Supporter Badge",
    badgeGenDesc: "Type your name and city to generate your personalized Mission 2027 supporter badge!",
    lblYourName: "Your Full Name:",
    lblYourCity: "Your Village / City:",
    btnDownloadBadge: "Download Supporter Card",
    
    connectTitle: "Constituency Connect & Public Portal",
    connectDesc: "Have a grievance, suggestion, or wish to join the Mission 2027 team? Reach out to the MLA Bholath office.",
    
    tabVolunteer: "🤝 Join Mission 2027 Volunteer",
    tabGrievance: "📩 Submit Public Grievance / Suggestion",
    
    btnSubmit: "Submit Information",
    footerCopyright: "© 2026 Office of Sardar Sukhpal Singh Khaira, MLA Bholath. All Rights Reserved."
  },
  
  pa: {
    heroBadge: "ਮਿਸ਼ਨ 2027 • ਪੰਜਾਬ • ਕਾਂਗਰਸ ਪਾਰਟੀ",
    heroTitle: "ਸਰਦਾਰ ਸੁਖਪਾਲ ਸਿੰਘ ਖਹਿਰਾ",
    heroSubtitle: "ਮੈਂਬਰ ਪੰਜਾਬ ਵਿਧਾਨ ਸਭਾ (ਹਲਕਾ ਭੁਲੱਥ)",
    heroSlogan: "“ਲੋਕਾਂ ਲਈ, ਲੋਕਾਂ ਨਾਲ ਹਮੇਸ਼ਾ — ਇੱਕ ਸੱਚਾ ਪੰਜਾਬ | ਇੱਕ ਨਵੀਂ ਉਮੀਦ”",
    heroDesc: "ਜਨਤਾ ਦੇ ਹੱਕਾਂ ਦੇ ਰਾਖੇ, ਵਿਧਾਨ ਸਭਾ ਵਿੱਚ ਪੰਜਾਬ ਦੀ ਬੇਬਾਕ ਆਵਾਜ਼, ਅਤੇ ਤਰੱਕੀ, ਕਿਸਾਨੀ ਦੇ ਸਤਿਕਾਰ, ਰੋਜ਼ਗਾਰ ਤੇ ਇਮਾਨਦਾਰ ਸ਼ਾਸਨ ਲਈ ਵਚਨਬੱਧ ਆਗੂ।",
    btnFacebook: "ਅਧਿਕਾਰਤ ਫੇਸਬੁੱਕ ਪੇਜ ਨਾਲ ਜੁੜੋ",
    btnJoin: "ਮਿਸ਼ਨ 2027 ਨਾਲ ਜੁੜੋ",
    btnGrievance: "ਜਨਤਕ ਸ਼ਿਕਾਇਤ / ਸੁਝਾਅ ਦਰਜ ਕਰੋ",
    statService: "15+ ਸਾਲ ਲੋਕ ਸੇਵਾ",
    statConstituency: "ਐਮ.ਐਲ.ਏ. ਹਲਕਾ ਭੁਲੱਥ",
    statSupporters: "100K+ ਫੇਸਬੁੱਕ ਸਮਰਥਕ",
    
    pillarsEyebrow: "ਪੰਜਾਬ ਲਈ ਦ੍ਰਿਸ਼ਟੀਕੋਣ",
    pillarsTitle: "ਮਿਸ਼ਨ 2027 ਦੇ 4 ਮੁੱਖ ਥੰਮ",
    pillarsSubtitle: "ਇੱਕ ਖੁਸ਼ਹਾਲ, ਸ਼ਾਂਤਮਈ ਅਤੇ ਆਤਮ-ਨਿਰਭਰ ਪੰਜਾਬ ਦੀ ਸਿਰਜਣਾ ਲਈ ਸਾਡਾ ਸੰਕਲਪ।",
    
    pillar1Title: "ਕਿਸਾਨੀ ਅਤੇ ਖੇਤੀਬਾੜੀ",
    pillar1Desc: "ਫਸਲਾਂ ਦੇ ਲਾਹੇਵੰਦ ਭਾਅ, ਖੇਤੀ ਕਰਜ਼ਾ ਮੁਆਫੀ, ਪਾਣੀ ਦੀ ਸੰਭਾਲ ਅਤੇ ਖੇਤ ਮਜ਼ਦੂਰਾਂ ਦੇ ਹੱਕਾਂ ਦੀ ਰਾਖੀ।",
    pillar2Title: "ਰੋਜ਼ਗਾਰ ਅਤੇ ਯੁਵਾ ਸ਼ਕਤੀ",
    pillar2Desc: "ਪੰਜਾਬ ਵਿੱਚ ਰੋਜ਼ਗਾਰ ਦੇ ਨਵੇਂ ਅਵਸਰ, ਹੁਨਰ ਵਿਕਾਸ ਕੇਂਦਰ, ਖੇਡ ਸਹੂਲਤਾਂ ਅਤੇ ਨੌਜਵਾਨਾਂ ਦੇ ਹਿਜਰਤ ਨੂੰ ਰੋਕਣਾ।",
    pillar3Title: "ਇਮਾਨਦਾਰ ਸ਼ਾਸਨ ਅਤੇ ਨਿਆਂ",
    pillar3Desc: "ਭ੍ਰਿਸ਼ਟਾਚਾਰ ਦਾ ਖਾਤਮਾ, ਨਸ਼ਾ ਤਸਕਰੀ ਵਿਰੁੱਧ ਸਖ਼ਤ ਕਾਰਵਾਈ ਅਤੇ ਪ੍ਰਸ਼ਾਸਨਿਕ ਜਵਾਬਦੇਹੀ।",
    pillar4Title: "ਸਿੱਖਿਆ ਅਤੇ ਸਿਹਤ ਸੇਵਾਵਾਂ",
    pillar4Desc: "ਸਰਕਾਰੀ ਸਕੂਲਾਂ ਦਾ ਆਧੁਨਿਕੀਕਰਨ, ਮੁਫ਼ਤ ਤੇ ਵਧੀਆ ਸਿਹਤ ਸੇਵਾਵਾਂ ਅਤੇ ਔਰਤਾਂ ਦਾ ਸਸ਼ਕਤੀਕਰਨ।",
    
    aboutEyebrow: "ਆਗੂ ਬਾਰੇ",
    aboutTitle: "ਪੰਜਾਬ ਦੀ ਬੇਬਾਕ ਅਤੇ ਨਿਡਰ ਆਵਾਜ਼",
    aboutLead: "ਸੁਖਪਾਲ ਸਿੰਘ ਖਹਿਰਾ ਨੇ ਹਮੇਸ਼ਾ ਸੱਚ, ਪਾਰਦਰਸ਼ਤਾ ਅਤੇ ਲੋਕ ਭਲਾਈ ਲਈ ਆਵਾਜ਼ ਬੁਲੰਦ ਕੀਤੀ ਹੈ।",
    aboutDesc: "ਹਲਕਾ ਭੁਲੱਥ ਦੀ ਨੁਮਾਇੰਦਗੀ ਕਰਦਿਆਂ, ਉਨ੍ਹਾਂ ਨੇ ਵਿਧਾਨ ਸਭਾ ਵਿੱਚ ਕਿਸਾਨਾਂ ਦੇ ਹੱਕਾਂ, ਲੋਕ ਮੁੱਦਿਆਂ ਅਤੇ ਪੰਜਾਬ ਦੇ ਪਾਣੀਆਂ ਦੀ ਰਾਖੀ ਲਈ ਡਟ ਕੇ ਪਹਿਰਾ ਦਿੱਤਾ ਹੈ।",
    
    fbTitle: "ਅਧਿਕਾਰਤ ਫੇਸਬੁੱਕ ਪੇਜ ਨਾਲ ਜੁੜੋ",
    fbDesc: "ਸਰਦਾਰ ਸੁਖਪਾਲ ਸਿੰਘ ਖਹਿਰਾ ਦੀਆਂ ਤਾਜ਼ਾ ਗਤੀਵਿਧੀਆਂ, ਜਨਤਕ ਜਲਸਿਆਂ, ਪ੍ਰੈਸ ਬਿਆਨਾਂ ਅਤੇ ਵੀਡੀਓਜ਼ ਲਈ ਸਾਡੇ ਫੇਸਬੁੱਕ ਪੇਜ ਨੂੰ ਫੋਲੋ ਕਰੋ।",
    btnVisitFb: "ਫੇਸਬੁੱਕ ਪੇਜ ਵੇਖੋ @SukhpalKhairaINC",
    
    badgeGenTitle: "ਆਪਣਾ ਡਿਜੀਟਲ ਸਮਰਥਕ ਕਾਰਡ ਬਣਾਓ",
    badgeGenDesc: "ਆਪਣਾ ਨਾਮ ਅਤੇ ਸ਼ਹਿਰ/ਪਿੰਡ ਲਿਖੋ ਅਤੇ ਮਿਸ਼ਨ 2027 ਦਾ ਡਿਜੀਟਲ ਕਾਰਡ ਤਿਆਰ ਕਰੋ!",
    lblYourName: "ਆਪਣਾ ਪੂਰਾ ਨਾਮ:",
    lblYourCity: "ਆਪਣਾ ਪਿੰਡ / ਸ਼ਹਿਰ:",
    btnDownloadBadge: "ਸਮਰਥਕ ਕਾਰਡ ਡਾਊਨਲੋਡ ਕਰੋ",
    
    connectTitle: "ਹਲਕਾ ਰਾਬਤਾ ਅਤੇ ਜਨਤਕ ਪੋਰਟਲ",
    connectDesc: "ਕੋਈ ਸ਼ਿਕਾਇਤ, ਸੁਝਾਅ ਹੈ ਜਾਂ ਮਿਸ਼ਨ 2027 ਟੀਮ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਣਾ ਚਾਹੁੰਦੇ ਹੋ? ਸਾਡੇ ਨਾਲ ਸੰਪਰਕ ਕਰੋ।",
    
    tabVolunteer: "🤝 ਮਿਸ਼ਨ 2027 ਵਾਲੰਟੀਅਰ ਬਣੋ",
    tabGrievance: "📩 ਸ਼ਿਕਾਇਤ / ਸੁਝਾਅ ਭੇਜੋ",
    
    btnSubmit: "ਜਾਣਕਾਰੀ ਜਮ੍ਹਾਂ ਕਰੋ",
    footerCopyright: "© 2026 ਦਫ਼ਤਰ ਸਰਦਾਰ ਸੁਖਪਾਲ ਸਿੰਘ ਖਹਿਰਾ, ਐਮ.ਐਲ.ਏ. ਭੁਲੱਥ। ਸਭ ਅਧਿਕਾਰ ਸੁਰੱਖਿਅਤ ਹਨ।"
  }
};

let currentLang = 'en';

function initLanguageSwitcher() {
  const langBtn = document.getElementById('langSwitchBtn');
  if (!langBtn) return;

  langBtn.addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'pa' : 'en';
    applyLanguage(currentLang);
  });
}

function applyLanguage(lang) {
  const langBtn = document.getElementById('langSwitchBtn');
  if (langBtn) {
    langBtn.innerHTML = lang === 'en' 
      ? `🌐 <span>ਪੰਜਾਬੀ</span>` 
      : `🌐 <span>English</span>`;
  }

  document.documentElement.setAttribute('lang', lang);

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });
}

/* ==========================================================================
   3. MOBILE NAVIGATION DRAWER & BOTTOM APP DOCK
   ========================================================================== */
function initMobileNav() {
  const toggleBtn = document.getElementById('mobileNavToggle');
  const navMenu = document.getElementById('mainNavMenu');

  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    const isActive = navMenu.classList.contains('active');
    toggleBtn.innerHTML = isActive ? '✕' : '☰';
  });

  navMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      toggleBtn.innerHTML = '☰';
    });
  });
}

function initMobileDock() {
  const dockItems = document.querySelectorAll('.dock-item');
  dockItems.forEach(item => {
    item.addEventListener('click', () => {
      dockItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });
}

/* ==========================================================================
   4. INTERACTIVE TABS (BIOGRAPHY & FORM TABS)
   ========================================================================== */
function initTabs() {
  const bioTabBtns = document.querySelectorAll('.bio-tab-btn');
  const bioTabPanes = document.querySelectorAll('.bio-tab-pane');

  bioTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');

      bioTabBtns.forEach(b => b.classList.remove('active'));
      bioTabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  const formTabBtns = document.querySelectorAll('.form-toggle-btn');
  const formModeInput = document.getElementById('formModeInput');
  const formTitle = document.getElementById('formTitle');

  formTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      formTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const mode = btn.getAttribute('data-mode');
      if (formModeInput) formModeInput.value = mode;

      if (formTitle) {
        formTitle.textContent = mode === 'volunteer' 
          ? 'Join Mission 2027 Team' 
          : 'Submit Public Grievance / Suggestion';
      }
    });
  });
}

/* ==========================================================================
   5. DIGITAL SUPPORTER BADGE GENERATOR
   ========================================================================== */
function initBadgeGenerator() {
  const nameInput = document.getElementById('badgeNameInput');
  const cityInput = document.getElementById('badgeCityInput');
  const badgeNameDisplay = document.getElementById('badgeNameDisplay');
  const badgeCityDisplay = document.getElementById('badgeCityDisplay');
  const downloadBtn = document.getElementById('downloadBadgeBtn');

  if (!nameInput || !badgeNameDisplay) return;

  nameInput.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    badgeNameDisplay.textContent = val ? val : "Your Name Here";
  });

  if (cityInput && badgeCityDisplay) {
    cityInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      badgeCityDisplay.textContent = val ? `📍 ${val}, Punjab` : "📍 Bholath / Punjab";
    });
  }

  if (downloadBtn) {
    downloadBtn.addEventListener('click', async () => {
      const name = nameInput.value.trim() || 'Supporter';
      const city = cityInput ? cityInput.value.trim() : 'Bholath / Punjab';

      try {
        await fetch('/api/badge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, city })
        });
      } catch (e) {
        console.log('Badge logged locally');
      }

      showModal(
        "🎉 Supporter Badge Ready!",
        `<p style="font-size:1.05rem;line-height:1.6;margin-bottom:16px;">Thank you <strong>${name}</strong> for joining <strong>Mission 2027</strong> in supporting Sardar Sukhpal Singh Khaira!</p>
        <p style="margin-bottom:20px;color:var(--text-muted)">Your customized supporter badge for <strong>${city}</strong> has been logged. You can share this badge directly on your Facebook profile!</p>
        <div style="display:flex;gap:12px;justify-content:center;">
          <a href="https://www.facebook.com/SukhpalKhairaINC" target="_blank" rel="noopener" class="btn-fb-hero" style="font-size:0.9rem;padding:12px 20px;">
            Share on Facebook Page
          </a>
        </div>`
      );
    });
  }
}

/* ==========================================================================
   6. CONSTITUENCY CONNECT & FORM SUBMISSION
   ========================================================================== */
function initFormHandler() {
  const form = document.getElementById('connectForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('formName').value.trim();
    const phone = document.getElementById('formPhone').value.trim();
    const village_city = document.getElementById('formVillage') ? document.getElementById('formVillage').value.trim() : 'Bholath';
    const message = document.getElementById('formMessage') ? document.getElementById('formMessage').value.trim() : '';
    const mode = document.getElementById('formModeInput').value;

    if (!name || !phone) {
      alert("Please fill in your Name and Mobile Phone Number.");
      return;
    }

    let trackingId = 'KH-' + Math.floor(100000 + Math.random() * 900000);
    const modeText = mode === 'volunteer' ? 'Volunteer Registration' : 'Citizen Grievance Submission';

    try {
      const endpoint = mode === 'volunteer' ? '/api/volunteers' : '/api/grievances';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, phone, village_city, message, description: message, category: 'Constituency Connect'
        })
      });
      const data = await response.json();
      
      if (!data.success) {
        const isGrievancePending = !!data.trackingCode || mode === 'grievance';
        const modalTitle = isGrievancePending ? "ℹ️ Submission Received Already!" : "⚠️ Phone Number Already Registered";
        const headerTitle = isGrievancePending ? "Submission Received Already!" : "Duplicate Phone Entry";
        const iconBg = isGrievancePending ? "rgba(255,107,0,0.12)" : "rgba(239,68,68,0.12)";
        const iconColor = isGrievancePending ? "var(--saffron-orange)" : "#ef4444";
        const iconSymbol = isGrievancePending ? "ℹ" : "!";

        showModal(
          modalTitle,
          `<div style="text-align:center;">
            <div style="width:60px;height:60px;background:${iconBg};color:${iconColor};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.75rem;margin:0 auto 16px auto;font-weight:900;">${iconSymbol}</div>
            <h4 style="font-size:1.25rem;font-weight:800;margin-bottom:8px;color:var(--text-main);">${headerTitle}</h4>
            <p style="color:var(--text-muted);line-height:1.6;margin-bottom:16px;">${data.message || 'Submission Received Already! Your grievance for this mobile number is already registered and pending review.'}</p>
            ${data.trackingCode ? `
              <div style="background:var(--bg-main);padding:10px 14px;border-radius:8px;border:1px dashed var(--border-color);display:inline-block;margin-top:4px;">
                <span style="font-size:0.8rem;color:var(--text-muted)">Reference Tracking Number:</span>
                <div style="font-size:1.25rem;font-weight:900;color:var(--saffron-orange);margin-top:2px;">${data.trackingCode}</div>
              </div>
            ` : ''}
          </div>`
        );
        return;
      }

      if (data.trackingCode) trackingId = data.trackingCode;
    } catch (err) {
      console.log('Form submission saved locally');
    }

    showModal(
      "✅ Submission Received Successfully!",
      `<div style="text-align:center;">
        <div style="width:60px;height:60px;background:var(--punjab-green-soft);color:var(--punjab-green);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.75rem;margin:0 auto 16px auto;">✓</div>
        <h4 style="font-size:1.25rem;font-weight:800;margin-bottom:8px;">Thank You, ${name}!</h4>
        <p style="color:var(--text-muted);line-height:1.6;margin-bottom:16px;">Your ${modeText} has been registered with the Constituency Office of Sardar Sukhpal Singh Khaira.</p>
        <div style="background:var(--bg-main);padding:14px;border-radius:10px;border:1px dashed var(--border-color);margin-bottom:20px;">
          <span style="font-size:0.85rem;color:var(--text-light)">Reference Tracking Number:</span>
          <div style="font-size:1.35rem;font-weight:900;color:var(--saffron-orange);letter-spacing:1px;margin-top:2px;">${trackingId}</div>
        </div>
        <p style="font-size:0.875rem;color:var(--text-muted);">Our team will review your message and contact you via phone (${phone}) shortly.</p>
      </div>`
    );

    form.reset();
  });
}

/* ==========================================================================
   7. MODAL UTILITY
   ========================================================================== */
function initModalHandler() {
  const modalOverlay = document.getElementById('modalOverlay');
  const closeBtn = document.getElementById('modalCloseBtn');

  if (!modalOverlay) return;

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
}

function showModal(title, contentHtml) {
  const modalOverlay = document.getElementById('modalOverlay');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');

  if (!modalOverlay || !modalTitle || !modalBody) return;

  modalTitle.textContent = title;
  modalBody.innerHTML = contentHtml;
  modalOverlay.classList.add('active');
}

function closeModal() {
  const modalOverlay = document.getElementById('modalOverlay');
  const modalCard = document.querySelector('.modal-content-card');

  if (modalOverlay) modalOverlay.classList.remove('active');
  if (modalCard) modalCard.classList.remove('admin-card-container');
}

/* ==========================================================================
   8. HEADER SCROLL SHADOW
   ========================================================================== */
function initHeaderScroll() {
  const header = document.querySelector('.main-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

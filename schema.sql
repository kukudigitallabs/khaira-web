-- ============================================================================
-- DATABASE SCHEMA & INITIAL SEED DATA FOR SUKHPAL SINGH KHAIRA WEB APP
-- Database Name: khaira_db
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `khaira_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `khaira_db`;

-- ----------------------------------------------------------------------------
-- 1. Admin Users Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` VARCHAR(20) DEFAULT 'admin',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. Volunteer Registrations Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `volunteers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) NOT NULL UNIQUE,
  `email` VARCHAR(100) DEFAULT NULL,
  `village_city` VARCHAR(100) NOT NULL,
  `constituency` VARCHAR(100) DEFAULT 'Bholath',
  `message` TEXT DEFAULT NULL,
  `status` VARCHAR(20) DEFAULT 'Active',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. Constituency Grievances / Public Requests Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `grievances` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tracking_code` VARCHAR(20) NOT NULL UNIQUE,
  `citizen_name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `village_city` VARCHAR(100) NOT NULL,
  `issue_category` VARCHAR(50) NOT NULL,
  `description` TEXT NOT NULL,
  `status` VARCHAR(20) DEFAULT 'Pending',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 4. Press Releases & Media News Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `press_releases` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(50) DEFAULT 'Press Release',
  `date_published` DATE DEFAULT (CURRENT_DATE),
  `summary` TEXT NOT NULL,
  `content_url` VARCHAR(255) DEFAULT 'https://www.facebook.com/SukhpalKhairaINC',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 5. Digital Supporter Badges Log Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `badge_generations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `supporter_name` VARCHAR(100) NOT NULL,
  `city` VARCHAR(100) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 6. Site Settings & SEO Configuration Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `site_settings` (
  `setting_key` VARCHAR(50) PRIMARY KEY,
  `setting_value` TEXT NOT NULL,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 7. Vision for Punjab Pillars Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `vision_pillars` (
  `id` INT PRIMARY KEY,
  `title` VARCHAR(100) NOT NULL,
  `description` TEXT NOT NULL,
  `icon` VARCHAR(50) NOT NULL,
  `bullet1` VARCHAR(150),
  `bullet2` VARCHAR(150),
  `bullet3` VARCHAR(150)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- SEED INITIAL DEMO DATA
-- ----------------------------------------------------------------------------

-- Seed Admin User (Username: admin | Password: Khaira@2027#)
INSERT INTO `admin_users` (`username`, `password_hash`, `role`)
VALUES ('admin', 'Khaira@2027#', 'superadmin')
ON DUPLICATE KEY UPDATE `username` = `username`;

-- Seed Site Settings
INSERT INTO `site_settings` (`setting_key`, `setting_value`) VALUES
('meta_title', 'Sardar Sukhpal Singh Khaira | MLA Bholath | Mission 2027 Punjab'),
('meta_description', 'Official website of Sardar Sukhpal Singh Khaira, Member of the Punjab Legislative Assembly (MLA Bholath) - Indian National Congress. Voice of Punjab, Mission 2027.'),
('meta_keywords', 'Sukhpal Singh Khaira, Sukhpal Khaira, MLA Bholath, Congress Punjab, Mission 2027 Punjab'),
('font_family', 'Outfit'),
('hero_title', 'Sardar Sukhpal Singh Khaira'),
('hero_slogan', '“ਲੋਕਾਂ ਲਈ, ਲੋਕਾਂ ਨਾਲ ਹਮੇਸ਼ਾ — ਇੱਕ ਸੱਚਾ ਪੰਜਾਬ | ਇੱਕ ਨਵੀਂ ਉਮੀਦ”'),
('hero_desc', 'Member of the Punjab Legislative Assembly representing Bholath constituency. Dedicated to fighting for agricultural rights, youth employment, transparent governance, and social justice.'),
('hero_image_url', 'banner.jpeg'),
('about_lead', 'Sukhpal Singh Khaira has consistently stood up for truth, transparency, and public welfare across Punjab.')
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

-- Seed Vision Pillars
INSERT INTO `vision_pillars` (`id`, `title`, `description`, `icon`, `bullet1`, `bullet2`, `bullet3`) VALUES
(1, 'Farmers & Agriculture', 'Ensuring guaranteed MSP, agrarian debt relief, crop diversification support, groundwater preservation, and dignity for farm workers.', 'fa-wheat-awn', 'Fair MSP for all major crops', 'Water table revival plan', 'Agricultural debt waiver'),
(2, 'Youth & Employment', 'Establishing regional industrial hubs, skill development centers, stopping youth brain-drain migration, and promoting sports.', 'fa-briefcase', '100,000+ Youth job creation', 'Sports academies in every block', 'Subsidized self-employment loans'),
(3, 'Anti-Corruption & Justice', 'Fearless legislative voice fighting corruption, ensuring administrative accountability, transparent tenders, and police reforms.', 'fa-scale-balanced', 'Zero tolerance for corruption', 'Whistleblower protection cell', 'Time-bound citizen services'),
(4, 'Education & Healthcare', 'Upgrading government schools with digital infrastructure, building affordable super-specialty hospitals, and empowering women.', 'fa-hospital', 'Smart government schools', 'Affordable healthcare for all', 'Women welfare schemes')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`);

-- Seed Sample Volunteers
INSERT INTO `volunteers` (`name`, `phone`, `email`, `village_city`, `constituency`, `status`)
VALUES 
('Gurpreet Singh', '+91 98721-54321', 'gurpreet.bholath@gmail.com', 'Bholath Khas', 'Bholath', 'Active'),
('Harpreet Kaur', '+91 94172-88123', 'harpreet.k@gmail.com', 'Kapurthala Town', 'Kapurthala', 'Active'),
('Manjit Singh', '+91 98140-99410', 'manjit.begowal@gmail.com', 'Begowal', 'Bholath', 'Active'),
('Jaswinder Singh', '+91 97800-11223', 'jaswinder@gmail.com', 'Subhanpur', 'Bholath', 'Active')
ON DUPLICATE KEY UPDATE `id` = `id`;

-- Seed Sample Grievances
INSERT INTO `grievances` (`tracking_code`, `citizen_name`, `phone`, `village_city`, `issue_category`, `description`, `status`)
VALUES 
('KH-784210', 'Jagjit Singh', '+91 98141-11223', 'Bholath Ward 4', 'Water & Sanitation', 'Water supply pipe repair demand in Ward 4 residential area.', 'In Review'),
('KH-891024', 'Sukhwinder Kaur', '+91 98765-43210', 'Begowal Market', 'Road Infrastructure', 'School approach road patch repair request for village children safety.', 'Resolved'),
('KH-902145', 'Baldev Singh', '+91 94170-55443', 'Subhanpur GT Road', 'Agriculture / Farmers', 'Canal water release schedule synchronization request for paddy sowing.', 'Pending')
ON DUPLICATE KEY UPDATE `tracking_code` = `tracking_code`;

-- Seed Initial Press Releases
INSERT INTO `press_releases` (`title`, `category`, `date_published`, `summary`, `content_url`)
VALUES 
('Khaira Demands Immediate Relief Package for Punjab Farmers Affected by Crop Losses', 'Assembly Issue', '2026-09-20', 'Sardar Sukhpal Singh Khaira addressed the Vidhan Sabha demanding fair compensation per acre for farmers facing weather disruptions.', 'https://www.facebook.com/SukhpalKhairaINC'),
('Mission 2027 Youth Volunteer Campaign Launched Across Bholath Constituency', 'Mission 2027', '2026-09-15', 'Over 1,000 youth registered as digital ambassadors to fight drug menace and champion employment opportunities.', 'https://www.facebook.com/SukhpalKhairaINC'),
('Khaira Exposes Corruption in Local Development Fund Distribution', 'Press Release', '2026-09-10', 'Public press conference highlighting financial irregularities in rural development grants across Kapurthala district.', 'https://www.facebook.com/SukhpalKhairaINC')
ON DUPLICATE KEY UPDATE `id` = `id`;

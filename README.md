# 🚒 BFP Berong SafeScape

**Interactive Fire Safety E-Learning & Simulation Platform**  
Developed in partnership with the **Bureau of Fire Protection (BFP) – Sta. Cruz Fire Station, Laguna** and **Laguna State Polytechnic University (LSPU)**.

---

## 📌 Prerequisites

Before running the project, ensure you have installed:
- **PHP** >= 8.2 with extensions: `pdo`, `pdo_sqlite` (or `pdo_mysql`), `mbstring`, `openssl`, `curl`
- **Composer** >= 2.0
- **Node.js** >= 18.0 & **NPM**

---

## 🚀 Setup & Installation

Run the following commands in your terminal to set up the project locally:

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-org/berong-safescape.git
cd berong-safescape

composer install
npm install
```

### 2. Configure Environment
```bash
# Copy the sample environment file
cp .env.example .env    # On Windows PowerShell: Copy-Item .env.example .env

# Generate application key
php artisan key:generate
```

### 3. Setup Database & Seed Data
By default, the platform uses **SQLite** for zero-configuration setup:
```bash
# Create SQLite file (Windows PowerShell)
if (-not (Test-Path database/database.sqlite)) { New-Item -ItemType File database/database.sqlite }

# Create SQLite file (Linux / macOS)
touch database/database.sqlite

# Run migrations and seed default content & test accounts
php artisan migrate --seed

# Create storage symlink for uploaded media
php artisan storage:link
```

### 4. Start Development Server
```bash
# Start backend, Vite, and queue concurrently:
composer run dev
```

*Or run them in two separate terminal windows:*
```bash
# Terminal 1: Backend Server (http://127.0.0.1:8000)
php artisan serve

# Terminal 2: Frontend Asset Bundler
npm run dev
```

---

## 🔑 Test Accounts

The seeder creates pre-configured accounts for testing each role:

| Role | Username | Password | Access / Portal |
|---|---|---|---|
| **Administrator** | `admin` | `admin123` | Admin Dashboard (`/admin`), CMS, Analytics |
| **Kid / Student** | `testkid` | `kid123` | Kids Dashboard (`/kids`), 5-Day Modules, Games |
| **Adult** | `testadult` | `adult123` | Adult Hub (`/adult`), Articles, Fire Prevention Guides |
| **Professional** | `testpro` | `pro123` | Professional Hub (`/professional`), Training Videos, Fire Code |

---

## 📖 User Manual

### 1. 👦 Student / Kid Flow (`/kids`)
1. **Pre-Assessment (`/assessment/pre-test`):** Complete a quick 15-question baseline test upon registering.
2. **5-Day SafeScape Modules (`/kids/safescape`):**
   - **Module 1:** Fire Safety Basics
   - **Module 2:** Stop, Drop, and Roll
   - **Module 3:** Smoke Detectors & Alarms
   - **Module 4:** Home Escape Planning
   - **Module 5:** Firefighter Heroes & Equipment  
   *(Each module unlocks after passing the prior module's quiz).*
3. **Educational Mini-Games (`/kids/challenges`):**
   - **The Right Call:** Interactive scenario decision game with leaderboards.
   - **Task Master:** Timed room hazard search.
   - **Smoke Crawl:** Practice staying low under toxic smoke.
   - **Hot or Not:** Sort items into safe vs. hazardous fire materials.
   - **Hazard Blitz & Memory Game:** Reflex and memory recall games.
4. **Badge Hall (`/kids/badges`):** Collect achievements earned throughout the curriculum.
5. **Certificate of Completion (`/kids/certificate`):** Complete the Post-Assessment with a passing score to download/print an official BFP Junior Firefighter certificate.

---

### 2. 🏡 Adult / Citizen Flow (`/adult`)
- **Safety Articles & Guides:** Learn about preventing electrical fires (octopus wiring), kitchen grease fires, LPG safety, and smoke detector maintenance.
- **PASS Technique Reference:** Review proper fire extinguisher usage (Pull, Aim, Squeeze, Sweep).
- **Berong AI Chatbot:** Click the floating Berong mascot in the bottom-right corner for instant fire safety answers and emergency advice.

---

### 3. 🧯 Fire Safety Professional Flow (`/professional`)
- **Training Video Library:** Access tactical video training for hazardous materials, rescue techniques, and structural investigations.
- **Fire Code Compliance:** Reference Philippine Fire Code (RA 9514) standards and building safety regulations.

---

### 4. 🛡️ Administrator Flow (`/admin`)
- **School & District Analytics (`/admin/analytics`):** Track fire safety scores across Santa Cruz schools (Elementary, High School, College) and export reports to CSV.
- **Content Management System (CMS):**
  - **Carousel:** Add/reorder homepage slider images.
  - **Articles & Videos:** Create and manage safety blogs and training videos.
  - **Quick Questions:** Manage canned chatbot Q&A pairs.
  - **Fire Codes:** Manage regulatory reference documents.
- **User Management:** Search registered users, change roles, or update permissions.
- **Maintenance Mode:** Toggle site-wide maintenance banners and countdown timers.

---

## ⚙️ Environment Configuration

Key settings in your `.env` file:

```dotenv
APP_NAME="BFP Berong SafeScape"
APP_URL=http://127.0.0.1:8000

# Database (Default: SQLite)
DB_CONNECTION=sqlite

# Optional: AI Chatbot (Google Gemini & ElevenLabs Voice)
GEMINI_API_KEY=your_gemini_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```
> *Note: If `GEMINI_API_KEY` is not provided, the chatbot runs in offline fallback mode using an internal BFP safety handbook.*

---

## 🔧 Useful Commands & Troubleshooting

| Action | Command |
|---|---|
| **Build for production** | `npm run build` |
| **Re-run migrations & seed** | `php artisan migrate:fresh --seed` |
| **Fix missing uploaded images** | `php artisan storage:link` |
| **Clear all caches** | `php artisan optimize:clear` |
| **Run tests** | `php artisan test` |

**Common Issues:**
- **Uploaded images or avatars return 404:** Run `php artisan storage:link`.
- **"Vite manifest not found":** Keep `npm run dev` running in the background, or run `npm run build`.
- **Port 8000 already in use:** Run `php artisan serve --port=8080`.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).  
Copyright © 2026 Bureau of Fire Protection - Sta. Cruz Fire Station & LSPU.

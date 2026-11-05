# 🚒 BFP Berong SafeScape

**Interactive Fire Safety E-Learning & Simulation Platform**  
Developed in partnership with the **Bureau of Fire Protection (BFP) – Sta. Cruz Fire Station, Laguna** and **Laguna State Polytechnic University (LSPU)**.

---

## 📌 Prerequisites

Ensure you have the following installed on your machine:
- **PHP** >= 8.2 (with `pdo`, `pdo_sqlite` or `pdo_mysql`, `mbstring`, `openssl`, `curl`, `fileinfo`)
- **Composer** >= 2.0
- **Node.js** >= 18.0 & **NPM**

---

## 🚀 Setup & Installation

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/kenji0011/berong-safescape-laravel.git
cd berong-safescape-laravel

composer install
npm install
```

### 2. Configure Environment
```bash
# Windows PowerShell
Copy-Item .env.example .env

# macOS / Linux
cp .env.example .env

# Generate application key
php artisan key:generate
```

### 3. Initialize Database & Storage
By default, the project uses **SQLite**:
```bash
# Create SQLite database file (Windows PowerShell)
if (-not (Test-Path database/database.sqlite)) { New-Item -ItemType File database/database.sqlite }

# Create SQLite database file (macOS / Linux)
touch database/database.sqlite

# Run migrations and seed default data & test accounts
php artisan migrate --seed

# Create storage symlink for uploaded images and PDF manuals
php artisan storage:link
```

### 4. Run the Application
```bash
# Start Laravel server, Vite, and queue listener concurrently:
composer run dev
```
*Or run them in separate terminals:*
```bash
# Terminal 1: Backend Server (http://127.0.0.1:8000)
php artisan serve

# Terminal 2: Frontend Vite Bundler
npm run dev
```

---

## 🔑 Test Accounts

After running `php artisan migrate --seed`, you can log in using these pre-configured accounts:

| Role | Username | Password | Default Route |
|---|---|---|---|
| **Administrator** | `admin` | `admin123` | `/admin` |
| **Kid / Student** | `testkid` | `kid123` | `/kids` |
| **Adult** | `testadult` | `adult123` | `/adult` |
| **Professional** | `testpro` | `pro123` | `/professional` |

---

## 📖 User Manual

### 1. 👦 Kids / Student Portal (`/kids`)
1. **Pre-Test (`/assessment/pre-test`):** New learners take a 15-question baseline assessment upon registration.
2. **SafeScape 5-Module Course (`/kids/safescape`):**
   - **Module 1: Fire is a Tool, Not a Toy** – Fire Triangle & *Element Mixer Lab*
   - **Module 2: The School Drill** – Recognizing alarms, the Red Box & *Rhythm Marshal Game*
   - **Module 3: The Escape Plan** – Planning two ways out & *Smoke Labyrinth Game*
   - **Module 4: Get Low and Go!** – *Smoke Physics* & safe crawling techniques
   - **Module 5: The Ultimate Defense** – Stop, Drop & Roll and the Final Exam  
   *(Modules unlock sequentially as each prior module is completed).*
3. **Certificate & Post-Test (`/kids/certificate` & `/assessment/post-test`):** Completing all 5 modules unlocks the Post-Test and the downloadable PDF **Fire Safety Hero Certificate**.
4. **Simulations, Videos & Unlockable Games:**
   - **Fire Safety Videos (`/kids/videos`):** Watch safety videos to earn the *Intel Analyst* badge.
   - **The Right Call (`/kids/the-right-call`):** Emergency dispatch simulator *(unlocks after watching all Fire Safety Videos)*.
   - **EDITH Simulation & Task Master (`/kids/task-master`):** 3D home escape simulation and task management game *(unlocks after completing all 5 modules)*.
5. **Mini Games (`/kids/challenges`) & Badge Hall (`/kids/badges`):**
   - Play **Fire Safety Quiz** (`/kids/quiz`), **Memory Game** (`/kids/memory-game`), **The Smoke Crawl** (`/kids/smoke-crawl`), **Hot or Not?** (`/kids/hot-or-not`), **Hazard Blitz** (`/kids/hazard-blitz`), and **3D Hazard Hunt** (`/game`) to earn badges in the Badge Hall.

---

### 2. 🏡 Adult Portal (`/adult`)
- **Fire Safety Articles (`/adult/blog/{id}`):** Search and read guides on home fire prevention, kitchen grease fires, electrical hazards, smoke alarms, and the P.A.S.S. extinguisher method.
- **Fire Safety Videos:** Watch curated adult fire safety videos directly in the dashboard player.
- **EDITH Simulator:** Launch the interactive home fire spread and exit drill simulator.
- **Berong AI Chatbot:** Click the floating Berong button in the bottom-right corner to ask fire safety questions (with voice readout support).

---

### 3. 🧯 Professional Portal (`/professional`)
- **Training Videos & Officer Ranks:** Watch specialized firefighting and rescue videos to progress through officer ranks (*Novice Officer* → *Active Officer* → *Safety Specialist* → *Elite Responder* → *Master Fire Chief*).
- **The Right Call (`/professional/the-right-call`):** Practice emergency call dispatching and check the leaderboard.
- **Training Manuals & Fire Codes:** View and download official BFP PDF manuals and Philippine Fire Code (RA 9514) references.

---

### 4. 🛡️ Administrator Portal (`/admin`)
- **Content Management Tabs (`/admin`):**
  - **Carousel:** Upload, toggle, and reorder homepage banner images.
  - **Blogs & Videos:** Publish, edit, delete, and reorder articles and categorized YouTube videos (`kids`, `adult`, `professional`).
  - **Users:** Search users, change roles (`admin`, `professional`, `adult`, `kid`), and manage granular access permissions.
  - **Questions:** Manage canned FAQ questions and responses for the Berong Chatbot.
  - **Fire Codes:** Manage Fire Code sections and upload PDF training manuals.
  - **Settings:** Configure **Maintenance Mode** with custom messages, scheduled end times, and live warning banners.
- **Analytics Dashboard (`/admin/analytics`):** View platform engagement, Pre-Test vs. Post-Test competency gains, per-school analytics across Santa Cruz District schools, user feedback, and **Export CSV** reports.

---

## ⚙️ Environment Variables (`.env`)

```dotenv
APP_NAME="BFP Berong SafeScape"
APP_URL=http://127.0.0.1:8000

# Database (Default: SQLite)
DB_CONNECTION=sqlite

# Optional: Berong AI Chatbot & Text-to-Speech
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_TTS_API_KEY=your_google_tts_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```
> **Note:** If `GEMINI_API_KEY` is omitted, the Berong Chatbot automatically runs in **Offline Mode** using built-in fire safety responses.

---

## 🔧 Useful Commands & Troubleshooting

| Task | Command |
|---|---|
| **Build frontend for production** | `npm run build` |
| **Reset database & re-seed** | `php artisan migrate:fresh --seed` |
| **Fix broken uploaded images / PDFs** | `php artisan storage:link` |
| **Clear application caches** | `php artisan optimize:clear` |
| **Run automated tests** | `php artisan test` |

- **Uploaded images or manuals return 404:** Run `php artisan storage:link`.
- **"Vite manifest not found" error:** Keep `npm run dev` running during development, or run `npm run build`.
- **Port 8000 already in use:** Run `php artisan serve --port=8080`.

---

## 📄 License

Licensed under the [MIT License](LICENSE).  
Copyright © 2026 Bureau of Fire Protection – Sta. Cruz Fire Station & LSPU.

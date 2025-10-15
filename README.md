# EduAI Companion 🎓

AI-powered Teacher Assistant Platform for automated grading, lesson planning, and student analytics.

## Features

- 🤖 **AI-Powered Grading** - Automatically grade essays and assignments with detailed feedback
- 📝 **Intelligent Answer Sheets** - Auto-generate questions and parse answer sheets
- 📚 **Lesson Plan Generation** - Create standards-aligned lesson plans instantly
- 📊 **Student Analytics** - Track progress with comprehensive dashboards
- 🎯 **Quiz Generation** - Generate interactive quizzes with automatic grading
- 📈 **Curriculum Alignment** - Map content to educational standards

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL
- **AI Engine**: Ollama (llama3:8b)

---

## 🚀 Complete Setup Guide

Follow these steps to set up and run EduAI Companion locally.

### Prerequisites

- Windows 10/11, macOS, or Linux
- Administrator/sudo access for installations
- Internet connection

---

## Step 1: Install Node.js

### Windows

1. Download Node.js installer from https://nodejs.org/
2. Download the **LTS version** (18.x or higher)
3. Run the installer
4. Check "Automatically install necessary tools" if prompted
5. Restart your terminal

**Verify Installation:**
```powershell
node --version
npm --version
```

### macOS

```bash
# Using Homebrew (recommended)
brew install node

# Or download from https://nodejs.org/
```

**Verify:**
```bash
node --version
npm --version
```

### Linux (Ubuntu/Debian)

```bash
# Update packages
sudo apt update

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version
npm --version
```

---

## Step 2: Install Python

### Windows

1. Download Python from https://www.python.org/downloads/
2. Download **Python 3.9+** (3.10 or 3.11 recommended)
3. **IMPORTANT**: Check "Add Python to PATH" during installation
4. Run the installer

**Verify:**
```powershell
python --version
pip --version
```

### macOS

```bash
# Using Homebrew
brew install python@3.11

# Verify
python3 --version
pip3 --version
```

### Linux (Ubuntu/Debian)

```bash
# Update packages
sudo apt update

# Install Python
sudo apt install python3 python3-pip python3-venv

# Verify
python3 --version
pip3 --version
```

---

## Step 3: Install PostgreSQL

### Windows

1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Download version 15 or higher
3. Run the installer
4. **Remember the password you set for the `postgres` user**
5. Keep default port: 5432

**After Installation:**
```powershell
# Open Command Prompt or PowerShell
psql -U postgres
# Enter your password when prompted

# Create database
CREATE DATABASE eduai_companion;
\q
```

### macOS

```bash
# Using Homebrew
brew install postgresql@15

# Start PostgreSQL
brew services start postgresql@15

# Create database
psql postgres
CREATE DATABASE eduai_companion;
\q
```

### Linux (Ubuntu/Debian)

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres psql
CREATE DATABASE eduai_companion;
\q
```

---

## Step 4: Install Ollama and AI Model

### Windows

1. Download Ollama from https://ollama.ai/download
2. Run the installer
3. Ollama will start automatically

**Pull the AI model:**
```powershell
ollama pull llama3:8b
```

This downloads ~4.7GB. Wait for it to complete.

**Verify:**
```powershell
ollama list
# Should show llama3:8b
```

### macOS

```bash
# Download from https://ollama.ai/download
# Or use Homebrew
brew install ollama

# Start Ollama service
brew services start ollama

# Pull the model
ollama pull llama3:8b

# Verify
ollama list
```

### Linux

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull the model
ollama pull llama3:8b

# Verify
ollama list
```

---

## Step 5: Clone and Setup the Project

### Clone Repository (if from Git)

```bash
git clone <repository-url>
cd EduAI-Companion
```

### Or if you already have the files:

```bash
cd EduAI-Companion
```

---

## Step 6: Setup Backend

### Windows

```powershell
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (optional - uses defaults)
# The app works without .env as it uses default settings

# Run the backend
python main.py
```

**Expected Output:**
```
INFO:root:Starting EduAI Companion API...
INFO:root:No tables found. Initializing database...
INFO:root:✓ Sample data seeded successfully (3 students, 1 course, 1 assignment)
INFO:root:API ready to accept requests
INFO:     Uvicorn running on http://127.0.0.1:8000
```

**Keep this terminal running!**

### macOS/Linux

```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the backend
python main.py
```

**Keep this terminal running!**

---

## Step 7: Setup Frontend

**Open a NEW terminal window** (keep backend running)

### Windows

```powershell
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Run the frontend
npm run dev
```

### macOS/Linux

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Run the frontend
npm run dev
```

**Expected Output:**
```
✓ Ready in 2.5s
○ Local: http://localhost:3000
```

---

## Step 8: Access the Application

Open your browser and go to:

🌐 **http://localhost:3000**

### Available URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs (Interactive!)

---

## 🎉 You're Ready!

The application is now running with:
- ✅ **3 Sample Students** (Alice, Bob, Carol)
- ✅ **1 Sample Course** (English Literature 101)
- ✅ **1 Sample Assignment** (Character Analysis Essay)

### Next Steps

1. **Explore the Dashboard** - See overview statistics
2. **View Students** - Check out sample student profiles
3. **Create an Assignment** - Try the "Short Answer (Auto-Questions)" type
4. **Generate a Lesson Plan** - Test AI lesson generation
5. **Create a Quiz** - Use AI to generate quiz questions
6. **Check Analytics** - View student progress tracking

---

## ⚠️ Important: Before Using AI Features

**Always make sure Ollama is running:**

```bash
ollama list
```

If Ollama isn't running, AI features (grading, lesson plans, quizzes) won't work.

**Common Error:**
```
Error: Failed to establish a new connection
```

**Solution:** Start Ollama:
```bash
ollama serve
# Or just run:
ollama list
```

---

## 🔄 Daily Usage

After initial setup, here's how to start the application:

### Every Time You Want to Use the App:

**Terminal 1 (Backend):**
```bash
cd backend
venv\Scripts\activate        # Windows
# OR
source venv/bin/activate     # Mac/Linux
python main.py
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

**That's it!** The database auto-initializes, and everything works.

---

## 📝 Key Features Usage

### 1. AI-Powered Grading

1. Go to **Assignments**
2. Click on an assignment
3. Click "Submit Work"
4. Select student and paste essay
5. AI grades automatically in 30-60 seconds

### 2. Auto-Generate Questions

1. **Assignments** → **Create Assignment**
2. Choose type: `Short Answer (Auto-Questions)`
3. Fill in title and description
4. AI generates 5 questions automatically
5. Students submit answer sheets
6. AI matches answers to questions and grades!

### 3. Generate Lesson Plans

1. Go to **Lesson Plans**
2. Click "Generate Lesson Plan"
3. Enter topic, grade level, duration
4. AI creates complete lesson plan in 60 seconds

### 4. Create Quizzes

1. Go to **Quizzes**
2. Click "Generate Quiz"
3. Enter topic and number of questions
4. AI generates quiz with automatic grading

### 5. Track Student Progress

1. Go to **Analytics**
2. Select a student
3. View scores, trends, and curriculum progress

---

## 🛠️ Troubleshooting

### Backend Won't Start

**Error: "ModuleNotFoundError"**
```bash
# Make sure virtual environment is activated
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

**Error: "Database connection failed"**
```bash
# Make sure PostgreSQL is running
# Check database exists
psql -U postgres -l

# Create database if missing
psql -U postgres -c "CREATE DATABASE eduai_companion;"
```

### Frontend Won't Start

**Error: "Port 3000 already in use"**
```bash
# Use different port
npm run dev -- -p 3001
```

**Error: "Command not found: npm"**
```bash
# Install Node.js (see Step 1)
```

### Ollama Issues

**Error: "Connection refused on port 11434"**
```bash
# Start Ollama
ollama serve

# Or simply:
ollama list
```

**Error: "Model not found"**
```bash
# Pull the model
ollama pull llama3:8b
```

### PostgreSQL Password Issues

If PostgreSQL asks for a password and you don't have one:

**Update backend/.env** (create if doesn't exist):
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost/eduai_companion
```

Replace `YOUR_PASSWORD` with your PostgreSQL password.

---

## 🔧 Advanced Configuration

### Change Backend Port

Edit `backend/main.py`:
```python
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
```

### Change Frontend Port

```bash
npm run dev -- -p 3001
```

### Use Different Ollama Model

Edit `backend/config.py`:
```python
ollama_model: str = "mistral:7b"
```

---

## 📂 Project Structure

```
EduAI-Companion/
├── backend/                 # FastAPI Backend
│   ├── main.py             # Entry point (run this)
│   ├── models.py           # Database models
│   ├── schemas.py          # API schemas
│   ├── database.py         # Database config
│   ├── ollama_service.py   # AI service
│   ├── config.py           # Settings
│   ├── routers/            # API routes
│   └── requirements.txt    # Python dependencies
│
├── frontend/               # Next.js Frontend
│   ├── app/               # Pages
│   ├── components/        # UI components
│   ├── lib/               # Utilities & API client
│   └── package.json       # Node dependencies
│
├── .gitignore
└── README.md
```

---

## 🎯 Features Overview

### For Teachers

✅ **Automated Grading**
- AI grades essays in 30-60 seconds
- Detailed feedback per submission
- Rubric-based scoring

✅ **Question Generation**
- Auto-generate questions from topics
- AI parses answer sheets
- Intelligent answer matching

✅ **Lesson Planning**
- Generate complete lesson plans
- Standards-aligned content
- Activities and materials included

✅ **Quiz Creation**
- AI-generated questions
- Multiple question types
- Automatic grading

✅ **Student Analytics**
- Progress tracking
- Performance trends
- Curriculum alignment

### For Students

✅ **Instant Feedback** - Know your score immediately
✅ **Detailed Explanations** - Understand mistakes
✅ **Progress Tracking** - See improvement over time
✅ **Flexible Submission** - Answer sheets in any format

---

## 🔐 Security Notes

- This is a **local development setup**
- Database has no password by default (local only)
- Do not expose to the internet without proper security
- For production, add authentication and secure configuration

---

## 📚 Sample Data

The app includes sample data for testing:

**Students:**
- Alice Johnson (STU001) - 10th Grade
- Bob Smith (STU002) - 10th Grade
- Carol Williams (STU003) - 10th Grade

**Course:**
- English Literature 101

**Assignment:**
- Character Analysis Essay (100 points)

Feel free to add more or delete these!

---

## 🆘 Need Help?

1. **Check if all services are running:**
   ```bash
   # PostgreSQL
   psql -U postgres -l
   
   # Ollama
   ollama list
   
   # Backend
   curl http://localhost:8000/api/health
   
   # Frontend
   curl http://localhost:3000
   ```

2. **Check backend logs** - Look at terminal where backend is running

3. **Check browser console** - Press F12 in browser

4. **Restart everything:**
   - Stop backend (Ctrl+C)
   - Stop frontend (Ctrl+C)
   - Start backend again
   - Start frontend again

---

## 🎓 Credits

Built with:
- [Next.js](https://nextjs.org/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Ollama](https://ollama.ai/)
- [PostgreSQL](https://www.postgresql.org/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## 📄 License

MIT License - Feel free to use for educational purposes.

---

**Happy Teaching with AI! 🚀**

\# 🚀 Quick Start - Database Setup

## Run These 3 Commands:

### 1️⃣ Create the Database
```bash
psql postgres -f database_setup.sql
```
> If prompted for password, enter your macOS password or PostgreSQL password

### 2️⃣ Install Dependencies
```bash
pip install -r requirements.txt
```

### 3️⃣ Create Tables
```bash
python init_db.py
```

### ✅ Verify Setup
```bash
python verify_db.py
```

---

## 🆘 If you get errors:

### "psql: command not found"
PostgreSQL not installed:
```bash
brew install postgresql@15
brew services start postgresql@15
```

### "fe_sendauth: no password supplied"
Set up PostgreSQL to not require password locally:
```bash
# Edit pg_hba.conf to trust local connections
# Or create .pgpass file with credentials
```

**OR** run commands manually:
```bash
psql postgres

# Then copy-paste these:
CREATE USER moviehub_user WITH PASSWORD 'moviehub123';
CREATE DATABASE moviehub OWNER moviehub_user;
GRANT ALL PRIVILEGES ON DATABASE moviehub TO moviehub_user;
\c moviehub
GRANT ALL ON SCHEMA public TO moviehub_user;
\q
```

### "pip install fails with SSL error"
```bash
pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org -r requirements.txt
```

---

## 📁 What We've Set Up

✅ Environment config (`.env`)  
✅ Database connection (`app/db.py`)  
✅ User model (`app/models/user.py`)  
✅ Favorite model (`app/models/favorite.py`)  
✅ Setup scripts (SQL and Python)  

## 🎯 Next: Authentication

Once database is working, we'll add:
- Google OAuth login
- Favorites API
- Frontend auth UI


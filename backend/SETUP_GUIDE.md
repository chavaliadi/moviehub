# MovieHub Database Setup Guide

## 📋 Prerequisites

1. **PostgreSQL installed** (you already have it! ✅)
2. **Python 3.8+** with pip
3. **Node.js** for frontend

## 🗄️ Database Setup

### Step 1: Create Database and User

Run this command in your terminal:

```bash
cd /Users/srinivasch/Desktop/MovieHub/backend
psql postgres -f database_setup.sql
```

If prompted for a password, enter your macOS/PostgreSQL password.

**Alternative manual setup:**

```bash
# Open PostgreSQL terminal
psql postgres

# Then run these commands one by one:
CREATE USER moviehub_user WITH PASSWORD 'moviehub123';
CREATE DATABASE moviehub OWNER moviehub_user;
GRANT ALL PRIVILEGES ON DATABASE moviehub TO moviehub_user;
\c moviehub
GRANT ALL ON SCHEMA public TO moviehub_user;
\q
```

### Step 2: Install Python Dependencies

```bash
cd /Users/srinivasch/Desktop/MovieHub/backend
pip install -r requirements.txt
```

If you get SSL errors, try:
```bash
pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org -r requirements.txt
```

### Step 3: Create Database Tables

```bash
python init_db.py
```

This will create the `users` and `favorites` tables.

### Step 4: Verify Database

```bash
psql moviehub -U moviehub_user -c "\dt"
```

You should see:
- `users` table
- `favorites` table

## ✅ What We've Created So Far

### Backend Files:
- ✅ `.env` - Environment configuration
- ✅ `app/db.py` - Database initialization
- ✅ `app/models/user.py` - User model
- ✅ `app/models/favorite.py` - Favorite model
- ✅ `init_db.py` - Database setup script

### Database Schema:

**Users Table:**
```
- id (Primary Key)
- email (Unique)
- name
- google_id (Unique, for OAuth)
- profile_picture
- created_at
- last_login
```

**Favorites Table:**
```
- id (Primary Key)
- user_id (Foreign Key → users.id)
- imdb_id (Movie identifier)
- movie_title
- movie_poster
- movie_year
- movie_type
- added_at
- UNIQUE constraint on (user_id, imdb_id)
```

## 🚀 Next Steps

After database setup is complete, we'll add:
1. Google OAuth authentication endpoints
2. Favorites API endpoints
3. Frontend authentication components
4. Login/Logout UI

## 🔧 Troubleshooting

### PostgreSQL not running?
```bash
# macOS
brew services start postgresql@15

# Check status
brew services list
```

### Can't connect to database?
```bash
# Check if PostgreSQL is listening
psql postgres -c "SELECT version();"
```

### Permission errors?
Make sure the user has proper privileges:
```sql
psql postgres
GRANT ALL PRIVILEGES ON DATABASE moviehub TO moviehub_user;
\c moviehub
GRANT ALL ON SCHEMA public TO moviehub_user;
```

## 📝 Database Connection Details

- **Database Name:** moviehub
- **Username:** moviehub_user
- **Password:** moviehub123
- **Host:** localhost
- **Port:** 5432
- **Connection String:** `postgresql://moviehub_user:moviehub123@localhost:5432/moviehub`

These are stored in your `.env` file.


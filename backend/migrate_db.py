from app import create_app, db
from sqlalchemy import text

app = create_app()

with app.app_context():
    print("Checking database schema...")
    try:
        # Check if column exists
        with db.engine.connect() as conn:
            result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='password_hash'"))
            if result.fetchone():
                print("Column 'password_hash' already exists.")
            else:
                print("Adding 'password_hash' column...")
                conn.execute(text("ALTER TABLE users ADD COLUMN password_hash VARCHAR(500)"))
                conn.commit()
                print("Column added successfully.")
    except Exception as e:
        print(f"Error: {e}")

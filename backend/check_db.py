#!/usr/bin/env python3
"""
Check database connection and existing tables.
"""
from app import create_app
from database import db
from sqlalchemy import inspect, text

def check_database():
    """Check database connection and existing tables."""
    app = create_app()
    
    with app.app_context():
        try:
            # Test basic connection
            result = db.session.execute(text("SELECT 1"))
            print("✓ Database connection successful")
            
            # Check what tables exist
            inspector = inspect(db.engine)
            existing_tables = inspector.get_table_names()
            print(f"Existing tables: {existing_tables}")
            
            # Check if users table exists
            if 'users' in existing_tables:
                print("✓ 'users' table found")
                
                # Check table structure
                columns = inspector.get_columns('users')
                print("Users table columns:")
                for column in columns:
                    print(f"  - {column['name']}: {column['type']}")
            else:
                print("✗ 'users' table NOT found")
                
            # Check current database name
            result = db.session.execute(text("SELECT current_database()"))
            db_name = result.scalar()
            print(f"Connected to database: {db_name}")
            
            # Check current schema
            result = db.session.execute(text("SELECT current_schema()"))
            schema_name = result.scalar()
            print(f"Current schema: {schema_name}")
            
        except Exception as e:
            print(f"Database connection error: {e}")

if __name__ == '__main__':
    check_database()

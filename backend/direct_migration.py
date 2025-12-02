"""
Minimal PostgreSQL Migration for Question Edit Feature
This version avoids loading your routes to prevent dependency errors

Run this file with: python direct_migration_postgres_minimal.py
"""

import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

print("\n" + "="*60)
print("QUESTION EDIT FEATURE - POSTGRESQL MIGRATION (MINIMAL)")
print("="*60)

print("\n⏳ Setting up database connection...")

try:
    # Import only what we need - no routes!
    from flask import Flask
    from config.config_postgres import Config
    from database import db
    
    print("   ✓ Imported Flask and database configuration")
    
    # Create minimal Flask app without loading routes
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)
    
    print("   ✓ Created minimal Flask app (no routes loaded)")
    print("   ✓ Database configured")
    print("   ✓ Ready to run migration!\n")

except ImportError as e:
    print(f"\n❌ Import failed: {e}")
    print("\nThis script only needs:")
    print("  - Flask")
    print("  - SQLAlchemy")
    print("  - psycopg2 (PostgreSQL driver)")
    print("\nYour routes and other dependencies are NOT needed for migration.")
    sys.exit(1)

from sqlalchemy import text


def run_migration():
    """Run the migration to add question edit functionality"""
    
    print("="*60)
    print("STARTING MIGRATION")
    print("="*60)
    
    with app.app_context():
        try:
            # Check database connection
            engine = db.engine
            dialect = engine.dialect.name
            
            print(f"\n✓ Database type: {dialect}")
            print(f"✓ Connected to: {engine.url.database} @ {engine.url.host}")
            
            # Test connection
            db.session.execute(text("SELECT 1"))
            print("✓ Database connection verified\n")
            
            # Step 1: Add columns to questions table
            print("STEP 1: Adding columns to questions table...")
            print("-" * 60)
            
            columns_added = 0
            
            # Try to add edit_count
            try:
                db.session.execute(text("""
                    ALTER TABLE questions 
                    ADD COLUMN IF NOT EXISTS edit_count INTEGER DEFAULT 0
                """))
                db.session.commit()
                print("   ✓ Added edit_count column")
                columns_added += 1
            except Exception as e:
                db.session.rollback()
                if "already exists" in str(e).lower():
                    print("   ⚠ edit_count column already exists")
                else:
                    print(f"   ⚠ Could not add edit_count: {e}")
            
            # Try to add last_edited_at
            try:
                db.session.execute(text("""
                    ALTER TABLE questions 
                    ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMP
                """))
                db.session.commit()
                print("   ✓ Added last_edited_at column")
                columns_added += 1
            except Exception as e:
                db.session.rollback()
                if "already exists" in str(e).lower():
                    print("   ⚠ last_edited_at column already exists")
                else:
                    print(f"   ⚠ Could not add last_edited_at: {e}")
            
            # Try to add last_edited_by
            try:
                db.session.execute(text("""
                    ALTER TABLE questions 
                    ADD COLUMN IF NOT EXISTS last_edited_by INTEGER
                """))
                db.session.commit()
                print("   ✓ Added last_edited_by column")
                columns_added += 1
            except Exception as e:
                db.session.rollback()
                if "already exists" in str(e).lower():
                    print("   ⚠ last_edited_by column already exists")
                else:
                    print(f"   ⚠ Could not add last_edited_by: {e}")

            try:
                db.session.execute(text("""
                    ALTER TABLE questions 
                    ADD COLUMN IF NOT EXISTS ai_generated_ans INTEGER
                """))
                db.session.commit()
                print("   ✓ Added ai_generated_ans column")
                columns_added += 1
            except Exception as e:
                db.session.rollback()
                if "already exists" in str(e).lower():
                    print("   ⚠ ai_generated_ans column already exists")
                else:
                    print(f"   ⚠ Could not add ai_generated_ans: {e}")
            
            # Try to add foreign key constraint
            try:
                db.session.execute(text("""
                    ALTER TABLE questions 
                    ADD CONSTRAINT fk_questions_last_edited_by 
                    FOREIGN KEY (last_edited_by) REFERENCES users(id)
                """))
                db.session.commit()
                print("   ✓ Added foreign key constraint for last_edited_by")
            except Exception as e:
                db.session.rollback()
                if "already exists" in str(e).lower():
                    print("   ⚠ Foreign key constraint already exists")
                else:
                    print(f"   ⚠ Could not add foreign key (not critical): {e}")
            
            print(f"\n   ✅ Step 1 complete! ({columns_added} columns added)\n")
            
            # Step 2: Create question_edit_history table
            print("STEP 2: Creating question_edit_history table...")
            print("-" * 60)

            
            try:
                db.session.execute(text("""
                    CREATE TABLE IF NOT EXISTS question_edit_history (
                        id SERIAL PRIMARY KEY,
                        question_id INTEGER NOT NULL,
                        editor_id INTEGER NOT NULL,
                        previous_title TEXT,
                        new_title TEXT,
                        previous_body TEXT,
                        new_body TEXT,
                        previous_tag_ids JSON,
                        new_tag_ids JSON,
                        edit_reason TEXT,
                        is_moderator_edit BOOLEAN DEFAULT FALSE,
                        requires_review BOOLEAN DEFAULT FALSE,
                        created_at TIMESTAMP DEFAULT NOW(),
                        updated_at TIMESTAMP DEFAULT NOW(),
                        CONSTRAINT fk_question_edit_history_question_id 
                            FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
                        CONSTRAINT fk_question_edit_history_editor_id 
                            FOREIGN KEY (editor_id) REFERENCES users(id)
                    )
                """))
                db.session.commit()
                print("   ✓ Created question_edit_history table")
                print("   ✓ Added foreign key constraints")
            except Exception as e:
                db.session.rollback()
                if "already exists" in str(e).lower():
                    print("   ⚠ question_edit_history table already exists")
                else:
                    print(f"   ⚠ Error creating table: {e}")
                    raise
            
            print("\n   ✅ Step 2 complete!\n")
            
            # Step 3: Create indexes
            print("STEP 3: Creating indexes for better performance...")
            print("-" * 60)
            
            indexes_created = 0
            
            try:
                db.session.execute(text("""
                    CREATE INDEX IF NOT EXISTS ix_question_edit_history_question_id 
                    ON question_edit_history(question_id)
                """))
                db.session.commit()
                print("   ✓ Created index on question_id")
                indexes_created += 1
            except Exception as e:
                db.session.rollback()
                print(f"   ⚠ Could not create index on question_id: {e}")
            
            try:
                db.session.execute(text("""
                    CREATE INDEX IF NOT EXISTS ix_question_edit_history_editor_id 
                    ON question_edit_history(editor_id)
                """))
                db.session.commit()
                print("   ✓ Created index on editor_id")
                indexes_created += 1
            except Exception as e:
                db.session.rollback()
                print(f"   ⚠ Could not create index on editor_id: {e}")
            
            try:
                db.session.execute(text("""
                    CREATE INDEX IF NOT EXISTS ix_question_edit_history_created_at 
                    ON question_edit_history(created_at)
                """))
                db.session.commit()
                print("   ✓ Created index on created_at")
                indexes_created += 1
            except Exception as e:
                db.session.rollback()
                print(f"   ⚠ Could not create index on created_at: {e}")
            
            print(f"\n   ✅ Step 3 complete! ({indexes_created} indexes created)\n")
            
            # Step 4: Verify
            print("STEP 4: Verifying database structure...")
            print("-" * 60)
            
            # Check columns
            result = db.session.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'questions' 
                AND column_name IN ('edit_count', 'last_edited_at', 'last_edited_by')
            """))
            columns = [row[0] for row in result]
            
            for col in ['edit_count', 'last_edited_at', 'last_edited_by']:
                if col in columns:
                    print(f"   ✓ {col} column exists in questions table")
                else:
                    print(f"   ❌ {col} column NOT found!")
            
            # Check table
            result = db.session.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_name = 'question_edit_history'
            """))
            if result.fetchone():
                print("   ✓ question_edit_history table exists")
            else:
                print("   ❌ question_edit_history table NOT found!")
            
            print("\n   ✅ Step 4 complete!\n")
            
            # Success!
            print("="*60)
            print("✅ MIGRATION COMPLETED SUCCESSFULLY!")
            print("="*60)
            print("\n📋 Summary:")
            print(f"   ✓ Added {columns_added} columns to questions table")
            print("   ✓ Created question_edit_history table")
            print(f"   ✓ Created {indexes_created} indexes")
            print("   ✓ Verified all changes")
            
            print("\n📝 Next Steps:")
            print("   1. Copy question_updated.py to models/question.py")
            print("   2. Copy question_edit_history.py to models/")
            print("   3. Copy question_routes_updated.py to routes/")
            print("   4. Copy frontend component files")
            print("   5. Test the edit feature!")
            
            print("\n🎉 Your PostgreSQL database is ready for question editing!\n")
            
        except Exception as e:
            db.session.rollback()
            print("\n" + "="*60)
            print("❌ MIGRATION FAILED")
            print("="*60)
            print(f"\nError: {e}")
            print("\nPossible reasons:")
            print("  - Questions table doesn't exist")
            print("  - Insufficient database permissions")
            print("  - Network connection to university server")
            print("\nPlease check and try again.")
            import traceback
            traceback.print_exc()


if __name__ == '__main__':
    try:
        run_migration()
    except KeyboardInterrupt:
        print("\n\n❌ Migration cancelled by user")

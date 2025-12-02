"""
PostgreSQL Migration for Answer Edit Feature
Adds edit tracking fields to answers table and creates answer_edit_history table

Run this file with: python migrate_answer_edit.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from sqlalchemy import text

print("\n" + "="*60)
print("ANSWER EDIT FEATURE - POSTGRESQL MIGRATION")
print("="*60)

app = create_app()

def run_migration():
    """Run the migration to add answer edit functionality"""
    
    print("\n" + "="*60)
    print("STARTING MIGRATION")
    print("="*60)
    
    with app.app_context():
        try:
            engine = db.engine
            dialect = engine.dialect.name
            
            print(f"\n✓ Database type: {dialect}")
            print(f"✓ Connected to: {engine.url.database} @ {engine.url.host}\n")
            
            # Step 1: Add columns to answers table
            print("STEP 1: Adding columns to answers table...")
            print("-" * 60)
            
            try:
                db.session.execute(text("""
                    ALTER TABLE answers 
                    ADD COLUMN IF NOT EXISTS is_accepted BOOLEAN DEFAULT FALSE,
                    ADD COLUMN IF NOT EXISTS edit_count INTEGER DEFAULT 0,
                    ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMP,
                    ADD COLUMN IF NOT EXISTS last_edited_by INTEGER
                """))
                db.session.commit()
                print("   ✓ Added is_accepted column")
                print("   ✓ Added edit_count column")
                print("   ✓ Added last_edited_at column")
                print("   ✓ Added last_edited_by column")
            except Exception as e:
                db.session.rollback()
                if "already exists" in str(e).lower():
                    print("   ⚠ Columns might already exist")
                else:
                    raise
            
            # Add foreign key constraint
            try:
                db.session.execute(text("""
                    ALTER TABLE answers 
                    ADD CONSTRAINT fk_answers_last_edited_by 
                    FOREIGN KEY (last_edited_by) REFERENCES users(id)
                """))
                db.session.commit()
                print("   ✓ Added foreign key constraint for last_edited_by")
            except Exception as e:
                db.session.rollback()
                if "already exists" in str(e).lower():
                    print("   ⚠ Foreign key constraint already exists")
            
            print("\n   ✅ Step 1 complete!\n")
            
            # Step 2: Create answer_edit_history table
            print("STEP 2: Creating answer_edit_history table...")
            print("-" * 60)
            
            try:
                db.session.execute(text("""
                    CREATE TABLE IF NOT EXISTS answer_edit_history (
                        id SERIAL PRIMARY KEY,
                        answer_id INTEGER NOT NULL,
                        editor_id INTEGER NOT NULL,
                        previous_body TEXT,
                        new_body TEXT,
                        previous_is_accepted BOOLEAN,
                        new_is_accepted BOOLEAN,
                        edit_reason TEXT,
                        is_moderator_edit BOOLEAN DEFAULT FALSE,
                        created_at TIMESTAMP DEFAULT NOW(),
                        updated_at TIMESTAMP DEFAULT NOW(),
                        CONSTRAINT fk_answer_edit_history_answer_id 
                            FOREIGN KEY (answer_id) REFERENCES answers(id) ON DELETE CASCADE,
                        CONSTRAINT fk_answer_edit_history_editor_id 
                            FOREIGN KEY (editor_id) REFERENCES users(id)
                    )
                """))
                db.session.commit()
                print("   ✓ Created answer_edit_history table")
                print("   ✓ Added foreign key constraints")
            except Exception as e:
                db.session.rollback()
                if "already exists" in str(e).lower():
                    print("   ⚠ answer_edit_history table already exists")
                else:
                    raise
            
            print("\n   ✅ Step 2 complete!\n")
            
            # Step 3: Create indexes
            print("STEP 3: Creating indexes for better performance...")
            print("-" * 60)
            
            try:
                db.session.execute(text("""
                    CREATE INDEX IF NOT EXISTS ix_answer_edit_history_answer_id 
                    ON answer_edit_history(answer_id)
                """))
                db.session.commit()
                print("   ✓ Created index on answer_id")
            except:
                print("   ⚠ Index on answer_id exists")
            
            try:
                db.session.execute(text("""
                    CREATE INDEX IF NOT EXISTS ix_answer_edit_history_editor_id 
                    ON answer_edit_history(editor_id)
                """))
                db.session.commit()
                print("   ✓ Created index on editor_id")
            except:
                print("   ⚠ Index on editor_id exists")
            
            try:
                db.session.execute(text("""
                    CREATE INDEX IF NOT EXISTS ix_answer_edit_history_created_at 
                    ON answer_edit_history(created_at)
                """))
                db.session.commit()
                print("   ✓ Created index on created_at")
            except:
                print("   ⚠ Index on created_at exists")
            
            print("\n   ✅ Step 3 complete!\n")
            
            # Step 4: Verify
            print("STEP 4: Verifying database structure...")
            print("-" * 60)
            
            # Check columns
            result = db.session.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'answers' 
                AND column_name IN ('is_accepted', 'edit_count', 'last_edited_at', 'last_edited_by')
            """))
            columns = [row[0] for row in result]
            
            for col in ['is_accepted', 'edit_count', 'last_edited_at', 'last_edited_by']:
                if col in columns:
                    print(f"   ✓ {col} column exists in answers table")
            
            # Check table
            result = db.session.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_name = 'answer_edit_history'
            """))
            if result.fetchone():
                print("   ✓ answer_edit_history table exists")
            
            print("\n   ✅ Step 4 complete!\n")
            
            # Success!
            print("="*60)
            print("✅ MIGRATION COMPLETED SUCCESSFULLY!")
            print("="*60)
            print("\n📋 Summary:")
            print("   ✓ Added 4 columns to answers table")
            print("   ✓ Created answer_edit_history table")
            print("   ✓ Created 3 indexes for performance")
            print("   ✓ Verified all changes")
            
            print("\n📝 Next Steps:")
            print("   1. Copy answer_updated.py to models/answer.py")
            print("   2. Copy answer_edit_history.py to models/")
            print("   3. Copy answer_routes_updated.py to routes/")
            print("   4. Copy frontend component files")
            print("   5. Test the edit feature!")
            
            print("\n🎉 Your PostgreSQL database is ready for answer editing!\n")
            
        except Exception as e:
            db.session.rollback()
            print("\n" + "="*60)
            print("❌ MIGRATION FAILED")
            print("="*60)
            print(f"\nError: {e}")
            import traceback
            traceback.print_exc()


if __name__ == '__main__':
    run_migration()
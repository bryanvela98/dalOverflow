"""
PostgreSQL Script to Remove Unnecessary Edit Columns
Removes last_edited_at and last_edited_by from questions and answers tables

Run this file with: python remove_edit_columns.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from sqlalchemy import text

print("\n" + "="*60)
print("REMOVE UNNECESSARY EDIT COLUMNS")
print("="*60)

app = create_app()

def run_cleanup():
    """Remove last_edited_at and last_edited_by columns"""
    
    print("\n" + "="*60)
    print("STARTING CLEANUP")
    print("="*60)
    
    with app.app_context():
        try:
            engine = db.engine
            
            print(f"\n✓ Database: {engine.url.database} @ {engine.url.host}\n")
            
            # Step 1: Drop columns from questions table
            print("STEP 1: Removing columns from questions table...")
            print("-" * 60)
            
            # Drop foreign key constraint first
            try:
                db.session.execute(text("""
                    ALTER TABLE questions 
                    DROP CONSTRAINT IF EXISTS fk_questions_last_edited_by
                """))
                db.session.commit()
                print("   ✓ Dropped foreign key constraint fk_questions_last_edited_by")
            except Exception as e:
                db.session.rollback()
                print(f"   ⚠ Foreign key constraint might not exist: {str(e)}")
            
            # Drop last_edited_by column
            try:
                db.session.execute(text("""
                    ALTER TABLE questions 
                    DROP COLUMN IF EXISTS last_edited_by
                """))
                db.session.commit()
                print("   ✓ Dropped last_edited_by column")
            except Exception as e:
                db.session.rollback()
                print(f"   ⚠ Error dropping last_edited_by: {str(e)}")
            
            # Drop last_edited_at column
            try:
                db.session.execute(text("""
                    ALTER TABLE questions 
                    DROP COLUMN IF EXISTS last_edited_at
                """))
                db.session.commit()
                print("   ✓ Dropped last_edited_at column")
            except Exception as e:
                db.session.rollback()
                print(f"   ⚠ Error dropping last_edited_at: {str(e)}")
            
            print("\n   ✅ Step 1 complete!\n")
            
            # Step 2: Drop columns from answers table
            print("STEP 2: Removing columns from answers table...")
            print("-" * 60)
            
            # Drop foreign key constraint first
            try:
                db.session.execute(text("""
                    ALTER TABLE answers 
                    DROP CONSTRAINT IF EXISTS fk_answers_last_edited_by
                """))
                db.session.commit()
                print("   ✓ Dropped foreign key constraint fk_answers_last_edited_by")
            except Exception as e:
                db.session.rollback()
                print(f"   ⚠ Foreign key constraint might not exist: {str(e)}")
            
            # Drop last_edited_by column
            try:
                db.session.execute(text("""
                    ALTER TABLE answers 
                    DROP COLUMN IF EXISTS last_edited_by
                """))
                db.session.commit()
                print("   ✓ Dropped last_edited_by column")
            except Exception as e:
                db.session.rollback()
                print(f"   ⚠ Error dropping last_edited_by: {str(e)}")
            
            # Drop last_edited_at column
            try:
                db.session.execute(text("""
                    ALTER TABLE answers 
                    DROP COLUMN IF EXISTS last_edited_at
                """))
                db.session.commit()
                print("   ✓ Dropped last_edited_at column")
            except Exception as e:
                db.session.rollback()
                print(f"   ⚠ Error dropping last_edited_at: {str(e)}")
            
            print("\n   ✅ Step 2 complete!\n")
            
            # Step 3: Verify
            print("STEP 3: Verifying cleanup...")
            print("-" * 60)
            
            # Check questions table
            result = db.session.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'questions' 
                AND column_name IN ('last_edited_at', 'last_edited_by')
            """))
            remaining_q = [row[0] for row in result]
            
            if not remaining_q:
                print("   ✓ Questions table: All unnecessary columns removed")
            else:
                print(f"   ⚠ Questions table still has: {remaining_q}")
            
            # Check answers table
            result = db.session.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'answers' 
                AND column_name IN ('last_edited_at', 'last_edited_by')
            """))
            remaining_a = [row[0] for row in result]
            
            if not remaining_a:
                print("   ✓ Answers table: All unnecessary columns removed")
            else:
                print(f"   ⚠ Answers table still has: {remaining_a}")
            
            # Check what we kept
            result = db.session.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'questions' 
                AND column_name IN ('edit_count', 'updated_at')
            """))
            kept_q = [row[0] for row in result]
            print(f"   ✓ Questions table kept: {kept_q}")
            
            result = db.session.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'answers' 
                AND column_name IN ('edit_count', 'updated_at', 'is_accepted')
            """))
            kept_a = [row[0] for row in result]
            print(f"   ✓ Answers table kept: {kept_a}")
            
            print("\n   ✅ Step 3 complete!\n")
            
            # Success!
            print("="*60)
            print("✅ CLEANUP COMPLETED SUCCESSFULLY!")
            print("="*60)
            print("\n📋 Summary:")
            print("   ✓ Removed last_edited_at from questions table")
            print("   ✓ Removed last_edited_by from questions table")
            print("   ✓ Removed last_edited_at from answers table")
            print("   ✓ Removed last_edited_by from answers table")
            print("\n📊 Kept columns for edit tracking:")
            print("   Questions: edit_count, updated_at")
            print("   Answers: edit_count, updated_at, is_accepted")
            
            print("\n📝 Next Steps:")
            print("   1. Copy question_minimal.py to models/question.py")
            print("   2. Copy answer_minimal.py to models/answer.py")
            print("   3. Copy answer_routes_minimal.py to routes/")
            print("   4. Copy question_routes_minimal.py to routes/")
            print("   5. NO edit history model needed!")
            
            print("\n🎉 Your database is now clean and minimal!\n")
            
        except Exception as e:
            db.session.rollback()
            print("\n" + "="*60)
            print("❌ CLEANUP FAILED")
            print("="*60)
            print(f"\nError: {e}")
            import traceback
            traceback.print_exc()


if __name__ == '__main__':
    print("\n⚠️  WARNING: This will remove columns from your database!")
    print("Columns to be removed:")
    print("  - questions.last_edited_at")
    print("  - questions.last_edited_by")
    print("  - answers.last_edited_at")
    print("  - answers.last_edited_by")
    print("\nColumns to be kept:")
    print("  - questions.edit_count")
    print("  - questions.updated_at (from BaseModel)")
    print("  - answers.edit_count")
    print("  - answers.updated_at (from BaseModel)")
    print("  - answers.is_accepted")
    
    confirm = input("\nType 'yes' to continue: ")
    if confirm.lower() == 'yes':
        run_cleanup()
    else:
        print("\nCleanup cancelled.")
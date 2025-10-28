from supabase import create_client

url = "postgresql://postgres:Dal@123@db.pqygcttjdvxynizbwwui.supabase.co:5432/postgres"
key = "16480"
supabase = create_client(url, key)


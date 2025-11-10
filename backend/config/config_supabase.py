import os
from supabase import create_client, Client
url="https://pqygcttjdvxynizbwwui.supabase.co"
key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxeWdjdHRqZHZ4eW5pemJ3d3VpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MzAwODIsImV4cCI6MjA3NzIwNjA4Mn0.n7GqoL9mHeDe_Po6fT6Mz77Oj9X64WDEFOyf7emwsgM"
supabase: Client = create_client(url, key)


response = supabase.table('User').select('*').limit(1).execute()

if response.data is not None:
    print('Connection successful:', response.data)
else:
    print('Connection failed. Error:', response.error)


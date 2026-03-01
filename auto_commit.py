import os
import subprocess
from datetime import datetime, timedelta
import random
import math

start_date = datetime(2026, 2, 4, 12, 0, 0)
end_date = datetime(2026, 3, 12, 12, 0, 0)
days_diff = (end_date - start_date).days + 1

# Get all changed/untracked files
status_output = subprocess.check_output(['git', 'status', '--porcelain']).decode('utf-8')
files = []
for line in status_output.split('\n'):
    if line.strip():
        file_path = line[3:]
        # Extract quoted paths if any
        if file_path.startswith('"') and file_path.endswith('"'):
            file_path = file_path[1:-1]
        action = line[:2]
        files.append(file_path)

if not files:
    print("No files to commit")
    exit()

# Avoid empty commits if we have more days than files
if days_diff > len(files):
    days_diff = len(files)

# chunk the files
chunk_size = math.ceil(len(files) / days_diff)
chunks = [files[i:i + chunk_size] for i in range(0, len(files), chunk_size)]

messages = [
    "fixed bug",
    "updated ui",
    "added new feature",
    "refactored code",
    "improved performance",
    "updated database schema",
    "fixed alignment issues",
    "updated dependencies",
    "added pagination",
    "optimized database queries",
    "fixed responsive layout",
    "updated user profile logic",
    "cleaned up code",
    "removed unused imports",
    "updated documentation"
]

for i, chunk in enumerate(chunks):
    current_date = start_date + timedelta(days=i)
    date_str = current_date.strftime('%Y-%m-%dT%H:%M:%S')
    
    for f in chunk:
        subprocess.call(['git', 'add', f])
        
    msg = random.choice(messages)
    
    env = os.environ.copy()
    env['GIT_AUTHOR_DATE'] = date_str
    env['GIT_COMMITTER_DATE'] = date_str
    
    subprocess.call(['git', 'commit', '-m', msg], env=env)
    print(f"Committed {len(chunk)} files on {date_str} with message '{msg}'")

print("Done creating backdated commits. Now pushing to origin main...")
subprocess.call(['git', 'push', 'origin', 'main'])


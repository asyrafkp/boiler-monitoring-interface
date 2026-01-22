#!/usr/bin/env python3
import os
import sys

# Try Graph API first
print("=== Testing Graph API Integration ===\n")

TENANT_ID = os.getenv('AZURE_TENANT_ID')
CLIENT_ID = os.getenv('AZURE_CLIENT_ID')
CLIENT_SECRET = os.getenv('AZURE_CLIENT_SECRET')

if TENANT_ID and CLIENT_ID and CLIENT_SECRET:
    print("✅ Azure credentials found in environment")
    print(f"   Tenant: {TENANT_ID[:8]}...")
    print(f"   Client: {CLIENT_ID[:8]}...")
    print(f"   Secret: {'*' * 20}\n")
    print("Running Graph API sync...\n")
    import subprocess
    result = subprocess.run(['python', '.github/scripts/download_from_graph_api.py'], capture_output=True, text=True)
    print(result.stdout)
    if result.returncode != 0:
        print("STDERR:", result.stderr)
    sys.exit(result.returncode)
else:
    print("❌ Azure credentials NOT found in environment")
    print("\nTo test locally, set these environment variables:")
    print("  $env:AZURE_TENANT_ID = 'your-tenant-id'")
    print("  $env:AZURE_CLIENT_ID = 'your-client-id'")
    print("  $env:AZURE_CLIENT_SECRET = 'your-client-secret'")
    print("\nThen run: python sync_now.py\n")
    print("OR trigger GitHub Actions workflow:")
    print("  1. Go to your GitHub repo → Actions tab")
    print("  2. Select 'Sync OneDrive Excel to GitHub (Hourly)'")
    print("  3. Click 'Run workflow' → Run workflow")
    sys.exit(1)


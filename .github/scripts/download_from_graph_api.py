#!/usr/bin/env python3
"""
Download Excel from OneDrive using Microsoft Graph API
Requires: Azure app registration with Files.Read.All permission
"""

import os
import sys
import requests
import json
from pathlib import Path
from datetime import datetime

# Get credentials from environment
TENANT_ID = os.getenv('AZURE_TENANT_ID')
CLIENT_ID = os.getenv('AZURE_CLIENT_ID')
CLIENT_SECRET = os.getenv('AZURE_CLIENT_SECRET')
ONEDRIVE_ITEM_ID = os.getenv('ONEDRIVE_ITEM_ID')  # Item ID or use fallback

# Fallback: keep share link as backup
ONEDRIVE_LINK = os.getenv('ONEDRIVE_LINK')

if not all([TENANT_ID, CLIENT_ID, CLIENT_SECRET]):
    print("❌ ERROR: Missing Azure credentials")
    print("Required environment variables:")
    print("  - AZURE_TENANT_ID")
    print("  - AZURE_CLIENT_ID")
    print("  - AZURE_CLIENT_SECRET")
    print("  - ONEDRIVE_ITEM_ID (optional)")
    
    if ONEDRIVE_LINK:
        print("\n⚠️ Falling back to OneDrive share link...")
        # Fall back to share link download
        import subprocess
        subprocess.run(['python', '.github/scripts/download_from_onedrive.py'])
        sys.exit(0)
    else:
        sys.exit(1)

print("🔐 Authenticating with Microsoft Graph API...")
print(f"Tenant: {TENANT_ID[:8]}...")
print(f"Client: {CLIENT_ID[:8]}...\n")

try:
    # Step 1: Get access token
    token_url = f"https://login.microsoftonline.com/{TENANT_ID}/oauth2/v2.0/token"
    
    token_data = {
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'scope': 'https://graph.microsoft.com/.default',
        'grant_type': 'client_credentials'
    }
    
    print("📝 Requesting access token...")
    token_response = requests.post(token_url, data=token_data, timeout=10)
    
    if token_response.status_code != 200:
        print(f"❌ Authentication failed: {token_response.status_code}")
        print(token_response.text[:200])
        sys.exit(1)
    
    token_json = token_response.json()
    access_token = token_json.get('access_token')
    
    if not access_token:
        print("❌ No access token received")
        print(token_response.text)
        sys.exit(1)
    
    print("✅ Access token obtained\n")
    
    # Step 2: Find boiler_data.xlsx in OneDrive
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    print("🔍 Searching for boiler_data.xlsx in OneDrive...")
    
    # List files from user's drive root
    search_url = "https://graph.microsoft.com/v1.0/me/drive/root/children?$filter=name eq 'boiler_data.xlsx'"
    
    search_response = requests.get(search_url, headers=headers, timeout=10)
    
    if search_response.status_code != 200:
        print(f"❌ Search failed: {search_response.status_code}")
        print(search_response.text[:200])
        sys.exit(1)
    
    search_json = search_response.json()
    files = search_json.get('value', [])
    
    if not files:
        print("❌ boiler_data.xlsx not found in OneDrive root")
        print("💡 Tip: Make sure the file is in your OneDrive root folder")
        sys.exit(1)
    
    file_item = files[0]
    file_id = file_item['id']
    file_name = file_item['name']
    file_size = file_item.get('size', 0)
    
    print(f"✅ Found: {file_name} ({file_size:,} bytes)\n")
    
    # Step 3: Download file content
    print("📥 Downloading file...")
    
    download_url = f"https://graph.microsoft.com/v1.0/me/drive/items/{file_id}/content"
    
    download_response = requests.get(download_url, headers=headers, timeout=30)
    
    if download_response.status_code != 200:
        print(f"❌ Download failed: {download_response.status_code}")
        print(download_response.text[:200])
        sys.exit(1)
    
    # Step 4: Save file
    Path('data').mkdir(exist_ok=True)
    
    file_path = 'data/boiler_data.xlsx'
    with open(file_path, 'wb') as f:
        f.write(download_response.content)
    
    file_size_downloaded = len(download_response.content)
    print(f"✅ File saved to {file_path}")
    print(f"📊 Size: {file_size_downloaded:,} bytes")
    print(f"⏰ Timestamp: {datetime.now().isoformat()}")
    
except requests.exceptions.Timeout:
    print("❌ Request timeout - check your network connection")
    sys.exit(1)
except requests.exceptions.RequestException as e:
    print(f"❌ Network error: {e}")
    sys.exit(1)
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

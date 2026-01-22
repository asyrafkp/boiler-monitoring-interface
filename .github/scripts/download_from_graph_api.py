#!/usr/bin/env python3
"""
Download Excel from OneDrive using:
1. Microsoft Graph API (if credentials available)
2. OneDrive share link (fallback)
"""

import os
import sys
import requests
from pathlib import Path
from datetime import datetime

# Get credentials from environment
TENANT_ID = os.getenv('AZURE_TENANT_ID')
CLIENT_ID = os.getenv('AZURE_CLIENT_ID')
CLIENT_SECRET = os.getenv('AZURE_CLIENT_SECRET')
REFRESH_TOKEN = os.getenv('AZURE_REFRESH_TOKEN')
ONEDRIVE_FILE_NAME = os.getenv('ONEDRIVE_FILE_NAME', 'boiler_data.xlsx')
ONEDRIVE_LINK = os.getenv('ONEDRIVE_LINK')

print("=" * 60)
print("📥 OneDrive File Download")
print("=" * 60)

# Try delegated auth with refresh token first (best method)
if TENANT_ID and CLIENT_ID and REFRESH_TOKEN:
    print("\n🔐 Using delegated authentication (refresh token)...")
    
    try:
        token_url = f"https://login.microsoftonline.com/{TENANT_ID}/oauth2/v2.0/token"
        token_data = {
            'client_id': CLIENT_ID,
            'grant_type': 'refresh_token',
            'refresh_token': REFRESH_TOKEN,
            'scope': 'Files.Read.All Sites.Read.All offline_access'
        }
        
        token_response = requests.post(token_url, data=token_data, timeout=10)
        
        if token_response.status_code == 200:
            print("✅ Access token obtained via refresh token")
            token_json = token_response.json()
            access_token = token_json.get('access_token')
            new_refresh_token = token_json.get('refresh_token')
            
            # Note: New refresh token might be returned, ideally should update GitHub secret
            if new_refresh_token and new_refresh_token != REFRESH_TOKEN:
                print("⚠️  Note: New refresh token available (consider updating GitHub secret)")
            
            if access_token:
                headers = {
                    'Authorization': f'Bearer {access_token}',
                    'Content-Type': 'application/json'
                }
                
                # Search for file
                print(f"🔍 Searching for '{ONEDRIVE_FILE_NAME}' in OneDrive...")
                
                # Use delegated auth endpoint (works with refresh token)
                search_url = f"https://graph.microsoft.com/v1.0/me/drive/root:/{ONEDRIVE_FILE_NAME}"
                search_response = requests.get(search_url, headers=headers, timeout=10)
                
                if search_response.status_code == 200:
                    file_item = search_response.json()
                    file_id = file_item.get('id')
                    file_name = file_item.get('name')
                    file_size = file_item.get('size', 0)
                    
                    print(f"✅ Found: {file_name} ({file_size:,} bytes)")
                    
                    # Download file
                    print("📥 Downloading file...")
                    download_url = f"https://graph.microsoft.com/v1.0/me/drive/items/{file_id}/content"
                    download_response = requests.get(download_url, headers=headers, timeout=30)
                    
                    if download_response.status_code == 200:
                        Path('data').mkdir(exist_ok=True)
                        with open('data/boiler_data.xlsx', 'wb') as f:
                            f.write(download_response.content)
                        print(f"✅ File saved: data/boiler_data.xlsx ({len(download_response.content):,} bytes)")
                        print(f"⏰ Timestamp: {datetime.now().isoformat()}\n")
                        print("🎉 SUCCESS: Automatic sync using delegated auth")
                        sys.exit(0)
                    else:
                        print(f"⚠️ Download failed: {download_response.status_code}")
                elif search_response.status_code == 404:
                    print(f"⚠️ File not found: {ONEDRIVE_FILE_NAME}")
                    print("  Make sure it's in your OneDrive root folder")
                else:
                    print(f"⚠️ Search failed: {search_response.status_code}")
                    print(search_response.text[:200])
        else:
            print(f"⚠️ Refresh token auth failed: {token_response.status_code}")
            print(token_response.text[:200])
    except Exception as e:
        print(f"⚠️ Delegated auth error: {e}")

# Try Graph API with client credentials (limited, won't work with /me/drive)
elif TENANT_ID and CLIENT_ID and CLIENT_SECRET:
    print("\n🔐 Attempting Graph API authentication...")

try:
        token_url = f"https://login.microsoftonline.com/{TENANT_ID}/oauth2/v2.0/token"
        token_data = {
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET,
            'scope': 'https://graph.microsoft.com/.default',
            'grant_type': 'client_credentials'
        }
        
        token_response = requests.post(token_url, data=token_data, timeout=10)
        
        if token_response.status_code == 200:
            print("✅ Access token obtained")
            access_token = token_response.json().get('access_token')
            
            if access_token:
                headers = {
                    'Authorization': f'Bearer {access_token}',
                    'Content-Type': 'application/json'
                }
                
                # Try to find file using search
                print(f"🔍 Searching for '{ONEDRIVE_FILE_NAME}' in OneDrive...")
                
                search_url = f"https://graph.microsoft.com/v1.0/me/drive/root:/{ONEDRIVE_FILE_NAME}"
                search_response = requests.get(search_url, headers=headers, timeout=10)
                
                if search_response.status_code == 200:
                    file_item = search_response.json()
                    file_id = file_item.get('id')
                    print(f"✅ Found: {ONEDRIVE_FILE_NAME}")
                    
                    # Download file
                    print("📥 Downloading file...")
                    download_url = f"https://graph.microsoft.com/v1.0/me/drive/items/{file_id}/content"
                    download_response = requests.get(download_url, headers=headers, timeout=30)
                    
                    if download_response.status_code == 200:
                        Path('data').mkdir(exist_ok=True)
                        with open('data/boiler_data.xlsx', 'wb') as f:
                            f.write(download_response.content)
                        print(f"✅ File saved: data/boiler_data.xlsx ({len(download_response.content):,} bytes)")
                        print(f"⏰ Timestamp: {datetime.now().isoformat()}\n")
                        sys.exit(0)
                    else:
                        print(f"⚠️ Download failed: {download_response.status_code}")
                elif search_response.status_code == 404:
                    print(f"⚠️ File not found: {ONEDRIVE_FILE_NAME}")
                    print("  Make sure it's in your OneDrive root folder")
                else:
                    print(f"⚠️ Search failed: {search_response.status_code}")
    except Exception as e:
        print(f"⚠️ Graph API error: {e}")

# Fallback to share link
print("\n📌 Falling back to OneDrive share link...\n")

if not ONEDRIVE_LINK:
    print("❌ ERROR: No download method available")
    print("\nYou need ONE of these:")
    print("  1. Graph API: AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET")
    print("  2. Share Link: ONEDRIVE_LINK")
    print("\nTo generate a new share link:")
    print("  1. Open OneDrive → Find your Excel file")
    print("  2. Click 'Share' → 'Copy link'")
    print("  3. Add to GitHub secret: ONEDRIVE_LINK")
    sys.exit(1)

print("📥 Downloading from OneDrive share link...")

urls_to_try = [
    ONEDRIVE_LINK + "&download=1",
    ONEDRIVE_LINK.replace("?", "?download=1&") if "?" in ONEDRIVE_LINK else ONEDRIVE_LINK,
    ONEDRIVE_LINK,
]

file_downloaded = False

for i, url in enumerate(urls_to_try, 1):
    try:
        print(f"  Attempt {i}...", end=" ")
        
        response = requests.get(
            url,
            timeout=30,
            allow_redirects=True,
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        )
        
        if response.status_code == 200:
            content_type = response.headers.get('content-type', '')
            if 'spreadsheet' in content_type.lower() or 'sheet' in content_type.lower():
                Path('data').mkdir(exist_ok=True)
                with open('data/boiler_data.xlsx', 'wb') as f:
                    f.write(response.content)
                print(f"✅ Success ({len(response.content):,} bytes)")
                print(f"✅ File saved: data/boiler_data.xlsx")
                print(f"⏰ Timestamp: {datetime.now().isoformat()}\n")
                file_downloaded = True
                break
            else:
                print(f"⚠️ Wrong content type: {content_type[:30]}")
        elif response.status_code == 403:
            print(f"⚠️ Access denied (403)")
        else:
            print(f"⚠️ Status {response.status_code}")
    except requests.exceptions.Timeout:
        print("⚠️ Timeout")
    except Exception as e:
        print(f"⚠️ Error: {e}")

if not file_downloaded:
    print("\n❌ Download failed from share link")
    print("\nThe share link may have expired. To fix:")
    print("  1. Open OneDrive → Find your Excel file")
    print("  2. Click 'Share' → 'Copy link'")
    print("  3. Go to GitHub repo → Settings → Secrets and variables")
    print("  4. Update secret ONEDRIVE_LINK with the new link")
    print("  5. Re-run the workflow")
    sys.exit(1)

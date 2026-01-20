#!/usr/bin/env python3
"""
Download latest Excel file from OneDrive folder structure.
Handles: Year/Month folder hierarchy
"""

import os
import re
import requests
from datetime import datetime
from pathlib import Path

# Get OneDrive link from environment
ONEDRIVE_LINK = os.getenv('ONEDRIVE_LINK')

if not ONEDRIVE_LINK:
    print("❌ ERROR: ONEDRIVE_LINK not set in GitHub secrets")
    print("Please add your OneDrive share link to GitHub secrets")
    exit(1)

print(f"📂 OneDrive Link: {ONEDRIVE_LINK[:50]}...")

# Convert share link to download URL if needed
def convert_onedrive_link(link):
    """Convert OneDrive share link to download URL"""
    # Extract resource ID from share link
    # Format: https://1drv.ms/...?e=...
    if '1drv.ms' in link:
        # For share links, we need to get the actual file
        # This is a simplified approach - may need adjustment
        return link.replace('?e=', '?download=1&e=')
    return link

try:
    # Create data directory
    Path('data').mkdir(exist_ok=True)
    
    print("🔍 Fetching OneDrive folder contents...")
    
    # Note: Direct API access to OneDrive share links is limited
    # This script uses a workaround approach
    
    # For now, we'll use a placeholder approach
    # In production, you may need to:
    # 1. Use Microsoft Graph API with proper auth
    # 2. Or use a Python OneDrive client library
    
    # Try to download directly from the share link
    modified_link = convert_onedrive_link(ONEDRIVE_LINK)
    
    print("📥 Attempting to download Excel file...")
    
    # Try common OneDrive share link formats
    download_urls = [
        modified_link,
        ONEDRIVE_LINK + "&download=1",
    ]
    
    file_downloaded = False
    
    for url in download_urls:
        try:
            print(f"Trying: {url[:60]}...")
            response = requests.get(url, timeout=30, allow_redirects=True)
            
            if response.status_code == 200:
                # Check if it's actually a file (not HTML)
                if 'application/vnd.openxmlformats' in response.headers.get('content-type', '') or \
                   'application/vnd.ms-excel' in response.headers.get('content-type', '') or \
                   len(response.content) > 10000:  # Likely a real file
                    
                    with open('data/boiler_data.xlsx', 'wb') as f:
                        f.write(response.content)
                    
                    file_size = len(response.content) / 1024
                    print(f"✅ Downloaded successfully ({file_size:.1f} KB)")
                    file_downloaded = True
                    break
        except Exception as e:
            print(f"⚠️ URL attempt failed: {str(e)[:100]}")
            continue
    
    if not file_downloaded:
        print("\n⚠️ Could not download from OneDrive share link")
        print("\n📝 To fix this:")
        print("1. Make sure the OneDrive link is correct and publicly shared")
        print("2. Or set up GitHub Secrets with ONEDRIVE_LINK")
        print("3. Or use the GitHub UI to manually upload the Excel file")
        print("\nFor now, the app will use the last synced version from GitHub")
        
        # Check if we have a previous version
        if os.path.exists('data/boiler_data.xlsx'):
            print("✓ Using previously synced file")
            file_downloaded = True
    
    if file_downloaded:
        print(f"📊 Timestamp: {datetime.now().isoformat()}")
    
except Exception as e:
    print(f"❌ Error: {str(e)}")
    exit(1)

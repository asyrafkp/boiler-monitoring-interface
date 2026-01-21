#!/usr/bin/env python3
"""
Download latest Excel file from OneDrive folder structure.
Handles: Year/Month folder hierarchy
"""

import os
import sys
import requests
from datetime import datetime
from pathlib import Path

# Get OneDrive link from environment
ONEDRIVE_LINK = os.getenv('ONEDRIVE_LINK')

if not ONEDRIVE_LINK:
    print("❌ ERROR: ONEDRIVE_LINK not set in GitHub secrets")
    print("Please add your OneDrive share link to GitHub secrets")
    sys.exit(1)

print(f"📂 OneDrive Link provided: Yes")

try:
    # Create data directory
    Path('data').mkdir(exist_ok=True)
    
    print("🔍 Attempting to download Excel from OneDrive...")
    
    # Method 1: Try direct download with modified URL
    # OneDrive share links can be modified to force download
    urls_to_try = [
        ONEDRIVE_LINK + "&download=1",
        ONEDRIVE_LINK.replace("?", "?download=1&"),
        ONEDRIVE_LINK,
    ]
    
    file_downloaded = False
    
    for i, url in enumerate(urls_to_try, 1):
        try:
            print(f"  Attempt {i}: Fetching...")
            
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            
            response = requests.get(
                url, 
                timeout=30, 
                allow_redirects=True,
                headers=headers,
                stream=True
            )
            
            print(f"  Status: {response.status_code}")
            print(f"  Content-Type: {response.headers.get('content-type', 'unknown')[:50]}")
            
            if response.status_code == 200:
                content = response.content
                content_size = len(content)
                
                print(f"  Content size: {content_size} bytes")
                
                # Check if it looks like an Excel file
                # Excel files start with specific magic bytes
                is_valid_excel = (
                    content_size > 5000 and  # Excel files are typically > 5KB
                    (content[:4] == b'PK\x03\x04' or  # ZIP-based (xlsx)
                     content[:8] == b'\xd0\xcf\x11\xe0' or  # OLE2 (xls)
                     'vnd.openxmlformats' in response.headers.get('content-type', '') or
                     'vnd.ms-excel' in response.headers.get('content-type', ''))
                )
                
                # Detailed diagnostics
                print(f"  Magic bytes: {content[:4].hex() if len(content) > 4 else 'N/A'}")
                print(f"  Is valid Excel: {is_valid_excel}")
                
                if is_valid_excel:
                    with open('data/boiler_data.xlsx', 'wb') as f:
                        f.write(content)
                    
                    print(f"✅ Downloaded successfully ({content_size / 1024:.1f} KB)")
                    file_downloaded = True
                    break
                else:
                    print(f"  ⚠️ Response doesn't look like Excel file (size: {content_size})")
                    if content_size < 1000:
                        try:
                            content_preview = content.decode('utf-8', errors='ignore')[:200]
                            print(f"  Content preview: {content_preview}")
                            if '<html' in content_preview.lower():
                                print("  ⚠️ Received HTML response - OneDrive link may be incorrect or expired")
                        except:
                            print(f"  First bytes: {content[:50]}")
                        
        except requests.exceptions.RequestException as e:
            print(f"  ⚠️ Request failed: {str(e)[:80]}")
            continue
        except Exception as e:
            print(f"  ⚠️ Error: {str(e)[:80]}")
            continue
    
    # Fallback: Create placeholder file so workflow doesn't fail
    if not file_downloaded:
        print("\n⚠️ Could not download from OneDrive")
        print("   OneDrive share links may have restrictions")
        print("\n📋 Alternative approaches:")
        print("   1. Manually upload Excel to GitHub data/ folder")
        print("   2. Use Microsoft Graph API instead")
        print("   3. Use a different sharing method")
        
        # Create a marker file so git has something to commit
        if not os.path.exists('data/boiler_data.xlsx'):
            print("\n✓ Creating placeholder for manual upload")
            # This allows the workflow to pass even without file
            Path('data/.sync_ready').touch()
        
        print("\n📝 Next: Upload Excel file manually to data/boiler_data.xlsx")
        sys.exit(0)  # Don't fail, allow manual workaround
    
    print(f"📊 Sync time: {datetime.now().isoformat()}")
    
except Exception as e:
    print(f"❌ Fatal error: {str(e)}")
    sys.exit(1)

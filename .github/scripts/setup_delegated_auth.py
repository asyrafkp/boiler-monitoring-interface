#!/usr/bin/env python3
"""
One-time setup: Authenticate and get refresh token for OneDrive access.
This refresh token will be stored in GitHub secrets and used for automatic sync.
"""

import os
import sys
import requests
import json
from datetime import datetime

print("=" * 70)
print("🔐 OneDrive Delegated Authentication Setup")
print("=" * 70)

# Get Azure app credentials
TENANT_ID = input("\nEnter your AZURE_TENANT_ID: ").strip()
CLIENT_ID = input("Enter your AZURE_CLIENT_ID: ").strip()
CLIENT_SECRET = input("Enter your AZURE_CLIENT_SECRET: ").strip()

if not TENANT_ID or not CLIENT_ID or not CLIENT_SECRET:
    print("❌ Error: Tenant ID, Client ID, and Client Secret are required")
    sys.exit(1)

print(f"\n✅ Using Tenant: {TENANT_ID[:8]}...")
print(f"✅ Using Client: {CLIENT_ID[:8]}...\n")

# Step 1: Request device code
print("📱 Step 1: Starting device code authentication flow...")
print("-" * 70)

device_code_url = f"https://login.microsoftonline.com/{TENANT_ID}/oauth2/v2.0/devicecode"

device_code_data = {
    'client_id': CLIENT_ID,
    'scope': 'Files.Read.All Sites.Read.All offline_access'
}

try:
    response = requests.post(device_code_url, data=device_code_data, timeout=10)
    
    if response.status_code != 200:
        print(f"❌ Device code request failed: {response.status_code}")
        print(response.text)
        sys.exit(1)
    
    device_code_response = response.json()
    
    user_code = device_code_response.get('user_code')
    device_code = device_code_response.get('device_code')
    verification_uri = device_code_response.get('verification_uri')
    expires_in = device_code_response.get('expires_in', 900)
    
    print("\n" + "=" * 70)
    print("🌐 AUTHENTICATION REQUIRED")
    print("=" * 70)
    print(f"\n1. Open this URL in your browser:")
    print(f"   {verification_uri}")
    print(f"\n2. Enter this code:")
    print(f"   {user_code}")
    print(f"\n3. Sign in with your Microsoft account (the one with OneDrive access)")
    print(f"\n⏱️  You have {expires_in // 60} minutes to complete this")
    print("\n" + "=" * 70)
    
    input("\nPress ENTER after you've completed the authentication...")
    
    # Step 2: Poll for token
    print("\n🔄 Waiting for authentication...")
    
    token_url = f"https://login.microsoftonline.com/{TENANT_ID}/oauth2/v2.0/token"
    
    token_data = {
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'grant_type': 'urn:ietf:params:oauth:grant-type:device_code',
        'device_code': device_code
    }
    
    max_attempts = 30
    for attempt in range(max_attempts):
        try:
            token_response = requests.post(token_url, data=token_data, timeout=10)
            token_json = token_response.json()
            
            if token_response.status_code == 200:
                # Success!
                access_token = token_json.get('access_token')
                refresh_token = token_json.get('refresh_token')
                
                if not refresh_token:
                    print("❌ No refresh token received")
                    print("Make sure your Azure app has 'offline_access' scope")
                    sys.exit(1)
                
                print("\n✅ Authentication successful!")
                print("-" * 70)
                
                # Test the token
                print("\n🧪 Testing OneDrive access...")
                headers = {
                    'Authorization': f'Bearer {access_token}',
                    'Content-Type': 'application/json'
                }
                
                test_url = "https://graph.microsoft.com/v1.0/me/drive/root/children"
                test_response = requests.get(test_url, headers=headers, timeout=10)
                
                if test_response.status_code == 200:
                    files = test_response.json().get('value', [])
                    print(f"✅ OneDrive access confirmed ({len(files)} files in root)")
                else:
                    print(f"⚠️  OneDrive test failed: {test_response.status_code}")
                
                # Save to file for easy copy-paste
                config_file = 'azure_refresh_token.txt'
                with open(config_file, 'w') as f:
                    f.write(f"AZURE_REFRESH_TOKEN={refresh_token}\n")
                
                print("\n" + "=" * 70)
                print("🎉 SETUP COMPLETE!")
                print("=" * 70)
                print("\n📋 Next Steps:")
                print("\n1. Go to your GitHub repository")
                print("2. Navigate to: Settings → Secrets and variables → Actions")
                print("3. Create a NEW secret:")
                print(f"   Name: AZURE_REFRESH_TOKEN")
                print(f"   Value: (copy from below)")
                print("\n" + "=" * 70)
                print("REFRESH TOKEN (copy this):")
                print("-" * 70)
                print(refresh_token)
                print("=" * 70)
                print(f"\n✅ Token also saved to: {config_file}")
                print("\n⚠️  IMPORTANT:")
                print("   - Keep this token secret")
                print("   - Don't commit it to Git")
                print("   - It will be used for automatic OneDrive sync")
                print("   - Valid as long as it's used at least once every 90 days")
                
                sys.exit(0)
                
            elif token_json.get('error') == 'authorization_pending':
                # Still waiting for user to authenticate
                if attempt % 5 == 0:
                    print(f"  Still waiting... ({attempt + 1}/{max_attempts})")
                import time
                time.sleep(5)
                continue
                
            elif token_json.get('error') == 'expired_token':
                print("❌ Device code expired. Please run the script again.")
                sys.exit(1)
                
            else:
                print(f"❌ Token request failed: {token_json.get('error')}")
                print(token_json.get('error_description', ''))
                sys.exit(1)
                
        except requests.exceptions.Timeout:
            print("  Timeout, retrying...")
            continue
        except Exception as e:
            print(f"❌ Error: {e}")
            sys.exit(1)
    
    print("❌ Timeout: No authentication completed within time limit")
    sys.exit(1)
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

#!/usr/bin/env python3
"""Test OneDrive link to verify it returns Excel file, not HTML"""

import requests

url = 'https://1drv.ms/x/c/B6A282DAF4E2A35F/IQCEQ8XPs7EnQZQONh7zYtWzASqM_JrM94DtGUYl_Px9ygA?e=EEiekq&download=1'

print('🔍 Testing OneDrive download...')
print(f'URL: {url}')

try:
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    response = requests.get(url, headers=headers, timeout=30, allow_redirects=True, stream=True)
    
    print(f'\n✅ Status: {response.status_code}')
    print(f'Content-Type: {response.headers.get("content-type", "unknown")[:100]}')
    
    # Get first chunk to check
    content = response.content[:1000]
    content_size = int(response.headers.get('content-length', len(response.content)))
    print(f'Content Length: {content_size} bytes')
    
    # Check if HTML
    if b'<!DOCTYPE' in content or b'<html' in content or b'<HTML' in content:
        print('\n❌ ERROR: Response is HTML, not Excel!')
        print(f'This means the OneDrive link is returning a web page.')
        print(f'Content preview: {content[:300]}')
    # Check if Excel
    elif content[:4] == b'PK\x03\x04':
        print('\n✅ SUCCESS: Response is Excel file (XLSX)!')
        print('GitHub Actions should be able to download this.')
    elif content[:8] == b'\xd0\xcf\x11\xe0':
        print('\n✅ SUCCESS: Response is Excel file (XLS)!')
        print('GitHub Actions should be able to download this.')
    elif 'vnd.openxmlformats' in response.headers.get('content-type', ''):
        print('\n✅ SUCCESS: Content-Type indicates Excel!')
        print('GitHub Actions should be able to download this.')
    else:
        print(f'\n⚠️  Response type unclear')
        print(f'Magic bytes: {content[:4].hex()}')
        print(f'First 200 bytes: {content[:200]}')
        
except Exception as e:
    print(f'\n❌ Error: {e}')

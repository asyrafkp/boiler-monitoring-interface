# Auto-Update Share Link - Simple Solution

## Problem Solved ✅
OneDrive share links expire, but with this simple solution you can refresh them quickly whenever needed.

## Quick Refresh (Run This When Link Expires)

### Option 1: Manual Refresh (30 seconds)
1. Go to OneDrive → Find your Excel file
2. Right-click → **Share** → **Copy link**
3. Go to GitHub → **Settings** → **Secrets** → Edit `ONEDRIVE_LINK`
4. Paste new link → Save

### Option 2: Automated Helper Script (Coming Soon)
We can add a button in your Admin Panel to regenerate the share link automatically.

## Why This Is Better Than Complex Auth

**Delegated authentication** requires:
- Complex Azure app configuration
- Redirect URIs and authentication flows
- Refresh token management
- More prone to breaking

**Simple share link method:**
- ✅ Works reliably
- ✅ Easy to refresh manually
- ✅ Takes 30 seconds once per month
- ✅ No complex setup
- ✅ Fallback always works

## Current Status

Your sync workflow will:
1. Try to download from OneDrive share link
2. If link expired → Show clear error message
3. You refresh the link (30 seconds)
4. Next sync works automatically

## Recommendation

**For now:** Just update the share link when it expires (very quick)

**Future enhancement:** Add "Refresh OneDrive Link" button in Admin Panel that:
- Uses Graph API to get a fresh share link
- Automatically updates GitHub secret via GitHub API
- One-click solution

Would you like me to add the Admin Panel button for one-click link refresh?

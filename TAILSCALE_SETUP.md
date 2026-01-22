# Tailscale + SMB Share Setup Guide

This guide shows you how to use Tailscale with Windows SMB share to give GitHub Actions direct access to your Excel file.

## Why This Solution?

- ✅ **Always fresh data** - Direct file access from your PC
- ✅ **No expiration** - No need to refresh links
- ✅ **Simple** - Just Windows file sharing, no SSH needed
- ✅ **Secure** - Encrypted via Tailscale VPN

## Prerequisites

- Windows PC with the Excel file
- Tailscale account (free)
- Your PC online during sync times (hourly)

## Step 1: Install Tailscale on Your PC

1. Go to https://tailscale.com/download
2. Download Tailscale for Windows
3. Install and sign in
4. Your device will get a name like `DESKTOP-ABC123` and a Tailscale IP like `100.x.x.x`

**Find your device info:**
```powershell
tailscale status
```
Note down your **device name** (e.g., `DESKTOP-ABC123`)

## Step 2: Create Tailscale Auth Key

**Note:** Auth keys work on the free tier. OAuth clients with tags require a paid plan.

1. Go to https://login.tailscale.com/admin/settings/keys
2. Click **Generate auth key**
3. Configure the key:
   - ✅ Check **Ephemeral** (nodes auto-delete after disconnecting)
   - ✅ Check **Reusable** (can be used multiple times)
   - Set expiration: **90 days** (or longer)
4. Click **Generate key**
5. Copy the auth key (starts with `tskey-auth-...`)
6. ⚠️ **Important:** Save this now - you won't see it again!

## Step 3: Create SMB Share on Windows

### 3.1 Create a folder for the Excel file (if not already)

For example: `C:\BoilerData\`

Put your Excel file there (e.g., `REPORT DAILY BULAN 2026 - 01 JANUARI.xlsx`)

### 3.2 Share the folder

1. Right-click the folder → **Properties**
2. Go to **Sharing** tab
3. Click **Advanced Sharing**
4. Check **Share this folder**
5. Note the **Share name** (e.g., `BoilerData`)
6. Click **Permissions**
7. Add your Windows user with **Read** permission
8. Click **OK** to close all dialogs

### 3.3 Test the share locally

Open PowerShell and test:
```powershell
# Test with your computer name
net use \\localhost\BoilerData

# Should show your shared folder
dir \\localhost\BoilerData
```

## Step 4: Configure GitHub Secrets

Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**

Add these secrets:

| Secret Name | Value | Example |
|------------|-------|---------|
| `TAILSCALE_AUTHKEY` | Auth key from Step 2 | `tskey-auth-...` |
| `TAILSCALE_DEVICE_NAME` | Your PC's device name (short or full Tailscale name) | `DESKTOP-ABC123` or `DESKTOP-ABC123.tailnet-abc.ts.net` |
| `SHARE_NAME` | SMB share name from Step 3 | `BoilerData` |
| `SHARE_USERNAME` | Your Windows username (leave empty for guest access) | `YourName` or empty |
| `SHARE_PASSWORD` | Your Windows password (leave empty for guest access) | `YourPassword` or empty |
| `FILE_NAME` | Excel file path (supports subfolders) | `REPORT DAILY.xlsx` or `Reports/January/data.xlsx` |

**Note:** 
- Both short name (`DESKTOP-ABC123`) and full Tailscale name work. Use whichever `tailscale status` shows.
- If your share doesn't require authentication, leave `SHARE_USERNAME` and `SHARE_PASSWORD` empty - the workflow will mount as guest.

## Step 5: Enable the Workflow

The workflow is already created: `.github/workflows/sync-tailscale.yml`

It will run automatically every hour, or you can test it manually:

1. Go to GitHub → **Actions** → **Sync from Tailscale Network**
2. Click **Run workflow** → **Run workflow**
3. Watch the logs

If successful, you'll see:
- ✅ Tailscale connected
- ✅ SMB share mounted
- ✅ File copied
- ✅ JSON updated
- ✅ Changes committed

## Step 6: Disable Old OneDrive Workflow

To avoid conflicts, disable the OneDrive workflow:

1. Go to `.github/workflows/sync-onedrive.yml`
2. Rename to `sync-onedrive.yml.disabled` or delete it

## Troubleshooting

### "Failed to mount" error

1. **Check Windows username/password** in GitHub Secrets
2. **Verify share name** is correct (case-sensitive)
3. **Test locally first:**
   ```powershell
   net use \\localhost\BoilerData /user:YourUsername YourPassword
   ```

### "Device not found" error

1. **Check Tailscale is running** on your PC
2. **Verify device name** - use `tailscale status` to confirm
3. **Try the full Tailscale name** - use `DESKTOP-ABC123.tailnet-abc.ts.net` if short name doesn't work
4. **Or use Tailscale IP** - e.g., `100.64.123.456` (find with `tailscale ip -4`)

### "Permission denied" error

1. **Check share permissions** - your user needs Read access
2. **Try Full Control** temporarily to test
3. **Check file isn't locked** - close Excel if open

### Workflow runs but no updates

1. **Check your PC is online** when workflow runs
2. **Verify file exists** in the shared folder
3. **Check file name matches exactly** (including spaces)

## Tips

- Keep your PC online during business hours for automatic syncs
- Tailscale reconnects automatically if disconnected
- Monitor GitHub Actions runs to ensure syncs work
- Share folder can be anywhere (Documents, Desktop, etc.)

## Security Notes

- SMB traffic encrypted by Tailscale VPN
- No public internet exposure
- Only GitHub Actions can access via Tailscale
- Read-only access recommended
- Change Windows password if leaked

## Maintenance

✅ **Zero maintenance** once configured!
- PC just needs to be online during sync times
- No manual link refreshes ever again
- Tailscale auto-updates and reconnects

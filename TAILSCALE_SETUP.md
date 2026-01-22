# Tailscale Setup Guide for Direct File Access

This guide shows you how to use Tailscale to give GitHub Actions direct access to your Excel file, eliminating OneDrive link expiration issues.

## Why Tailscale?

- ✅ **Always fresh data** - Direct file access from your PC
- ✅ **No expiration** - No need to refresh links
- ✅ **Simple** - Just keep your PC online when syncs run
- ✅ **Secure** - Encrypted VPN connection

## Prerequisites

- Windows PC with the Excel file
- Tailscale account (free)
- Your PC online during sync times (hourly)

## Step 1: Install Tailscale on Your PC

1. Go to https://tailscale.com/download
2. Download Tailscale for Windows
3. Install and sign in
4. Note your device name (e.g., `DESKTOP-ABC123`)

## Step 2: Create Tailscale OAuth Client

1. Go to https://login.tailscale.com/admin/settings/oauth
2. Click **Generate OAuth client**
3. Add tags: `tag:ci`
4. Copy the **OAuth Client ID** and **OAuth Secret**

## Step 3: Setup SSH on Your Windows PC

### Option A: OpenSSH (Built-in Windows)

1. Open **Settings** → **Apps** → **Optional Features**
2. Click **Add a feature**
3. Find and install **OpenSSH Server**
4. Open PowerShell as Administrator:
   ```powershell
   Start-Service sshd
   Set-Service -Name sshd -StartupType 'Automatic'
   ```

5. Create SSH key for GitHub Actions (no password):
   ```powershell
   ssh-keygen -t ed25519 -f ~\.ssh\github_actions -N '""'
   ```

6. Add public key to authorized_keys:
   ```powershell
   cat ~\.ssh\github_actions.pub >> ~\.ssh\authorized_keys
   ```

7. Copy the **private key** (will be used in GitHub Secrets):
   ```powershell
   cat ~\.ssh\github_actions
   ```

### Option B: Use SMB Share (Simpler, Windows only)

1. Right-click your Excel file folder
2. Properties → Sharing → **Share**
3. Add **Everyone** with **Read** permission
4. Note the network path (e.g., `\\DESKTOP-ABC123\SharedFolder`)

## Step 4: Configure GitHub Secrets

Go to your GitHub repo → Settings → Secrets and variables → Actions

Add these secrets:

| Secret Name | Value | Example |
|------------|-------|---------|
| `TAILSCALE_OAUTH_CLIENT_ID` | OAuth client ID from Step 2 | `k...` |
| `TAILSCALE_OAUTH_SECRET` | OAuth secret from Step 2 | `tskey-client-...` |
| `TAILSCALE_DEVICE_IP` | Your PC's Tailscale IP or hostname | `100.xx.xx.xx` or `username@DESKTOP-ABC123` |
| `FILE_PATH` | Full path to Excel file on your PC | `C:/Users/YourName/Documents/boiler_data.xlsx` |
| `SSH_PRIVATE_KEY` | Private key from Step 3 (if using SSH) | (the content of github_actions file) |

**To find your Tailscale IP:**
```powershell
tailscale ip -4
```

## Step 5: Test the Connection

1. Go to GitHub → Actions → **Sync from Tailscale Network**
2. Click **Run workflow**
3. Check the logs

If successful, you'll see:
- Tailscale connected
- File downloaded
- JSON updated
- Changes committed

## Step 6: Disable Old OneDrive Workflow

Rename the old workflow to disable it:
```powershell
cd .github/workflows
mv sync-onedrive.yml sync-onedrive.yml.disabled
```

## Troubleshooting

### SSH Connection Failed

1. Check Windows Firewall allows SSH (port 22)
2. Test SSH locally first:
   ```powershell
   ssh -i github_actions username@localhost
   ```

### File Not Found

1. Use forward slashes in FILE_PATH: `C:/Users/...`
2. Verify path is accessible:
   ```powershell
   Test-Path "C:/Users/YourName/Documents/boiler_data.xlsx"
   ```

### Tailscale Connection Failed

1. Check OAuth client has `tag:ci`
2. Verify secrets are correct (no extra spaces)
3. Check Tailscale is running on your PC

## Alternative: SMB Share (No SSH)

If you prefer SMB share over SSH, update the workflow:

```yaml
- name: Download Excel via SMB
  env:
    DEVICE_NAME: ${{ secrets.TAILSCALE_DEVICE_IP }}
  run: |
    sudo apt-get install -y cifs-utils
    sudo mount -t cifs //$DEVICE_NAME/SharedFolder /mnt -o guest
    cp /mnt/boiler_data.xlsx data/boiler_data.xlsx
    sudo umount /mnt
```

## Maintenance

- Keep your PC online during sync times (every hour)
- Tailscale will auto-reconnect if disconnected
- No manual link refresh needed! 🎉

## Security Notes

- SSH key is used only by GitHub Actions
- Tailscale encrypts all traffic
- File access is read-only
- No public internet exposure

/**
 * OneDrive Connection Service
 * Handles Microsoft authentication and GitHub secret updates
 */

interface OneDriveAuthConfig {
  clientId: string;
  tenantId: string;
  redirectUri: string;
}

interface GitHubConfig {
  owner: string;
  repo: string;
  token: string;
}

/**
 * Authenticate with Microsoft and get OneDrive share link
 */
export async function authenticateOneDrive(config: OneDriveAuthConfig): Promise<string> {
  // Open Microsoft authentication popup
  const authUrl = `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/authorize?` +
    `client_id=${config.clientId}&` +
    `response_type=token&` +
    `redirect_uri=${encodeURIComponent(config.redirectUri)}&` +
    `scope=${encodeURIComponent('Files.Read.All Sites.Read.All')}&` +
    `response_mode=fragment`;

  return new Promise((resolve, reject) => {
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      authUrl,
      'OneDrive Authentication',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
    );

    if (!popup) {
      reject(new Error('Popup blocked. Please allow popups for this site.'));
      return;
    }

    // Listen for messages from the popup
    const messageHandler = (event: MessageEvent) => {
      // Verify origin for security
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data.type === 'auth-success' && event.data.accessToken) {
        window.removeEventListener('message', messageHandler);
        popup.close();
        clearInterval(checkPopup);
        resolve(event.data.accessToken);
      } else if (event.data.type === 'auth-error') {
        window.removeEventListener('message', messageHandler);
        popup.close();
        clearInterval(checkPopup);
        reject(new Error(event.data.error || 'Authentication failed'));
      }
    };

    window.addEventListener('message', messageHandler);

    // Fallback: Check if popup has navigated to redirect URI (for older browsers)
    const checkPopup = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(checkPopup);
          window.removeEventListener('message', messageHandler);
          reject(new Error('Authentication cancelled'));
          return;
        }

        // Try to read popup URL (will fail if cross-origin)
        if (popup.location.href.includes(config.redirectUri)) {
          const hash = popup.location.hash;
          const params = new URLSearchParams(hash.substring(1));
          const accessToken = params.get('access_token');

          if (accessToken) {
            popup.close();
            clearInterval(checkPopup);
            window.removeEventListener('message', messageHandler);
            resolve(accessToken);
          } else {
            const error = params.get('error_description') || 'Authentication failed';
            popup.close();
            clearInterval(checkPopup);
            window.removeEventListener('message', messageHandler);
            reject(new Error(error));
          }
        }
      } catch (e) {
        // Cross-origin error - popup hasn't redirected yet or messageHandler will handle it
      }
    }, 500);

    // Timeout after 5 minutes
    setTimeout(() => {
      clearInterval(checkPopup);
      window.removeEventListener('message', messageHandler);
      if (!popup.closed) {
        popup.close();
      }
      reject(new Error('Authentication timeout'));
    }, 300000);
  });
}

/**
 * Recursively search for a file in OneDrive by listing folders
 * Works with personal OneDrive accounts (no SPO license required)
 */
async function findFileRecursively(
  accessToken: string,
  fileName: string,
  path: string = '/me/drive/root/children',
  maxDepth: number = 5,
  currentDepth: number = 0
): Promise<any> {
  if (currentDepth >= maxDepth) {
    return null;
  }

  const response = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const items = data.value || [];

  // Check if file is in current folder
  const file = items.find((item: any) => 
    item.name.toLowerCase() === fileName.toLowerCase() && 
    item.file // Ensure it's a file, not a folder
  );

  if (file) {
    return file;
  }

  // Recursively search subfolders
  const folders = items.filter((item: any) => item.folder);
  for (const folder of folders) {
    const found = await findFileRecursively(
      accessToken,
      fileName,
      `/me/drive/items/${folder.id}/children`,
      maxDepth,
      currentDepth + 1
    );
    if (found) {
      return found;
    }
  }

  return null;
}

/**
 * Get OneDrive share link for a file
 */
export async function getOneDriveShareLink(
  accessToken: string,
  fileName: string
): Promise<string> {
  try {
    console.log('Searching OneDrive for:', fileName);
    
    // For personal accounts without SPO license, use recursive folder listing
    const file = await findFileRecursively(accessToken, fileName);
    
    if (!file) {
      // Try to list some Excel files to help user
      const rootResponse = await fetch('https://graph.microsoft.com/v1.0/me/drive/root/children?$top=50', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (rootResponse.ok) {
        const rootData = await rootResponse.json();
        const excelFiles = rootData.value.filter((f: any) => f.name.match(/\.xlsx?$/i) && f.file);
        const fileList = excelFiles.map((f: any) => f.name).slice(0, 10).join('\n  - ');
        
        throw new Error(
          `File not found: ${fileName}\n\n` +
          `First ${excelFiles.length} Excel files in root:\n  - ${fileList}\n\n` +
          `Copy the exact filename (note: search depth limited to 5 folders deep).`
        );
      }
      
      throw new Error(
        `File not found: ${fileName}\n\n` +
        `Make sure:\n` +
        `1. The file exists in your OneDrive\n` +
        `2. The filename is exactly correct (including spaces)\n` +
        `3. The file is within 5 folders from root`
      );
    }

    console.log('File found:', file.name, 'ID:', file.id);
    const fileId = file.id;

    // For personal OneDrive accounts, use permissions API instead of createLink
    // This works without SharePoint Online license
    const shareUrl = `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/createLink`;
    const shareResponse = await fetch(shareUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'view',
        scope: 'anonymous'
      })
    });

    if (!shareResponse.ok) {
      const errorData = await shareResponse.json();
      console.log('createLink failed, trying alternatives...', errorData.error?.message);
      
      // Personal OneDrive: Try to get existing share links first
      const existingPermsUrl = `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/permissions`;
      const existingPermsResponse = await fetch(existingPermsUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (existingPermsResponse.ok) {
        const permsData = await existingPermsResponse.json();
        const existingLink = permsData.value?.find((p: any) => p.link?.scope === 'anonymous');
        
        if (existingLink?.link?.webUrl) {
          console.log('Using existing share link');
          return existingLink.link.webUrl;
        }
      }
      
      // If no existing link, user needs to create one manually
      throw new Error(
        `Unable to auto-create share link (personal OneDrive limitation).\n\n` +
        `Please create a share link manually:\n` +
        `1. Go to OneDrive and find: ${fileName}\n` +
        `2. Right-click → Share → Copy link\n` +
        `3. Go to GitHub repo Settings → Secrets → Update ONEDRIVE_LINK\n` +
        `4. Paste the share link\n\n` +
        `The link will last several months before expiring.`
      );
    }

    const shareData = await shareResponse.json();
    return shareData.link.webUrl;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to get share link');
  }
}

/**
 * Update GitHub secret via GitHub API
 */
export async function updateGitHubSecret(
  config: GitHubConfig,
  secretName: string,
  secretValue: string
): Promise<void> {
  try {
    // Get public key for encryption
    const keyUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/actions/secrets/public-key`;
    const keyResponse = await fetch(keyUrl, {
      headers: {
        'Authorization': `token ${config.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!keyResponse.ok) {
      throw new Error('Failed to get GitHub public key');
    }

    const { key, key_id } = await keyResponse.json();

    // Encrypt secret value using libsodium
    // Note: In production, you'd use @github/webauthn-json or similar
    // For now, we'll use a server endpoint to handle encryption
    const encryptResponse = await fetch('/api/encrypt-secret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: secretValue, publicKey: key })
    });

    if (!encryptResponse.ok) {
      throw new Error('Failed to encrypt secret');
    }

    const { encrypted } = await encryptResponse.json();

    // Update secret
    const secretUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/actions/secrets/${secretName}`;
    const updateResponse = await fetch(secretUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${config.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        encrypted_value: encrypted,
        key_id: key_id
      })
    });

    if (!updateResponse.ok) {
      throw new Error('Failed to update GitHub secret');
    }
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to update GitHub secret');
  }
}

/**
 * Full workflow: Authenticate, get link, update secret
 */
export async function refreshOneDriveConnection(
  oneDriveConfig: OneDriveAuthConfig,
  githubConfig: GitHubConfig,
  fileName: string
): Promise<{ shareLink: string; message: string }> {
  try {
    // Step 1: Authenticate with Microsoft
    const accessToken = await authenticateOneDrive(oneDriveConfig);

    // Step 2: Get OneDrive share link
    const shareLink = await getOneDriveShareLink(accessToken, fileName);

    // Step 3: Update GitHub secret
    await updateGitHubSecret(githubConfig, 'ONEDRIVE_LINK', shareLink);

    return {
      shareLink,
      message: 'OneDrive connection refreshed successfully!'
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to refresh connection');
  }
}

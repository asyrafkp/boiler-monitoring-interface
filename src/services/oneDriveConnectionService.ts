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

    // Listen for redirect
    const checkPopup = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(checkPopup);
          reject(new Error('Authentication cancelled'));
          return;
        }

        // Check if popup has navigated to redirect URI
        if (popup.location.href.includes(config.redirectUri)) {
          const hash = popup.location.hash;
          const params = new URLSearchParams(hash.substring(1));
          const accessToken = params.get('access_token');

          if (accessToken) {
            popup.close();
            clearInterval(checkPopup);
            resolve(accessToken);
          } else {
            const error = params.get('error_description') || 'Authentication failed';
            popup.close();
            clearInterval(checkPopup);
            reject(new Error(error));
          }
        }
      } catch (e) {
        // Cross-origin error - popup hasn't redirected yet
      }
    }, 500);

    // Timeout after 5 minutes
    setTimeout(() => {
      clearInterval(checkPopup);
      if (!popup.closed) {
        popup.close();
      }
      reject(new Error('Authentication timeout'));
    }, 300000);
  });
}

/**
 * Get OneDrive share link for a file
 */
export async function getOneDriveShareLink(
  accessToken: string,
  fileName: string
): Promise<string> {
  try {
    // Search for file
    const searchUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${fileName}`;
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!searchResponse.ok) {
      throw new Error(`File not found: ${fileName}`);
    }

    const fileData = await searchResponse.json();
    const fileId = fileData.id;

    // Create sharing link
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
      throw new Error('Failed to create share link');
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

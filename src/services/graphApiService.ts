/**
 * Microsoft Graph API Service
 * Handles OAuth2 authentication and OneDrive file access
 */

interface GraphTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface GraphFileResponse {
  value: Array<{
    id: string;
    name: string;
    webUrl: string;
    size: number;
    lastModifiedDateTime: string;
  }>;
}

interface GraphDriveItemResponse {
  '@microsoft.graph.downloadUrl': string;
}

class GraphApiService {
  private clientId: string;
  private tenantId: string;
  private redirectUri: string;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor() {
    // These values should be configured from environment variables
    // For development, they can be hardcoded or loaded from a config file
    this.clientId = (import.meta as any).env.VITE_MS_GRAPH_CLIENT_ID || '';
    this.tenantId = (import.meta as any).env.VITE_MS_GRAPH_TENANT_ID || '';
    this.redirectUri = window.location.origin + '/callback';
  }

  /**
   * Get the OAuth2 login URL
   */
  getLoginUrl(): string {
    const scopes = [
      'Files.Read',
      'Sites.Read.All',
      'offline_access'
    ];

    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      scope: scopes.join(' '),
      response_mode: 'query',
      prompt: 'select_account'
    });

    return `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string, clientSecret: string): Promise<string> {
    const params = new URLSearchParams({
      client_id: this.clientId,
      scope: 'https://graph.microsoft.com/.default',
      code: code,
      redirect_uri: this.redirectUri,
      grant_type: 'authorization_code',
      client_secret: clientSecret
    });

    try {
      const response = await fetch(
        `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params.toString()
        }
      );

      if (!response.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const data: GraphTokenResponse = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000);

      // Store in sessionStorage for persistence during session
      sessionStorage.setItem('graphAccessToken', this.accessToken);
      sessionStorage.setItem('graphTokenExpiry', String(this.tokenExpiry));

      return this.accessToken;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string, clientSecret: string): Promise<string> {
    const params = new URLSearchParams({
      client_id: this.clientId,
      scope: 'https://graph.microsoft.com/.default',
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      client_secret: clientSecret
    });

    try {
      const response = await fetch(
        `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params.toString()
        }
      );

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data: GraphTokenResponse = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000);

      sessionStorage.setItem('graphAccessToken', this.accessToken);
      sessionStorage.setItem('graphTokenExpiry', String(this.tokenExpiry));

      return this.accessToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }

  /**
   * Check if current token is still valid
   */
  isTokenValid(): boolean {
    if (!this.accessToken || !this.tokenExpiry) {
      // Try to restore from sessionStorage
      const stored = sessionStorage.getItem('graphAccessToken');
      const expiry = sessionStorage.getItem('graphTokenExpiry');
      
      if (stored && expiry) {
        this.accessToken = stored;
        this.tokenExpiry = parseInt(expiry);
      } else {
        return false;
      }
    }

    return Date.now() < (this.tokenExpiry - 60000); // 1 minute buffer
  }

  /**
   * Get access token, refresh if needed
   */
  async getAccessToken(refreshToken?: string, clientSecret?: string): Promise<string> {
    if (this.isTokenValid() && this.accessToken) {
      return this.accessToken;
    }

    if (refreshToken && clientSecret) {
      return await this.refreshToken(refreshToken, clientSecret);
    }

    throw new Error('No valid access token available');
  }

  /**
   * Find folder by name in user's drive
   */
  async findFolder(folderName: string): Promise<string | null> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(
        `https://graph.microsoft.com/v1.0/me/drive/root/children?$filter=name eq '${encodeURIComponent(folderName)}'`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to search for folder');
      }

      const data: GraphFileResponse = await response.json();
      return data.value.length > 0 ? data.value[0].id : null;
    } catch (error) {
      console.error('Error finding folder:', error);
      throw error;
    }
  }

  /**
   * Find file in a specific folder
   */
  async findFile(parentFolderId: string, fileName: string): Promise<string | null> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(
        `https://graph.microsoft.com/v1.0/me/drive/items/${parentFolderId}/children?$filter=name eq '${encodeURIComponent(fileName)}'`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to search for file');
      }

      const data: GraphFileResponse = await response.json();
      return data.value.length > 0 ? data.value[0].id : null;
    } catch (error) {
      console.error('Error finding file:', error);
      throw error;
    }
  }

  /**
   * Get download URL for a file
   */
  async getFileDownloadUrl(fileId: string): Promise<string> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(
        `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}?$select=@microsoft.graph.downloadUrl`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get download URL');
      }

      const data: GraphDriveItemResponse = await response.json();
      return data['@microsoft.graph.downloadUrl'];
    } catch (error) {
      console.error('Error getting download URL:', error);
      throw error;
    }
  }

  /**
   * Download file content as ArrayBuffer
   */
  async downloadFile(downloadUrl: string): Promise<ArrayBuffer> {
    try {
      const response = await fetch(downloadUrl);

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      return await response.arrayBuffer();
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }

  /**
   * List files in a folder
   */
  async listFilesInFolder(folderId: string): Promise<Array<{id: string; name: string}>> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(
        `https://graph.microsoft.com/v1.0/me/drive/items/${folderId}/children`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to list files');
      }

      const data: GraphFileResponse = await response.json();
      return data.value.map(item => ({
        id: item.id,
        name: item.name
      }));
    } catch (error) {
      console.error('Error listing files:', error);
      throw error;
    }
  }

  /**
   * Clear stored token
   */
  clearToken(): void {
    this.accessToken = null;
    this.tokenExpiry = null;
    sessionStorage.removeItem('graphAccessToken');
    sessionStorage.removeItem('graphTokenExpiry');
  }

  /**
   * Is user authenticated
   */
  isAuthenticated(): boolean {
    return this.isTokenValid();
  }
}

// Export singleton instance
export const graphApiService = new GraphApiService();
export default GraphApiService;

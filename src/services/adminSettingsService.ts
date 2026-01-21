import { supabase } from './supabaseService';

export interface AdminSetting {
  id: number;
  setting_key: string;
  setting_value: string;
  description?: string;
  updated_by?: string;
  updated_at: string;
}

/**
 * Get a specific admin setting
 */
export async function getAdminSetting(
  settingKey: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('setting_value')
      .eq('setting_key', settingKey)
      .single();

    if (error) {
      console.error(`Error getting setting ${settingKey}:`, error);
      return null;
    }

    return data?.setting_value || null;
  } catch (error) {
    console.error('Error in getAdminSetting:', error);
    return null;
  }
}

/**
 * Update an admin setting
 */
export async function updateAdminSetting(
  settingKey: string,
  settingValue: string,
  updatedBy?: string
): Promise<boolean> {
  try {
    const { error, data } = await supabase
      .from('admin_settings')
      .upsert(
        {
          setting_key: settingKey,
          setting_value: settingValue,
          updated_by: updatedBy || 'admin',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'setting_key' }
      );

    if (error) {
      console.error(`❌ Error updating setting ${settingKey}:`, error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
      });
      throw new Error(error.message || 'Failed to update setting');
    }

    console.log(`✅ Setting updated: ${settingKey}`, data);
    return true;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in updateAdminSetting:', errorMsg);
    throw error;
  }
}

/**
 * Get OneDrive Excel link
 */
export async function getOneDriveLink(): Promise<string> {
  const link = await getAdminSetting('onedrive_excel_link');
  return link || '';
}

/**
 * Update OneDrive Excel link
 */
export async function updateOneDriveLink(
  link: string,
  updatedBy?: string
): Promise<boolean> {
  if (!link || !link.startsWith('http')) {
    throw new Error('Invalid OneDrive link format');
  }

  return await updateAdminSetting('onedrive_excel_link', link, updatedBy);
}

/**
 * Get all admin settings
 */
export async function getAllAdminSettings(): Promise<AdminSetting[]> {
  try {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('*')
      .order('setting_key', { ascending: true });

    if (error) {
      console.error('Error getting settings:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllAdminSettings:', error);
    return [];
  }
}

import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import './UserManagement.css';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  permissions: {
    dataView: boolean;
    dataModify: boolean;
    settings: boolean;
    maintenance: boolean;
  };
  createdAt: string;
}

const UserManagement: React.FC = () => {
  const { addNotification } = useNotification();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load users from localStorage on mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    try {
      const stored = localStorage.getItem('admin_users');
      if (stored) {
        setUsers(JSON.parse(stored));
      } else {
        // Initialize with default admin user
        const defaultUser: AdminUser = {
          id: 'admin_default',
          username: 'Admin',
          email: 'admin@boiler.local',
          permissions: {
            dataView: true,
            dataModify: true,
            settings: true,
            maintenance: true,
          },
          createdAt: new Date().toISOString(),
        };
        saveUsers([defaultUser]);
        setUsers([defaultUser]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      showMessage('Failed to load users', 'error');
    }
  };

  const saveUsers = (updatedUsers: AdminUser[]) => {
    localStorage.setItem('admin_users', JSON.stringify(updatedUsers));
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const addUser = () => {
    if (!newUsername.trim() || !newEmail.trim()) {
      showMessage('Username and email are required', 'error');
      return;
    }

    if (users.some((u) => u.email === newEmail)) {
      showMessage('Email already exists', 'error');
      return;
    }

    const newUser: AdminUser = {
      id: `user_${Date.now()}`,
      username: newUsername,
      email: newEmail,
      permissions: {
        dataView: true,
        dataModify: false,
        settings: false,
        maintenance: false,
      },
      createdAt: new Date().toISOString(),
    };

    const updated = [...users, newUser];
    saveUsers(updated);
    setUsers(updated);
    setNewUsername('');
    setNewEmail('');
    setShowForm(false);
    showMessage(`User "${newUsername}" added successfully`, 'success');
    addNotification(`New admin user "${newUsername}" created`, 'success');
  };

  const removeUser = (id: string) => {
    if (users.length === 1) {
      showMessage('Cannot remove the last admin user', 'error');
      return;
    }

    if (confirm('Remove this user?')) {
      const updated = users.filter((u) => u.id !== id);
      saveUsers(updated);
      setUsers(updated);
      showMessage('User removed successfully', 'success');
      addNotification('Admin user removed', 'info');
    }
  };

  const togglePermission = (
    userId: string,
    permission: keyof AdminUser['permissions']
  ) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        return {
          ...u,
          permissions: {
            ...u.permissions,
            [permission]: !u.permissions[permission],
          },
        };
      }
      return u;
    });
    saveUsers(updated);
    setUsers(updated);
    showMessage('Permission updated', 'success');
    addNotification('User permissions updated', 'info');
  };

  const userStats = {
    total: users.length,
    fullAccess: users.filter(
      (u) =>
        u.permissions.dataView &&
        u.permissions.dataModify &&
        u.permissions.settings &&
        u.permissions.maintenance
    ).length,
    viewOnly: users.filter(
      (u) => u.permissions.dataView && !u.permissions.dataModify
    ).length,
  };

  return (
    <div className="user-management">
      <div className="um-header">
        <h3>Admin Users</h3>
        <button
          className="um-add-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancel' : '+ Add User'}
        </button>
      </div>

      {/* Statistics */}
      <div className="um-stats">
        <div className="um-stat-card">
          <div className="um-stat-label">Total Users</div>
          <div className="um-stat-value">{userStats.total}</div>
        </div>
        <div className="um-stat-card">
          <div className="um-stat-label">Full Access</div>
          <div className="um-stat-value">{userStats.fullAccess}</div>
        </div>
        <div className="um-stat-card">
          <div className="um-stat-label">View Only</div>
          <div className="um-stat-value">{userStats.viewOnly}</div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`um-message um-message-${message.type}`}>
          {message.type === 'success' ? '✓' : '✕'} {message.text}
        </div>
      )}

      {/* Add User Form */}
      {showForm && (
        <div className="um-form">
          <div className="um-form-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addUser()}
            />
          </div>
          <div className="um-form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addUser()}
            />
          </div>
          <button className="um-submit-btn" onClick={addUser}>
            Add User
          </button>
        </div>
      )}

      {/* Users List */}
      <div className="um-users-list">
        {users.map((user) => (
          <div key={user.id} className="um-user-card">
            <div className="um-user-header">
              <div className="um-user-info">
                <div className="um-username">{user.username}</div>
                <div className="um-email">{user.email}</div>
              </div>
              <button
                className="um-remove-btn"
                onClick={() => removeUser(user.id)}
                title="Remove user"
              >
                ✕
              </button>
            </div>

            <div className="um-permissions">
              <label className="um-permission-item">
                <input
                  type="checkbox"
                  checked={user.permissions.dataView}
                  onChange={() => togglePermission(user.id, 'dataView')}
                />
                <span>View Data</span>
              </label>
              <label className="um-permission-item">
                <input
                  type="checkbox"
                  checked={user.permissions.dataModify}
                  onChange={() => togglePermission(user.id, 'dataModify')}
                />
                <span>Modify Data</span>
              </label>
              <label className="um-permission-item">
                <input
                  type="checkbox"
                  checked={user.permissions.settings}
                  onChange={() => togglePermission(user.id, 'settings')}
                />
                <span>Settings</span>
              </label>
              <label className="um-permission-item">
                <input
                  type="checkbox"
                  checked={user.permissions.maintenance}
                  onChange={() => togglePermission(user.id, 'maintenance')}
                />
                <span>Maintenance</span>
              </label>
            </div>

            <div className="um-user-meta">
              <small>Added: {new Date(user.createdAt).toLocaleDateString()}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;

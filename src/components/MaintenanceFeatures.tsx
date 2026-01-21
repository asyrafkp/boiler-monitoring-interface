import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import './MaintenanceFeatures.css';

interface MaintenanceRecord {
  id: string;
  boiler: number;
  type: 'downtime' | 'maintenance' | 'repair' | 'inspection';
  startDate: string;
  endDate: string;
  duration: number; // in hours
  description: string;
  notes: string;
  status: 'scheduled' | 'ongoing' | 'completed';
  createdDate: string;
}

export const MaintenanceFeatures: React.FC = () => {
  const { addNotification } = useNotification();
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filterBoiler, setFilterBoiler] = useState<'all' | '1' | '2' | '3'>('all');
  const [filterType, setFilterType] = useState<'all' | 'downtime' | 'maintenance' | 'repair' | 'inspection'>('all');

  const [formData, setFormData] = useState({
    boiler: 1,
    type: 'maintenance' as const,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    description: '',
    notes: '',
    status: 'completed' as const
  });

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = () => {
    try {
      const stored = localStorage.getItem('maintenance_records');
      if (stored) {
        setRecords(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading maintenance records:', error);
    }
  };

  const saveRecords = (newRecords: MaintenanceRecord[]) => {
    try {
      localStorage.setItem('maintenance_records', JSON.stringify(newRecords));
      setRecords(newRecords);
    } catch (error) {
      console.error('Error saving maintenance records:', error);
    }
  };

  const calculateDuration = (start: string, end: string): number => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();
    return Math.max(0, Math.round(diffMs / (1000 * 60 * 60)));
  };

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    
    const duration = calculateDuration(formData.startDate, formData.endDate);
    const newRecord: MaintenanceRecord = {
      id: Date.now().toString(),
      boiler: formData.boiler,
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      duration,
      description: formData.description,
      notes: formData.notes,
      status: formData.status,
      createdDate: new Date().toISOString()
    };

    saveRecords([newRecord, ...records]);
    setFormData({
      boiler: 1,
      type: 'maintenance',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      description: '',
      notes: '',
      status: 'completed'
    });
    setShowForm(false);
    addNotification(`Boiler ${newRecord.boiler} ${newRecord.type} record added successfully`, 'success');
  };

  const handleDeleteRecord = (id: string) => {
    if (confirm('Delete this maintenance record?')) {
      saveRecords(records.filter(r => r.id !== id));
      addNotification('Maintenance record deleted', 'info');
    }
  };

  const filteredRecords = records.filter(record => {
    const boilerMatch = filterBoiler === 'all' || record.boiler.toString() === filterBoiler;
    const typeMatch = filterType === 'all' || record.type === filterType;
    return boilerMatch && typeMatch;
  });

  const totalDowntime = filteredRecords
    .filter(r => r.type === 'downtime' && r.status === 'completed')
    .reduce((sum, r) => sum + r.duration, 0);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'downtime': return '🔴';
      case 'maintenance': return '🔧';
      case 'repair': return '⚙️';
      case 'inspection': return '🔍';
      default: return '📋';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'scheduled';
      case 'ongoing': return 'ongoing';
      case 'completed': return 'completed';
      default: return '';
    }
  };

  return (
    <div className="maintenance-features">
      <div className="maintenance-header">
        <h3>🔧 Maintenance & Downtime Tracking</h3>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="add-record-btn"
        >
          {showForm ? '✕ Close' : '+ Add Record'}
        </button>
      </div>

      {/* Add Record Form */}
      {showForm && (
        <div className="maintenance-form">
          <form onSubmit={handleAddRecord}>
            <div className="form-row">
              <div className="form-group">
                <label>Boiler</label>
                <select
                  value={formData.boiler}
                  onChange={(e) => setFormData({ ...formData, boiler: parseInt(e.target.value) })}
                  required
                >
                  <option value={1}>Boiler 1</option>
                  <option value={2}>Boiler 2</option>
                  <option value={3}>Boiler 3</option>
                </select>
              </div>

              <div className="form-group">
                <label>Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  required
                >
                  <option value="downtime">Downtime</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="repair">Repair</option>
                  <option value="inspection">Inspection</option>
                </select>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label>Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Annual maintenance, Boiler tube cleaning"
                required
              />
            </div>

            <div className="form-group full-width">
              <label>Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional details, findings, or observations..."
                rows={3}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">Save Record</button>
              <button type="button" onClick={() => setShowForm(false)} className="cancel-btn">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Statistics */}
      <div className="maintenance-stats">
        <div className="stat-card">
          <div className="stat-label">Total Records</div>
          <div className="stat-value">{filteredRecords.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Downtime</div>
          <div className="stat-value">{totalDowntime}h</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Scheduled</div>
          <div className="stat-value">{filteredRecords.filter(r => r.status === 'scheduled').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Ongoing</div>
          <div className="stat-value">{filteredRecords.filter(r => r.status === 'ongoing').length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="maintenance-filters">
        <div className="filter-group">
          <label>Filter by Boiler:</label>
          <div className="filter-buttons">
            {(['all', '1', '2', '3'] as const).map(boiler => (
              <button
                key={boiler}
                className={`filter-btn ${filterBoiler === boiler ? 'active' : ''}`}
                onClick={() => setFilterBoiler(boiler)}
              >
                {boiler === 'all' ? 'All' : `Boiler ${boiler}`}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label>Filter by Type:</label>
          <div className="filter-buttons">
            {(['all', 'downtime', 'maintenance', 'repair', 'inspection'] as const).map(type => (
              <button
                key={type}
                className={`filter-btn ${filterType === type ? 'active' : ''}`}
                onClick={() => setFilterType(type)}
              >
                {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Records List */}
      <div className="maintenance-list">
        {filteredRecords.length === 0 ? (
          <div className="no-records">
            <p>📭 No maintenance records found</p>
          </div>
        ) : (
          <div className="records-container">
            {filteredRecords.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()).map(record => (
              <div key={record.id} className={`record-card status-${getStatusColor(record.status)}`}>
                <div className="record-header">
                  <span className="record-type">
                    {getTypeIcon(record.type)} {record.type.toUpperCase()}
                  </span>
                  <span className="record-boiler">Boiler {record.boiler}</span>
                  <span className={`record-status status-${getStatusColor(record.status)}`}>
                    {record.status.toUpperCase()}
                  </span>
                  <button 
                    onClick={() => handleDeleteRecord(record.id)}
                    className="delete-btn"
                  >
                    🗑️
                  </button>
                </div>

                <div className="record-body">
                  <p className="record-description">{record.description}</p>
                  
                  <div className="record-details">
                    <div className="detail-item">
                      <span className="detail-label">Period:</span>
                      <span className="detail-value">
                        {new Date(record.startDate).toLocaleDateString()} to {new Date(record.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Duration:</span>
                      <span className="detail-value">{record.duration} hours</span>
                    </div>
                  </div>

                  {record.notes && (
                    <div className="record-notes">
                      <strong>Notes:</strong> {record.notes}
                    </div>
                  )}

                  <div className="record-meta">
                    Added: {new Date(record.createdDate).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

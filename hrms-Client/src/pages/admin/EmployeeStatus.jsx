import React, { useState, useEffect } from 'react';
import { C, SHADOW, RADIUS, TYPOGRAPHY } from '../../theme'; // Adjust this import path as needed

const EmployeeStatusMaster = () => {
  const [statuses, setStatuses] = useState([]);
  const [newStatus, setNewStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States for inline editing
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState('');

  const fetchStatuses = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/employee-statuses');
      const data = await response.json();
      setStatuses(data);
    } catch (err) {
      console.error("Failed to fetch statuses", err);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  // Handle Add Form Submission
  const handleAddStatus = async (e) => {
    e.preventDefault();
    if (!newStatus.trim()) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/employee-statuses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_status: newStatus }),
      });

      if (response.ok) {
        setNewStatus(''); 
        fetchStatuses(); 
      } else {
        throw new Error('Failed to save to database');
      }
    } catch (err) {
      alert("Failed to add status: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Start Inline Editing Mode
  const startEdit = (statusItem) => {
    setEditingId(statusItem.id);
    setEditingValue(statusItem.employee_status);
  };

  // Cancel Inline Editing Mode
  const cancelEdit = () => {
    setEditingId(null);
    setEditingValue('');
  };

  // Save Inline Edit (PUT Request)
  const handleSaveEdit = async (id) => {
    if (!editingValue.trim()) return;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/employee-statuses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_status: editingValue }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      setEditingId(null);
      fetchStatuses(); // Refresh table updates
    } catch (err) {
      alert("Error updating status: " + err.message);
    }
  };

  // Delete Status Type (DELETE Request)
  const handleDeleteStatus = async (id) => {
    if (window.confirm("Are you sure you want to delete this status option? Employees currently using this type may display blank metrics.")) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/employee-statuses/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to delete status option');

        fetchStatuses(); // Refresh table entries
      } catch (err) {
        alert("Error deleting status: " + err.message);
      }
    }
  };

  return (
    <div style={{ fontFamily: TYPOGRAPHY.fontFamily }}>
      <h2 style={{ color: C.secondary, marginBottom: '20px' }}>Employee Status</h2>
      
      {/* Add New Status Form */}
      <div style={{ backgroundColor: C.card, padding: '24px', borderRadius: RADIUS.card, boxShadow: SHADOW.card, marginBottom: '24px', display: 'flex', alignItems: 'flex-end', gap: '16px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: C.secondary }}>Add New Status Type</label>
          <input 
            type="text" 
            value={newStatus} 
            onChange={(e) => setNewStatus(e.target.value)} 
            placeholder="e.g., Probation, Notice Period"
            style={{ padding: '12px', borderRadius: RADIUS.input, border: `1px solid ${C.borderLight}`, outline: 'none' }}
          />
        </div>
        <button 
          onClick={handleAddStatus} 
          disabled={isSubmitting || !newStatus.trim()} 
          style={{ background: C.accent, color: "#fff", border: "none", padding: "12px 24px", borderRadius: "10px", fontWeight: "600", cursor: "pointer", height: '43px' }}
        >
          {isSubmitting ? 'Saving...' : '+ Add'}
        </button>
      </div>

      {/* Status Table */}
      <div style={{ backgroundColor: C.card, borderRadius: RADIUS.card, boxShadow: SHADOW.card, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ borderBottom: `2px solid ${C.borderLight}` }}>
            <tr>
              <th style={{ padding: '16px', color: C.muted, fontWeight: '600', fontSize: '14px', width: '80px' }}>ID</th>
              <th style={{ padding: '16px', color: C.muted, fontWeight: '600', fontSize: '14px' }}>Status Name</th>
              <th style={{ padding: '16px', color: C.muted, fontWeight: '600', fontSize: '14px', textAlign: 'center', width: '200px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {statuses.map((status) => (
              <tr key={status.id} style={{ borderBottom: `1px solid ${C.borderLight}`, height: '65px' }}>
                <td style={{ padding: '16px', color: C.text, fontSize: '14px' }}>{status.id}</td>
                
                <td style={{ padding: '16px', fontSize: '14px' }}>
                  {editingId === status.id ? (
                    <input 
                      type="text"
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      style={styles.inlineInput}
                      autoFocus
                    />
                  ) : (
                    <strong style={{ color: C.secondary, fontWeight: '700' }}>{status.employee_status}</strong>
                  )}
                </td>

                <td style={{ padding: '16px', textAlign: 'center' }}>
                  {editingId === status.id ? (
                    <>
                      <button onClick={() => handleSaveEdit(status.id)} style={styles.actionBtn.save}>Save</button>
                      <button onClick={cancelEdit} style={styles.actionBtn.cancel}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(status)} style={styles.actionBtn.edit}>Edit</button>
                      <button onClick={() => handleDeleteStatus(status.id)} style={styles.actionBtn.delete}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {statuses.length === 0 && (
          <div style={{ padding: '20px', textAlign: 'center', color: C.muted }}>
            No status items configured.
          </div>
        )}
      </div>
    </div>
  );
};

// Inline helper styles matching employee board design rules
const styles = {
  inlineInput: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #3ea0cf',
    outline: 'none',
    fontSize: '14px',
    width: '80%',
    fontWeight: '600',
    color: '#0f172a'
  },
  actionBtn: {
    edit: { backgroundColor: 'transparent', color: '#eab308', border: '1px solid #eab308', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', marginRight: '8px', fontSize: '13px', fontWeight: '500' },
    delete: { backgroundColor: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' },
    save: { backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', marginRight: '8px', fontSize: '13px', fontWeight: '600' },
    cancel: { backgroundColor: 'transparent', color: '#64748b', border: '1px solid #cbd5e1', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }
  }
};

export default EmployeeStatusMaster;
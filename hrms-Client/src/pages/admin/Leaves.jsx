import React, { useState, useEffect } from 'react';
import { C, SHADOW, RADIUS, TYPOGRAPHY } from '../../theme';

const Leaves = () => {
  const [activeTab, setActiveTab] = useState('requests');

  // Data States
  const [leaves, setLeaves] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLeave, setNewLeave] = useState({ typeName: '', daysAllowed: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Data function
  const fetchLeavesData = async () => {
    setIsLoading(true);
    try {
      // Fetch Employee Leave Requests
      const reqResponse = await fetch('http://localhost:5000/api/admin/leaves');
      if (reqResponse.ok) {
        const reqData = await reqResponse.json();
        setLeaves(reqData);
      }

      // Fetch Leave Types Master List
      const typesResponse = await fetch('http://localhost:5000/api/admin/leave-types');
      if (typesResponse.ok) {
        const typesData = await typesResponse.json();
        setLeaveTypes(typesData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeavesData();
  }, []);

  // Submit New Leave Type
  const handleAddLeaveType = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/admin/leave-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLeave),
      });

      if (!response.ok) throw new Error('Failed to add leave type');

      // Reset form, close modal, and refresh data
      setNewLeave({ typeName: '', daysAllowed: '' });
      setIsModalOpen(false);
      fetchLeavesData();
      
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusStyle = (status) => {
    const baseStyle = { ...styles.statusBadge };
    if (status === 'Approved' || status === 'Active') return { ...baseStyle, backgroundColor: C.successBg, color: C.success };
    if (status === 'Cancelled' || status === 'Inactive') return { ...baseStyle, backgroundColor: C.dangerBg, color: C.danger };
    return { ...baseStyle, backgroundColor: C.warningBg, color: C.warning };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (isLoading) return <div style={{ color: C.text }}>Loading data...</div>;

  return (
    <div style={{ fontFamily: TYPOGRAPHY.fontFamily, position: 'relative' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: C.secondary }}>Leave Management</h2>
        
        {activeTab === 'types' && (
          <button style={styles.primaryBtn} onClick={() => setIsModalOpen(true)}>
            + Add Leave Type
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={styles.tabsContainer}>
        <button 
          style={activeTab === 'requests' ? styles.activeTabBtn : styles.inactiveTabBtn}
          onClick={() => setActiveTab('requests')}
        >
          Employee Leaves
        </button>
        <button 
          style={activeTab === 'types' ? styles.activeTabBtn : styles.inactiveTabBtn}
          onClick={() => setActiveTab('types')}
        >
          Manage Leave Types
        </button>
      </div>
      
      {/* Tab 1 Content */}
      {activeTab === 'requests' && (
        <div style={styles.tableContainer}>
          {/* Keep your exact same table code for requests here */}
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ borderBottom: `2px solid ${C.borderLight}` }}>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Employee ID</th>
                <th style={styles.th}>Leave Type</th>
                <th style={styles.th}>Duration</th>
                <th style={styles.th}>Days</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr key={leave.id} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
                  <td style={styles.td}>{leave.id}</td>
                  <td style={styles.td}><strong>{leave.EmployeeId}</strong></td>
                  <td style={styles.td}>
                    <span style={styles.typeBadge}>{leave.typeName || leave.LeaveType}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={{ fontSize: '13px', color: C.text }}>
                      {formatDate(leave.FromDate)} to {formatDate(leave.ToDate)}
                    </span>
                  </td>
                  <td style={styles.td}><strong>{leave.NumberOfDays}</strong></td>
                  <td style={styles.td}><span style={getStatusStyle(leave.Status)}>{leave.Status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2 Content */}
      {activeTab === 'types' && (
        <div style={styles.tableContainer}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ borderBottom: `2px solid ${C.borderLight}` }}>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Leave Name</th>
                <th style={styles.th}>Default Days / Year</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {leaveTypes.map((type) => (
                <tr key={type.id} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
                  <td style={styles.td}>{type.id}</td>
                  <td style={styles.td}><strong style={{ color: C.secondary }}>{type.typeName}</strong></td>
                  <td style={styles.td}>{type.daysAllowed} Days</td>
                  <td style={styles.td}><span style={getStatusStyle(type.status)}>{type.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL OVERLAY */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ marginTop: 0, color: C.secondary }}>Add Leave Type</h3>
            
            <form onSubmit={handleAddLeaveType} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={styles.label}>Leave Name (e.g. Sick Leave)</label>
                <input 
                  type="text" 
                  required
                  style={styles.input} 
                  value={newLeave.typeName}
                  onChange={(e) => setNewLeave({...newLeave, typeName: e.target.value})}
                />
              </div>

              <div>
                <label style={styles.label}>Days Allowed per Year</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  style={styles.input} 
                  value={newLeave.daysAllowed}
                  onChange={(e) => setNewLeave({...newLeave, daysAllowed: e.target.value})}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} style={styles.primaryBtn}>
                  {isSubmitting ? 'Saving...' : 'Save Leave Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

const styles = {
  tabsContainer: { display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: `2px solid ${C.borderLight}`, paddingBottom: '12px' },
  activeTabBtn: { backgroundColor: C.primary, color: C.white, border: 'none', padding: '8px 20px', borderRadius: RADIUS.pill, fontWeight: '600', cursor: 'pointer', fontSize: '14px', boxShadow: SHADOW.soft, transition: 'all 0.2s ease' },
  inactiveTabBtn: { backgroundColor: C.inputBg, color: C.primary, border: `1px solid ${C.inputBorder}`, padding: '8px 20px', borderRadius: RADIUS.pill, fontWeight: '600', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s ease' },
  
  tableContainer: { overflowX: 'auto', backgroundColor: C.card, borderRadius: RADIUS.card, boxShadow: SHADOW.card },
  th: { padding: '16px', color: C.muted, fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' },
  td: { padding: '16px', color: C.text, fontSize: '14px', verticalAlign: 'middle' },
  
  statusBadge: { padding: '6px 12px', borderRadius: RADIUS.pill, fontSize: '12px', fontWeight: '600' },
  typeBadge: { backgroundColor: C.inputBg, color: C.primary, border: `1px solid ${C.inputBorder}`, padding: '4px 8px', borderRadius: RADIUS.button, fontSize: '13px', fontWeight: '500' },
  
  primaryBtn: { backgroundColor: C.primary, color: C.white, border: 'none', padding: '10px 20px', borderRadius: RADIUS.button, cursor: 'pointer', fontWeight: '600' },
  cancelBtn: { backgroundColor: 'transparent', color: C.muted, border: `1px solid ${C.borderLight}`, padding: '10px 20px', borderRadius: RADIUS.button, cursor: 'pointer', fontWeight: '600' },

  // Modal Styles
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: C.card, padding: '24px', borderRadius: RADIUS.card, width: '400px', maxWidth: '90%', boxShadow: SHADOW.card },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: C.muted, marginBottom: '6px' },
  input: { width: '100%', padding: '10px', borderRadius: RADIUS.input, border: `1px solid ${C.inputBorder}`, backgroundColor: C.inputBg, fontSize: '14px', boxSizing: 'border-box' }
};

export default Leaves;
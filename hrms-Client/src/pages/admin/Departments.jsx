import React, { useState, useEffect } from 'react';
import { C, SHADOW, RADIUS, TYPOGRAPHY } from '../../theme'; // Adjust this import path as needed

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/departments');
        if (!response.ok) throw new Error('Failed to fetch data');
        
        const data = await response.json();
        setDepartments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const handleView = (id) => console.log("View details for department ID:", id);
  const handleEdit = (id) => console.log("Edit department ID:", id);
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      console.log("Delete department ID:", id);
    }x
  };

  if (isLoading) return <div style={{ color: C.text }}>Loading departments...</div>;
  if (error) return <div style={{ color: C.danger }}>Error: {error}</div>;

  return (
    <div style={{ fontFamily: TYPOGRAPHY.fontFamily }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: C.secondary }}>Departments</h2>
        <button style={styles.addBtn}>+ Add Department</button>
      </div>
      
      <div style={styles.tableContainer}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ borderBottom: `2px solid ${C.borderLight}` }}>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Department Name</th>
              <th style={styles.th}>Department Code</th>
              <th style={styles.th}>Parent ID</th>
              <th style={{ ...styles.th, textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept) => (
              <tr key={dept.id} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
                <td style={styles.td}>{dept.id}</td>
                <td style={styles.td}>
                  <strong style={{ color: C.secondary }}>{dept.Department}</strong>
                </td>
                <td style={styles.td}>
                  <span style={styles.codeBadge}>{dept.DepartmentCode}</span>
                </td>
                <td style={styles.td}>
                  {dept.parent_id !== null ? dept.parent_id : <span style={{ color: C.muted }}>None</span>}
                </td>
                <td style={{ ...styles.td, textAlign: 'center' }}>
                  <button onClick={() => handleView(dept.id)} style={styles.actionBtn.view}>View</button>
                  <button onClick={() => handleEdit(dept.id)} style={styles.actionBtn.edit}>Edit</button>
                  <button onClick={() => handleDelete(dept.id)} style={styles.actionBtn.delete}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {departments.length === 0 && (
          <div style={{ padding: '20px', textAlign: 'center', color: C.muted }}>
            No departments found.
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  tableContainer: {
    overflowX: 'auto', 
    backgroundColor: C.card, 
    borderRadius: RADIUS.card, 
    boxShadow: SHADOW.card 
  },
  th: {
    padding: '16px',
    color: C.muted,
    fontWeight: '600',
    fontSize: '14px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  td: {
    padding: '16px',
    color: C.text,
    fontSize: '14px',
  },
  codeBadge: {
    backgroundColor: C.inputBg,
    color: C.primary,
    border: `1px solid ${C.inputBorder}`,
    padding: '4px 8px',
    borderRadius: RADIUS.button,
    fontSize: '13px',
    fontWeight: '500'
  },
  addBtn: {
    border: "none",
    background: C.accent,
    color: "#fff",
    padding: "14px 22px",
    borderRadius: "14px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(214,58,110,.25)",
  },
  actionBtn: {
    view: {
      backgroundColor: 'transparent',
      color: C.primary,
      border: `1px solid ${C.primary}`,
      padding: '6px 12px',
      borderRadius: RADIUS.button,
      cursor: 'pointer',
      marginRight: '8px',
      fontSize: '13px',
      fontWeight: '500'
    },
    edit: {
      backgroundColor: 'transparent',
      color: C.warning,
      border: `1px solid ${C.warning}`,
      padding: '6px 12px',
      borderRadius: RADIUS.button,
      cursor: 'pointer',
      marginRight: '8px',
      fontSize: '13px',
      fontWeight: '500'
    },
    delete: {
      backgroundColor: 'transparent',
      color: C.danger,
      border: `1px solid ${C.danger}`,
      padding: '6px 12px',
      borderRadius: RADIUS.button,
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: '500'
    }
  }
};

export default Departments;
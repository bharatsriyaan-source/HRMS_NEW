import React, { useState, useEffect } from 'react';
import { C, SHADOW, RADIUS, TYPOGRAPHY } from '../../theme';

// --- Reusable Input Component ---
const FormGroup = ({ label, name, type = "text", value, onChange, required = false, placeholder = "", disabled = false }) => (
  <div style={styles.formGroup}>
    <label style={styles.label}>{label} {required && <span style={{color: 'red'}}>*</span>}</label>
    <input 
      type={type} 
      name={name} 
      value={value} 
      onChange={onChange} 
      required={required}
      placeholder={placeholder}
      disabled={disabled}
      style={styles.input} 
    />
  </div>
);

const Projects = () => {
  // --- Core States ---
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]); 
  const [userRole, setUserRole] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Modal & Form States ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [editProjectId, setEditProjectId] = useState(null);
  const [activeTab, setActiveTab] = useState('Basic Info');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const initialFormState = {
    projectcode: '', protocol: '', clientid: '', clientstudyid: '', studyid: '', tid: '', currencyid: '',
    studytype: '', noofsites: '', noofsubject: '', noofvisits: '', studyduration: '', edc: '',
    contractsigndate: '', totalcontractvalue: '', submissiontype: '', contractsigned: '0',
    expectedstudystartdate: '', expectedstudyenddate: '', actualstudystartdate: '', actualstudyenddate: '',
    startdatecomment: '', enddatecomment: '', protocol_desc: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  // --- API Integrations ---
  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/projects');
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/clients-lookup');
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (err) {
      console.error("Failed to fetch clients dictionary reference", err);
    }
  };

  useEffect(() => {
    const savedRole = localStorage.getItem("role") || sessionStorage.getItem("role") || "ADMIN";
    setUserRole(savedRole.toUpperCase());
    
    fetchProjects();
    fetchClients();
  }, []);

  // --- Modal Controllers ---
  const openModal = () => {
    // FIXED: Removed the restrictive guard blocking ADMIN accounts
    setFormData(initialFormState);
    setIsEditMode(false);
    setIsViewMode(false);
    setEditProjectId(null);
    setActiveTab('Basic Info');
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleView = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/projects/${id}`);
      if (!response.ok) throw new Error('Failed to load project parameters');
      const data = await response.json();
      setFormData(formatProjectDates(data));
      setIsViewMode(true);
      setIsEditMode(false);
      setEditProjectId(id);
      setActiveTab('Basic Info');
      setIsModalOpen(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/projects/${id}`);
      if (!response.ok) throw new Error('Failed to load project info');
      const data = await response.json();
      setFormData(formatProjectDates(data));
      setIsEditMode(true);
      setIsViewMode(false);
      setEditProjectId(id);
      setActiveTab('Basic Info');
      setIsModalOpen(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to drop this project row permanently?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/projects/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to drop table row');
        fetchProjects();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const formatProjectDates = (data) => {
    const formatted = { ...initialFormState, ...data };
    const dateFields = ['contractsigndate', 'expectedstudystartdate', 'expectedstudyenddate', 'actualstudystartdate', 'actualstudyenddate'];
    dateFields.forEach(field => {
      if (formatted[field]) {
        formatted[field] = new Date(formatted[field]).toISOString().split('T')[0];
      }
    });
    return formatted;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isViewMode) return; // Prevent submission in standard view mode

    setIsSubmitting(true);
    setFormError(null);

    const url = isEditMode 
      ? `http://localhost:5000/api/admin/projects/${editProjectId}`
      : 'http://localhost:5000/api/admin/projects';
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!response.ok) throw new Error('Error processing transactional update.');
      
      alert(`Project successfully ${isEditMode ? 'updated' : 'created'}!`);
      closeModal();
      fetchProjects();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = ['Basic Info', 'Study Logistics', 'Timeline & Comments'];

  if (isLoading && projects.length === 0) return <div style={{ color: C.text }}>Loading corporate projects archive...</div>;
  if (error) return <div style={{ color: C.danger }}>Error: {error}</div>;

  return (
    <div style={{ fontFamily: TYPOGRAPHY.fontFamily, position: 'relative' }}>
      
      {/* HEADER BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: C.secondary }}>Projects</h2>
        {/* FIXED: Replaced checking constraint so ADMIN roles can add entries */}
        {(userRole === "ADMIN" || userRole === "HR") && (
          <button onClick={openModal} style={styles.addBtn}>+ Create New Project</button>
        )}
      </div>

      {/* RENDER TABLE DATAGRID */}
      <div style={styles.tableContainer}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ borderBottom: `2px solid ${C.borderLight}` }}>
            <tr>
              <th style={styles.th}>Code</th>
              <th style={styles.th}>Protocol Name</th>
              <th style={styles.th}>Client Linked</th>
              <th style={styles.th}>Study Type</th>
              <th style={styles.th}>Total Value</th>
              <th style={{ ...styles.th, textAlign: 'center' }}>Actions Mapping</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((proj) => {
              const connectedClient = clients.find(c => c.clientid === proj.clientid);
              return (
                <tr key={proj.projectid} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
                  <td style={styles.td}><strong>{proj.projectcode}</strong></td>
                  <td style={styles.td}>{proj.protocol}</td>
                  <td style={styles.td}>
                    <span style={styles.clientBadge}>
                      {connectedClient ? connectedClient.clientname : `ID Reference: ${proj.clientid}`}
                    </span>
                  </td>
                  <td style={styles.td}>{proj.studytype || 'N/A'}</td>
                  <td style={styles.td}>{proj.totalcontractvalue ? `$${proj.totalcontractvalue}` : '0.00'}</td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <button onClick={() => handleView(proj.projectid)} style={styles.actionBtn.view}>View</button>
                    
                    {/* FIXED: Opened write access parameters for ADMIN roles */}
                    {(userRole === "ADMIN" || userRole === "HR") && (
                      <>
                        <button onClick={() => handleEdit(proj.projectid)} style={styles.actionBtn.edit}>Edit</button>
                        <button onClick={() => handleDelete(proj.projectid)} style={styles.actionBtn.archive}>Drop</button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* CRUD MANAGEMENT OVERLAY MODAL */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: C.secondary }}>
                {isViewMode ? 'Project Schema View' : (isEditMode ? 'Edit Project Metrics' : 'Initialize New Project Entry')}
              </h2>
              <button onClick={closeModal} style={styles.closeModalBtn}>&times;</button>
            </div>

            {formError && <div style={{ color: C.danger, marginBottom: '16px', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '8px' }}>{formError}</div>}

            {/* TAB INTERFACE ROUTER */}
            <div style={styles.tabContainer}>
              {tabs.map(tab => (
                <button key={tab} type="button" onClick={() => setActiveTab(tab)} style={activeTab === tab ? styles.activeTab : styles.inactiveTab}>
                  {tab}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <div style={styles.scrollableFormArea}>
                {/* FIXED: Removed userRole checks from fieldset disable logic */}
                <fieldset disabled={isViewMode} style={{ border: 'none', padding: 0, margin: 0 }}>
                  
                  {/* TAB 1: BASIC METRICS & CLIENT MAPPING */}
                  {activeTab === 'Basic Info' && (
                    <div style={styles.grid}>
                      <FormGroup label="Project Code" name="projectcode" value={formData.projectcode} onChange={handleChange} required />
                      <FormGroup label="Protocol Identifier" name="protocol" value={formData.protocol} onChange={handleChange} required />
                      
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Client Target Mapping <span style={{color: 'red'}}>*</span></label>
                        <select name="clientid" value={formData.clientid} onChange={handleChange} required style={styles.input}>
                          <option value="">Choose Connected Client...</option>
                          {clients.map((cli) => (
                            <option key={cli.clientid} value={cli.clientid}>
                              {cli.clientname} (ID: {cli.clientid})
                            </option>
                          ))}
                        </select>
                      </div>

                      <FormGroup label="Client Study ID" name="clientstudyid" value={formData.clientstudyid} onChange={handleChange} />
                      <FormGroup label="Study ID (Internal)" name="studyid" type="number" value={formData.studyid} onChange={handleChange} />
                      <FormGroup label="TID Reference" name="tid" type="number" value={formData.tid} onChange={handleChange} />
                      <FormGroup label="Currency Key Reference" name="currencyid" type="number" value={formData.currencyid} onChange={handleChange} />
                    </div>
                  )}

                  {/* TAB 2: STUDY METRICS & LOGISTICS */}
                  {activeTab === 'Study Logistics' && (
                    <div style={styles.grid}>
                      <FormGroup label="Study Classification" name="studytype" value={formData.studytype} onChange={handleChange} placeholder="e.g. Clinical Trial Phase III" />
                      <FormGroup label="Total Sites Count" name="noofsites" type="number" value={formData.noofsites} onChange={handleChange} />
                      <FormGroup label="Total Target Subjects" name="noofsubject" type="number" value={formData.noofsubject} onChange={handleChange} />
                      <FormGroup label="Visits Count Metric" name="noofvisits" type="number" value={formData.noofvisits} onChange={handleChange} />
                      <FormGroup label="Calculated Duration (Months)" name="studyduration" type="number" value={formData.studyduration} onChange={handleChange} />
                      <FormGroup label="EDC Platform Core" name="edc" value={formData.edc} onChange={handleChange} placeholder="e.g. Rave, InForm" />
                      <FormGroup label="Submission Protocol Type" name="submissiontype" value={formData.submissiontype} onChange={handleChange} required />
                    </div>
                  )}

                  {/* TAB 3: TIMELINE, FINANCIALS & COMMENTS */}
                  {activeTab === 'Timeline & Comments' && (
                    <div style={styles.grid}>
                      <FormGroup label="Contract Signature Date" name="contractsigndate" type="date" value={formData.contractsigndate} onChange={handleChange} />
                      <FormGroup label="Total Financial Contract Value" name="totalcontractvalue" type="number" step="0.01" value={formData.totalcontractvalue} onChange={handleChange} />
                      
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Contract Signed Indicator</label>
                        <select name="contractsigned" value={formData.contractsigned} onChange={handleChange} style={styles.input}>
                          <option value="0">No / Execution Pending</option>
                          <option value="1">Yes / Fully Signed</option>
                        </select>
                      </div>

                      <FormGroup label="Expected Study Start" name="expectedstudystartdate" type="date" value={formData.expectedstudystartdate} onChange={handleChange} required />
                      <FormGroup label="Expected Study Termination" name="expectedstudyenddate" type="date" value={formData.expectedstudyenddate} onChange={handleChange} required />
                      <FormGroup label="Actual Operational Commencement" name="actualstudystartdate" type="date" value={formData.actualstudystartdate} onChange={handleChange} required />
                      <FormGroup label="Actual Project Closure Date" name="actualstudyenddate" type="date" value={formData.actualstudyenddate} onChange={handleChange} required />
                      
                      <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                        <label style={styles.label}>Protocol Details & Parameters Scope</label>
                        <textarea name="protocol_desc" value={formData.protocol_desc} onChange={handleChange} required style={{ ...styles.input, height: '80px', resize: 'vertical' }} />
                      </div>

                      <FormGroup label="Timeline Commencement Comment" name="startdatecomment" value={formData.startdatecomment} onChange={handleChange} required />
                      <FormGroup label="Timeline Closure Comment" name="enddatecomment" value={formData.enddatecomment} onChange={handleChange} required />
                    </div>
                  )}

                </fieldset>
              </div>

              {/* ACTION EXECUTION BUTTONS TRACE */}
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '16px', paddingTop: '16px', borderTop: `1px solid ${C.borderLight}` }}>
                <button type="button" onClick={closeModal} style={styles.cancelBtn}>
                  {isViewMode ? 'Close Interface' : 'Cancel Actions'}
                </button>
                {!isViewMode && (
                  <button type="submit" disabled={isSubmitting} style={styles.submitBtn}>
                    {isSubmitting ? 'Processing Transaction...' : (isEditMode ? 'Update Metrics' : 'Commit Project Record')}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Keeping your inline style definitions exactly the same...
const styles = {
  tableContainer: { overflowX: 'auto', backgroundColor: C.card, borderRadius: RADIUS.card, boxShadow: SHADOW.card },
  th: { padding: '16px', color: C.muted, fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' },
  td: { padding: '16px', color: C.text, fontSize: '14px' },
  clientBadge: { backgroundColor: 'rgba(43,125,161,0.1)', color: '#2b7da1', padding: '6px 12px', borderRadius: RADIUS.button, fontSize: '13px', fontWeight: '600' },
  addBtn: { border: "none", background: "#d63a6e", color: "#fff", padding: "14px 22px", borderRadius: "14px", fontWeight: "600", cursor: "pointer", boxShadow: "0 10px 24px rgba(214,58,110,.25)" },
  actionBtn: {
    view: { backgroundColor: 'transparent', color: '#3ea0cf', border: '1px solid #3ea0cf', padding: '6px 12px', borderRadius: RADIUS.button, cursor: 'pointer', marginRight: '8px', fontSize: '13px', fontWeight: '500' },
    edit: { backgroundColor: 'transparent', color: C.warning, border: `1px solid ${C.warning}`, padding: '6px 12px', borderRadius: RADIUS.button, cursor: 'pointer', marginRight: '8px', fontSize: '13px', fontWeight: '500' },
    archive: { backgroundColor: 'transparent', color: C.danger, border: `1px solid ${C.danger}`, padding: '6px 12px', borderRadius: RADIUS.button, cursor: 'pointer', fontSize: '13px', fontWeight: '500' }
  },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.45)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' },
  modalContent: { backgroundColor: '#fff', padding: '32px', borderRadius: '16px', width: '100%', maxWidth: '950px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' },
  scrollableFormArea: { overflowY: 'auto', paddingRight: '10px', maxHeight: '55vh' },
  closeModalBtn: { background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: '#64748b', lineHeight: '1' },
  tabContainer: { display: 'flex', borderBottom: '2px solid #e5edf4', marginBottom: '24px', overflowX: 'auto' },
  activeTab: { padding: '12px 24px', backgroundColor: 'transparent', border: 'none', borderBottom: '3px solid #d63a6e', color: '#d63a6e', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' },
  inactiveTab: { padding: '12px 24px', backgroundColor: 'transparent', border: 'none', color: '#64748b', fontWeight: '600', cursor: 'pointer', fontSize: '14px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' },
  formGroup: { display: 'flex', flexDirection: 'column' },
  label: { marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#334155' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #e5edf4', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '14px', outline: 'none' },
  submitBtn: { border: "none", background: "#2b7da1", color: "#fff", padding: "12px 24px", borderRadius: "10px", fontWeight: "600", cursor: "pointer" },
  cancelBtn: { backgroundColor: 'transparent', color: '#64748b', border: '1px solid #e5edf4', padding: '12px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }
};

export default Projects;
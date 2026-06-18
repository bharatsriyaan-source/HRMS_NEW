import React, { useState, useEffect } from 'react';
import { C, SHADOW, RADIUS, TYPOGRAPHY } from '../../theme';

const FormGroup = ({ label, name, type = "text", value, onChange, required = false, placeholder = "" }) => (
  <div style={styles.formGroup}>
    <label style={styles.label}>{label} {required && <span style={{color: 'red'}}>*</span>}</label>
    <input 
      type={type} 
      name={name} 
      value={value} 
      onChange={onChange} 
      required={required}
      placeholder={placeholder}
      style={styles.input} 
    />
  </div>
);

const ClientMaster = () => {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal Management States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [activeTab, setActiveTab] = useState('General');
  const [editClientId, setEditClientId] = useState(null);
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State keys map to descriptive names for UI control; Backend handles database mapping
  const initialFormState = {
    ClientCode: '', ClientName: '', Address: '', City: '', Country: '', CustomerName: '', Email: '', CountryCode1: '', CurrentContactNo: '',
    Email2: '', CountryCode2: '', CurrentContactNo2: '', Comment: '', CDADoc: '', MSADoc: '',
    CDASigned: 0, CDAStart: '', CDAEnd: '', 
    MSASigned: 0, MSADraftInitiationDate: '', MSAStartdate: '', MSAEnddate: '',
    LocalAgreementSigned: 0, LocalAgreementStartdate: '', LocalAgreementEnddate: '', LocalAgreementDoc: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/clients');
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (err) {
      console.error("Failed extracting client matrix data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const openAddModal = () => {
    setFormData(initialFormState);
    setIsEditMode(false);
    setIsViewMode(false);
    setFormError(null);
    setActiveTab('General');
    setIsModalOpen(true);
  };

  const handleModalOpen = async (id, viewOnly = false) => {
    try {
      const selected = clients.find(c => c.ClientId === id);
      if (!selected) return;

      const formatted = { ...initialFormState, ...selected };
      
      // FIXED: Safely map database short column names into frontend state keys
      formatted.CDAStart = selected.CDAStart || '';
      formatted.CDAEnd = selected.CDAEnd || '';
      formatted.MSAStartdate = selected.MSAStart || '';
      formatted.MSAEnddate = selected.MSAEnd || '';

      // Cleanly format dates into strict HTML5 YYYY-MM-DD input formats
      const dateFields = [
        'CDAStart', 'CDAEnd', 
        'MSADraftInitiationDate', 'MSAStartdate', 'MSAEnddate', 
        'LocalAgreementStartdate', 'LocalAgreementEnddate'
      ];
      
      dateFields.forEach(field => {
        if (formatted[field]) {
          formatted[field] = new Date(formatted[field]).toISOString().split('T')[0];
        } else {
          formatted[field] = '';
        }
      });

      setFormData(formatted);
      setEditClientId(id);
      setIsViewMode(viewOnly);
      setIsEditMode(!viewOnly);
      setFormError(null);
      setActiveTab('General');
      setIsModalOpen(true);
    } catch (err) {
      alert("Error parsing client profile registry.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (isViewMode) return;

    setIsSubmitting(true);
    setFormError(null);

    const url = isEditMode 
      ? `http://localhost:5000/api/admin/clients/${editClientId}`
      : 'http://localhost:5000/api/admin/clients';
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save client registry changes.");
      
      setIsModalOpen(false);
      fetchClients();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this client profile? All records will be dropped.")) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/clients/${id}`, { method: 'DELETE' });
        if (response.ok) fetchClients();
      } catch (err) {
        alert("Purge execution exception: " + err.message);
      }
    }
  };

  return (
    <div style={{ fontFamily: TYPOGRAPHY.fontFamily }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: C.secondary }}>Clients</h2>
        <button onClick={openAddModal} style={styles.addBtn}>+ Register Client</button>
      </div>

      {/* Directory Table View */}
      <div style={styles.tableContainer}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ borderBottom: `2px solid ${C.borderLight}` }}>
            <tr>
              <th style={styles.th}>Code</th>
              <th style={styles.th}>Client Name</th>
              <th style={styles.th}>Primary Contact</th>
              <th style={styles.th}>Location</th>
              <th style={styles.th}>CDA</th>
              <th style={styles.th}>MSA</th>
              <th style={styles.th}>Local Agreement</th>
              <th style={{ ...styles.th, textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.ClientId} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
                <td style={styles.td}><span style={styles.codeBadge}>{client.ClientCode}</span></td>
                <td style={styles.td}><strong style={{ color: C.secondary }}>{client.ClientName}</strong></td>
                <td style={styles.td}>
                  <div>{client.CustomerName}</div>
                  <div style={{ fontSize: '12px', color: C.muted }}>{client.Email}</div>
                </td>
                <td style={styles.td}>{client.City}, {client.Country}</td>
                <td style={styles.td}>
                  <span style={{ ...styles.statusTag, backgroundColor: client.CDASigned ? '#e1f5ee' : '#cbd5e1', color: client.CDASigned ? '#0f6e56' : '#475569' }}>
                    {client.CDASigned ? 'Active' : 'Pending'}
                  </span>
                </td>
                <td style={styles.td}>
                  <span style={{ ...styles.statusTag, backgroundColor: client.MSASigned ? '#e1f5ee' : '#cbd5e1', color: client.MSASigned ? '#0f6e56' : '#475569' }}>
                    {client.MSASigned ? 'Active' : 'Pending'}
                  </span>
                </td>
                <td style={styles.td}>
                  <span style={{ ...styles.statusTag, backgroundColor: client.LocalAgreementSigned ? '#e8f4fa' : '#cbd5e1', color: client.LocalAgreementSigned ? '#2b7da1' : '#475569' }}>
                    {client.LocalAgreementSigned ? 'Active' : 'Pending'}
                  </span>
                </td>
                <td style={{ ...styles.td, textAlign: 'center', whiteSpace: 'nowrap' }}>
                  <button onClick={() => handleModalOpen(client.ClientId, true)} style={styles.actionBtn.view}>View</button>
                  <button onClick={() => handleModalOpen(client.ClientId, false)} style={styles.actionBtn.edit}>Edit</button>
                  <button onClick={() => handleDelete(client.ClientId)} style={styles.actionBtn.archive}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {clients.length === 0 && !isLoading && (
          <div style={{ padding: '30px', textAlign: 'center', color: C.muted }}>No client accounts registered yet.</div>
        )}
      </div>

      {/* Form Overlay Modal */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, color: C.secondary }}>
                {isViewMode ? 'Client Dossier' : (isEditMode ? 'Modify Client Registry' : 'New Client Registration')}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={styles.closeModalBtn}>&times;</button>
            </div>

            {formError && <div style={styles.errorBanner}>{formError}</div>}

            <div style={styles.tabContainer}>
              {['General', 'Contact Details', 'Legal Agreements'].map(tab => (
                <button key={tab} type="button" onClick={() => setActiveTab(tab)} style={activeTab === tab ? styles.activeTab : styles.inactiveTab}>{tab}</button>
              ))}
            </div>

            <form onSubmit={handleFormSubmit}>
              <div style={styles.scrollableFormArea}>
                <fieldset disabled={isViewMode} style={{ border: 'none', padding: 0, margin: 0 }}>
                  
                  {/* TAB 1: General Info */}
                  {activeTab === 'General' && (
                    <div style={styles.grid}>
                      <FormGroup label="Client System Code" name="ClientCode" value={formData.ClientCode} onChange={handleInputChange} required placeholder="e.g., CLI-01" />
                      <FormGroup label="Client Corporate Name" name="ClientName" value={formData.ClientName} onChange={handleInputChange} required placeholder="e.g., Acme Labs Inc." />
                      <FormGroup label="Country" name="Country" value={formData.Country} onChange={handleInputChange} required />
                      <FormGroup label="City" name="City" value={formData.City} onChange={handleInputChange} required />
                      <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                        <label style={styles.label}>Corporate Address</label>
                        <input type="text" name="Address" value={formData.Address} onChange={handleInputChange} required style={styles.input} />
                      </div>
                      <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                        <label style={styles.label}>General Operational Comments</label>
                        <textarea name="Comment" value={formData.Comment} onChange={handleInputChange} rows={3} style={{ ...styles.input, resize: 'none', fontFamily: 'inherit' }} />
                      </div>
                    </div>
                  )}

                  {/* TAB 2: Contact Details */}
                  {activeTab === 'Contact Details' && (
                    <div style={styles.grid}>
                      <h4 style={{ gridColumn: '1 / -1', color: C.primary, margin: '5px 0' }}>Primary Point of Contact</h4>
                      <FormGroup label="Customer Point Name" name="CustomerName" value={formData.CustomerName} onChange={handleInputChange} required />
                      <FormGroup label="Email ID" name="Email" type="email" value={formData.Email} onChange={handleInputChange} required />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ flex: 1 }}><FormGroup label="Code" name="CountryCode1" value={formData.CountryCode1} onChange={handleInputChange} required /></div>
                        <div style={{ flex: 3 }}><FormGroup label="Contact Number" name="CurrentContactNo" value={formData.CurrentContactNo} onChange={handleInputChange} required /></div>
                      </div>

                      <h4 style={{ gridColumn: '1 / -1', color: C.primary, margin: '15px 0 5px 0', borderTop: `1px solid ${C.borderLight}`, paddingTop: '15px' }}>Secondary / Backup Contact</h4>
                      <FormGroup label="Backup Contact Name" name="Email2" value={formData.Email2} onChange={handleInputChange} />
                      <FormGroup label="Backup Email ID" name="CountryCode2" value={formData.CountryCode2} onChange={handleInputChange} />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ flex: 1 }}><FormGroup label="Code" name="CountryCode3" value={formData.CountryCode3} onChange={handleInputChange} /></div>
                        <div style={{ flex: 3 }}><FormGroup label="Backup Phone" name="CurrentContactNo2" value={formData.CurrentContactNo2} onChange={handleInputChange} /></div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: Legal & Contracts */}
                  {activeTab === 'Legal Agreements' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      
                      {/* CDA CARD MODULE */}
                      <div style={styles.legalSubCard}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <h4 style={{ margin: 0, color: C.secondary }}>Confidential Disclosure Agreement (CDA)</h4>
                          <select name="CDASigned" value={formData.CDASigned} onChange={handleInputChange} style={styles.inlineSelect}>
                            <option value={0}>Not Signed / Pending</option>
                            <option value={1}>Signed / Active</option>
                          </select>
                        </div>
                        {parseInt(formData.CDASigned) === 1 && (
                          <div style={styles.grid}>
                            <FormGroup label="CDA Start Date" name="CDAStart" type="date" value={formData.CDAStart} onChange={handleInputChange} />
                            <FormGroup label="CDA End Date" name="CDAEnd" type="date" value={formData.CDAEnd} onChange={handleInputChange} />
                          </div>
                        )}
                        <div style={{ ...styles.formGroup, marginTop: '12px' }}>
                          <label style={styles.label}>CDA Document References / Notes</label>
                          <input type="text" name="CDADoc" value={formData.CDADoc} onChange={handleInputChange} placeholder="e.g., Document path index references" style={styles.input} />
                        </div>
                      </div>

                      {/* MSA FIELD MODULE */}
                      <div style={styles.legalSubCard}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <h4 style={{ margin: 0, color: C.secondary }}>Master Services Agreement (MSA)</h4>
                          <select name="MSASigned" value={formData.MSASigned} onChange={handleInputChange} style={styles.inlineSelect}>
                            <option value={0}>Not Signed / Pending</option>
                            <option value={1}>Signed / Active</option>
                          </select>
                        </div>
                        <div style={{ ...styles.grid, marginBottom: '12px' }}>
                          <FormGroup label="MSA Draft Initiation Date" name="MSADraftInitiationDate" type="date" value={formData.MSADraftInitiationDate} onChange={handleInputChange} />
                        </div>
                        {parseInt(formData.MSASigned) === 1 && (
                          <div style={styles.grid}>
                            <FormGroup label="MSA Start Date" name="MSAStartdate" type="date" value={formData.MSAStartdate} onChange={handleInputChange} />
                            <FormGroup label="MSA End Date" name="MSAEnddate" type="date" value={formData.MSAEnddate} onChange={handleInputChange} />
                          </div>
                        )}
                        <div style={{ ...styles.formGroup, marginTop: '12px' }}>
                          <label style={styles.label}>MSA Document References / Notes</label>
                          <input type="text" name="MSADoc" value={formData.MSADoc} onChange={handleInputChange} placeholder="e.g., Contract tracker database index path" style={styles.input} />
                        </div>
                      </div>

                      {/* LOCAL AGREEMENT CARD MODULE */}
                      <div style={styles.legalSubCard}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <h4 style={{ margin: 0, color: C.secondary }}>Local Agreement</h4>
                          <select name="LocalAgreementSigned" value={formData.LocalAgreementSigned} onChange={handleInputChange} style={styles.inlineSelect}>
                            <option value={0}>No / Pending</option>
                            <option value={1}>Yes / Active</option>
                          </select>
                        </div>
                        {parseInt(formData.LocalAgreementSigned) === 1 && (
                          <div style={styles.grid}>
                            <FormGroup label="Local Agreement Start Date" name="LocalAgreementStartdate" type="date" value={formData.LocalAgreementStartdate} onChange={handleInputChange} />
                            <FormGroup label="Local Agreement End Date" name="LocalAgreementEnddate" type="date" value={formData.LocalAgreementEnddate} onChange={handleInputChange} />
                          </div>
                        )}
                        <div style={{ ...styles.formGroup, marginTop: '12px' }}>
                          <label style={styles.label}>Local Agreement Document References / Notes</label>
                          <input type="text" name="LocalAgreementDoc" value={formData.LocalAgreementDoc} onChange={handleInputChange} placeholder="e.g., Local service localization file links" style={styles.input} />
                        </div>
                      </div>

                    </div>
                  )}
                </fieldset>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '16px', paddingTop: '16px', borderTop: `1px solid ${C.borderLight}` }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={styles.cancelBtn}>{isViewMode ? 'Close' : 'Cancel'}</button>
                {!isViewMode && (
                  <button type="submit" disabled={isSubmitting} style={styles.submitBtn}>
                    {isSubmitting ? 'Processing...' : (isEditMode ? 'Update Client' : 'Register Client')}
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

const styles = {
  tableContainer: { overflowX: 'auto', backgroundColor: C.card, borderRadius: RADIUS.card, boxShadow: SHADOW.card },
  th: { padding: '16px', color: C.muted, fontWeight: '600', fontSize: '13.5px', textTransform: 'uppercase' },
  td: { padding: '16px', color: C.text, fontSize: '14px', verticalAlign: 'middle' },
  codeBadge: { background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', fontSize: '12.5px', fontWeight: '700', color: '#475569', border: '1px solid #e2e8f0' },
  statusTag: { padding: '5px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  addBtn: { border: "none", background: C.accent, color: "#fff", padding: "12px 20px", borderRadius: "10px", fontWeight: "600", cursor: "pointer" },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.45)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' },
  modalContent: { backgroundColor: '#fff', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '850px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' },
  scrollableFormArea: { overflowY: 'auto', paddingRight: '12px', maxHeight: '55vh' },
  closeModalBtn: { background: 'none', border: 'none', fontSize: '30px', cursor: 'pointer', color: C.muted, lineHeight: '1' },
  tabContainer: { display: 'flex', borderBottom: '2px solid #e2e8f0', marginBottom: '20px', overflowX: 'auto', gap: '8px' },
  activeTab: { padding: '10px 20px', backgroundColor: 'transparent', border: 'none', borderBottom: `3px solid #3ea0cf`, color: '#3ea0cf', fontWeight: '700', cursor: 'pointer', fontSize: '14.5px' },
  inactiveTab: { padding: '10px 20px', backgroundColor: 'transparent', border: 'none', color: '#64748b', fontWeight: '600', cursor: 'pointer', fontSize: '14.5px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' },
  formGroup: { display: 'flex', flexDirection: 'column' },
  label: { marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#334155' },
  input: { padding: '11px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '14px', outline: 'none' },
  inlineSelect: { padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '600', outline: 'none', backgroundColor: '#fff' },
  legalSubCard: { border: '1px solid #e2e8f0', padding: '18px', borderRadius: '12px', backgroundColor: '#fdfefe', marginBottom: '10px' },
  submitBtn: { border: "none", background: "#d63a6e", color: "#fff", padding: "12px 24px", borderRadius: "10px", fontWeight: "600", cursor: "pointer" },
  cancelBtn: { backgroundColor: 'transparent', color: '#64748b', border: '1px solid #e2e8f0', padding: '12px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' },
  errorBanner: { color: C.danger, padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' },
  actionBtn: {
    view: { backgroundColor: 'transparent', color: C.primary, border: `1px solid ${C.primary}`, padding: '5px 12px', borderRadius: RADIUS.button, cursor: 'pointer', marginRight: '6px', fontSize: '13px', fontWeight: '500' },
    edit: { backgroundColor: 'transparent', color: '#eab308', border: '1px solid #eab308', padding: '5px 12px', borderRadius: RADIUS.button, cursor: 'pointer', marginRight: '6px', fontSize: '13px', fontWeight: '500' },
    archive: { backgroundColor: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '5px 12px', borderRadius: RADIUS.button, cursor: 'pointer', fontSize: '13px', fontWeight: '500' }
  }
};

export default ClientMaster;
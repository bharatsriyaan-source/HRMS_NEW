import { useState } from "react";
import { C, SHADOW, RADIUS } from "../../theme";

export default function EmployeeResign() {
  const [form, setForm] = useState({
    lastWorkingDay: "",
    noticePeriod: "",
    reason: "",
  });

  const resignationStatus = {
    status: "Not Submitted",
    submittedDate: "-",
    hrRemarks: "-",
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.lastWorkingDay || !form.reason) {
      alert("Please fill required fields");
      return;
    }
    alert("Resignation request submitted successfully!");
    setForm({ lastWorkingDay: "", noticePeriod: "", reason: "" });
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Resignation</h1>
        <p style={styles.subtitle}>
          Submit your resignation request and track its status
        </p>
      </div>

      {/* Current Status */}
      <div style={styles.statusCard}>
        <h3 style={styles.sectionTitle}>Current Status</h3>
        
        <div style={styles.statusGrid}>
          <div>
            <div style={styles.statusLabel}>Status</div>
            <span style={styles.statusBadge}>{resignationStatus.status}</span>
          </div>
          <div>
            <div style={styles.statusLabel}>Submitted Date</div>
            <div style={styles.statusValue}>{resignationStatus.submittedDate}</div>
          </div>
          <div>
            <div style={styles.statusLabel}>HR Remarks</div>
            <div style={styles.statusValue}>{resignationStatus.hrRemarks}</div>
          </div>
        </div>
      </div>

      {/* Submit Resignation Form */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Submit Resignation</h2>

        <form onSubmit={handleSubmit}>
          <div style={styles.formGrid}>
            <div>
              <label style={styles.label}>Last Working Day *</label>
              <input
                type="date"
                style={styles.input}
                value={form.lastWorkingDay}
                onChange={(e) => setForm({ ...form, lastWorkingDay: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={styles.label}>Notice Period (Days)</label>
              <input
                type="number"
                placeholder="30"
                style={styles.input}
                value={form.noticePeriod}
                onChange={(e) => setForm({ ...form, noticePeriod: e.target.value })}
              />
            </div>
          </div>

          <div style={{ marginTop: "24px" }}>
            <label style={styles.label}>Reason for Resignation *</label>
            <textarea
              rows={5}
              style={styles.textarea}
              placeholder="Please explain your reason for leaving..."
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              required
            />
          </div>

          <div style={styles.noteBox}>
            <strong>Note:</strong> Please ensure all assigned tasks are handed over and complete the exit formalities before your last working day.
          </div>

          <button type="submit" style={styles.submitBtn}>
            Submit Resignation Request
          </button>
        </form>
      </div>

      {/* Resignation Process Timeline */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Resignation Process</h2>

        <div style={styles.timeline}>
          {[
            { step: 1, title: "Submit Request", desc: "Employee submits resignation with details" },
            { step: 2, title: "HR Review", desc: "HR verifies notice period and documentation" },
            { step: 3, title: "Management Approval", desc: "Final approval from reporting manager / HR head" },
            { step: 4, title: "Exit Clearance", desc: "Assets handover, NOC, and final settlement" },
          ].map((item) => (
            <div key={item.step} style={styles.step}>
              <div style={styles.circle}>{item.step}</div>
              <div style={styles.stepContent}>
                <div style={styles.stepTitle}>{item.title}</div>
                <div style={styles.stepDesc}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: "32px",
  },

  header: {
    marginBottom: "8px",
  },

  title: {
    margin: 0,
    fontSize: "32px",
    fontWeight: "700",
    color: C.text,
  },

  subtitle: {
    color: C.muted,
    marginTop: "6px",
    fontSize: "15.5px",
  },

  statusCard: {
    background: C.card,
    borderRadius: RADIUS.card,
    padding: "32px",
    boxShadow: SHADOW.card,
  },

  statusGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "24px",
  },

  statusLabel: {
    color: C.muted,
    fontSize: "13.5px",
    marginBottom: "8px",
    fontWeight: "500",
  },

  statusValue: {
    fontWeight: "600",
    color: C.text,
    fontSize: "15px",
  },

  statusBadge: {
    background: "#fff7db",
    color: "#9a6b00",
    padding: "8px 18px",
    borderRadius: "999px",
    fontSize: "14px",
    fontWeight: "600",
    display: "inline-block",
  },

  card: {
    background: C.card,
    borderRadius: RADIUS.card,
    padding: "32px",
    boxShadow: SHADOW.card,
  },

  sectionTitle: {
    margin: "0 0 26px 0",
    fontSize: "20px",
    fontWeight: "700",
    color: C.primary,
    borderBottom: `2px solid ${C.border}`,
    paddingBottom: "12px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "20px",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: "600",
    color: C.text,
  },

  input: {
    width: "100%",
    padding: "13px 16px",
    borderRadius: RADIUS.button,
    border: `1px solid ${C.border}`,
    backgroundColor: "#f8fafc",
    fontSize: "15px",
    outline: "none",
  },

  textarea: {
    width: "100%",
    padding: "13px 16px",
    borderRadius: RADIUS.button,
    border: `1px solid ${C.border}`,
    backgroundColor: "#f8fafc",
    fontSize: "15px",
    resize: "vertical",
    minHeight: "130px",
    outline: "none",
  },

  noteBox: {
    margin: "24px 0",
    padding: "18px 20px",
    background: "#fff7ed",
    border: `1px solid #fed7aa`,
    borderRadius: RADIUS.button,
    color: "#c2410c",
    fontSize: "14.5px",
  },

  submitBtn: {
    marginTop: "12px",
    border: "none",
    background: C.accent,
    color: "#fff",
    padding: "15px 32px",
    borderRadius: RADIUS.button,
    fontWeight: "600",
    fontSize: "16px",
    cursor: "pointer",
    boxShadow: "0 10px 25px rgba(214, 58, 110, 0.25)",
    transition: "all 0.2s",
  },

  timeline: {
    display: "flex",
    flexDirection: "column",
    gap: "28px",
    position: "relative",
    paddingLeft: "12px",
  },

  step: {
    display: "flex",
    gap: "20px",
    alignItems: "flex-start",
    position: "relative",
  },

  circle: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: C.primary,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "18px",
    flexShrink: 0,
    zIndex: 2,
  },

  stepContent: {
    paddingTop: "6px",
  },

  stepTitle: {
    fontWeight: "600",
    color: C.text,
    fontSize: "16px",
    marginBottom: "4px",
  },

  stepDesc: {
    color: C.muted,
    fontSize: "14.5px",
    lineHeight: "1.5",
  },
};
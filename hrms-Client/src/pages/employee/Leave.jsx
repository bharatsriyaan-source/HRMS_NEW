import { useState } from "react";
import { C, SHADOW, RADIUS } from "../../theme";

const leaveHistory = [
  {
    id: 1,
    type: "Casual Leave",
    from: "10-Jul-2026",
    to: "12-Jul-2026",
    days: 3,
    status: "Approved",
  },
  {
    id: 2,
    type: "Sick Leave",
    from: "20-Jun-2026",
    to: "21-Jun-2026",
    days: 2,
    status: "Pending",
  },
  {
    id: 3,
    type: "Earned Leave",
    from: "01-May-2026",
    to: "05-May-2026",
    days: 5,
    status: "Rejected",
  },
];

export default function EmployeeLeave() {
  const [form, setForm] = useState({
    leaveType: "",
    fromDate: "",
    toDate: "",
    reason: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.leaveType || !form.fromDate || !form.toDate || !form.reason) {
      alert("Please fill all fields");
      return;
    }
    alert("Leave request submitted successfully!");
    // Reset form
    setForm({ leaveType: "", fromDate: "", toDate: "", reason: "" });
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Leave Management</h1>
          <p style={styles.subtitle}>Apply and track your leave requests</p>
        </div>
      </div>

      {/* Leave Balance */}
      <div style={styles.balanceGrid}>
        {[
          { type: "Casual Leave", balance: 10, color: C.primary },
          { type: "Sick Leave", balance: 8, color: "#d63a6e" },
          { type: "Earned Leave", balance: 15, color: "#0f6e56" },
          { type: "Total Available", balance: 33, color: C.text },
        ].map((item, index) => (
          <div key={index} style={styles.balanceCard}>
            <div style={styles.balanceLabel}>{item.type}</div>
            <div style={{ ...styles.balanceValue, color: item.color }}>
              {item.balance}
            </div>
          </div>
        ))}
      </div>

      {/* Apply for Leave */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Apply for Leave</h2>

        <form onSubmit={handleSubmit}>
          <div style={styles.formGrid}>
            <div>
              <label style={styles.label}>Leave Type</label>
              <select
                style={styles.input}
                value={form.leaveType}
                onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
                required
              >
                <option value="">Select Leave Type</option>
                <option value="Casual Leave">Casual Leave</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Earned Leave">Earned Leave</option>
              </select>
            </div>

            <div>
              <label style={styles.label}>From Date</label>
              <input
                type="date"
                style={styles.input}
                value={form.fromDate}
                onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={styles.label}>To Date</label>
              <input
                type="date"
                style={styles.input}
                value={form.toDate}
                onChange={(e) => setForm({ ...form, toDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ marginTop: "20px" }}>
            <label style={styles.label}>Reason / Remarks</label>
            <textarea
              rows={4}
              style={styles.textarea}
              placeholder="Please provide a reason for your leave..."
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              required
            />
          </div>

          <button type="submit" style={styles.applyBtn}>
            Submit Leave Request
          </button>
        </form>
      </div>

      {/* Leave History */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Leave History</h2>

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>From</th>
                <th>To</th>
                <th>Days</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {leaveHistory.map((leave) => (
                <tr key={leave.id}>
                  <td style={styles.tableCell}>{leave.type}</td>
                  <td style={styles.tableCell}>{leave.from}</td>
                  <td style={styles.tableCell}>{leave.to}</td>
                  <td style={styles.tableCell}><strong>{leave.days}</strong></td>
                  <td style={styles.tableCell}>
                    <span style={{
                      ...styles.statusBadge,
                      ...(leave.status === "Approved" && styles.approved),
                      ...(leave.status === "Pending" && styles.pending),
                      ...(leave.status === "Rejected" && styles.rejected),
                    }}>
                      {leave.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

  balanceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "20px",
  },

  balanceCard: {
    background: C.card,
    padding: "28px 24px",
    borderRadius: RADIUS.card,
    boxShadow: SHADOW.card,
    textAlign: "center",
    transition: "all 0.2s",
  },

  balanceLabel: {
    fontSize: "15px",
    color: C.muted,
    marginBottom: "8px",
    fontWeight: "500",
  },

  balanceValue: {
    fontSize: "42px",
    fontWeight: "700",
  },

  card: {
    background: C.card,
    borderRadius: RADIUS.card,
    padding: "32px",
    boxShadow: SHADOW.card,
  },

  sectionTitle: {
    margin: "0 0 24px 0",
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
    transition: "all 0.2s",
  },

  textarea: {
    width: "100%",
    padding: "13px 16px",
    borderRadius: RADIUS.button,
    border: `1px solid ${C.border}`,
    backgroundColor: "#f8fafc",
    fontSize: "15px",
    resize: "vertical",
    minHeight: "110px",
    outline: "none",
  },

  applyBtn: {
    marginTop: "28px",
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

  tableWrap: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: C.card,
  },

  tableCell: {
    padding: "16px 12px",
    borderBottom: `1px solid ${C.border}`,
    textAlign: "left",
  },

  statusBadge: {
    padding: "6px 16px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "600",
  },

  approved: {
    background: "#e1f5ee",
    color: "#0f6e56",
  },

  pending: {
    background: "#fff7db",
    color: "#9a6b00",
  },

  rejected: {
    background: "#fde8ef",
    color: C.accent,
  },
};
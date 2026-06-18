import React, { useState, useEffect } from "react";
import { C, SHADOW, RADIUS } from "../../theme"; // Adjust this path if needed

export default function EmployeeDetails() {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Get the logged-in user's ID from local storage
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const employeeId = storedUser?.id;

    if (!employeeId) {
      setError("Session expired. Please log in again.");
      setLoading(false);
      return;
    }

    // 2. Fetch their specific profile data
    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/employees/${employeeId}`);
        if (!response.ok) throw new Error("Failed to load profile details.");

        const data = await response.json();
        setEmployee(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Helper to format database dates nicely
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) return dateString;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? dateString : date.toLocaleDateString();
  };

  if (loading) return <div style={{ padding: "32px", color: C.text, fontFamily: "Inter, sans-serif" }}>Loading your profile...</div>;
  if (error) return <div style={{ padding: "32px", color: "#d63a6e", fontFamily: "Inter, sans-serif" }}>Error: {error}</div>;
  if (!employee) return null;

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.avatarSection}>
          
          {/* UPDATED: Dynamic Profile Photo or Initials Fallback */}
          {employee.Photo ? (
            <img 
              src={`http://localhost:5000/uploads/${employee.Photo}`} 
              alt={`${employee.FirstName}'s Profile`} 
              style={styles.profileImage} 
            />
          ) : (
            <div style={styles.avatar}>
              {employee.FirstName?.[0]}{employee.LastName?.[0]}
            </div>
          )}

          <div>
            <h1 style={styles.title}>
              {employee.FirstName} {employee.MiddleName} {employee.LastName}
            </h1>
            <p style={styles.designation}>
              {employee.role || "Employee"} • {employee.Department ? `Dept ID: ${employee.Department}` : "No Dept"}
            </p>
            <p style={styles.employeeId}>Employee ID: {employee.EmployeeID}</p>
          </div>
        </div>
      </div>

      {/* PERSONAL INFORMATION */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Personal Information</h3>
        <div style={styles.grid}>
          <Info label="First Name" value={employee.FirstName} />
          <Info label="Middle Name" value={employee.MiddleName || "-"} />
          <Info label="Last Name" value={employee.LastName} />
          <Info label="Email" value={employee.EmailId} />
          <Info label="Phone" value={employee.CurrentContactNo} />
          <Info label="Gender" value={employee.Gender || "N/A"} />
          <Info label="Date of Birth" value={formatDate(employee.DateOfBirth)} />
          <Info label="Marital Status" value={employee.MaritalStatus || "N/A"} />
          <Info label="Blood Group" value={employee.BloodGroup || "N/A"} />
          <Info label="Nationality" value={employee.Nationality || "N/A"} />
        </div>
      </div>

      {/* EMPLOYMENT INFORMATION */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Employment Information</h3>
        <div style={styles.grid}>
          <Info label="System Role" value={employee.role} />
          <Info label="Status" value={employee.Status} />
          <Info label="Employment Type" value={employee.StatusOfEmployee || "N/A"} />
          <Info label="Direct Supervisor ID" value={employee.DirectSupervisor || "N/A"} />
          <Info label="Work Location" value={employee.WorkLocation || "N/A"} />
          <Info label="Joining Date" value={formatDate(employee.StartDate)} />
        </div>
      </div>

      {/* THREE COLUMN GRID FOR WIDER SCREENS */}
      <div style={styles.threeCol}>
        
        {/* ADDRESS */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Address Information</h3>
          <div style={styles.grid}>
            <Info label="Current Address" value={employee.CurrentAddress || "N/A"} />
            <Info label="Permanent Address" value={employee.PermanantAddress || "N/A"} />
          </div>
        </div>

        {/* BANK DETAILS */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Bank Details</h3>
          <div style={styles.grid}>
            <Info label="Account Holder" value={employee.AccountHolderName || "N/A"} />
            <Info label="Account Number" value={employee.AccountNumber || "N/A"} />
            <Info label="Bank Name" value={employee.BankName || "N/A"} />
            <Info label="IFSC Code" value={employee.IFSCCode || "N/A"} />
          </div>
        </div>

        {/* DOCUMENTS */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Official Documents</h3>
          <div style={styles.grid}>
            <Info label="PAN Number" value={employee.PANNo || "N/A"} />
            <Info label="Aadhar Number" value={employee.AadharNo || "N/A"} />
            <Info label="Passport Number" value={employee.PassportNo || "N/A"} />
          </div>
        </div>
        
      </div>
    </div>
  );
}

// Simple Reusable Component
function Info({ label, value }) {
  return (
    <div style={styles.infoBox}>
      <div style={styles.label}>{label}</div>
      <div style={styles.value}>{value}</div>
    </div>
  );
}

// Styles
const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: "32px",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    background: C.card,
    padding: "28px 32px",
    borderRadius: RADIUS.card,
    boxShadow: SHADOW.card,
  },
  avatarSection: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
  },
  // NEW: Styling for the uploaded photo
  profileImage: {
    width: "110px",
    height: "110px",
    borderRadius: "22px",
    objectFit: "cover",
    boxShadow: "0 12px 30px rgba(0, 0, 0, 0.15)",
  },
  avatar: {
    width: "110px",
    height: "110px",
    borderRadius: "22px",
    background: C.accent,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "36px",
    fontWeight: "700",
    boxShadow: "0 12px 30px rgba(214, 58, 110, 0.25)",
    textTransform: "uppercase",
  },
  title: {
    margin: 0,
    fontSize: "34px",
    fontWeight: "700",
    color: C.text,
  },
  designation: {
    fontSize: "18px",
    color: C.text,
    margin: "6px 0 4px 0",
    fontWeight: "500",
    textTransform: "capitalize",
  },
  employeeId: {
    color: C.muted,
    fontSize: "15px",
    fontWeight: "500",
  },
  card: {
    background: C.card,
    borderRadius: RADIUS.card,
    padding: "32px",
    boxShadow: SHADOW.card,
  },
  cardTitle: {
    margin: "0 0 26px 0",
    fontSize: "20px",
    fontWeight: "700",
    color: C.primary,
    borderBottom: `2px solid ${C.borderLight || '#e2e8f0'}`,
    paddingBottom: "12px",
  },
  threeCol: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
    gap: "24px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "18px",
  },
  infoBox: {
    background: C.inputBg || "#f8fafc",
    border: `1px solid ${C.borderLight || '#e2e8f0'}`,
    borderRadius: RADIUS.button,
    padding: "18px 20px",
    transition: "all 0.2s ease",
  },
  label: {
    fontSize: "13.5px",
    color: C.muted,
    marginBottom: "6px",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  value: {
    fontSize: "16px",
    fontWeight: "600",
    color: C.text,
    wordBreak: "break-all",
  },
};
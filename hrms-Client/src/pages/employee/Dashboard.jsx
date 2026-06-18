import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { C, SHADOW, RADIUS } from "../../theme";
import {
  FiCalendar,
  FiUser,
  FiBriefcase,
  FiCheckCircle,
} from "react-icons/fi";

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [showDashboard, setShowDashboard] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Dynamic Announcements States
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch live announcements on component mount
  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/announcements');
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard announcements:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // 2. Control the Carousel Auto-Rotate Timer dynamically
  useEffect(() => {
    if (!showDashboard && announcements.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % announcements.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [showDashboard, announcements.length]);

  const handleAnnouncementClick = (announcement) => {
    navigate(`/announcements/${announcement.id}`, { 
      state: { announcement } 
    });
  };

  const formatDateLabel = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? dateString : d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  // Render a brief loading message if data isn't ready
  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '88vh', color: C.text }}>Loading Workspace Dashboard...</div>;
  }

  // SCREEN A: Welcome Carousel Screen (Only rendered if there are announcements to show)
  if (!showDashboard && announcements.length > 0) {
    const current = announcements[currentSlide];
    
    // Fallback corporate cover placeholder image if no banner was uploaded via Multer
    const bannerImg = current.Photo 
      ? `http://localhost:5000/uploads/${current.Photo}`
      : "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200"; 

    return (
      <div style={styles.welcomePage}>
        <div style={styles.carouselContainer}>
          <h1 style={{ 
            textAlign: "center", 
            color: C.text, 
            marginBottom: "40px",
            fontSize: "34px",
            fontWeight: "700"
          }}>
            Latest Announcements
          </h1>

          <div 
            style={styles.carouselCard}
            onClick={() => handleAnnouncementClick(current)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.02)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <img 
              src={bannerImg} 
              alt="Announcement banner"
              style={styles.carouselImage}
            />
            <div style={styles.overlay}>
              <div style={styles.carouselDate}>Published: {formatDateLabel(current.NoticeDate)}</div>
              <h3 style={styles.carouselTitleText}>📢 Internal Notice Update</h3>
              <p style={styles.carouselDesc}>{current.Notice}</p>
            </div>
          </div>

          <div style={styles.dots}>
            {announcements.map((_, index) => (
              <span
                key={index}
                onClick={() => setCurrentSlide(index)}
                style={{
                  ...styles.dot,
                  background: currentSlide === index ? C.primary : "transparent",
                }}
              />
            ))}
          </div>
        </div>

        <button
          style={styles.continueBtn}
          onClick={() => setShowDashboard(true)}
        >
          Continue To Dashboard →
        </button>
      </div>
    );
  }

  // SCREEN B: Main Dashboard View
  return (
    <div style={styles.page}>
      <div style={styles.pageHead}>
        <div>
          <div style={styles.welcome}>Welcome Back</div>
          <h1 style={styles.pageTitle}>Employee Dashboard</h1>
          <p style={styles.pageSub}>
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        {[
          { title: "Leave Balance", value: "12", icon: <FiCalendar />, color: C.primary, bg: "#e8f4fa" },
          { title: "Pending Requests", value: "2", icon: <FiCheckCircle />, color: C.accent, bg: "#fde8ef" },
          { title: "Department", value: "IT", icon: <FiBriefcase />, color: "#0f6e56", bg: "#e1f5ee" },
          { title: "Manager", value: "Admin Staff", icon: <FiUser />, color: "#854f0b", bg: "#faeeda" },
        ].map((item, index) => (
          <div key={index} style={styles.statCard}>
            <div style={{ ...styles.statIcon, background: item.bg, color: item.color }}>
              {item.icon}
            </div>
            <div style={styles.statValue}>{item.value}</div>
            <div style={styles.statTitle}>{item.title}</div>
          </div>
        ))}
      </div>

      {/* Panels Row */}
      <div style={styles.panelGrid}>
        <div style={styles.panel}>
          <h3 style={styles.panelTitle}>Leave Summary</h3>
          <div style={styles.leaveItem}>Casual Leave : 5</div>
          <div style={styles.leaveItem}>Sick Leave : 4</div>
          <div style={styles.leaveItem}>Earned Leave : 3</div>
        </div>

        <div style={styles.panel}>
          <h3 style={styles.panelTitle}>Recent Notices</h3>
          
          {/* MAP OVER THE LIVE RECENT ANNOUNCEMENTS ARRAY */}
          {announcements.slice(0, 3).map((item) => (
            <div key={item.id} style={styles.noticeItem}>
              {item.Notice.length > 50 ? `${item.Notice.substring(0, 50)}...` : item.Notice}
              <span style={{ display: 'block', fontSize: '11px', color: C.muted, marginTop: '4px' }}>
                {formatDateLabel(item.NoticeDate)}
              </span>
            </div>
          ))}
          
          {announcements.length === 0 && (
            <div style={{ color: C.muted, padding: '10px 0', fontSize: '14px' }}>
              No active corporate notices right now.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== STYLES ====================
const styles = {
  welcomePage: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "88vh",
    padding: "40px 20px",
    background: "#fff",
  },
  carouselContainer: {
    width: "100%",
    maxWidth: "900px",
    marginBottom: "48px",
  },
  carouselCard: {
    height: "380px",
    borderRadius: RADIUS.card,
    overflow: "hidden",
    position: "relative",
    cursor: "pointer",
    boxShadow: SHADOW.card,
    transition: "transform 0.4s ease, box-shadow 0.4s ease",
  },
  carouselImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(13,45,61,0.92) 75%)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    padding: "48px 40px",
  },
  carouselDate: {
    color: "#cbd5e1",
    fontSize: "13px",
    fontWeight: "600",
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  carouselTitleText: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#fff",
    marginBottom: "12px",
    lineHeight: "1.2",
  },
  carouselDesc: {
    fontSize: "15px",
    color: "#e2e8f0",
    lineHeight: "1.6",
    maxWidth: "90%",
    display: "-webkit-box",
    WebkitLineClamp: "3",
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  dots: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    marginTop: "32px",
  },
  dot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    cursor: "pointer",
    transition: "all 0.3s",
    border: `2px solid ${C.primary}`,
  },
  continueBtn: {
    border: "none",
    background: C.accent,
    color: "#fff",
    padding: "16px 44px",
    borderRadius: RADIUS.button,
    fontWeight: "600",
    fontSize: "16px",
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(214, 58, 110, 0.3)",
    transition: "all 0.2s",
  },
  page: { display: "flex", flexDirection: "column", gap: "32px" },
  pageHead: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  welcome: { color: C.primary, fontWeight: "600", fontSize: "15px", marginBottom: "6px" },
  pageTitle: { fontSize: "32px", fontWeight: "700", margin: 0, color: C.text },
  pageSub: { color: C.muted, marginTop: "6px", fontSize: "15px" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" },
  statCard: { background: C.card, padding: "28px 24px", borderRadius: RADIUS.card, boxShadow: SHADOW.card },
  statIcon: { width: "60px", height: "60px", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", marginBottom: "20px" },
  statValue: { fontSize: "36px", fontWeight: "700", color: C.text, marginBottom: "4px" },
  statTitle: { color: C.muted, fontSize: "15px" },
  panelGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px" },
  panel: { background: C.card, padding: "28px", borderRadius: RADIUS.card, boxShadow: SHADOW.card },
  panelTitle: { fontSize: "19px", fontWeight: "700", color: C.text, marginBottom: "20px" },
  leaveItem: { padding: "14px 18px", background: "#f8fafc", border: `1px solid ${C.borderLight || '#e2e8f0'}`, borderRadius: RADIUS.button, marginBottom: "10px", fontSize: "15px", color: C.text },
  noticeItem: { padding: "14px 18px", background: "#f8fafc", border: `1px solid ${C.borderLight || '#e2e8f0'}`, borderRadius: RADIUS.button, marginBottom: "10px", fontSize: "14px", color: C.secondary, fontWeight: "600" },
};
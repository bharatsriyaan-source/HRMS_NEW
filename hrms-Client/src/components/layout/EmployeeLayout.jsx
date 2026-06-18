import EmployeeSidebar from "./EmployeeSidebar";
import Topbar from "./Topbar";
import { Outlet } from "react-router-dom";

export default function EmployeeLayout() {
  return (
    <div style={styles.wrapper}>
      <EmployeeSidebar />

      <div style={styles.main}>
        <Topbar />

        <div style={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    minHeight: "100vh",
    background: "#f6f9fc",
  },

  main: {
    flex: 1,
    marginLeft: "260px",
    display: "flex",
    flexDirection: "column",
  },

  content: {
    padding: "24px",
    flex: 1,
  },
};
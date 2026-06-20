import { Link } from "react-router-dom";

function NavBar() {
  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        marginBottom: "30px",
        justifyContent: "center",
      }}
    >
      <Link
        to="/"
        style={{
          padding: "10px 20px",
          backgroundColor: location.pathname === "/" ? "#007bff" : "#e9ecef",
          color: location.pathname === "/" ? "white" : "black",
          borderRadius: "5px",
          textDecoration: "none",
        }}
      >
        Weekly Planner
      </Link>
      <Link
        to="/master"
        style={{
          padding: "10px 20px",
          backgroundColor:
            location.pathname === "/master" ? "#007bff" : "#e9ecef",
          color: location.pathname === "/master" ? "white" : "black",
          borderRadius: "5px",
          textDecoration: "none",
        }}
      >
        Database Master List
      </Link>
    </div>
  );
}

export default NavBar;

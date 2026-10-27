import {
  Search,
  Bell,
  Moon,
  UserCircle,
} from "lucide-react";

export default function Navbar({ title }) {
  return (
    <header
      style={{
        height: 75,
        background: "#ffffff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 30px",
        borderBottom: "1px solid #E5E7EB",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div>
        <h2
          style={{
            margin: 0,
            fontSize: 28,
            color: "#111827",
            fontWeight: 700,
          }}
        >
          {title}
        </h2>

        <small
          style={{
            color: "#6B7280",
          }}
        >
          FANMENI Festival Management System
        </small>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 15,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#F3F4F6",
            borderRadius: 30,
            padding: "8px 15px",
            width: 260,
          }}
        >
          <Search
            size={18}
            color="#6B7280"
          />

          <input
            placeholder="Search..."
            style={{
              border: "none",
              background: "transparent",
              outline: "none",
              marginLeft: 10,
              width: "100%",
            }}
          />
        </div>

        <button
          style={iconButton}
        >
          <Moon size={20}/>
        </button>

        <button
          style={iconButton}
        >
          <Bell size={20}/>
        </button>

        <button
          style={iconButton}
        >
          <UserCircle size={24}/>
        </button>
      </div>
    </header>
  );
}

const iconButton = {
  width: 45,
  height: 45,
  borderRadius: "50%",
  border: "none",
  background: "#F3F4F6",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
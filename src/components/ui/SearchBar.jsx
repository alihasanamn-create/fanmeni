import { Search, X } from "lucide-react";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  onClear,
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: 16,
        padding: "0 16px",
        height: 52,
        width: "100%",
        maxWidth: 420,
        transition: ".25s",
      }}
    >
      <Search
        size={18}
        color="#6B7280"
      />

      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          padding: "0 12px",
          fontSize: 15,
          background: "transparent",
        }}
      />

      {value && (
        <button
          onClick={onClear}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          <X
            size={18}
            color="#6B7280"
          />
        </button>
      )}
    </div>
  );
}
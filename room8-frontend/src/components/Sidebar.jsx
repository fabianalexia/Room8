import React from "react";

const Sidebar = () => {
  const matches = [
    {
      id: 1,
      name: "Liv",
      photo:
        "https://images.unsplash.com/photo-1502686851042-cc3f39b4f3ea?auto=format&fit=crop&w=200&q=80",
      lastMessage: "Hey! 👋",
    },
    {
      id: 2,
      name: "Maya",
      photo:
        "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=200&q=80",
      lastMessage: "Let’s grab coffee ☕",
    },
  ];

  return (
    <div
      style={{
        width: "320px",
        height: "100vh",
        backgroundColor: "#121212",
        borderRight: "1px solid #222",
        color: "white",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Header */}
      <div
  style={{
    padding: "22px 26px",
    borderBottom: "1px solid #222",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "70px",
    boxSizing: "border-box",
    color: "#9C7BFF", // lavender purple
    fontWeight: "800",
    fontSize: "1.3rem",
  }}
>
  Matches <span style={{ fontSize: "1.2rem" }}>💬</span>
</div>

      {/* Match list */}
      <div style={{ flexGrow: 1, overflowY: "auto" }}>
        {matches.map((match) => (
          <div
            key={match.id}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "14px 18px",
              borderBottom: "1px solid #1c1c1c",
              transition: "background 0.25s ease",
              cursor: "pointer",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#1e1e1e")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <img
              src={match.photo}
              alt={match.name}
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                objectFit: "cover",
                marginRight: "14px",
                border: "2px solid #2a2a2a",
              }}
            />
            <div>
              <div
                style={{
                  fontWeight: "600",
                  fontSize: "1rem",
                  marginBottom: "3px",
                }}
              >
                {match.name}
              </div>
              <div
                style={{
                  fontSize: "0.9rem",
                  color: "#aaa",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  width: "180px",
                }}
              >
                {match.lastMessage}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
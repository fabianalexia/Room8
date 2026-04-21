import React from "react";

export default function PhotoCard({ person }) {
  if (!person) return null;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "20px",
        backgroundImage: `url(${person.photo})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s ease-in-out",
      }}
    >
      <div
        style={{
          position: "absolute",
          bottom: "0",
          left: "0",
          width: "100%",
          padding: "16px",
          background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
          color: "#fff",
          borderBottomLeftRadius: "20px",
          borderBottomRightRadius: "20px",
        }}
      >
        <h2 style={{ fontSize: "1.2rem", margin: 0 }}>
          {person.name}, {person.age}
        </h2>
        <p
          style={{
            fontSize: "0.9rem",
            color: "#ccc",
            marginTop: "4px",
          }}
        >
          {person.distance}
        </p>
      </div>
    </div>
  );
}
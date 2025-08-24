import React from "react";

const UnderDevelopment = () => {
  const containerStyle = {
    height: "100vh",
    background: "linear-gradient(to right, #2c3e50, #3498db)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "#fff",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    textAlign: "center",
    padding: "20px",
  };

  const emojiStyle = {
    fontSize: "80px",
    marginBottom: "20px",
  };

  const headingStyle = {
    fontSize: "32px",
    fontWeight: "bold",
    marginBottom: "10px",
  };

  const subtextStyle = {
    fontSize: "18px",
    color: "#f0f0f0",
    maxWidth: "600px",
  };

  return (
    <div style={containerStyle}>
      <div style={emojiStyle}>🚧🛠️</div>
      <div style={headingStyle}>This Page is Under Development</div>
      <div style={subtextStyle}>
        We're working hard to bring this feature to you soon. Thank you for your patience!
      </div>
    </div>
  );
};

export default UnderDevelopment;

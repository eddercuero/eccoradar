import React from "react";
import ReactDOM from "react-dom/client";
import EcoRadar from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <div style={{ minHeight: "100vh", width: "100%", display: "flex", alignItems: "stretch" }}>
      <EcoRadar />
    </div>
  </React.StrictMode>
);

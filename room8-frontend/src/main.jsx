import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "@fontsource-variable/inter";
import "@fontsource-variable/inter-tight";
import "@fontsource/fredoka/600.css";
import "./css/mobile.css";
import "./css/theme.css";
import { initNative } from "./native";

initNative();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
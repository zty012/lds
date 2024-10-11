import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useGSAP } from "@gsap/react";
gsap.registerPlugin(ScrollToPlugin, useGSAP);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

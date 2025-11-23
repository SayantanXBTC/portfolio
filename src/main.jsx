import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { AnimatePresence } from "framer-motion"
import "./index.css"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
      <AnimatePresence mode="wait">
        <App />
      </AnimatePresence>
  </React.StrictMode>
)

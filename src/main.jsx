import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { BrowserRouter } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import "./index.css"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter basename="/portfolio">
      <AnimatePresence mode="wait">
        <App />
      </AnimatePresence>
    </BrowserRouter>
  </React.StrictMode>
)

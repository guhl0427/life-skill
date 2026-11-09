import { StrictMode } from "react"
import { BrowserRouter } from "react-router-dom"
import { createRoot } from "react-dom/client"
import { AppProvider } from "./context/AppContext"
import App from "./App"
import "./index.css"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </StrictMode>
)

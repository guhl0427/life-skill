import { StrictMode } from "react"
import { BrowserRouter } from "react-router-dom"
import { createRoot } from "react-dom/client"
import { AppProvider } from "./context/AppContext"
import App from "./App"
import "@fontsource/zcool-kuaile/400.css"
import "@fontsource-variable/noto-sans-sc/wght.css"
import "@fontsource/caveat/latin-400.css"
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

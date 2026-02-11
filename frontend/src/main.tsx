import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.tsx";
import "./index.css";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_HERE";

createRoot(document.getElementById("root")!).render(
    <GoogleOAuthProvider clientId={CLIENT_ID}>
        <App />
    </GoogleOAuthProvider>
);

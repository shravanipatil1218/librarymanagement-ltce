import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Expose test function globally for debugging
import { testPDFGeneration } from "./lib/receipt-generator";
(window as any).testPDFGeneration = testPDFGeneration;

createRoot(document.getElementById("root")!).render(<App />);

import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // Your Tailwind CSS import
import App from "./App"; // The main App component (now typically for the home/donation page)
import SuccessPage from "./sucessPage"; // Import the SuccessPage component
// import CancelPage from "./CancelPage"; // Import the CancelPage component
import VerifyPage from "./validatePage"; // Import the VerifyPage component
import AdminSetPrice from "./createTicketPage"; // Import the VerifyPage component

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        {/* Route for the main application (home/donation page) */}
        <Route path="/" element={<App />} />
        {/* Route for the success page after a donation */}
        <Route path="/success" element={<SuccessPage />} />
        {/* Route for the cancel page after a donation */}
        {/* <Route path="/cancel" element={<CancelPage />} /> */}
        {/* Route for the ticket verification page */}
        <Route path="/verify" element={<VerifyPage />} />

        {/* Route for the ticket creation page */}
        <Route path="/create" element={<AdminSetPrice />} />
      </Routes>
    </Router>
  </React.StrictMode>
);

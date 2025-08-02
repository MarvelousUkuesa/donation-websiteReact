import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // Import useLocation
import Header from "./header"; // Import Header
import DonationPage from "./donationPage"; // Import DonationPage
import SuccessPage from "./sucessPage"; // Import SuccessPage (already provided)
import VerifyPage from "./validatePage"; // Import VerifyPage (already provided)

function App() {
  const [amount, setAmount] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Use the location hook to get router information
  const location = useLocation();

  const PROCESS_DONATION_ENDPOINT =
    "https://jzikgvz0ka.execute-api.eu-central-1.amazonaws.com/default/ProcessDonation"; // Your actual API Gateway Endpoint

  // --- Dynamic Background Image Logic (moved to App.js for app-wide background) ---
  const backgroundImages = [
    "/images/backgroundImg/yaam_eventt1_011.jpg",
    "/images/backgroundImg/yaam_eventt1_012.jpg",
    "/images/backgroundImg/yaam_eventt2_008.jpg",
    "/images/backgroundImg/yaam_eventt2_009.jpg",
  ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % backgroundImages.length
      );
    }, 4000); // Change image every 4 seconds
    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    const donationAmountCents = Math.round(parseFloat(amount) * 100);

    if (isNaN(donationAmountCents) || donationAmountCents < 50) {
      setMessage("Please enter a valid donation amount (minimum €0.50).");
      setLoading(false);
      return;
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setMessage("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(PROCESS_DONATION_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: donationAmountCents,
          currency: "eur",
          email: email,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to create checkout session.");
      if (data.session_url) window.location.href = data.session_url;
    } catch (error) {
      console.error("Error during donation process:", error);
      setMessage(`An error occurred: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Determine which page content to show based on the current path
  let pageContent;
  if (location.pathname === "/success") {
    pageContent = <SuccessPage />;
    // } else if (location.pathname === "/cancel") {
    //   pageContent = <CancelPage />; // Assuming you have a CancelPage component
  } else if (location.pathname.startsWith("/verify")) {
    pageContent = <VerifyPage />;
  } else {
    // Default content for the home/donation page
    pageContent = (
      <DonationPage
        handleSubmit={handleSubmit}
        amount={amount}
        setAmount={setAmount}
        email={email}
        setEmail={setEmail}
        loading={loading}
        message={message}
      />
    );
  }

  return (
    <div className="relative w-screen h-screen bg-black">
      <div className="absolute inset-0 w-full h-full z-0">
        {backgroundImages.map((src, index) => (
          <img
            key={src}
            src={src}
            alt="Background"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${currentImageIndex === index ? "opacity-100" : "opacity-0"}`}
          />
        ))}
      </div>
      <div className="relative z-10 flex flex-col h-full">
        <Header />
        {pageContent}
      </div>
    </div>
  );
}

export default App;

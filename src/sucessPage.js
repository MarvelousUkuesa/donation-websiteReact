// src/SuccessPage.js
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
// Assuming QRCode is used internally, but not necessarily for direct display of the QR code image
// If you are generating it with qrcode.react directly, ensure you import QRCodeCanvas or QRCodeSVG
// import { QRCodeCanvas } from "qrcode.react"; // Example if you want to use qrcode.react directly

// --- Import the new reusable components ---
import Header from "./header"; // Adjust path if needed
import ImageCarousel from "./components/imgCarousel"; // Adjust path if needed
// ------------------------------------------

function SuccessPage() {
  const location = useLocation();
  const [donationDetails, setDonationDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const GET_DETAILS_ENDPOINT =
    "https://ahn4duplfi.execute-api.eu-central-1.amazonaws.com/default/getDonationDetials";

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const id = query.get("session_id");

    if (id) {
      const fetchDonationDetails = async () => {
        setLoading(true);
        setError("");

        try {
          const response = await fetch(
            `${GET_DETAILS_ENDPOINT}?sessionId=${id}`
          );
          const data = await response.json();

          if (
            response.status === 404 ||
            (data.status && data.status === "not_found")
          ) {
            if (retryCount < 5) {
              console.log(
                "Donation record not yet found, retrying in 2 seconds..."
              );
              setTimeout(() => setRetryCount((prev) => prev + 1), 2000);
            } else {
              setError(
                "Donation record not found after multiple retries. Please check your email or contact support."
              );
              setLoading(false);
            }
            return;
          }

          if (
            response.status === 202 ||
            (data.status && data.status === "pending")
          ) {
            if (retryCount < 5) {
              console.log(
                "Donation payment is still pending, retrying in 2 seconds..."
              );
              setTimeout(() => setRetryCount((prev) => prev + 1), 2000);
            } else {
              setError(
                "Payment is still pending after multiple retries. Please check your email or contact support."
              );
              setLoading(false);
            }
            return;
          }

          if (!response.ok) {
            throw new Error(data.error || "Failed to fetch donation details.");
          }

          if (data.status === "succeeded") {
            setDonationDetails(data);
            setLoading(false);
          } else {
            setError(
              `Donation status: ${data.status}. Please check your email or contact support.`
            );
            setLoading(false);
          }
        } catch (err) {
          setError(err.message);
          setLoading(false);
        }
      };

      fetchDonationDetails();
    } else {
      setError(
        "No session ID found in URL. Payment status cannot be verified."
      );
      setLoading(false);
    }
  }, [location, GET_DETAILS_ENDPOINT, retryCount]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  // This URL is for an external QR code generator service.
  // If you want to use qrcode.react, you'd render <QRCodeCanvas value="..." /> directly.
  const qrCodeUrl =
    donationDetails && donationDetails.verificationId
      ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`${window.location.origin}/verify?id=${donationDetails.verificationId}`)}`
      : "";

  return (
    // Updated outer div to be full screen, relative, and contain the carousel
    <div className="relative min-h-screen flex flex-col justify-between items-center overflow-hidden">
      {/* Background Image Carousel */}
      <ImageCarousel />

      {/* Header (positioned above everything) */}
      <Header />

      {/* Main Content Area - Center it and give it a z-index */}
      <div className="relative z-10 flex flex-grow items-center justify-center p-4 w-full">
        <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md text-center">
          {loading && (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-6"></div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                Verifying Payment & Generating Ticket...
              </h1>
              <p className="text-lg text-gray-700 mb-6">
                Please wait a moment while we confirm your donation.
              </p>
            </>
          )}

          {error && (
            <>
              <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
                <p className="text-lg font-semibold">Verification Error</p>
                <p className="text-sm">{error}</p>
              </div>
              <Link
                to="/"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
              >
                Go to Home Page
              </Link>
            </>
          )}

          {donationDetails && !error && (
            <>
              <svg
                className="mx-auto h-24 w-24 text-green-500 mb-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                Donation Successful!
              </h1>
              <p className="text-lg text-gray-700 mb-6">
                Your payment has been successfully verified. Here is your
                ticket:
              </p>

              <div className="border-dashed border-2 border-gray-300 rounded-lg p-4 mb-6">
                <h2 className="text-lg font-semibold mb-2">
                  Your Verifiable E-Ticket
                </h2>
                <div className="flex justify-center my-4">
                  {donationDetails.verificationId ? (
                    <img
                      src={qrCodeUrl}
                      alt="Donation Verification QR Code"
                      className="rounded-lg max-w-[180px] max-h-[180px]"
                    />
                  ) : (
                    <p className="text-red-500">
                      QR Code not available. Please check email.
                    </p>
                  )}
                </div>
                {/* If you prefer to generate QR code client-side with qrcode.react:
                {donationDetails.verificationId ? (
                    <QRCodeCanvas
                      value={`${window.location.origin}/verify?id=${donationDetails.verificationId}`}
                      size={180}
                      level="H"
                      className="mx-auto"
                    />
                  ) : (
                    <p className="text-red-500">
                      QR Code not available. Please check email.
                    </p>
                  )}
                */}
                <div className="text-left text-gray-700 text-sm space-y-2">
                  <p className="flex justify-between">
                    <span className="font-semibold">Amount:</span>
                    <span className="font-mono text-lg">
                      €{(donationDetails.amount / 100).toFixed(2)}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-semibold">Payer Email:</span>
                    <span className="font-mono">
                      {donationDetails.payerEmail || "N/A"}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-semibold">Status:</span>
                    <span className="font-mono">{donationDetails.status}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-semibold">Purchase Time:</span>
                    <span className="font-mono">
                      {formatTimestamp(donationDetails.creationTime)}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-semibold">
                      Valid Until (8 AM next day):
                    </span>
                    <span className="font-mono">
                      {formatTimestamp(donationDetails.expirationTime)}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-semibold">Verification ID:</span>
                    <span className="font-mono break-all">
                      {donationDetails.verificationId}
                    </span>
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-6">
                A final confirmation email with the QR code will also be sent to
                your email address.
              </p>
            </>
          )}

          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out mt-6"
          >
            Go to Home Page
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SuccessPage;

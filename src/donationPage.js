import React, { useState, useEffect } from "react";

// The endpoint for the PUBLIC Lambda function that gets the price.
const GET_PRICE_ENDPOINT =
  "https://e0znnw5mj2.execute-api.eu-central-1.amazonaws.com/default/get-price";

// This component now fetches the price on load.
// The props (handleSubmit, etc.) will be passed down from your main App component.
const DonationPage = ({
  handleSubmit,
  amount,
  setAmount,
  email,
  setEmail,
  loading,
  message,
}) => {
  // State to hold the fetched fixed price and loading status
  const [fixedPrice, setFixedPrice] = useState(null);
  const [eventName, setEventName] = useState(""); // NEW: State for the event name
  const [isLoadingPrice, setIsLoadingPrice] = useState(true);

  // This useEffect hook runs once when the component mounts to fetch the price
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch(GET_PRICE_ENDPOINT);
        // A 200 OK response means a price has been set
        if (response.ok) {
          const data = await response.json();
          if (data.priceInCents) {
            // Convert price from cents to a displayable format (e.g., 15.00)
            const priceInEuros = (data.priceInCents / 100).toFixed(2);
            setFixedPrice(priceInEuros);
            setAmount(priceInEuros);
            // NEW: Set the event name if it exists in the response
            if (data.eventName) {
              setEventName(data.eventName);
            }
          }
        }
        // A 404 Not Found response is also a valid outcome, meaning no price is set.
        // We don't need to do anything special in that case.
      } catch (error) {
        // Log errors but don't block the user. The form will work in manual mode.
        console.error("Could not fetch event price:", error);
      } finally {
        // Stop the loading indicator regardless of the outcome
        setIsLoadingPrice(false);
      }
    };

    fetchPrice();
    // The dependency array is empty so this runs only once on mount.
    // We pass setAmount from props, so we should include it.
  }, [setAmount]);

  return (
    <main className="flex-grow flex flex-col items-center justify-center p-4 bg-black/50 text-white h-full text-center">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
            {/* NEW: Display event name in title if it exists */}
            {eventName || "Entrance Fee"}
          </h1>
          <p className="text-center text-gray-600 mb-6">
            {/* NEW: Display a more specific subtitle if it's an event */}
            {eventName
              ? "Purchase your entry ticket below."
              : "Your contribution supports our mission."}
          </p>

          {/* Show a loading spinner while fetching the price */}
          {isLoadingPrice ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700"
                >
                  {/* NEW: Change label based on whether it's an event or donation */}
                  {eventName ? "Ticket Price" : "Donation Amount"}
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">€</span>
                  </div>
                  <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0.5"
                    step="0.01"
                    className="block w-full rounded-md border-gray-300 pl-7 pr-12 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 disabled:bg-gray-200"
                    placeholder="10.00"
                    required
                    // The disabled prop is now active, making the input uneditable if a price is set.
                    disabled={fixedPrice !== null}
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 sm:text-sm">EUR</span>
                  </div>
                </div>
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm py-2 px-3 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={loading}
              >
                {/* NEW: Change button text based on context */}
                {loading
                  ? "Processing..."
                  : eventName
                    ? "Get Ticket"
                    : "Donate Now"}
              </button>
            </form>
          )}

          {message && (
            <p
              className={`mt-4 text-center text-sm font-medium ${
                message.includes("successful")
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </main>
  );
};

export default DonationPage;

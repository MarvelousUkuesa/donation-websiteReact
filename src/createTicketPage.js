import React, { useState, useEffect } from "react";

// --- 1. CONFIGURATION ---
const COGNITO_POOL_ID = "eu-central-1_YJlGGf5RJ";
const COGNITO_CLIENT_ID = "4rhiecdnqc17ru6q5odcb91tca";
const SET_PRICE_ENDPOINT =
  "https://xottoldl7i.execute-api.eu-central-1.amazonaws.com/default/validate_ticket/set-price";
const UNSET_PRICE_ENDPOINT =
  "https://xottoldl7i.execute-api.eu-central-1.amazonaws.com/default/validate_ticket/unset-price";

// --- 2. HELPER HOOK FOR SDK ---
const useCognitoSdk = () => {
  const [isSdkReady, setIsSdkReady] = useState(false);
  useEffect(() => {
    if (window.AmazonCognitoIdentity) {
      setIsSdkReady(true);
      return;
    }
    const interval = setInterval(() => {
      if (window.AmazonCognitoIdentity) {
        setIsSdkReady(true);
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);
  return isSdkReady;
};

// --- 3. MAIN COMPONENT ---
export default function CreateTicket() {
  const isSdkReady = useCognitoSdk();
  const [authState, setAuthState] = useState("loading");

  // User and form state
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Price setting functionality state
  const [price, setPrice] = useState("");
  const [eventName, setEventName] = useState("");
  const [isSettingPrice, setIsSettingPrice] = useState(false);
  const [priceSetSuccess, setPriceSetSuccess] = useState("");
  const [priceSetError, setPriceSetError] = useState("");

  // State for the unsetting price functionality
  const [isUnsettingPrice, setIsUnsettingPrice] = useState(false);

  const userPool = React.useMemo(() => {
    if (!isSdkReady) return null;
    return new window.AmazonCognitoIdentity.CognitoUserPool({
      UserPoolId: COGNITO_POOL_ID,
      ClientId: COGNITO_CLIENT_ID,
    });
  }, [isSdkReady]);

  useEffect(() => {
    if (!isSdkReady || !userPool) return;
    const currentUser = userPool.getCurrentUser();
    if (currentUser) {
      currentUser.getSession((err, session) => {
        if (err || !session.isValid()) {
          setAuthState("signedOut");
        } else {
          setUser(currentUser);
          setAuthState("signedIn");
        }
      });
    } else {
      setAuthState("signedOut");
    }
  }, [isSdkReady, userPool]);

  // --- AUTHENTICATION HANDLERS ---
  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    const userToAuth = new window.AmazonCognitoIdentity.CognitoUser({
      Username: email,
      Pool: userPool,
    });
    const authDetails = new window.AmazonCognitoIdentity.AuthenticationDetails({
      Username: email,
      Password: password,
    });
    userToAuth.authenticateUser(authDetails, {
      onSuccess: () => {
        setUser(userToAuth);
        setAuthState("signedIn");
      },
      onFailure: (err) => {
        setError(err.message || "An unknown error occurred.");
      },
      // Note: newPasswordRequired is not handled in this simplified version
    });
  };

  const handleLogout = () => {
    user?.signOut();
    setUser(null);
    setAuthState("signedOut");
  };

  // --- PRICE MANAGEMENT HANDLERS ---
  const handleSetPrice = async () => {
    setPriceSetError("");
    setPriceSetSuccess("");

    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      setPriceSetError("Please enter a valid, positive price.");
      return;
    }
    if (!eventName.trim()) {
      setPriceSetError("Please enter an event name.");
      return;
    }

    setIsSettingPrice(true);
    try {
      const priceInCents = Math.trunc(parseFloat(price) * 100);
      const session = await new Promise((resolve, reject) => {
        user.getSession((err, session) =>
          err ? reject(err) : resolve(session)
        );
      });
      const token = session.getIdToken().getJwtToken();
      const payload = {
        price: priceInCents,
        eventName: eventName.trim(),
      };

      const response = await fetch(SET_PRICE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify(payload),
      });

      const resultJson = await response.json();
      if (!response.ok) {
        throw new Error(resultJson.message || "Failed to set price.");
      }
      setPriceSetSuccess(
        `Event '${eventName}' successfully set to €${parseFloat(price).toFixed(2)}!`
      );
    } catch (err) {
      setPriceSetError(`Error: ${err.message}`);
    } finally {
      setIsSettingPrice(false);
    }
  };

  const handleRemovePrice = async () => {
    setPriceSetError("");
    setPriceSetSuccess("");
    setIsUnsettingPrice(true);

    try {
      const session = await new Promise((resolve, reject) => {
        user.getSession((err, session) =>
          err ? reject(err) : resolve(session)
        );
      });
      const token = session.getIdToken().getJwtToken();

      const response = await fetch(UNSET_PRICE_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: token,
        },
      });

      const resultJson = await response.json();
      if (!response.ok) {
        throw new Error(resultJson.message || "Failed to remove price.");
      }
      setPriceSetSuccess("Fixed price has been successfully removed.");
    } catch (err) {
      setPriceSetError(`Error: ${err.message}`);
    } finally {
      setIsUnsettingPrice(false);
    }
  };

  // --- RENDER LOGIC ---
  if (authState === "loading" || !isSdkReady) {
    return (
      <div className="bg-gray-100 flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (authState === "signedIn") {
    return (
      <div className="bg-gray-100 flex flex-col min-h-screen font-sans justify-center items-center">
        <main className="flex-grow flex items-center justify-center p-4 w-full">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center w-full max-w-md flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Manage Event Price
            </h1>
            <p className="text-gray-600 mb-6">
              Set or remove the fixed donation price for all users.
            </p>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2 text-left">
                Event Name
              </label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="shadow-sm border rounded-lg w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Summer Festival 2025"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2 text-left">
                Price (€)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="shadow-sm border rounded-lg w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., 15.00"
              />
            </div>

            <button
              onClick={handleSetPrice}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              disabled={isSettingPrice || isUnsettingPrice}
            >
              {isSettingPrice ? "Saving..." : "Set Fixed Price"}
            </button>

            <button
              onClick={handleRemovePrice}
              className="w-full mt-2 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              disabled={isSettingPrice || isUnsettingPrice}
            >
              {isUnsettingPrice ? "Removing..." : "Remove Fixed Price"}
            </button>

            {priceSetSuccess && (
              <p className="mt-4 text-sm text-green-600">{priceSetSuccess}</p>
            )}
            {priceSetError && (
              <p className="mt-4 text-sm text-red-600">{priceSetError}</p>
            )}

            <div className="mt-8 border-t pt-6">
              <p className="text-sm text-gray-600 mb-4">
                Logged in as: <strong>{user?.getUsername()}</strong>
              </p>
              <button
                onClick={handleLogout}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // --- FIX: Render the login form when signed out ---
  return (
    <div className="bg-gray-100 flex items-center justify-center h-screen font-sans">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Admin Sign In
        </h1>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow-sm border rounded-lg w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow-sm border rounded-lg w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

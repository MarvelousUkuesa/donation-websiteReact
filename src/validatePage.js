import React, { useState, useEffect } from "react";
import Header from "./header"; // Adjust path if needed
import Footer from "./footer"; // Adjust path if needed

// IMPORTANT: This component assumes the following scripts are loaded in your main HTML file
// before this React application script. The rawgit.com URLs are deprecated and can cause
// "Script error." issues. Please use a reliable CDN like jsDelivr instead.
//
// <!-- AWS SDK for JavaScript (required by Cognito Identity SDK) -->
// <script src="https://cdn.jsdelivr.net/npm/aws-sdk@2.1625.0/dist/aws-sdk.min.js"></script>
// <!-- Amazon Cognito Identity SDK for JavaScript -->
// <script src="https://cdn.jsdelivr.net/npm/amazon-cognito-identity-js@6.3.12/dist/amazon-cognito-identity.min.js"></script>

// --- 1. CONFIGURATION ---
// IMPORTANT: Replace these values with your actual AWS Cognito and API Gateway details.
const COGNITO_POOL_ID = "eu-central-1_YJlGGf5RJ";
const COGNITO_CLIENT_ID = "4rhiecdnqc17ru6q5odcb91tca";
const API_ENDPOINT =
  "https://xottoldl7i.execute-api.eu-central-1.amazonaws.com/default/validate_ticket";

/**
 * A custom hook to check if the Cognito SDK is loaded.
 */
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

/**
 * The main application component.
 */
export default function App() {
  const isSdkReady = useCognitoSdk();
  const [authState, setAuthState] = useState("loading"); // loading, signedOut, signedIn
  const [authView, setAuthView] = useState("signIn"); // signIn, signUp, confirmSignUp, forgotPassword, resetPassword, newPasswordRequired

  // User state
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // This state holds the user object during the new password flow
  const [cognitoUser, setCognitoUser] = useState(null);

  // Verification page state
  const [manualVerificationId, setManualVerificationId] = useState(""); // State for manual input
  const [validationResult, setValidationResult] = useState(null);
  const [validationError, setValidationError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false); // Default to false

  const userPool = React.useMemo(() => {
    if (!isSdkReady) return null;
    return new window.AmazonCognitoIdentity.CognitoUserPool({
      UserPoolId: COGNITO_POOL_ID,
      ClientId: COGNITO_CLIENT_ID,
    });
  }, [isSdkReady]);

  // Session check effect
  useEffect(() => {
    if (!isSdkReady || !userPool) return;
    const currentUser = userPool.getCurrentUser();
    if (currentUser) {
      currentUser.getSession((err, session) => {
        if (err) {
          console.error("Session check failed:", err);
          setAuthState("signedOut");
          return;
        }
        if (session && session.isValid()) {
          setUser(currentUser);
          setAuthState("signedIn");
        } else {
          setAuthState("signedOut");
        }
      });
    } else {
      setAuthState("signedOut");
    }
  }, [isSdkReady, userPool]);

  const clearFormState = () => {
    setError("");
    setSuccessMessage("");
    setPassword("");
    setConfirmationCode("");
  };

  const switchView = (view) => {
    clearFormState();
    setAuthView(view);
  };

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
      onFailure: (err) => setError(err.message || "An unknown error occurred."),
      newPasswordRequired: (userAttributes, requiredAttributes) => {
        setCognitoUser(userToAuth);
        switchView("newPasswordRequired");
      },
    });
  };

  const handleNewPasswordSubmit = (e) => {
    e.preventDefault();
    setError("");
    cognitoUser.completeNewPasswordChallenge(password, null, {
      onSuccess: () => {
        setSuccessMessage("Password changed successfully! Please sign in.");
        switchView("signIn");
      },
      onFailure: (err) => setError(err.message || "An unknown error occurred."),
    });
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    setError("");
    const attributeList = [
      new window.AmazonCognitoIdentity.CognitoUserAttribute({
        Name: "email",
        Value: email,
      }),
    ];
    userPool.signUp(email, password, attributeList, null, (err, result) => {
      if (err) {
        setError(err.message || "An unknown error occurred.");
        return;
      }
      setCognitoUser(result.user);
      setSuccessMessage("Confirmation code sent to your email.");
      switchView("confirmSignUp");
    });
  };

  const handleConfirmSignUp = (e) => {
    e.preventDefault();
    setError("");
    const cognitoUserToConfirm = new window.AmazonCognitoIdentity.CognitoUser({
      Username: email,
      Pool: userPool,
    });
    cognitoUserToConfirm.confirmRegistration(
      confirmationCode,
      true,
      (err, result) => {
        if (err) {
          setError(err.message || "An unknown error occurred.");
          return;
        }
        setSuccessMessage("Account confirmed successfully! Please sign in.");
        switchView("signIn");
      }
    );
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setError("");
    const cognitoUserToReset = new window.AmazonCognitoIdentity.CognitoUser({
      Username: email,
      Pool: userPool,
    });
    cognitoUserToReset.forgotPassword({
      onSuccess: () => {
        setSuccessMessage("Password reset code sent to your email.");
        switchView("resetPassword");
      },
      onFailure: (err) => setError(err.message || "An unknown error occurred."),
    });
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setError("");
    const cognitoUserToReset = new window.AmazonCognitoIdentity.CognitoUser({
      Username: email,
      Pool: userPool,
    });
    cognitoUserToReset.confirmPassword(confirmationCode, password, {
      onSuccess: () => {
        setSuccessMessage(
          "Password has been reset successfully! Please sign in."
        );
        switchView("signIn");
      },
      onFailure: (err) => setError(err.message || "An unknown error occurred."),
    });
  };

  const handleLogout = () => {
    user?.signOut();
    setUser(null);
    setAuthState("signedOut");
    switchView("signIn");
  };

  const handleManualVerification = async (e) => {
    e.preventDefault();
    if (!manualVerificationId) {
      setValidationError("Please enter a verification ID.");
      return;
    }

    setIsVerifying(true);
    setValidationError("");
    setValidationResult(null);

    try {
      const session = await new Promise((resolve, reject) => {
        user.getSession((err, session) =>
          err ? reject(err) : resolve(session)
        );
      });
      const token = session.getIdToken().getJwtToken();
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({ verificationId: manualVerificationId }),
      });
      const resultJson = await response.json();
      if (!response.ok)
        throw new Error(resultJson.reason || "Failed to validate ticket.");
      setValidationResult(resultJson);
    } catch (err) {
      console.error("Validation error:", err);
      setValidationError(err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  // Helper function to format Unix timestamps
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp * 1000).toLocaleString();
  };

  const renderAuthForms = () => {
    const commonFormClasses =
      "bg-white p-8 rounded-xl shadow-lg w-full max-w-md";
    const inputClasses =
      "shadow-sm border rounded-lg w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500";
    const buttonClasses =
      "w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors";
    const linkClasses =
      "inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800";

    return (
      <div className="bg-gray-100 flex items-center justify-center h-screen font-sans">
        <div className={commonFormClasses}>
          {successMessage && (
            <p className="bg-green-100 text-green-700 p-3 rounded-md mb-4 text-center">
              {successMessage}
            </p>
          )}
          {error && (
            <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-center">
              {error}
            </p>
          )}

          {authView === "signIn" && (
            <form onSubmit={handleLogin}>
              <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
                Sign In
              </h1>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClasses}
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
                  className={inputClasses}
                  required
                />
              </div>
              <button type="submit" className={buttonClasses}>
                Sign In
              </button>
              <div className="flex justify-between items-center mt-4">
                <button
                  type="button"
                  onClick={() => switchView("forgotPassword")}
                  className={linkClasses}
                >
                  Forgot Password?
                </button>
              </div>
            </form>
          )}

          {authView === "signUp" && (
            <form onSubmit={handleSignUp}>
              <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
                Create Account
              </h1>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClasses}
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
                  className={inputClasses}
                  placeholder="At least 8 characters"
                  required
                />
              </div>
              <button type="submit" className={buttonClasses}>
                Sign Up
              </button>
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => switchView("signIn")}
                  className={linkClasses}
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

          {authView === "confirmSignUp" && (
            <form onSubmit={handleConfirmSignUp}>
              <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
                Verify Your Account
              </h1>
              <p className="text-center text-gray-600 mb-4">
                A confirmation code was sent to <strong>{email}</strong>.
              </p>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Confirmation Code
                </label>
                <input
                  type="text"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  className={inputClasses}
                  required
                />
              </div>
              <button type="submit" className={buttonClasses}>
                Confirm Account
              </button>
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => switchView("signIn")}
                  className={linkClasses}
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

          {authView === "forgotPassword" && (
            <form onSubmit={handleForgotPassword}>
              <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
                Reset Password
              </h1>
              <p className="text-center text-gray-600 mb-4">
                Enter your email to receive a password reset code.
              </p>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClasses}
                  required
                />
              </div>
              <button type="submit" className={buttonClasses}>
                Send Code
              </button>
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => switchView("signIn")}
                  className={linkClasses}
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

          {authView === "resetPassword" && (
            <form onSubmit={handleResetPassword}>
              <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
                Set New Password
              </h1>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  className={inputClasses}
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClasses}
                  placeholder="At least 8 characters"
                  required
                />
              </div>
              <button type="submit" className={buttonClasses}>
                Set New Password
              </button>
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => switchView("signIn")}
                  className={linkClasses}
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

          {authView === "newPasswordRequired" && (
            <form onSubmit={handleNewPasswordSubmit}>
              <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
                Set Your New Password
              </h1>
              <p className="text-center text-gray-600 mb-4">
                As a new user, you must set a permanent password.
              </p>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClasses}
                  placeholder="At least 8 characters"
                  required
                />
              </div>
              <button type="submit" className={buttonClasses}>
                Set Password and Sign In
              </button>
            </form>
          )}
        </div>
      </div>
    );
  };

  if (authState === "loading" || !isSdkReady) {
    return (
      <div className="bg-gray-100 flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (authState === "signedIn") {
    return (
      <div className="relative min-h-screen flex flex-col justify-between items-center overflow-hidden">
        {/* Header (positioned above everything) */}
        <Header />

        {/* Main Content Area - Center it and give it a z-index */}

        <div className="bg-gray-100 flex items-center justify-center min-h-screen p-4 font-sans">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center w-full max-w-md">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              Ticket Verification
            </h1>

            <form onSubmit={handleManualVerification} className="mb-6">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Verification ID
                </label>
                <input
                  type="text"
                  value={manualVerificationId}
                  onChange={(e) => setManualVerificationId(e.target.value)}
                  className="shadow-sm border rounded-lg w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter ticket ID..."
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg"
                disabled={isVerifying}
              >
                {isVerifying ? "Verifying..." : "Verify Ticket"}
              </button>
            </form>

            <div className="mt-4">
              {isVerifying && (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              )}
              {validationError && (
                <div className="bg-red-100 text-red-700 p-4 rounded-md">
                  <p>{validationError}</p>
                </div>
              )}
              {validationResult && (
                <div className="text-left text-sm text-gray-700 space-y-2">
                  {validationResult.valid ? (
                    <div className="text-center text-green-600 mb-4">
                      <p className="text-2xl font-semibold">Ticket Valid!</p>
                      <p className="text-gray-700">{validationResult.reason}</p>
                    </div>
                  ) : (
                    <div className="text-center text-red-600 mb-4">
                      <p className="text-2xl font-semibold">Ticket Invalid</p>
                      <p className="text-gray-700">{validationResult.reason}</p>
                    </div>
                  )}
                  {/* FIX: Add Purchase and Redeemed time display */}
                  <p>
                    <strong>Payer Email:</strong>{" "}
                    {validationResult.payerEmail || "N/A"}
                  </p>
                  <p>
                    <strong>Amount:</strong>{" "}
                    {validationResult.amount
                      ? `${validationResult.amount / 100} ${validationResult.currency}`
                      : "N/A"}
                  </p>
                  <p>
                    <strong>Purchased Time:</strong>{" "}
                    {formatTimestamp(validationResult.creationTime)}
                  </p>
                  <p>
                    <strong>Redeemed Time:</strong>{" "}
                    {formatTimestamp(validationResult.redeemedTime)}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    {validationResult.redeemed ? "Redeemed" : "Not Redeemed"}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8 border-t pt-6">
              <p className="text-sm text-gray-600 mb-4">
                Logged in as: <strong>{user?.getUsername()}</strong>
              </p>
              <button
                onClick={handleLogout}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
        {/* Footer (positioned above everything) */}
        <Footer />
      </div>
    );
  }

  return renderAuthForms();
}

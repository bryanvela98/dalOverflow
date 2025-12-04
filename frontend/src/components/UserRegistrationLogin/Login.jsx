import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../constants/apiConfig";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOTP] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showOtpField, setShowOtpField] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    console.log("Logging in:", { email, password });

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Login successful! Redirecting...");
        console.log("Login successful:", data.user);
        localStorage.setItem("token", data.user.token);
        // Store user data including ID for creating questions/answers
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: data.user.user_id || data.user.id,
            username: data.user.username,
            email: data.user.email,
            display_name: data.user.display_name || data.user.username,
            profile_picture_url: data.user.profile_picture_url,
          })
        );
        console.log("Token: ", data.user.token);
        navigate("/");
      } else {
        setMessage("Login failed: " + data.message);
        console.log("Login failed:", data.message);
      }
    } catch (error) {
      setMessage("Network error. Please try again.");
      console.error("Login error:", error);
    }
    localStorage.setItem("currentUser", JSON.stringify(data.user));
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!email.endsWith("@dal.ca")) {
      setMessage("Please use a valid Dalhousie email address (@dal.ca)");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      setMessage(data.message);

      if (response.ok) {
        setShowOtpField(true);
      }
    } catch (error) {
      console.log(error);
      setMessage("Error sending reset OTP");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setMessage(
        "Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 symbol"
      );
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, new_password: newPassword }),
      });

      const data = await response.json();
      setMessage(data.message);

      if (response.ok) {
        setEmail("");
        setNewPassword("");
        setOTP("");
        setShowOtpField(false);
        setIsForgotPassword(false);
      }
    } catch (error) {
      setMessage("Error resetting password");
    }
  };

  const handleResendOTP = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      setMessage(data.message);
      console.log(data);
    } catch (error) {
      console.log(error);
      setMessage("Error resending OTP");
    }
  };

  // Change the form submission based on current mode
  const handleSubmit = isForgotPassword
    ? showOtpField
      ? handleResetPassword
      : handleForgotPassword
    : handleLogin;

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2
        style={{
          textAlign: "center",
          marginBottom: "24px",
          color: "#2d3748",
          fontSize: "28px",
          fontWeight: "700",
        }}
      >
        {isForgotPassword
          ? showOtpField
            ? "Reset Password"
            : "Forgot Password"
          : "Welcome Back"}
      </h2>
      <p
        style={{
          textAlign: "center",
          marginBottom: "28px",
          color: "#718096",
          fontSize: "14px",
        }}
      >
        {isForgotPassword
          ? showOtpField
            ? "Enter OTP and new password"
            : "Enter your email to receive reset OTP"
          : "Sign in to continue to your account"}
      </p>

      <input
        type="email"
        placeholder="Dalhousie Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={isForgotPassword && showOtpField}
      />

      {!isForgotPassword && (
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      )}

      {isForgotPassword && showOtpField && (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOTP(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </>
      )}

      <button type="submit">
        {isForgotPassword
          ? showOtpField
            ? "Reset Password"
            : "Send Reset OTP"
          : "Sign In"}
      </button>

      {isForgotPassword && showOtpField && (
        <button type="button" onClick={handleResendOTP}>
          Resend OTP
        </button>
      )}

      {!isForgotPassword && (
        <div className="forgot-password">
          <button type="button" onClick={() => setIsForgotPassword(true)}>
            Forgot Password?
          </button>
        </div>
      )}

      {isForgotPassword && (
        <div className="back-to-login">
          <button
            type="button"
            onClick={() => {
              setIsForgotPassword(false);
              setShowOtpField(false);
              setMessage("");
            }}
          >
            Back to Login
          </button>
        </div>
      )}

      {message && <div className="message">{message}</div>}
    </form>
  );
}

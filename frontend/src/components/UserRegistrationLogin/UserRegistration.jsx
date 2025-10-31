import { useState } from "react";

export default function UserRegistration() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOTP] = useState("");
  const [showOtpField, setShowOtpField] = useState(false);
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    console.log("Registering:", { email, password });

    try {
      const response = await fetch("http://127.0.0.1:5001/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      setMessage(data.message);
      console.log(data);

      if (response.ok) {
        setShowOtpField(true);
      }
    } catch (error) {
      console.log(error);
      setMessage("Error connecting to the server");
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    console.log("Verifying OTP:", { email, otp });

    try {
      const response = await fetch(
        "http://127.0.0.1:5001/api/auth/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, otp }),
        }
      );

      const data = await response.json();
      setMessage(data.message);
      console.log(data);

      // Reset form if OTP verification was successful
      if (response.ok) {
        setEmail("");
        setPassword("");
        setOTP("");
        setShowOtpField(false);
      }
    } catch (error) {
      console.log(error);
      setMessage("Error verifying OTP");
    }
  };

  const handleResendOTP = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:5001/api/auth/resend-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();
      setMessage(data.message);
      console.log(data);
    } catch (error) {
      console.log(error);
      setMessage("Error resending OTP");
    }
  };

  // Change the form submission based on current step
  const handleSubmit = showOtpField ? handleVerifyOTP : handleRegister;

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Dalhousie Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={showOtpField}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={showOtpField}
      />

      {showOtpField && (
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOTP(e.target.value)}
          required
        />
      )}

      {/* Only ONE submit button */}
      <button type="submit">{showOtpField ? "Verify OTP" : "Register"}</button>

      {showOtpField && (
        <button type="button" onClick={handleResendOTP}>
          Resend OTP
        </button>
      )}

      {message && <div>{message}</div>}
    </form>
  );
}

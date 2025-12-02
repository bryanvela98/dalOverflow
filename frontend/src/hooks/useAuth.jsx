import { useState, useEffect } from "react";

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsLoggedIn(false);
      return;
    }

    // If token exists, assume logged in while validating
    setIsLoggedIn(true);

    //check if token is valid
    fetch("http://127.0.0.1:5001/api/auth/validate", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (!response.ok) {
          localStorage.removeItem("token");
          setIsLoggedIn(false);
        }
      })

      .catch(() => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
      });
  }, []);

  return isLoggedIn;
}

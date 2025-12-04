import { useState, useEffect } from "react";
import apiFetch from "../utils/api";
import API_BASE_URL from "../constants/apiConfig";
import apiFetch from "../utils/api";

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
    fetch(`${API_BASE_URL}/auth/validate`, {
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

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react"; 

// a route guard has been setup for auth purpose which restricts a user from unauthenticated access to protected pages by checking for a token in local storage

export default function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const [is_loggedin, set_is_loggedin] = useState(false);
  
  useEffect(() => {
    const checking_login = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        navigate("/login");
        return;
      }

      const backend_res = await fetch("http://127.0.0.1:5001/api/auth/validate",{
        method: "GET",
        headers:{
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

    if(backend_res.ok){
      set_is_loggedin(true);
    }else{
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  checking_login();
  }, [navigate]);

  return children;
}

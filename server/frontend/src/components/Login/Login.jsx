import React, { useState } from 'react';
import "./Login.css";
import Header from '../Header/Header';

const Login = ({ onClose }) => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [open, setOpen] = useState(true);
  const [errorMessage, setErrorMessage] = useState(""); // State for displaying error messages

  // It's good practice to get the backend URL from environment variables,
  // even if window.location.origin works for relative paths.
  // const backend_url = process.env.REACT_APP_BACKEND_URL;
  let login_url = window.location.origin + "/djangoapp/login"; // Keeping your current structure for now

  const login = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Clear previous error messages

    try {
        const res = await fetch(login_url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "userName": userName,
                "password": password
            }),
            // --- CRITICAL ADDITION: Allow sending/receiving cookies ---
            credentials: 'include',
            // --- ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ ---
        });

        // Always parse the JSON response, regardless of HTTP status
        const json = await res.json();

        // --- CRITICAL FIX: Check for numerical status 200 from backend JSON ---
        if (json.status === 200) { // Backend sends numeric 200 for success
            sessionStorage.setItem('username', json.userName);
            // Assuming setOpen(false) closes the modal/redirects
            setOpen(false);
        } else {
            // Display the specific error message from the backend JSON
            setErrorMessage(json.message || "The user could not be authenticated.");
            // console.log("Login failed:", json.message); // For debugging
        }
    } catch (error) {
        // Handle network errors (e.g., server not reachable)
        console.error("Network error during login:", error);
        setErrorMessage("Could not connect to the server. Please try again.");
    }
};

  if (!open) {
    // This will redirect when setOpen(false) is called on successful login
    // or when the Cancel button is clicked.
    window.location.href = "/";
  }
  
  return (
    <div>
      <Header/>
    <div onClick={onClose}>
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        className='modalContainer'
      >
          <form className="login_panel" style={{}} onSubmit={login}>
              {/* Display error message if it exists */}
              {errorMessage && <p style={{ color: 'red', textAlign: 'center' }}>{errorMessage}</p>}
              
              <div>
              <span className="input_field">Username </span>
              <input type="text"  name="username" placeholder="Username" className="input_field" onChange={(e) => setUserName(e.target.value)}/>
              </div>
              <div>
              <span className="input_field">Password </span>
              <input name="psw" type="password"  placeholder="Password" className="input_field" onChange={(e) => setPassword(e.target.value)}/>            
              </div>
              <div>
              <input className="action_button" type="submit" value="Login"/>
              <input className="action_button" type="button" value="Cancel" onClick={()=>setOpen(false)}/>
              </div>
              <a className="loginlink" href="/register">Register Now</a>
          </form>
      </div>
    </div>
    </div>
  );
};

export default Login;
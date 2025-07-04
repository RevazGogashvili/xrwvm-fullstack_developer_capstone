import React, { useState, useEffect } from 'react';
import "./Dealers.css";
import "../assets/style.css";
import Header from '../Header/Header';
import review_icon from "../assets/reviewicon.png"

const Dealers = () => {
  const [dealersList, setDealersList] = useState([]);
  const [states, setStates] = useState([]); // Correct state variable name
  const [error, setError] = useState(null); // State to hold any fetch errors

  // Use the environment variable for the backend URL (CRUCIAL)
  const backend_url = process.env.REACT_APP_BACKEND_URL;

  // Single function to fetch dealers, handles both all and by state
  const fetchDealers = async (state_param = "") => { // Default to empty string for fetching all
    setError(null); // Clear previous errors
    let url; // <--- THIS VARIABLE IS DECLARED *LOCALLY* EACH TIME THE FUNCTION RUNS

    // Construct the URL based on whether a specific state is requested or "All"
    if (state_param && state_param !== "All") {
      url = `${backend_url}/djangoapp/get_dealers/${state_param}`;
      console.log("Fetching filtered dealers URL:", url); // Debugging
    } else {
      url = `${backend_url}/djangoapp/get_dealers`; // Fetch all dealers
      console.log("Fetching all dealers URL:", url); // Debugging
    }

    try {
      const res = await fetch(url, {
        method: "GET"
      });
  
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
  
      const retobj = await res.json();
  
      if (retobj.status === 200) {
        let fetched_dealers = Array.from(retobj.dealers);
        setDealersList(fetched_dealers);
  
        if (state_param === "" || state_param === "All") {
          let unique_states = [...new Set(fetched_dealers.map(dealer => dealer.state))];
          setStates(unique_states);
        }
      } else {
        setError(retobj.message || "Failed to fetch dealers from the server.");
      }
    } catch (e) {
      console.error("An error occurred while fetching dealers:", e);
      setError("Could not connect to the dealership service. Please try again later.");
    }
  };

  // This function will be called by the state dropdown's onChange
  const handleStateChange = (event) => {
    const selectedState = event.target.value;
    console.log("Selected state from dropdown:", selectedState); // Debugging
    fetchDealers(selectedState); // Call the new centralized fetch function
  };

  useEffect(() => {
    fetchDealers("All");
  }, [backend_url]);

  let isLoggedIn = sessionStorage.getItem("username") != null;

  return(
    <div>
      <Header/>

      {error && <div style={{ color: 'red', textAlign: 'center', margin: '1rem' }}>{error}</div>}

     <table className='table'>
      <thead>
        <tr>
        <th>ID</th>
        <th>Dealer Name</th>
        <th>City</th>
        <th>Address</th>
        <th>Zip</th>
        <th>
        <select name="state" id="state" onChange={handleStateChange}>
        <option value="" selected disabled hidden>State</option>
        <option value="All">All States</option>
        {states.map(state => (
            <option key={state} value={state}>{state}</option>
        ))}
        </select>        

        </th>
        {isLoggedIn ? (
            <th>Review Dealer</th>
           ):<></>
        }
        </tr>
      </thead>
      <tbody>
     {dealersList.map(dealer => (
        <tr key={dealer.id}>
          <td>{dealer['id']}</td>
          <td><a href={'/dealer/'+dealer['id']}>{dealer['full_name']}</a></td>
          <td>{dealer['city']}</td>
          <td>{dealer['address']}</td>
          <td>{dealer['zip']}</td>
          <td>{dealer['state']}</td>
          {isLoggedIn ? (
            <td><a href={`/postreview/${dealer['id']}`}><img src={review_icon} className="review_icon" alt="Post Review"/></a></td>
           ):<></>
          }
        </tr>
      ))}
      </tbody>
     </table>
    </div>
  )
}

export default Dealers;
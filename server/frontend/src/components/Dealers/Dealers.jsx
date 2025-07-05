// frontend/src/components/Dealers/Dealers.jsx

import React, { useState, useEffect } from 'react';
import "./Dealers.css";
import "../assets/style.css";
import Header from '../Header/Header';
import review_icon from "../assets/reviewicon.png";

const Dealers = () => {
  const [dealersList, setDealersList] = useState([]);
  const [states, setStates] = useState([]);
  const [error, setError] = useState(null);

  // Hardcode the full backend URL to work reliably everywhere.
  const backend_url = "https://gogashvilire-8000.theiadockernext-0-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai";

  const fetchDealers = async (state = "All") => {
    setError(null);
    let url;

    // Build URL from scratch and handle "All" case.
    if (state === "All") {
      url = `${backend_url}/djangoapp/get_dealers`;
    } else {
      url = `${backend_url}/djangoapp/get_dealers/${state}`;
    }

    try {
      const res = await fetch(url, { method: "GET" });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const retobj = await res.json();
      if (retobj.status === 200) {
        setDealersList(Array.from(retobj.dealers));
        if (state === "All") {
          let unique_states = [...new Set(retobj.dealers.map(dealer => dealer.state))];
          setStates(unique_states);
        }
      } else {
        setError(retobj.message || "Failed to fetch dealers.");
      }
    } catch (e) {
      setError("Could not connect to the dealership service.");
    }
  };

  useEffect(() => {
    fetchDealers(); // Fetch all on initial load
  }, []);

  let isLoggedIn = sessionStorage.getItem("username") != null;

  return (
    <div>
      <Header />
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      <table className='table'>
        <thead>
          <tr>
            <th>ID</th>
            <th>Dealer Name</th>
            <th>City</th>
            <th>Address</th>
            <th>Zip</th>
            <th>
              <select name="state" id="state" onChange={(e) => fetchDealers(e.target.value)}>
                <option value="All">All States</option>
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </th>
            {isLoggedIn && <th>Review Dealer</th>}
          </tr>
        </thead>
        <tbody>
          {dealersList.map(dealer => (
            <tr key={dealer.id}>
              <td>{dealer.id}</td>
              <td><a href={`/dealer/${dealer.id}`}>{dealer.full_name}</a></td>
              <td>{dealer.city}</td>
              <td>{dealer.address}</td>
              <td>{dealer.zip}</td>
              <td>{dealer.state}</td>
              {isLoggedIn && (
                <td><a href={`/postreview/${dealer.id}`}><img src={review_icon} className="review_icon" alt="Post Review" /></a></td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dealers;
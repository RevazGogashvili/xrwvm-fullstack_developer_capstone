// frontend/src/components/Dealers/PostReview.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import "./Dealers.css";
import "../assets/style.css";
import Header from '../Header/Header';

const PostReview = () => {
  const [dealer, setDealer] = useState({});
  const [review, setReview] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [date, setDate] = useState("");
  const [carmodels, setCarmodels] = useState([]);
  const [error, setError] = useState(null);

  // --- DEFINITIVE FIX: Hardcoding the Django server URL ---
  // This bypasses the environment variable loading issue in your lab.
  const backend_url = "https://gogashvilire-8000.theiadockernext-0-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai";

  const params = useParams();
  const id = params.id;

  // These URLs will be built correctly using the hardcoded URL.
  const dealer_url = `${backend_url}/djangoapp/dealer/${id}`;
  const review_url = `${backend_url}/djangoapp/add_review`;
  const carmodels_url = `${backend_url}/djangoapp/get_cars`;

  // Fetch dealer details
  const get_dealer = async () => {
    try {
      const res = await fetch(dealer_url, { method: "GET" });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const retobj = await res.json();
      if (retobj.dealer && retobj.dealer.length > 0) {
        setDealer(retobj.dealer[0]);
      } else {
        setError("Could not load dealer details.");
      }
    } catch (e) {
      setError("Could not connect to server to load dealer details.");
    }
  };

  // --- get_cars function with the corrected logic ---
  const get_cars = async () => {
    try {
      const res = await fetch(carmodels_url, { method: "GET" });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const retobj = await res.json();
      
      // We now check directly for the 'CarModels' array, as there is no 'status' key.
      if (retobj.CarModels && Array.isArray(retobj.CarModels)) {
        setCarmodels(retobj.CarModels);
        setError(null); // Clear any previous errors on success
      } else {
        // This handles cases where the response is valid JSON but doesn't have the expected data.
        setError("Could not load car models: incorrect data format received.");
      }
    } catch (e) {
      console.error("DEBUG (PostReview.jsx): Network or parsing error fetching car models:", e);
      setError("Could not connect to the server to load car models.");
      setCarmodels([]); // Ensure it's an empty array on error
    }
  };
  // --- End of corrected get_cars function ---

  // Post the review
  const postreview = async () => {
    let name = sessionStorage.getItem("firstname") + " " + sessionStorage.getItem("lastname");
    if (name.includes("null")) {
      name = sessionStorage.getItem("username");
    }

    if (!model || review === "" || date === "" || year === "") {
      alert("All fields are mandatory.");
      return;
    }

    const model_split = model.split(" ");
    const make_chosen = model_split[0];
    const model_chosen = model_split.slice(1).join(" ");

    const jsoninput = JSON.stringify({
      "name": name, "dealership": id, "review": review,
      "purchase": true, "purchase_date": date, "car_make": make_chosen,
      "car_model": model_chosen, "car_year": year,
    });

    const res = await fetch(review_url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: jsoninput,
      credentials: 'include',
    });

    const json = await res.json();
    if (json.status === 200) {
      window.location.href = window.location.origin + "/dealer/" + id;
    }
  };

  useEffect(() => {
    get_dealer();
    get_cars();
  }, [id]); // Dependency array: re-run if the dealer ID changes

  return (
    <div>
      <Header/>
      <div style={{margin:"5%"}}>
        {error && <p style={{color: 'red', textAlign: 'center'}}>{error}</p>}
        
        <h1 style={{color:"darkblue"}}>{dealer.full_name || 'Loading Dealer...'}</h1>
        <textarea id='review' cols='50' rows='7' onChange={(e) => setReview(e.target.value)} placeholder="Write your review here..."></textarea>
        
        <div className='input_field'>
          Purchase Date <input type="date" onChange={(e) => setDate(e.target.value)}/>
        </div>
        
        <div className='input_field'>
          Car Make 
          <select name="cars" id="cars" onChange={(e) => setModel(e.target.value)}>
            <option value="" selected disabled hidden>Choose Car Make and Model</option>
            {carmodels.map(carmodel => (
              <option key={carmodel.id || `${carmodel.CarMake}-${carmodel.CarModel}`} value={`${carmodel.CarMake} ${carmodel.CarModel}`}>
                {carmodel.CarMake} {carmodel.CarModel}
              </option>
            ))}
          </select>        
        </div>

        <div className='input_field'>
          Car Year <input type="number" onChange={(e) => setYear(e.target.value)} placeholder="e.g., 2023"/>
        </div>
        
        <div>
          <button className='postreview' onClick={postreview}>Post Review</button>
        </div>
      </div>
    </div>
  );
};
export default PostReview;
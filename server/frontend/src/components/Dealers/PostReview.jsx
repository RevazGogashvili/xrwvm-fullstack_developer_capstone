import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import "./Dealers.css"; // Assuming this CSS is relevant
import "../assets/style.css"; // Assuming this CSS is relevant
import Header from '../Header/Header';

const PostReview = () => {
  const [dealer, setDealer] = useState({});
  const [review, setReview] = useState("");
  const [model, setModel] = useState(""); // Initialize as empty string
  const [year, setYear] = useState("");
  const [date, setDate] = useState("");
  const [carmodels, setCarmodels] = useState([]);
  const [error, setError] = useState(null); // State for displaying errors

  // --- CRITICAL: Choose ONE of these for backend_url ---

  // OPTION 1: RECOMMENDED FOR PRODUCTION (Uses environment variable)
  // This requires you to have a .env file in your frontend directory with:
  // REACT_APP_BACKEND_URL=https://gogashvilire-8000.theiadockernext-0-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai
  const backend_url = process.env.REACT_APP_BACKEND_URL;

  // OPTION 2: TEMPORARY WORKAROUND (Hardcoded URL)
  // Use this ONLY if process.env.REACT_APP_BACKEND_URL is consistently 'undefined'.
  // Remember to replace the URL below with YOUR ACTUAL Django server URL (port 8000).
  // const backend_url = "https://gogashvilire-8000.theiadockernext-0-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai";
  
  // --- END backend_url OPTIONS ---

  // Debugging log to see what backend_url is resolving to
  console.log("DEBUG (PostReview.jsx): REACT_APP_BACKEND_URL (or hardcoded) is:", backend_url);

  let params = useParams();
  let id = params.id; // dealer_id from URL

  // Construct URLs using backend_url
  let dealer_details_url = `${backend_url}/djangoapp/dealer/${id}`;
  let review_post_url = `${backend_url}/djangoapp/add_review`;
  let carmodels_fetch_url = `${backend_url}/djangoapp/get_cars`; // Renamed for clarity

  const postreview = async ()=>{
    setError(null); // Clear previous errors

    let name = sessionStorage.getItem("firstname") + " " + sessionStorage.getItem("lastname");
    // If the first and second name are stored as null, use the username
    if (name.includes("null") || name.trim() === "") {
      name = sessionStorage.getItem("username");
    }

    if (!model || review.trim() === "" || date.trim() === "" || year.trim() === "") {
      alert("All review details are mandatory (Review, Purchase Date, Car Make/Model, Car Year)");
      return;
    }

    let make_chosen = "";
    let model_chosen = "";

    // Safely split model if it's not null/undefined and is a string
    if (model) {
      const model_split = model.split(" ");
      make_chosen = model_split[0];
      model_chosen = model_split.slice(1).join(" "); // Join remaining parts for model
    }

    let jsoninput = JSON.stringify({
      "name": name,
      "dealership": id,
      "review": review,
      "purchase": true, // Assuming true if a review is being posted
      "purchase_date": date,
      "car_make": make_chosen,
      "car_model": model_chosen,
      "car_year": year,
    });

    console.log("DEBUG (PostReview.jsx): Submitting review payload:", jsoninput); // Debugging

    try {
      const res = await fetch(review_post_url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: jsoninput,
        credentials: 'include', // CRITICAL: Send cookies for authentication
      });
      
      const json = await res.json();
      // Check HTTP status first, then internal status from JSON payload
      if (res.ok && json.status === 200) { 
          window.location.href = window.location.origin + "/dealer/" + id;
      } else {
          setError(json.message || "Failed to post review. Please try again.");
          console.error("DEBUG (PostReview.jsx): Post review failed:", json.message || json); // Debugging
      }
    } catch (e) {
      console.error("DEBUG (PostReview.jsx): Network or parsing error during post review:", e);
      setError("Could not connect to the server to post review.");
    }
  };

  const get_dealer = async ()=>{
    setError(null);
    console.log("DEBUG (PostReview.jsx): Fetching dealer details from:", dealer_details_url);
    try {
      const res = await fetch(dealer_details_url, {
        method: "GET",
        credentials: 'include', // Include credentials for consistency
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const retobj = await res.json();
      
      if(retobj.status === 200) {
        // Assuming retobj.dealer is an array, take the first element
        // or ensure your backend directly returns the dealer object
        if (Array.isArray(retobj.dealer) && retobj.dealer.length > 0) {
          setDealer(retobj.dealer[0]);
        } else if (retobj.dealer) { // If it's directly an object
          setDealer(retobj.dealer);
        } else {
          setError("Dealer details not found.");
          setDealer({}); // Clear dealer state if not found
        }
      } else {
        setError(retobj.message || "Failed to fetch dealer details.");
        setDealer({}); // Clear dealer state on error
      }
    } catch (e) {
      console.error("DEBUG (PostReview.jsx): Error fetching dealer details:", e);
      setError("Could not load dealer information.");
      setDealer({}); // Clear dealer state on error
    }
  }

  const get_cars = async ()=>{
    setError(null);
    console.log("DEBUG (PostReview.jsx): Fetching car models from:", carmodels_fetch_url);
    try {
      const res = await fetch(carmodels_fetch_url, {
        method: "GET",
        credentials: 'include', // Include credentials for consistency
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const retobj = await res.json();
      
      // --- CRITICAL CHECK: Ensure 'CarModels' is the correct key and it's an array ---
      if (retobj.status === 200 && Array.isArray(retobj.CarModels)) {
          setCarmodels(retobj.CarModels);
      } else {
          setError(retobj.message || "Failed to fetch car models. Data format incorrect or no models found.");
          console.error("DEBUG (PostReview.jsx): Car models fetch failed:", retobj.message || retobj); // Debugging
          setCarmodels([]); // Ensure it's an empty array if data is bad
      }
    } catch (e) {
      console.error("DEBUG (PostReview.jsx): Network or parsing error fetching car models:", e);
      setError("Could not connect to the server to load car models.");
      setCarmodels([]); // Ensure it's an empty array on error
    }
  }

  useEffect(() => {
    get_dealer();
    get_cars();
  }, [id, backend_url]); // Rerun if id or backend_url changes

  // Year validation for input type="number"
  const handleYearChange = (e) => {
    const value = e.target.value;
    // Basic validation for years within a reasonable range (e.g., 1900-current year + 1)
    if (value === "" || (/^\d+$/.test(value) && parseInt(value) >= 1900 && parseInt(value) <= new Date().getFullYear() + 1)) {
      setYear(value);
    } else {
      alert("Please enter a valid car year (e.g., between 1900 and " + (new Date().getFullYear() + 1) + ").");
    }
  };


  return (
    <div>
      <Header/>
      {error && <div style={{ color: 'red', textAlign: 'center', margin: '1rem' }}>{error}</div>}

      <div  style={{margin:"5%"}}>
      <h1 style={{color:"darkblue"}}>{dealer.full_name || 'Loading Dealer...'}</h1> {/* Display loading or default text */}
      <textarea id='review' cols='50' rows='7' onChange={(e) => setReview(e.target.value)} value={review} placeholder="Write your review here..."></textarea>
      
      <div className='input_field'>
        Purchase Date <input type="date" onChange={(e) => setDate(e.target.value)} value={date}/>
      </div>

      <div className='input_field'>
        Car Make 
        <select name="cars" id="cars" onChange={(e) => setModel(e.target.value)} value={model}>
          <option value="" disabled hidden>Choose Car Make and Model</option>
          {carmodels.length === 0 && !error ? // Show loading if no models and no error
            <option disabled>Loading car models...</option> :
            carmodels.map(carmodel => (
            // --- CRITICAL: Add unique key prop for each option ---
            <option key={carmodel.id || `${carmodel.CarMake}-${carmodel.CarModel}`}
                    value={`${carmodel.CarMake} ${carmodel.CarModel}`}>
              {carmodel.CarMake} {carmodel.CarModel}
            </option>
          ))}
        </select>        
      </div >

      <div className='input_field'>
        Car Year <input 
                   type="number" // --- Changed to type="number" ---
                   onChange={handleYearChange} 
                   value={year}
                   min={1900} // HTML min attribute for numbers
                   max={new Date().getFullYear() + 1} // HTML max attribute, dynamically set for numbers
                   placeholder="e.g., 2023"
                 />
      </div>

      <div>
        <button className='postreview' onClick={postreview}>Post Review</button>
      </div>
    </div>
    </div>
  )
}
export default PostReview;
// frontend/src/components/Dealers/Dealer.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import "./Dealers.css";
import "../assets/style.css";
import Header from '../Header/Header';
import positive_icon from "../assets/positive.png";
import neutral_icon from "../assets/neutral.png";
import negative_icon from "../assets/negative.png";

const Dealer = () => {
  const [dealer, setDealer] = useState({});
  const [reviews, setReviews] = useState([]);
  const [unfiltered_reviews, setUnfilteredReviews] = useState([]);
  const [sentiment, setSentiment] = useState("all");
  const [error, setError] = useState(null);

  // Hardcode the Django server URL to fix the `undefined` bug.
  const backend_url = "https://gogashvilire-8000.theiadockernext-0-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai";

  let params = useParams();
  let id = params.id;

  const get_dealer = async () => {
    const dealer_details_url = `${backend_url}/djangoapp/dealer/${id}`;
    try {
      const res = await fetch(dealer_details_url, { method: "GET" });
      if (!res.ok) throw new Error("Failed to fetch dealer details.");
      const retobj = await res.json();
      if (retobj.status === 200 && retobj.dealer && retobj.dealer.length > 0) {
        setDealer(retobj.dealer[0]);
      } else {
        setError("Dealer details not found.");
      }
    } catch (e) {
      setError("Could not connect to server to load dealer details.");
    }
  };

  const get_reviews = async () => {
    const dealer_reviews_url = `${backend_url}/djangoapp/reviews/dealer/${id}`;
    try {
      const res = await fetch(dealer_reviews_url, { method: "GET" });
      if (!res.ok) throw new Error("Failed to fetch reviews.");
      const retobj = await res.json();

      if (retobj.reviews && Array.isArray(retobj.reviews)) {
        if (retobj.reviews.length > 0) {
            setReviews(retobj.reviews);
            setUnfilteredReviews(retobj.reviews);
        }
      } else {
        setError("Could not load reviews: incorrect data format.");
      }
    } catch (e) {
      setError("Could not connect to server to load reviews.");
    }
  };

  const filter_reviews = (new_sentiment) => {
    if (new_sentiment === "all") {
      setReviews(unfiltered_reviews);
    } else {
      let filtered_list = unfiltered_reviews.filter(review => review.sentiment === new_sentiment);
      setReviews(filtered_list);
    }
    setSentiment(new_sentiment);
  };

  useEffect(() => {
    get_dealer();
    get_reviews();
  }, [id]);

  // --- THIS IS THE CORRECTED RENDER FUNCTION FOR THE ICON ---
  const render_sentiment_icon = (sentiment_value) => {
    let icon_src;
    let alt_text;
    if (sentiment_value === "positive") {
      icon_src = positive_icon;
      alt_text = "Positive review";
    } else if (sentiment_value === "negative") {
      icon_src = negative_icon;
      alt_text = "Negative review";
    } else {
      icon_src = neutral_icon;
      alt_text = "Neutral review";
    }
    // We apply a className to control the size via CSS
    return <img src={icon_src} alt={alt_text} className="sentiment-icon" />;
  };
  // --- END OF CORRECTED FUNCTION ---

  let add_review_button;
  if (sessionStorage.getItem("username")) {
    add_review_button = <a href={`/postreview/${id}`}><button className='btn btn-primary' style={{ float: 'right' }}>Add Review</button></a>;
  }

  return (
    <div>
      <Header />
      <div style={{ margin: "20px" }}>
        <h1 style={{ color: "darkblue" }}>{dealer.full_name}{add_review_button}</h1>
        <h4 style={{ color: "grey" }}>{dealer.city}, {dealer.address}, Zip - {dealer.zip}, {dealer.state} </h4>
      </div>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      <div className="reviews_panel">
        <div className="filters">
          <label>Sentiment:</label>
          <input type="radio" id="all" name="sentiment_filter" value="all" onChange={() => filter_reviews("all")} checked={sentiment === "all"} />
          <label htmlFor="all">All</label>
          <input type="radio" id="positive" name="sentiment_filter" value="positive" onChange={() => filter_reviews("positive")} checked={sentiment === "positive"} />
          <label htmlFor="positive">Positive</label>
          <input type="radio" id="neutral" name="sentiment_filter" value="neutral" onChange={() => filter_reviews("neutral")} checked={sentiment === "neutral"} />
          <label htmlFor="neutral">Neutral</label>
          <input type="radio" id="negative" name="sentiment_filter" value="negative" onChange={() => filter_reviews("negative")} checked={sentiment === "negative"} />
          <label htmlFor="negative">Negative</label>
        </div>
        {reviews.length === 0 && !error ? (<p>There are no reviews for this dealership.</p>) : (
          reviews.map(review => (
            <div className='review_card' key={review._id || review.id}>
              <div className='card_header'>
                <div className='reviewer'>{review.name}</div>
                <div className='review_detail'>{review.car_make}, {review.car_model}</div>
                <div className='review_detail'>{review.car_year}</div>
              </div>
              <div className='card_body'>
                <div className='review'>{review.review}</div>
                <div>{render_sentiment_icon(review.sentiment)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dealer;
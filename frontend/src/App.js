
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import MainSection from './components/MainSection'; 
import MainPage from './components/MainPage'; // Import MainPage
import ProfilePage from './components/ProfilePage'; // Import ProfilePage
import './App.css';
import DMPage from './components/DMPage';
import CreateTimeline from './components/CreateTimeline';
import OngoingProject from './components/OngoingProject'; 
import PostJob from './components/PostJob'; 
import ContactUs from './components/ContactUs';
import AboutUs from './components/AboutUs';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsAndConditions from './components/TermsAndConditions'; 
import Footer from './components/Footer'; 
import React, { useState, useEffect } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import PaymentForm from "./components/PaymentForm";
import ReviewForm from './components/ReviewForm';
import FreelancerPage from './components/FreelancerPage'; // Import FreelancerPage

const stripePromise =loadStripe("pk_test_51R8SdlFb6GyXWQWifPnTIKWBpUkCd2XVAXgPPtVswu1M3NjmOIoUoTApFQ2OwfC4ErJ6eUtY6B1PO9fVlvUbFMer00aThejWPy");





const App = () => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setCurrentUser(storedUser);
  }, []);

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Header/>
                <MainSection/>
                <Footer></Footer>
              </>
            }
          />
          <Route path="/main" element={<MainPage />} /> {/* Route for MainPage */}
          <Route path="/profile" element={<ProfilePage />} /> {/* Route for ProfilePage */}
          <Route path="/chat" element={<DMPage />} /> {/* Route for ProfilePage */}
          <Route path="/create-timeline" element={<CreateTimeline />} /> {/* Route for ProfilePage */}
          <Route path="/post" element={<PostJob/>} /> {/* Route for ProfilePage */}
          <Route path="/ong-proj" element={<OngoingProject />} /> {/* Route for ProfilePage */}
          <Route path="/contact" element={<ContactUs/>} /> {/* Route for ProfilePage */}
          <Route path="/abt" element={<AboutUs />} /> {/* Route for ProfilePage */}
          <Route path="/homes" element={<MainPage />} /> {/* Route for ProfilePage */}
          <Route path="/payment" element={<Elements stripe={stripePromise}><PaymentForm /></Elements>}/>
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/review" element={<ReviewForm />} />
          <Route path="/freelancer-profile/:id" element={<FreelancerPage />} />


        </Routes>
      </div>
    </Router>
  );
};

export default App;

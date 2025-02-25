import React from 'react';
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
import Footer from './components/Footer'; 




const App = () => {
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

        </Routes>
      </div>
    </Router>
  );
};

export default App;

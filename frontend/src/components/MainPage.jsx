import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import JobCard from "./JobCard"; // Ensure this path is correct
import "./MainPage.css";
import io from "socket.io-client";

const socket = io("http://localhost:5001");

window.socket = socket; // Make socket globally accessible for debugging

const MainPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]); // All jobs fetched from the API
  const [featuredJob, setFeaturedJob] = useState(null); // Most liked job
  const [trendingJobs, setTrendingJobs] = useState([]); // Top 3 most liked jobs
  const [generalJobs, setGeneralJobs] = useState([]); // Remaining jobs
  const [filteredGeneralJobs, setFilteredGeneralJobs] = useState([]); // Filtered jobs for general listing
  const [searchTerm, setSearchTerm] = useState(""); // Search term state
  const [budgetRange, setBudgetRange] = useState([0, 10000]); // Budget range state
  const [skillsFilter, setSkillsFilter] = useState(""); // Skills filter state
  const [currentUser, setCurrentUser] = useState(null);

  // Retrieve logged-in user from localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setCurrentUser(storedUser);
  }, []);

  // Fetch jobs from backend
  useEffect(() => {
    fetchJobs();
  }, []);

  // Function to fetch jobs
  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/jobs"); // Update API route if needed
      const data = await res.json();

      // Sort jobs by likes in descending order
      const sortedJobs = data.sort((a, b) => b.likes - a.likes);
      setJobs(sortedJobs);

      // Set featured job (most liked job)
      setFeaturedJob(sortedJobs[0]);

      // Set trending jobs (next 3 most liked jobs)
      setTrendingJobs(sortedJobs.slice(1, 4));

      // Set general jobs (remaining jobs)
      setGeneralJobs(sortedJobs.slice(4));
      setFilteredGeneralJobs(sortedJobs.slice(4)); // Initialize filtered general jobs
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  // Function to handle likes
  const handleLike = async (jobId) => {
    try {
      const token = localStorage.getItem("token"); // Get the token from storage
      const res = await fetch(`/api/jobs/${jobId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include the token in the headers
        },
      });

      if (res.ok) {
        // Refresh the job list after liking
        fetchJobs();
      } else {
        console.error("Failed to like job:", res.statusText);
      }
    } catch (err) {
      console.error("Error liking job:", err);
    }
  };

  const handleSearch = () => {
    const filteredJobs = generalJobs.filter((job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredGeneralJobs(filteredJobs);
  };

  // Function to handle filter application
  const handleApplyFilters = () => {
    const filteredJobs = generalJobs.filter((job) => {
      const withinBudget =
        job.budget >= budgetRange[0] && job.budget <= budgetRange[1];
      const matchesSkills = skillsFilter
        ? job.skillsRequired.some((skill) =>
            skill.toLowerCase().includes(skillsFilter.toLowerCase())
          )
        : true;
      return withinBudget && matchesSkills;
    });
    setFilteredGeneralJobs(filteredJobs);
  };

  // Logout functionality: clear localStorage and navigate to home/login page
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    navigate("/");
  };

  return (
    <div className="profile-page">
      {/* Header Section with Logout */}
      <div className="header">
        <img src="images/image10.png" alt="User" />
        <div className="header-right">
          <span onClick={() => navigate("/profile")}>Profile</span>
          <span onClick={() => navigate("/chat")}>Chat</span>
          <span onClick={() => navigate("/ong-proj")}>Ongoing Projects</span>
          <span onClick={() => navigate("/post")}>Post a Job</span>
          <span onClick={() => navigate("/contact")}>Contact Us</span>
          <span onClick={() => navigate("/abt")}>About</span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Job Platform Section */}
      <div className="job-platform">
        {/* Hero Section */}
        <div className="hero-filter-container">
          <div className="hero-section">
            <h1>Discover Your Next Opportunity</h1>
            <p className="hero-subtitle">
              Join the future of work with cutting-edge projects and global
              opportunities.
            </p>
            <div className="search-container">
              <input
                type="text"
                placeholder="Search jobs (e.g., 'AI Engineer')"
                className="search-bar"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="search-button" onClick={handleSearch}>
                🔍 Search
              </button>
            </div>

            {/* Featured Job Section */}
            {featuredJob && (
              <div className="featured-job">
                <h2>🌟 Featured Job</h2>
                <div className="featured-job-card">
                  <h3>{featuredJob.title}</h3>
                  <p>{featuredJob.description}</p>
                  <div className="skills-tags">
                    {featuredJob.skillsRequired.map((skill, index) => (
                      <span key={index}>{skill}</span>
                    ))}
                  </div>
                  <div className="job-meta">
                    <span>💰 ${featuredJob.budget}</span>
                    <span>⏳ {featuredJob.timeline}</span>
                    <span>❤️ {featuredJob.likes} Likes</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Filter Section */}
          <div className="filter-section">
            <h2>Refine Your Search</h2>
            <div className="filter-group">
              <label>Budget Range</label>
              <input
                type="range"
                min="0"
                max="10000"
                value={budgetRange[1]}
                onChange={(e) =>
                  setBudgetRange([0, parseInt(e.target.value)])
                }
                className="budget-slider"
              />
              <span>
                ${budgetRange[0]} - ${budgetRange[1]}
              </span>
            </div>
            <div className="filter-group">
              <label>Skills</label>
              <input
                type="text"
                placeholder="Enter skills (e.g., React, Python)"
                className="skills-input"
                value={skillsFilter}
                onChange={(e) => setSkillsFilter(e.target.value)}
              />
            </div>
            <button className="apply-filters" onClick={handleApplyFilters}>
              Apply Filters
            </button>
          </div>
        </div>

        {/* Trending Jobs Section */}
        <div className="trending-jobs">
          <h2>🔥 Trending Jobs</h2>
          <div className="trending-grid">
            {trendingJobs.length > 0 ? (
              trendingJobs.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  currentUser={currentUser}
                  onLike={handleLike}
                />
              ))
            ) : (
              <p>No trending jobs available</p>
            )}
          </div>
        </div>

        {/* Job Grid (General Listing) */}
        <div className="job-grid">
          {filteredGeneralJobs.length > 0 ? (
            filteredGeneralJobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                currentUser={currentUser}
                onLike={handleLike}
              />
            ))
          ) : (
            <p>No jobs available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainPage;

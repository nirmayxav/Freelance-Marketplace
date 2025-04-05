import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import './OngoingProject.css';

const OngoingProject = () => {
  const [applicantProjects, setApplicantProjects] = useState([]);
  const [clientProjects, setClientProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [applicantSubmissions, setApplicantSubmissions] = useState({});

  const navigateToHome = () => navigate('/homes');
  const navigateToChat = () => navigate('/chat');
  const navigateTopost = () => navigate('/post');
  const navigateContact = () => navigate('/contact');
  const navigateToAbout = () => navigate('/abt');
  const navigateToContact = () => navigate('/contact');
  const navigateToProfile = () => navigate('/profile');
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  useEffect(() => {
    const fetchApplicantProjects = async () => {
      try {
        const res = await fetch(`http://localhost:5001/api/ongoing-projects/applicant/${userId}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          setApplicantProjects(data.timelines);
        } else {
          setError(data.message || "Error fetching applicant projects");
        }
      } catch (err) {
        setError(err.message);
      }
    };

    const fetchClientProjects = async () => {
      try {
        const res = await fetch(`http://localhost:5001/api/ongoing-projects/client/${userId}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          setClientProjects(data.timelines);
        } else {
          setError(data.message || "Error fetching client projects");
        }
      } catch (err) {
        setError(err.message);
      }
    };

    Promise.all([fetchApplicantProjects(), fetchClientProjects()])
      .then(() => setLoading(false))
      .catch(() => setLoading(false));
  }, [userId]);

  const handleApplicantSubmit = async (timelineId) => {
    const submissionText = applicantSubmissions[timelineId];
    try {
      const res = await fetch(`http://localhost:5001/api/ongoing-projects/${timelineId}/submit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ submission: submissionText }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Submission updated!");
      } else {
        alert("Error updating submission: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error updating submission");
    }
  };

  const handleClientAccept = async (timeline) => {
    try {
      const res = await fetch(`http://localhost:5001/api/ongoing-projects/${timeline._id}/accept`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        alert("Submission accepted!");
        localStorage.setItem("jobId", timeline.jobId?._id || timeline.jobId);
        localStorage.setItem("freelancerId", timeline.applicant);
        navigate("/payment", {
          state: { timeline },
        });
      } else {
        alert("Error accepting submission: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error accepting submission");
    }
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };
  if (loading) return <p>Loading ongoing projects...</p>;

  return (
    <div className="ongoing-project">
       <div className="header">
        <img src="images/image10.png" alt="User" />
        <div className="header-right">
        <span onClick={() => navigate("/homes")}>Home</span>

          <span onClick={() => navigate("/profile")}>Profile</span>
          <span onClick={() => navigate("/chat")}>Chat</span>
          <span onClick={() => navigate("/post")}>Post a Job</span>
          <span onClick={() => navigate("/abt")}>About Us</span>
          <span onClick={() => navigate("/contact")}>Contact Us</span>
          
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
      <h1>Ongoing Projects</h1>
      {error && <p className="error">{error}</p>}

      {/* Applicant Section */}
      <div className="important-features">
        <h2>Projects as Applicant</h2>
        {applicantProjects.length > 0 ? (
          applicantProjects.map((timeline) => (
            <div key={timeline._id} className="submission-item">
              <h3>Project: <b>{timeline.jobId?.title || "Untitled Project"}</b></h3>
              <div className="project-timeline">
                <h4>Project Timeline</h4>
                <div className="timeline-steps">
                  {timeline.milestones?.length > 0 ? (
                    timeline.milestones.map((milestone, index) => (
                      <div key={index} className="timeline-step">
                        <span>{milestone.description}</span>
                        {index === 0 && timeline.createdAt && (
                          <p>Started on {new Date(timeline.createdAt).toLocaleDateString()}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p>No timeline milestones available.</p>
                  )}
                </div>
              </div>
              <div className="code-submission">
                <h4>Your Submission</h4>
                <textarea
                  rows={3}
                  placeholder="Enter text or GitHub link"
                  value={applicantSubmissions[timeline._id] || ""}
                  onChange={(e) =>
                    setApplicantSubmissions({
                      ...applicantSubmissions,
                      [timeline._id]: e.target.value,
                    })
                  }
                />
                <button onClick={() => handleApplicantSubmit(timeline._id)}>Submit</button>
              </div>
            </div>
          ))
        ) : (
          <p>No ongoing project as applicant.</p>
        )}
      </div>

      {/* Client Section */}
      <div className="important-features">
        <h2>Projects as Client</h2>
        {clientProjects.length > 0 ? (
          clientProjects.map((timeline) => (
            <div key={timeline._id} className="submission-item">
              <h3>Project: <b>{timeline.jobId?.title || "Untitled Project"}</b></h3>
              <div className="project-timeline">
                <h4>Project Timeline</h4>
                <div className="timeline-steps">
                  {timeline.milestones?.length > 0 ? (
                    timeline.milestones.map((milestone, index) => (
                      <div key={index} className="timeline-step">
                        <span>{milestone.description}</span>
                        {index === 0 && timeline.createdAt && (
                          <p>Started on {new Date(timeline.createdAt).toLocaleDateString()}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p>No timeline milestones available.</p>
                  )}
                </div>
              </div>
              <div className="acceptance-section">
                <h4>Applicant Submission</h4>
                <textarea
                  readOnly
                  rows={3}
                  placeholder="No submission provided"
                  value={timeline.applicantSubmission || ""}
                />
                <button className="accept-button" onClick={() => handleClientAccept(timeline)}>Accept</button>
              </div>
            </div>
          ))
        ) : (
          <p>No ongoing project as client.</p>
        )}
      </div>
    </div>
  );
};

export default OngoingProject;

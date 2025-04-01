import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './OngoingProject.css';

const OngoingProject = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [isAccepted, setIsAccepted] = useState(false);

  // Fetch timeline (ongoing project) details from the backend
  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const res = await fetch(`http://localhost:5001/api/timeline/${projectId}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setTimeline(data.timeline);
          // If timeline status is accepted or in-progress, mark project as accepted
          if (data.timeline.status === 'accepted' || data.timeline.status === 'in-progress') {
            setIsAccepted(true);
          }
        } else {
          // No timeline found (e.g. 404) – no ongoing project exists
          setTimeline(null);
        }
      } catch (error) {
        console.error('Error fetching timeline:', error);
        setTimeline(null);
      } finally {
        setLoading(false);
      }
    };
    fetchTimeline();
  }, [projectId]);

  // Navigation functions (unchanged)
  const navigateToHome = () => { navigate('/homes'); };
  const navigateToChat = () => { navigate('/chat'); };
  const navigateToProfile = () => { navigate('/profile'); };
  const navigateToPost = () => { navigate('/post'); };
  const navigateContact = () => { navigate('/contact'); };
  const navigateToAbout = () => { navigate('/abt'); };

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    if (code.trim()) {
      const newSubmission = {
        id: submissions.length + 1,
        code,
        timestamp: new Date().toLocaleString(),
        status: 'Pending Review',
      };
      setSubmissions([...submissions, newSubmission]);
      setCode('');
    }
  };

  const handleAccept = () => {
    // Optionally, you can also update the timeline status in your backend here.
    setIsAccepted(true);
    alert('Project accepted! Payment will be released.');
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  // If no ongoing project (timeline) is found, show a message
  if (!timeline) {
    return (
      <div className="ongoing-project">
        <div className="header">
          <img src='images/image10.png' alt="User" />
          <div className="header-right">
            <span onClick={navigateToHome}>Home</span>
            <span onClick={navigateToProfile}>Profile</span>
            <span onClick={navigateToChat}>Chat</span>
            <span onClick={navigateContact}>Contact Us</span>
            <span onClick={navigateToAbout}>About</span>
            <span onClick={navigateToPost}>Post a Job</span>
            <span>Settings</span>
          </div>
        </div>
        <h1>No ongoing projects</h1>
      </div>
    );
  }

  return (
    <div className="ongoing-project">
      <div className="header">
        <img src='images/image10.png' alt="User" />
        <div className="header-right">
          <span onClick={navigateToHome}>Home</span>
          <span onClick={navigateToProfile}>Profile</span>
          <span onClick={navigateToChat}>Chat</span>
          <span onClick={navigateContact}>Contact Us</span>
          <span onClick={navigateToAbout}>About</span>
          <span onClick={navigateToPost}>Post a Job</span>
          <span>Settings</span>
        </div>
      </div>
      <h1>Ongoing Project: Project #{projectId}</h1>

      {/* Project Timeline using milestones */}
      <div className="project-timeline">
        <h2>Project Timeline</h2>
        <div className="timeline-steps">
          {timeline.milestones && timeline.milestones.length > 0 ? (
            timeline.milestones.map((milestone, index) => (
              <div key={index} className={`timeline-step ${index === timeline.milestones.length - 1 ? 'active' : 'completed'}`}>
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

      {/* Important Features based on milestone descriptions */}
      <div className="important-features">
        <h2>Important Features</h2>
        <ul>
          {timeline.milestones && timeline.milestones.length > 0 ? (
            timeline.milestones.map((milestone, index) => (
              <li key={index}>{milestone.description}</li>
            ))
          ) : (
            <p>No important features defined.</p>
          )}
        </ul>
      </div>

      {/* Code Submission Section */}
      <div className="code-submission">
        <h2>Code Submission</h2>
        <form onSubmit={handleCodeSubmit}>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code here..."
            rows={10}
            required
          />
          <button type="submit">Submit Code</button>
        </form>
      </div>

      {/* Submissions History */}
      <div className="submissions-history">
        <h2>Submissions History</h2>
        {submissions.length > 0 ? (
          submissions.map((submission) => (
            <div key={submission.id} className="submission-item">
              <p><strong>Submitted on:</strong> {submission.timestamp}</p>
              <pre>{submission.code}</pre>
              <p><strong>Status:</strong> {submission.status}</p>
            </div>
          ))
        ) : (
          <p>No submissions yet.</p>
        )}
      </div>

      {/* Acceptance Section */}
      {!isAccepted && (
        <div className="acceptance-section">
          <h2>Accept Project</h2>
          <p>Review the code and click below to accept the project.</p>
          <button onClick={handleAccept} className="accept-button">
            ✅ Accept Project
          </button>
        </div>
      )}

      {isAccepted && (
        <div className="acceptance-confirmation">
          <h2>Project Accepted!</h2>
          <p>Payment will be released as per the agreed terms.</p>
        </div>
      )}
    </div>
  );
};

export default OngoingProject;

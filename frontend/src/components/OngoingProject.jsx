import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './OngoingProject.css'; // Ensure you have this CSS file for styling


const OngoingProject = () => {
  const navigate = useNavigate();
    
      const navigateToHome = () => {
        navigate('/homes'); // Navigate to the profile page
      };
    
      const navigateToChat = () => {
        navigate('/chat'); // Navigate to the chat page
      };
      const navigateToProfile = () => {
        navigate('/profile'); // Navigate to the chat page
      };
      const navigateToPost = () => {
        navigate('/post'); // Navigate to the chat page
      };
      const navigateContact = () => {
        navigate('/contact'); // Navigate to the chat page
      };
      const navigateToAbout = () => {
        navigate('/abt'); // Navigate to the chat page
      };
  const { projectId } = useParams();
  const [code, setCode] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [isAccepted, setIsAccepted] = useState(false);

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    if (code.trim()) {
      const newSubmission = {
        id: submissions.length + 1,
        code,
        timestamp: new Date().toLocaleString(),
        status: 'Pending Review'
      };
      setSubmissions([...submissions, newSubmission]);
      setCode('');
    }
  };

  const handleAccept = () => {
    setIsAccepted(true);
    alert('Project accepted! Payment will be released.');
  };

  return (
    <div className="ongoing-project">
       <div className="header">
        <img src='images/image10.png' alt="User" className="" />
        
        <div className="header-right">
          <span onClick={navigateToHome}>Home</span>
          <span onClick={navigateToProfile}>Profile</span>
          <span onClick={navigateToChat}>Chat</span>

          <span onClick={navigateContact}>Contact Us</span>
          <span onClick={navigateToAbout}>About</span>
          
        
          <span onClick={navigateToPost}>Post a Job</span>

          <span >Settings</span>
        </div>
      </div>
      <h1>Ongoing Project: Project #{projectId}</h1>

      {/* Project Timeline */}
      <div className="project-timeline">
        <h2>Project Timeline</h2>
        <div className="timeline-steps">
          <div className="timeline-step completed">
            <span>1. Project Kickoff</span>
            <p>Completed on 2023-10-01</p>
          </div>
          <div className="timeline-step completed">
            <span>2. Design Approval</span>
            <p>Completed on 2023-10-10</p>
          </div>
          <div className="timeline-step active">
            <span>3. Development Phase</span>
            <p>In Progress</p>
          </div>
          <div className="timeline-step">
            <span>4. Testing & QA</span>
            <p>Upcoming</p>
          </div>
          <div className="timeline-step">
            <span>5. Final Delivery</span>
            <p>Upcoming</p>
          </div>
        </div>
      </div>

      {/* Important Features */}
      <div className="important-features">
        <h2>Important Features</h2>
        <ul>
          <li>Responsive Design</li>
          <li>User Authentication</li>
          <li>Payment Gateway Integration</li>
          <li>Admin Dashboard</li>
          <li>API Integration</li>
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
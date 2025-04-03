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
  const [paymentMethod, setPaymentMethod] = useState(null);  // State to store the selected payment method
  const [currentMilestoneIndex, setCurrentMilestoneIndex] = useState(0);

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
          if (data.timeline.status === 'accepted' || data.timeline.status === 'in-progress') {
            setIsAccepted(true);
            setCurrentMilestoneIndex(data.timeline.milestones.findIndex(milestone => milestone.status === 'in-progress'));
          }
        } else {
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

  const handleAccept = async () => {
    if (timeline.milestones.length - 1 === currentMilestoneIndex) {
      // If this is the last milestone, mark the project as completed
      setIsAccepted(false);
      alert('Project completed! Payment will be released.');
      navigate('/payment');  // Redirect to payment page
      return;
    }

    // Move to the next milestone
    const res = await fetch(`http://localhost:5001/api/timeline/${projectId}/milestone`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ milestoneIndex: currentMilestoneIndex + 1 }),
    });

    const data = await res.json();
    if (data.success) {
      setCurrentMilestoneIndex(currentMilestoneIndex + 1);
      setTimeline(data.timeline);
    } else {
      console.error('Error updating milestone:', data.message);
    }
  };

  const handlePaymentMethod = (method) => {
    setPaymentMethod(method);
    console.log("Payment Method Selected: ", method);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!timeline) {
    return (
      <div className="ongoing-project">
        <h1>No ongoing projects</h1>
      </div>
    );
  }

  return (
    <div className="ongoing-project">
      <h1>Ongoing Project: Project #{projectId}</h1>

      {/* Project Timeline using milestones */}
      <div className="project-timeline">
        <h2>Project Timeline</h2>
        <div className="timeline-steps">
          {timeline.milestones && timeline.milestones.length > 0 ? (
            timeline.milestones.map((milestone, index) => (
              <div key={index} className={`timeline-step ${index === currentMilestoneIndex ? 'active' : 'completed'}`}>
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

      {/* Milestone Review Section */}
      {isAccepted && currentMilestoneIndex < timeline.milestones.length - 1 && (
        <div className="acceptance-section">
          <h2>Accept Project</h2>
          <p>Review the current milestone and click below to accept the project.</p>
          <button onClick={handleAccept} className="accept-button">
            ✅ Accept Milestone
          </button>
        </div>
      )}

      {/* Payment Section */}
      {isAccepted && currentMilestoneIndex === timeline.milestones.length - 1 && (
        <div className="payment-selection">
          <h2>Complete the Project</h2>
          <p>Select a payment method to release the payment.</p>
          <button onClick={() => handlePaymentMethod('Stripe')}>Stripe (Card Payment)</button>
          <button onClick={() => handlePaymentMethod('Blockchain')}>Blockchain (Crypto)</button>
        </div>
      )}
    </div>
  );
};

export default OngoingProject;

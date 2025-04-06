import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateTimeline.css';

const CreateTimeline = () => {
  // Initialize hooks unconditionally
  const [formData, setFormData] = useState({
    paymentMode: 'full',       // Options: 'full', 'milestone', 'hourly'
    totalAmount: '',
    milestones: [{ description: '', amount: '', trigger: '' }],
    escrowEnabled: true,
    paymentType: 'stripe',     // Options: 'stripe', 'blockchain', 'other'
  });

  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  // Retrieve the selected conversation from localStorage
  const selectedConversation = JSON.parse(localStorage.getItem('selectedConversation'));

  // If selectedConversation is not found, handle the error.
  if (!selectedConversation) {
    alert('No selected conversation found!');
    return null;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleMilestoneChange = (index, e) => {
    const newMilestones = [...formData.milestones];
    newMilestones[index][e.target.name] = e.target.value;
    setFormData({ ...formData, milestones: newMilestones });
  };

  const addMilestone = () => {
    if (formData.paymentMode === 'milestone') {
      setFormData({
        ...formData,
        milestones: [...formData.milestones, { description: '', amount: '', trigger: '' }],
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!selectedConversation) {
      alert('Conversation not found!');
      return;
    }
  
    for (let milestone of formData.milestones) {
      if (!milestone.description || !milestone.amount || !milestone.trigger) {
        alert('Please fill in all milestone fields.');
        return;
      }
    }
  
    if ((formData.paymentMode === 'full' || formData.paymentMode === 'hourly') && formData.milestones.length > 1) {
      alert('Only one milestone is allowed for full or hourly payment modes.');
      return;
    }
  
    const finalPaymentMode = formData.paymentMode;
    const computedTotal = formData.milestones.reduce(
      (sum, milestone) => sum + Number(milestone.amount),
      0
    );
  
    const requestData = {
      ...formData,
      conversationId: selectedConversation._id,
      applicant: selectedConversation.participants[0]._id,
      client: JSON.parse(localStorage.getItem("user")).id,
      paymentMode: finalPaymentMode,
      paymentType: formData.paymentType,
      totalAmount: formData.totalAmount || computedTotal,
      jobId: selectedConversation.jobId._id,
    };
  
    const jobId = selectedConversation.jobId._id;
    const currentConversationId = selectedConversation._id;
  
    try {
      const res = await fetch('http://localhost:5001/api/timeline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(requestData),
      });
  
      const result = await res.json();
  
      if (result.success) {
        // ✅ Close the job
        try {
          const closeJobRes = await fetch(`http://localhost:5001/api/jobs/${jobId}/close`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
  
          const closeJobResult = await closeJobRes.json();
          if (!closeJobRes.ok || !closeJobResult.success) {
            console.error("❌ Failed to close job:", closeJobResult.message);
          } else {
            console.log("✅ Job successfully closed.");
          }
        } catch (err) {
          console.error("❌ Error closing job:", err);
        }
  
        // ✅ Delete extra conversations
        try {
          const deleteRes = await fetch(
            `http://localhost:5001/api/conversations?jobId=${jobId}&exclude=${currentConversationId}`,
            {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            }
          );
  
          const contentType = deleteRes.headers.get('content-type');
          let deleteResult;
          if (contentType && contentType.includes('application/json')) {
            deleteResult = await deleteRes.json();
          } else {
            deleteResult = await deleteRes.text();
            console.error('Delete endpoint did not return JSON:', deleteResult);
          }
  
          if (!deleteResult.success) {
            console.error("❌ Error deleting extra conversations:", deleteResult.message);
          } else {
            console.log("✅ Extra conversations deleted");
          }
        } catch (deleteError) {
          console.error("❌ Error deleting extra conversations:", deleteError);
        }
  
        navigate('/chat');
      } else {
        console.error("❌ Error creating timeline:", result.message);
      }
    } catch (error) {
      console.error('❌ Error creating timeline:', error);
    }
  };
  
  

  return (
    <div className="timeline-container">
      <div className="header">
        <img src="images/image50.png" alt="User" className="header-img" />
      </div>
      <div className="timeline-stepper">
        <div className={`step ${currentStep === 1 ? 'active' : ''}`}>1. Payment Mode</div>
        <div className={`step ${currentStep === 2 ? 'active' : ''}`}>2. Payment Type</div>
        <div className={`step ${currentStep === 3 ? 'active' : ''}`}>3. Timeline & Escrow</div>
        <div className={`step ${currentStep === 4 ? 'active' : ''}`}>4. Review</div>
      </div>

      <form 
        onSubmit={handleSubmit} 
        className="timeline-form"
        onKeyDown={(e) => {
          // Prevent Enter from submitting the form if not on the final step.
          if (e.key === "Enter" && currentStep !== 4) {
            e.preventDefault();
          }
        }}
      >
        {/* Step 1: Payment Mode */}
        {currentStep === 1 && (
          <div className="form-step">
            <h2>Select Payment Mode</h2>
            <div className="payment-options">
              <label className="payment-card">
                <input
                  type="radio"
                  name="paymentMode"
                  value="full"
                  checked={formData.paymentMode === 'full'}
                  onChange={handleChange}
                />
                <div className="card-content">
                  <h3>Full Payment</h3>
                  <p>Receive full amount upon project completion</p>
                </div>
              </label>
              <label className="payment-card">
                <input
                  type="radio"
                  name="paymentMode"
                  value="milestone"
                  checked={formData.paymentMode === 'milestone'}
                  onChange={handleChange}
                />
                <div className="card-content">
                  <h3>Milestone Payments</h3>
                  <p>Split payment into project phases</p>
                </div>
              </label>
              <label className="payment-card">
                <input
                  type="radio"
                  name="paymentMode"
                  value="hourly"
                  checked={formData.paymentMode === 'hourly'}
                  onChange={handleChange}
                />
                <div className="card-content">
                  <h3>Hourly Rate</h3>
                  <p>Pay based on hours worked</p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Step 2: Payment Type */}
        {currentStep === 2 && (
          <div className="form-step">
            <h2>Select Payment Type</h2>
            <div className="payment-options">
              <label className="payment-method-card">
                <input
                  type="radio"
                  name="paymentType"
                  value="stripe"
                  checked={formData.paymentType === 'stripe'}
                  onChange={handleChange}
                />
                <div className="card-content">
                  <h3>Card Payment (Stripe)</h3>
                  <p>Pay with a card through Stripe</p>
                </div>
              </label>
              <label className="payment-method-card">
                <input
                  type="radio"
                  name="paymentType"
                  value="blockchain"
                  checked={formData.paymentType === 'blockchain'}
                  onChange={handleChange}
                />
                <div className="card-content">
                  <h3>Blockchain (Crypto)</h3>
                  <p>Pay with cryptocurrency</p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Step 3: Timeline & Escrow */}
        {currentStep === 3 && (
          <div className="form-step">
            <h2>Define Timeline & Escrow</h2>
            <div className="escrow-toggle">
  <label className="switch">
    <input
      type="checkbox"
      name="escrowEnabled"
      checked={formData.escrowEnabled}
      onChange={(e) => setFormData({ ...formData, escrowEnabled: e.target.checked })}
      disabled={formData.paymentMode === 'milestone'}
    />
    <span className="slider" />
  </label>
  <span className="toggle-label">Enable Escrow Payments</span>
</div>


            {/* Milestone Section: Always visible */}
            <div className="milestones-section">
              {formData.milestones.map((milestone, index) => (
                <div key={index} className="milestone-card">
                  <h3>
                    {formData.paymentMode === 'milestone'
                      ? `Milestone ${index + 1}`
                      : `${formData.paymentMode.charAt(0).toUpperCase() + formData.paymentMode.slice(1)} Payment`}
                  </h3>
                  <input
                    type="text"
                    placeholder="Description (e.g., Design Approval)"
                    name="description"
                    value={milestone.description}
                    onChange={(e) => handleMilestoneChange(index, e)}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    name="amount"
                    value={milestone.amount}
                    onChange={(e) => handleMilestoneChange(index, e)}
                    required
                  />
                  <textarea
                    placeholder="Completion Criteria"
                    name="trigger"
                    value={milestone.trigger}
                    onChange={(e) => handleMilestoneChange(index, e)}
                    required
                  />
                </div>
              ))}
              {/* Only allow adding more milestones for milestone mode */}
              {formData.paymentMode === 'milestone' && (
                <button type="button" onClick={addMilestone} className="add-milestone">
                  + Add Milestone
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div className="form-step">
            <h2>Review Proposal</h2>
            <div className="review-section">
              <h3>Payment Mode: {formData.paymentMode}</h3>
              <h3>Payment Type: {formData.paymentType}</h3>
              <div className="milestone-review">
                {formData.milestones.map((milestone, index) => (
                  <div key={index} className="milestone-item">
                    <h4>
                      {formData.paymentMode === 'milestone'
                        ? `Milestone ${index + 1}`
                        : `${formData.paymentMode.charAt(0).toUpperCase() + formData.paymentMode.slice(1)} Payment`}
                    </h4>
                    <p>Description: {milestone.description}</p>
                    <p>Amount: ${milestone.amount}</p>
                    <p>Trigger: {milestone.trigger}</p>
                  </div>
                ))}
              </div>
              <div className="escrow-status">
                <h3>Escrow: {formData.escrowEnabled ? 'Enabled' : 'Disabled'}</h3>
              </div>
            </div>
          </div>
        )}

        <div className="form-navigation">
          {currentStep > 1 && (
            <button type="button" onClick={() => setCurrentStep(currentStep - 1)}>
              Back
            </button>
          )}
          {currentStep < 4 ? (
            <button type="button" onClick={() => setCurrentStep(currentStep + 1)}>
              Next
            </button>
          ) : (
            <button type="submit">Send Proposal</button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateTimeline;

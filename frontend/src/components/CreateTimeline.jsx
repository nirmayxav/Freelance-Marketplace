import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateTimeline.css';


const CreateTimeline = () => {
  const [formData, setFormData] = useState({
    paymentMode: 'full',
    totalAmount: '',
    milestones: [{ description: '', amount: '', trigger: '' }],
    escrowEnabled: true
  });
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMilestoneChange = (index, e) => {
    const newMilestones = [...formData.milestones];
    newMilestones[index][e.target.name] = e.target.value;
    setFormData({ ...formData, milestones: newMilestones });
  };

  const addMilestone = () => {
    setFormData({
      ...formData,
      milestones: [...formData.milestones, { description: '', amount: '', trigger: '' }]
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log(formData);
    navigate('/chat');
  };

  return (
    <div className="timeline-container">
       <div className="header">
        <img src='images/image10.png' alt="User" className="" />
        </div>
      <div className="timeline-stepper">
        <div className={`step ${currentStep === 1 ? 'active' : ''}`}>1. Payment Mode</div>
        <div className={`step ${currentStep === 2 ? 'active' : ''}`}>2. Timeline & Escrow</div>
        <div className={`step ${currentStep === 3 ? 'active' : ''}`}>3. Review</div>
      </div>

      <form onSubmit={handleSubmit} className="timeline-form">
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

        {currentStep === 2 && (
          <div className="form-step">
            <h2>Define Timeline & Escrow</h2>
            <div className="escrow-toggle">
              <label>
                <input
                  type="checkbox"
                  name="escrowEnabled"
                  checked={formData.escrowEnabled}
                  onChange={(e) => setFormData({ ...formData, escrowEnabled: e.target.checked })}
                />
                Enable Escrow Payments
              </label>
            </div>

            {formData.paymentMode === 'milestone' && (
              <div className="milestones-section">
                {formData.milestones.map((milestone, index) => (
                  <div key={index} className="milestone-card">
                    <h3>Milestone {index + 1}</h3>
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
                <button type="button" onClick={addMilestone} className="add-milestone">
                  + Add Milestone
                </button>
              </div>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div className="form-step">
            <h2>Review Proposal</h2>
            <div className="review-section">
              <h3>Payment Mode: {formData.paymentMode}</h3>
              {formData.paymentMode === 'milestone' && (
                <div className="milestone-review">
                  {formData.milestones.map((milestone, index) => (
                    <div key={index} className="milestone-item">
                      <h4>Milestone {index + 1}</h4>
                      <p>Description: {milestone.description}</p>
                      <p>Amount: ${milestone.amount}</p>
                      <p>Trigger: {milestone.trigger}</p>
                    </div>
                  ))}
                </div>
              )}
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
          {currentStep < 3 ? (
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
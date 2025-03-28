import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PostJob.css'; // Ensure you have this CSS file for styling

const PostJob = () => {
  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    budget: '',
    timeline: '',
    skills: [],
    attachments: []
  });

  const [newSkill, setNewSkill] = useState('');
  const navigate = useNavigate();

  const navigateToHome = () => navigate('/homes');
  const navigateToChat = () => navigate('/chat');
  const navigateToproj = () => navigate('/ong-proj');
  const navigateToPost = () => navigate('/post');
  const navigateContact = () => navigate('/contact');
  const navigateToAbout = () => navigate('/abt');

  const handleInputChange = (e) => {
    setJobData({ ...jobData, [e.target.name]: e.target.value });
  };

  const handleSkillAdd = () => {
    if (newSkill.trim() && !jobData.skills.includes(newSkill)) {
      setJobData({ ...jobData, skills: [...jobData.skills, newSkill] });
      setNewSkill('');
    }
  };

  const handleFileUpload = (e) => {
    setJobData({ ...jobData, attachments: [e.target.files[0]] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', jobData.title);
    formData.append('description', jobData.description);
    formData.append('budget', jobData.budget);
    formData.append('timeline', jobData.timeline);
    formData.append('skillsRequired', jobData.skills.join(','));
    if (jobData.attachments.length > 0) {
      formData.append('fileAttachment', jobData.attachments[0]);
    }

    try {
      const response = await axios.post('http://localhost:5001/api/jobs/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      console.log('Job Posted:', response.data);
      navigate('/homes');
    } catch (error) {
      console.error('Error posting job:', error.response?.data || error.message);
    }
  };

  return (
    <div className="post-job-container">
      <div className="header">
        <img src='images/image10.png' alt="User" />
        <div className="header-right">
          <span onClick={navigateToHome}>Home</span>
          <span onClick={navigateToChat}>Chat</span>
          <span onClick={navigateToproj}>Ongoing Projects</span>
          
          <span onClick={navigateContact}>Contact Us</span>
          <span onClick={navigateToAbout}>About</span>
          <span>Settings</span>
        </div>
      </div>
      <h1>Post a New Job</h1>
      
      <form onSubmit={handleSubmit} className="job-form">
        <div className="form-section">
          <h2>Job Details</h2>
          <div className="form-group">
            <label>Job Title</label>
            <input
              type="text"
              name="title"
              value={jobData.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Job Description</label>
            <textarea
              name="description"
              value={jobData.description}
              onChange={handleInputChange}
              rows="6"
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Skills Required</h2>
          <div className="skills-input">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add required skills"
            />
            <button type="button" onClick={handleSkillAdd} className="add-skill">
              Add Skill
            </button>
          </div>
          <div className="skills-tags">
            {jobData.skills.map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
                <button
                  type="button"
                  onClick={() => setJobData({
                    ...jobData,
                    skills: jobData.skills.filter((_, i) => i !== index)
                  })}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h2>Budget & Timeline</h2>
          <div className="budget-timeline">
            <div className="form-group">
              <label>Budget ($)</label>
              <input
                type="number"
                name="budget"
                value={jobData.budget}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>

            <div className="form-group">
  <label>Timeline</label>
  <input
    type="text"
    name="timeline"
    value={jobData.timeline}
    onChange={handleInputChange}
    placeholder="Enter timeline (e.g., 2 weeks, 1 month)"
    required
  />
</div>

          </div>
        </div>

        <div className="form-section">
          <h2>Attachments</h2>
          <div className="file-upload">
            <label className="upload-area">
              <input
                type="file"
                onChange={handleFileUpload}
              />
              <div className="upload-content">
                <svg viewBox="0 0 24 24" width="48" height="48">
                  <path fill="currentColor" d="M14,13V17H10V13H7L12,8L17,13H14M19.35,10.03C18.67,6.59 15.64,4 12,4C9.11,4 6.6,5.64 5.35,8.03C2.34,8.36 0,10.9 0,14A6,6 0 0,0 6,20H19A5,5 0 0,0 24,15C24,12.36 21.95,10.22 19.35,10.03Z"/>
                </svg>
                <p>Drag files here or click to upload</p>
              </div>
            </label>
            <div className="file-list">
              {jobData.attachments.map((file, index) => (
                <div key={index} className="file-item">
                  <span>{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setJobData({
                      ...jobData,
                      attachments: jobData.attachments.filter((_, i) => i !== index)
                    })}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button type="submit" className="submit-button">
          Post Job
        </button>
      </form>
    </div>
  );
};

export default PostJob;

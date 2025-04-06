import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";

const ApplyPopup = ({
  job,
  applyMessage,
  setApplyMessage,
  counterOffer,
  setCounterOffer,
  onSubmit,
  onClose,
}) => {
  const popupRef = useRef(null);

  // 🧠 Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return ReactDOM.createPortal(
    <div className="popup-overlay">
      <div className="apply-popup" ref={popupRef}>
        {job?.fileAttachment && (
          <img
            src={job.fileAttachment}
            alt={job.title}
            className="freelance-card-img"
            style={{ marginBottom: "1rem", maxWidth: "100%" }}
          />
        )}

        <h3>Apply for {job?.title}</h3>

        {job?.description && (
          <p style={{ marginBottom: "1rem", fontStyle: "italic" }}>{job.description}</p>
        )}

        <textarea
          placeholder="Write your message..."
          value={applyMessage}
          onChange={(e) => setApplyMessage(e.target.value)}
        />

        <input
          type="number"
          placeholder="Counter Offer (Optional)"
          value={counterOffer}
          onChange={(e) => setCounterOffer(e.target.value)}
        />

        <button onClick={onSubmit}>Submit</button>
        <button style={{ background: "#ff00ff" }} onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>,
    document.getElementById("popup-root")
  );
};

export default ApplyPopup;

import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";

const SharePopup = ({ onClose, shareToWhatsApp, shareToX, copyLink }) => {
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
      <div className="share-popup" ref={popupRef}>
        <h3>Share this Job</h3>
        <div className="share-btn-row">
          <button onClick={shareToWhatsApp}>WhatsApp</button>
          <button onClick={shareToX}>X</button>
          <button onClick={copyLink}>Copy</button>
          <button
            style={{ background: "#ff00ff" }}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.getElementById("popup-root")
  );
};

export default SharePopup;

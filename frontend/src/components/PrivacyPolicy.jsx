import React from "react";
import "./PrivacyPolicy.css";

const PrivacyPolicy = () => {
  return (
    <div className="privacy-container">
      <h1>🔒 Privacy Policy</h1>
      <p>
        Welcome to our Freelance Marketplace. We are committed to protecting your personal data and your right to privacy. This policy outlines how we handle your data, in accordance with industry-leading standards.
      </p>

      <section>
        <h2>1. Data We Collect</h2>
        <ul>
          <li>Account Info (name, email, etc.)</li>
          <li>Payment Information (Stripe/Crypto – handled securely)</li>
          <li>Chat Logs and Transactional Activity</li>
          <li>Usage Data (analytics, device info)</li>
        </ul>
      </section>

      <section>
        <h2>2. How We Use Your Data</h2>
        <ul>
          <li>To facilitate job and payment interactions</li>
          <li>To improve user experience and platform reliability</li>
          <li>For identity verification and fraud prevention</li>
          <li>To comply with legal obligations</li>
        </ul>
      </section>

      <section>
        <h2>3. Data Sharing & Third-Parties</h2>
        <p>
          We do not sell your data. We only share it with trusted processors:
        </p>
        <ul>
          <li>Stripe for card payments</li>
          <li>Blockchain APIs for crypto transactions</li>
          <li>Analytics services like Google/Fathom</li>
          <li>Cloud providers for infrastructure</li>
        </ul>
      </section>

      <section>
        <h2>4. Data Retention & Control</h2>
        <ul>
          <li>We store data only as long as necessary for business or legal reasons</li>
          <li>You may request deletion of your account and data</li>
          <li>We anonymize and encrypt sensitive information</li>
        </ul>
      </section>

      <section>
        <h2>5. Your Rights</h2>
        <ul>
          <li>Right to access and rectify your data</li>
          <li>Right to delete your data (within legal bounds)</li>
          <li>Right to data portability</li>
          <li>Right to object to processing</li>
        </ul>
      </section>

      <section>
        <h2>6. Security Measures</h2>
        <p>
          We use end-to-end encryption, secure key management, and zero-trust authentication for critical services. All payments are handled using PCI-DSS compliant providers.
        </p>
      </section>

      <section>
        <h2>7. Updates to This Policy</h2>
        <p>
          We may update this privacy policy to reflect changes to our data practices. If we make any material changes, we’ll notify you.
        </p>
      </section>

      <footer>
        <p>📬 For questions or concerns, contact us at: nirmay0604@gmail.com</p>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;

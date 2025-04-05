import React from "react";
import "./TermsAndConditions.css";

const TermsAndConditions = () => {
  return (
    <div className="terms-container">
      <h1>📜 Terms & Conditions</h1>
      <p>
        These Terms and Conditions govern your use of our Freelance Marketplace platform. By using the platform, you agree to comply with and be legally bound by these terms.
      </p>

      <section>
        <h2>1. User Responsibilities</h2>
        <ul>
          <li>You must be at least 18 years old to register and use our services.</li>
          <li>You are responsible for maintaining the confidentiality of your account.</li>
          <li>You agree not to engage in any unlawful or harmful behavior while using our platform.</li>
        </ul>
      </section>

      <section>
        <h2>2. Payment Terms</h2>
        <ul>
          <li>Payments are handled securely via Stripe or Cryptocurrency.</li>
          <li>Clients must fund escrow payments prior to project start (if applicable).</li>
          <li>Freelancers are paid only after client approval or milestone completion.</li>
        </ul>
      </section>

      <section>
        <h2>3. Escrow Policy</h2>
        <p>
          Our escrow system holds funds during the project. Funds are released to freelancers only when the agreed-upon milestones are approved. We do not mediate disputes, but we do log and timestamp all submissions.
        </p>
      </section>

      <section>
        <h2>4. Project Disputes</h2>
        <ul>
          <li>All communication must be done through our platform for transparency.</li>
          <li>In case of conflict, both parties agree to attempt mutual resolution before legal steps.</li>
          <li>We reserve the right to suspend or ban users involved in repeated disputes or abuse.</li>
        </ul>
      </section>

      <section>
        <h2>5. Account Termination</h2>
        <ul>
          <li>We reserve the right to suspend or terminate accounts for violating these terms.</li>
          <li>We may restrict features or access to ensure platform integrity.</li>
        </ul>
      </section>

      <section>
        <h2>6. Intellectual Property</h2>
        <p>
          Users retain ownership of their content. By uploading work, you grant us a limited license to display and store the content for operational purposes.
        </p>
      </section>

      <section>
        <h2>7. Limitation of Liability</h2>
        <p>
          We are not liable for any indirect, incidental, or consequential damages resulting from the use of our platform. Use is at your own risk.
        </p>
      </section>

      <section>
        <h2>8. Changes to Terms</h2>
        <p>
          We reserve the right to modify these terms at any time. If changes are made, we will notify users through the platform.
        </p>
      </section>

      <footer>
        <p>📧 For questions, contact us at nirmay0604@gmail.com</p>
      </footer>
    </div>
  );
};

export default TermsAndConditions;

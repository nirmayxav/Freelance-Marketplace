import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ethers } from "ethers";

const API_BASE_URL = "http://localhost:5001/api/payment";

const cardStyle = {
  style: {
    base: {
      color: "#ffffff",
      fontSize: "16px",
      "::placeholder": { color: "#aab7c4" },
    },
    invalid: { color: "#ff0033" },
  },
};

const PaymentForm = () => {
    const navigate = useNavigate();
  


  const stripe = useStripe();
  const elements = useElements();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [clientWallet, setClientWallet] = useState(null);

  const [amount, setAmount] = useState("");
  const [currency] = useState("usd");
  const [type, setType] = useState("full");
  const [method, setMethod] = useState("stripe");

  const [clientId, setClientId] = useState(null);
  const [freelancerId, setFreelancerId] = useState(null);
  const [jobId, setJobId] = useState(null);

  const passedTimeline = location.state?.timeline;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to access the payment page.");
      navigate("/login");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));
    if (user?._id || user?.id) {
      setClientId(user._id || user.id);
    }

    if (passedTimeline) {
      setFreelancerId(passedTimeline.applicant);
      setJobId(passedTimeline.jobId?._id || passedTimeline.jobId);
      setAmount(passedTimeline.totalAmount);
      setType(passedTimeline.escrowEnabled ? "escrow" : "full");
      setMethod(passedTimeline.paymentType === "blockchain" ? "crypto" : "stripe");
    }
  }, [navigate, passedTimeline]);

  const connectWallet = async () => {
    if (!window.ethereum) return setError("MetaMask is not installed.");
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setClientWallet(address);
    } catch (err) {
      setError("Wallet connection failed.");
    }
  };

  const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!amount || isNaN(amount) || amount <= 0) return setError("Invalid amount.");
    if (!["full", "escrow"].includes(type)) return setError("Invalid payment type.");
    if (!clientId || !freelancerId || !jobId) return setError("Missing required IDs.");
    console.log("clientId:", clientId);
console.log("freelancerId:", freelancerId);
console.log("jobId:", jobId);

    if (![clientId, freelancerId, jobId].every(isValidObjectId)) {
      setError("Invalid ObjectId format.");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return setError("Authentication token missing.");

    const payload = {
      amount: parseFloat(amount),
      currency,
      type,
      freelancerId,
      jobId,
    };

    try {
      if (method === "stripe") {
        if (!stripe || !elements) return setError("Stripe.js not loaded.");

        const res = await axios.post(`${API_BASE_URL}/create-payment`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const clientSecret = res.data.clientSecret;
        if (!clientSecret) return setError("Missing Stripe clientSecret.");

        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: { card: elements.getElement(CardElement) },
        });

        if (result.error) setError(result.error.message);
        else if (result.paymentIntent?.status === "succeeded") setSuccess(true);
        else setError("Payment did not succeed.");
      }

      if (method === "crypto") {
        if (!clientWallet) {
          await connectWallet();
          if (!clientWallet) return setError("Wallet not connected.");
        }

        const res = await axios.post(
          `${API_BASE_URL}/crypto-request`,
          {
            freelancerId,
            jobId,
            type,
            milestones: [{ title: "Single Payment", amountUSD: parseFloat(amount) }],
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const cryptoPayment = res.data?.payments?.[0];
        if (!cryptoPayment) return setError("No crypto payment data.");

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const tx = await signer.sendTransaction({
          to: cryptoPayment.toWallet,
          value: ethers.parseEther(cryptoPayment.amountCrypto),
        });

        await axios.post(
          `${API_BASE_URL}/verify-crypto`,
          { intentId: cryptoPayment._id, txHash: tx.hash },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setSuccess(true);
      }
    } catch (err) {
      console.error("Payment Error:", err);
      setError(err?.response?.data?.error || "Payment failed.");
    }
    setLoading(false);
  };

  return (
    <form
      onSubmit={handlePayment}
      style={{
        maxWidth: 500,
        margin: "3rem auto",
        background: "#0a0a1a",
        padding: "2rem",
        borderRadius: "20px",
        color: "#fff",
        boxShadow: "0 0 20px rgba(0,209,255,0.2)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2 style={{ color: "#00d1ff", marginBottom: "1.5rem" }}>Make Payment</h2>

      <div style={{ marginBottom: "1.2rem" }}>
        <label>Amount (USD)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          readOnly
          style={{
            width: "100%",
            padding: "10px",
            background: "#1a1a2e",
            border: "1px solid #333",
            color: "#fff",
            borderRadius: "8px",
            marginTop: "0.5rem",
          }}
        />
      </div>

      <div style={{ marginBottom: "1.2rem" }}>
        <label>Payment Type</label>
        <input
          type="text"
          value={type === "escrow" ? "Escrow" : "Full Payment"}
          readOnly
          style={{
            width: "100%",
            padding: "10px",
            background: "#1a1a2e",
            border: "1px solid #333",
            color: "#fff",
            borderRadius: "8px",
            marginTop: "0.5rem",
          }}
        />
      </div>

      <div style={{ marginBottom: "1.2rem" }}>
        <label>Payment Method</label>
        <input
          type="text"
          value={method === "crypto" ? "Crypto" : "Card"}
          readOnly
          style={{
            width: "100%",
            padding: "10px",
            background: "#1a1a2e",
            border: "1px solid #333",
            color: "#fff",
            borderRadius: "8px",
            marginTop: "0.5rem",
          }}
        />
      </div>

      {method === "crypto" && (
        <button
          type="button"
          onClick={connectWallet}
          style={{
            background: "#333",
            color: "#fff",
            padding: "12px",
            border: "1px solid #00d1ff",
            borderRadius: "8px",
            marginBottom: "1rem",
            width: "100%",
            cursor: "pointer",
          }}
        >
          {clientWallet
            ? `🔗 Connected: ${clientWallet.slice(0, 6)}...${clientWallet.slice(-4)}`
            : "🔌 Connect Wallet"}
        </button>
      )}

      {method === "stripe" && (
        <>
          <label>Card Details</label>
          <div
            style={{
              padding: "12px",
              background: "#1a1a2e",
              borderRadius: "10px",
              marginBottom: "1.5rem",
              border: "1px solid #333",
            }}
          >
            <CardElement options={cardStyle} />
          </div>
        </>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "limegreen" }}>✅ Payment successful!</p>}

      <button
        type="submit"
        disabled={loading}
        style={{
          background: "#00d1ff",
          color: "#0a0a1a",
          padding: "12px",
          border: "none",
          borderRadius: "10px",
          fontWeight: "bold",
          width: "100%",
          cursor: "pointer",
          marginTop: "10px",
        }}
      >
        {loading ? "Processing..." : "💸 Pay Now"}
      </button>
    </form>
  );
};

export default PaymentForm;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Opp from "./Opp.json";
import axios from "axios";

const Home = () => {
  const navigate = useNavigate();
  const [disabledButtons, setDisabledButtons] = useState([]);
  const [selectedInternship, setSelectedInternship] = useState(null);

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [resumeLink, setResumeLink] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get("http://localhost:3001/home", {
          withCredentials: true,
        });
      } catch (error) {
        navigate("/login");
      }
    };
    checkAuth();
  }, [navigate]);

  const apply = (internship, index) => {
    setSelectedInternship({ internship, index });
  };

  const submitApplication = async (e) => {
    e.preventDefault();

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      alert("Phone number must be exactly 10 digits");
      return;
    }

    try {
      await axios.post(
        "http://localhost:3001/apply",
        {
          opportunity: {
            company: selectedInternship?.internship?.Company,
            role: selectedInternship?.internship?.Role,
            location: {
              office: selectedInternship?.internship?.Location?.Office,
              stipend: selectedInternship?.internship?.Location?.Stipend,
            },
          },
          phone,
          email,
          resumeLink,
        },
        { withCredentials: true }
      );

      setDisabledButtons((prev) => [...prev, selectedInternship.index]);
      setSelectedInternship(null);
      setPhone("");
      setEmail("");
      setResumeLink("");

      alert("Applied Successfully ✅");
    } catch (error) {
      alert("Session expired. Please login again.");
      navigate("/login");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Available Internships</h2>

      {(Opp?.Internships || []).map((internship, index) => (
        <div
          key={index}
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            marginBottom: "15px",
            borderRadius: "8px",
          }}
        >
          <h3>{internship.Role}</h3>
          <p><b>Company:</b> {internship.Company}</p>
          <p><b>Office:</b> {internship.Location?.Office}</p>
          <p><b>Stipend:</b> {internship.Location?.Stipend}</p>
          <p><b>Duration:</b> {internship.Internship?.Duration}</p>

          <button
            onClick={() => apply(internship, index)}
            disabled={disabledButtons.includes(index)}
            style={{
              padding: "8px 16px",
              backgroundColor: disabledButtons.includes(index)
                ? "gray"
                : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            {disabledButtons.includes(index) ? "Applied" : "Apply Now"}
          </button>
        </div>
      ))}

      {/* 🔥 MODAL FORM */}
      {selectedInternship && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "10px",
              width: "350px",
            }}
          >
            <h3 style={{ textAlign: "center" }}>
              Apply for {selectedInternship.internship.Role}
            </h3>

            <form onSubmit={submitApplication}>
              <input
                type="tel"
                placeholder="Phone (10 digits)"
                required
                maxLength={10}
                value={phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 10) {
                    setPhone(value);
                  }
                }}
                style={{
                  width: "100%",
                  padding: "8px",
                  marginBottom: "10px",
                }}
              />

              <input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  marginBottom: "10px",
                }}
              />

              <input
                type="text"
                placeholder="Resume Link"
                required
                value={resumeLink}
                onChange={(e) => setResumeLink(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  marginBottom: "20px",
                }}
              />

              {/* ✅ FIXED BUTTON ALIGNMENT */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "15px",
                }}
              >
                <button
                  type="submit"
                  style={{
                    padding: "8px 20px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Submit
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedInternship(null)}
                  style={{
                    padding: "8px 20px",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

import React from 'react';
import './UserCreationForm.css'; // Updated CSS file

const UserCreationForm = () => {
  return (
    <div className="userCreationForm-container">
      <h1 className="userCreationForm-title">User Creation / Restriction Form – Standard / Restricted</h1>
      <p className="userCreationForm-subtitle">
        This form is for requesting access to the company’s system/computer services.
      </p>

      {/* Section 1: Applicant Details */}
      <section className="userCreationForm-section">
        <h2>Applicant Details</h2>
        <div className="userCreationForm-grid-3">
          <input type="text" placeholder="First Name" />
          <input type="text" placeholder="Middle Name" />
          <input type="text" placeholder="Surname" />
          <input type="text" placeholder="Designation" />
          <input type="text" placeholder="Department" />
          <input type="text" placeholder="Employee No" />
        </div>
      </section>

      {/* Section 2: System Requirements */}
      <section className="userCreationForm-section">
        <h2>System Requirements</h2>
        <div className="userCreationForm-checkbox-grid">
          {[
            "Domain Network Account",
            "Technical Services Access",
            "Email Account",
            "Email Alias Account",
            "Gapro Login",
            "HRIS Login",
            "Outlook Email",
            "General Email Address",
            "Finger Print System Access",
            "Other System Resources",
          ].map((label, i) => (
            <label key={i}>
              <input type="checkbox" /> {label}
            </label>
          ))}
        </div>
        <input
          type="text"
          placeholder="If general email required, please type here"
          className="userCreationForm-full-input"
        />
      </section>

      {/* Internet Access Reason */}
      <section className="userCreationForm-section">
        <h2>Internet Access</h2>
        <input
          type="text"
          placeholder="Reason for Internet Access"
          className="userCreationForm-full-input"
        />
      </section>

      {/* Authorized Access */}
      <section className="userCreationForm-section">
        <h2>Authorized Access Details</h2>
        <div className="userCreationForm-checkbox-grid">
          {[
            "Create personal share folder on Server",
            "Give access to shared drives",
            "Email group access",
            "Restrict to company shared drives",
            "Restrict access to company email",
            "Restrict access to company-related resources",
          ].map((label, i) => (
            <label key={i}>
              <input type="checkbox" /> {label}
            </label>
          ))}
        </div>
      </section>

      {/* User Signature */}
      <section className="userCreationForm-section">
        <h2>User’s Declaration</h2>
        <div className="userCreationForm-grid-2">
          <input type="text" placeholder="User's Name" />
          <input type="text" placeholder="Employee No" />
          <input type="text" placeholder="User's Signature" />
          <input type="text" placeholder="Date" />
        </div>
      </section>

      {/* HR Dept Section */}
      <section className="userCreationForm-section">
        <h2>HR Department Use Only</h2>
        <div className="userCreationForm-grid-2">
          <input type="text" placeholder="Name of HR Representative" />
          <input type="text" placeholder="Signature" />
        </div>
        <input type="text" placeholder="Date" className="userCreationForm-full-input" />
      </section>

      <button className="userCreationForm-submit-button">Submit</button>
    </div>
  );
};

export default UserCreationForm;

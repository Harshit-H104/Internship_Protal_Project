import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/admin/applications")
      .then(res => setApplications(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div>
      <h2>Admin Dashboard</h2>

      <table border="1">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Job Role</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app, index) => (
            <tr key={index}>
              <td>{app.name}</td>
              <td>{app.email}</td>
              <td>{app.jobRole}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;

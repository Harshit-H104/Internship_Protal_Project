import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3001",
  withCredentials: true,
});

// LOGIN
export const loginUser = (email, password) =>
  API.post("/login", { email, password });

// REGISTER
export const registerUser = (name, email, password) =>
  API.post("/register", { name, email, password });

// APPLY INTERNSHIP
export const applyInternship = (opportunity) =>
  API.post("/apply", { opportunity });

// GET APPLIED INTERNSHIPS
export const getMyApplications = () =>
  API.get("/applied");


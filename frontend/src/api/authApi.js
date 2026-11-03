import axiosInstance from "./axiosInstance";

export async function registerUser(formValues) {
  const response = await axiosInstance.post("/auth/register", {
    full_name: formValues.fullName,
    email: formValues.email,
    password: formValues.password,
  });
  return response.data;
}

export async function loginUser(formValues) {
  const response = await axiosInstance.post("/auth/login", {
    email: formValues.email,
    password: formValues.password,
  });
  return response.data;
}

export async function getCurrentUser() {
  const response = await axiosInstance.get("/auth/me");
  return response.data;
}

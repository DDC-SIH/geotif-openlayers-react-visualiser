import { RegisterFormData } from "./pages/Register";
import { SignInFormData } from "./pages/SignIn";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const register = async (formData: RegisterFormData) => {
    const response = await fetch(`${API_BASE_URL}/api/users/register`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
  
    const responseBody = await response.json();
  
    if (!response.ok) {
      throw new Error(responseBody.message);
    }
    localStorage.setItem("token", responseBody.token);
    localStorage.setItem("userId", responseBody.userId);
  };

  export const validateToken = async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/validate-token`, {
      // pass all cookies
      credentials: "include",
      // pass local storage token
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },

    });
    if (response.status === 401) {
      throw new Error("Unauthorized");
    }


    if (!response.ok) {
      throw new Error("Token invalid");
    }

    return response.json();
  };

  export const signIn = async (formData: SignInFormData) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
  
    const body = await response.json();
    if (!response.ok) {
      throw new Error(body.message);
    }
    localStorage.setItem("token", body.token);
    localStorage.setItem("userId", body.userId);

    return body;
  };


  export const signOut = async () => {
    // remove token from local storage
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      credentials: "include",
      method: "POST",
    });
  
    if (!response.ok) {
      throw new Error("Error during sign out");
    }
  };

  
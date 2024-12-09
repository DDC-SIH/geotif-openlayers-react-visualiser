import { RegisterFormData } from "./pages/Register";
import { SignInFormData } from "./pages/SignIn";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// FUNCTIONS REGARDING THE USER

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

  export const addDownload = async (downloadObject: any) => {
    const response = await fetch(`${API_BASE_URL}/api/users/addDownload`, {
      method: "POST",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ downloadObject }),
    });

    if (!response.ok) {
      throw new Error("Failed to add download");
    }

    return response.json();
  };




// for getting files from L1B,L1C,L2B,L2C

  export const fetchAllFiles = async () => {
    const response = await fetch(`${API_BASE_URL}/api/get-files/all`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Could not load items");
    }

    return response.json();
  };

  export const fetchFilesByTable = async (table: string) => {
    const response = await fetch(`${API_BASE_URL}/api/get-files/table/${table}`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Could not load items");
    }

    return response.json();
  };

  export const fetchFileByTableAndDate = async (table: string, date: string) => {
    const response = await fetch(`${API_BASE_URL}/api/get-files/table/${table}/${date}`, {
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Item not found");
      }
      throw new Error("Could not load item");
    }

    return response.json();
  };

  export const searchFilesByDateRange = async (searchParams: { startDate: string; endDate: string; processingLevel: string }) => {
    const response = await fetch(`${API_BASE_URL}/api/get-files/search`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(searchParams),
    });

    if (!response.ok) {
      throw new Error("Could not search items");
    }

    return response.json();
  };

  export const searchFilesWithTime = async (searchParams: { startDate: string; endDate: string; processingLevel: string }) => {
    const response = await fetch(`${API_BASE_URL}/api/get-files/searchWithTime`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(searchParams),
    });

    if (!response.ok) {
      throw new Error("Could not search items");
    }

    return response.json();
  };

  export const getItem = async (processingLevel: string, dateTime: string) => {
    const response = await fetch(`${API_BASE_URL}/api/get-files/getItem`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ processingLevel, dateTime }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Item or time entry not found");
      }
      throw new Error("Could not load item");
    }

    return response.json();
  };



// -------------authorization

export const submitRequest = async (formData:any, file:any) => {
  const form = new FormData();
  form.append('file', file);
  form.append('dataSource', formData.dataSource);
  form.append('category', formData.category);
  form.append('profileCategory', formData.profileCategory);
  form.append('message', formData.message);

  try {
    const response = await fetch(`${API_BASE_URL}/api/authorize/submit-request`, {
      method: 'POST',
      body: form,
    });

    if (!response.ok) {
      throw new Error('Failed to submit request');
    }

    const data = await response.json();
    return data;  // Contains fileUrl and success message
  } catch (error) {
    console.error('Error submitting request:', error);
    throw error;
  }
};
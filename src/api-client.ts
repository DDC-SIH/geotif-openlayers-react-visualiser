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


export const getDownloads = async () => {
  const response = await fetch(`${API_BASE_URL}/api/users/downloads`, {
    credentials: "include",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Could not load downloads");
  }

  return response.json();
}



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
      credentials: "include",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
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


// API function to fetch all requests
export const fetchAllRequests = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/authorize/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      credentials: 'include',  
    });

    if (!response.ok) {
      throw new Error('Error fetching all requests');
    }

    const data = await response.json();  
    return data.items;  
  } catch (error) {
    console.error('Error fetching all requests:', error);
    throw new Error('Error fetching all requests');
  }
};



export const updateStatus = async (uniqueId: string, status: string) => {
  const response = await fetch(`${API_BASE_URL}/api/authorize/update-status/${uniqueId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    credentials: 'include',  // Ensure credentials are sent with the request
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error('Failed to update status');
  }

  return response.json();  // Returning the updated item data
};


export const generateApiKey = async (apiName: string) => {
  const response = await fetch(`${API_BASE_URL}/api/keys/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    credentials: 'include', // Ensures cookies are included
    body: JSON.stringify({ apiName }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to generate API key');
  }

  return response.json();
};

export const toggleApiKeyStatus = async (apiKey: string) => {
  const response = await fetch(`${API_BASE_URL}/api/keys/toggle`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    credentials: 'include', // Ensures cookies are included
    body: JSON.stringify({ apiKey }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to toggle API key status');
  }

  return response.json();
};


export const getAllApiKeys = async (): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/api/keys/all`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch API keys');
  }

  return response.json();
};



// ----------------------- hdf5 upload

interface PresignedUrlResponse {
  url: string;
}

interface UploadResponse {
  message: string;
}

export const getPresignedUrl = async (fileName: string): Promise<PresignedUrlResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/hdf/presigned-url?fileName=${encodeURIComponent(fileName)}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Error fetching presigned URL: ${response.statusText}`);
  }

  return response.json();
};

export const uploadFileToS3 = async (url: string, file: File): Promise<void> => {
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type, // Ensure Content-Type matches the file type
      },
      body: file, // Ensure the file is sent as the body
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('S3 Response Error:', errorText); // Log the detailed error from S3
      throw new Error(`Error uploading file to S3: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error in uploadFileToS3:', error);
    throw error;
  }
};


export const uploadMultipartFile = async (formData: FormData): Promise<UploadResponse> => {
  console.log('Uploading multipart file:', formData); 
  const response = await fetch(`${API_BASE_URL}/api/hdf/multipart-upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Error uploading multipart file: ${response.statusText}`);
  }

  return response.json();
};



export const downloadZip = async (downloadDateTime: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/downloadZip?downloadDateTime=${encodeURIComponent(downloadDateTime)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to download the file");
    }

    // Handle the response - trigger download
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `download_${downloadDateTime}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

  } catch (error) {
    console.error("Error downloading zip:", error);
    throw error;
  }
};

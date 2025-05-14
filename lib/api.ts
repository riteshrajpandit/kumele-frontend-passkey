import axios from 'axios';

// For development, use the local API
// For production, use the deployed API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authentication APIs
export const signUp = async (userData: any) => {
  try {
    const response = await apiClient.post('/auth/signup/', userData);
    return response.data;
  } catch (error: any) {
    console.error('Signup error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const login = async (loginData: { email: string; password: string }) => {
  try {
    const response = await apiClient.post('/auth/login/', loginData);
    return response.data;
  } catch (error: any) {
    console.error('Login error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Login failed' };
  }
};

export const verifyEmail = async (verificationData: { email: string; code: string }) => {
  try {
    const response = await apiClient.post('/auth/verify-email/', verificationData);
    return response.data;
  } catch (error: any) {
    console.error('Verification error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const googleSignIn = async (data: { auth_token: string }) => {
  try {
    const response = await apiClient.post('/auth/google-signin/', data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Google sign-in failed' };
  }
};

// Passkey APIs
export const getPasskeyRegistrationOptions = async (email: string) => {
  try {
    const response = await apiClient.post('/auth/passkey/register/options/', { email });
    return response.data;
  } catch (error: any) {
    console.error('Get passkey registration options error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to get passkey registration options' };
  }
};

export const verifyPasskeyRegistration = async (registrationData: any) => {
  try {
    const response = await apiClient.post('/auth/passkey/register/verify/', registrationData);
    return response.data;
  } catch (error: any) {
    console.error('Passkey registration verification error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to verify passkey registration' };
  }
};

export const getPasskeyLoginOptions = async () => {
  try {
    const response = await apiClient.post('/auth/passkey/login/options/', {});
    return response.data;
  } catch (error: any) {
    console.error('Get passkey login options error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to get passkey login options' };
  }
};

export const verifyPasskeyLogin = async (loginData: any) => {
  try {
    const response = await apiClient.post('/auth/passkey/login/verify/', loginData);
    return response.data;
  } catch (error: any) {
    console.error('Passkey login verification error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to verify passkey login' };
  }
};

// User APIs
export const updatePermissions = async (permissionsData: any, token: string) => {
  try {
    const response = await apiClient.post('/auth/update-permissions/', permissionsData, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to update permissions' };
  }
};

export const setUsername = async (usernameData: { username: string }, token: string) => {
  try {
    const response = await apiClient.post('/auth/set-username/', usernameData, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to set username' };
  }
};

export const deleteUser = async (token: string) => {
  try {
    const response = await apiClient.delete('/auth/account/delete/', {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Delete user error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to delete user account' };
  }
};

export const fetchHobbies = async () => {
  try {
    const response = await apiClient.get('/api/hobbies/');
    return response.data;
  } catch (error: any) {
    console.error('Fetch hobbies error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to fetch hobbies' };
  }
};

export const selectHobbies = async (hobbiesData: { hobby_ids: number[] }, token: string) => {
  try {
    const response = await apiClient.post('/api/select-hobbies/', hobbiesData, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Select hobbies error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to select hobbies' };
  }
};

export const searchUsers = async (query: string, token: string) => {
  try {
    const response = await apiClient.get('/api/search/', {
      params: { q: query },
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Search users error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to search users' };
  }
};

export const followUser = async (username: string, token: string) => {
  try {
    const response = await apiClient.post(`/api/${username}/follow/`, {}, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Follow user error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to follow user' };
  }
};

export const getFollowersFollowings = async (username: string, token: string) => {
  try {
    const response = await apiClient.get(`/api/${username}/follows/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Get followers/followings error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to fetch followers/followings' };
  }
};
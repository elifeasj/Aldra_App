// API Configuration
// export const API_URL = 'http://192.168.0.118:5001'; // Local network IP
export const API_URL = 'https://aldra-backend.onrender.com';  // For production (live)

export const endpoints = {
    register: `${API_URL}/register`,
    login: `${API_URL}/login`,
    checkServer: API_URL,
    logs: `${API_URL}/logs`,
    savelog: `${API_URL}/logs`,
};

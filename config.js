// API Configuration
export const API_URL = 'http://192.168.0.215:5001'; // Local network IP
// export const API_URL = 'https://your-production-api.com'; // For production

export const endpoints = {
    register: `${API_URL}/register`,
    login: `${API_URL}/login`,
    checkServer: API_URL,
};

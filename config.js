// API Configuration
// export const API_URL = 'http://192.168.0.118:5001'; // Local network IP
export const API_URL = 'https://aldra-backend.up.railway.app';  // For production (live)
export const STRAPI_URL = 'https://aldra-cms.up.railway.app';  // Strapi backend (aldra-cms)




export const endpoints = {
    register: `${API_URL}/register`,
    login: `${API_URL}/login`,
    checkServer: API_URL,
    logs: `${API_URL}/logs`,
    savelog: `${API_URL}/logs`,
    questions: `${STRAPI_URL}/api/questions`,
    categories: `${STRAPI_URL}/api/categories`,
};



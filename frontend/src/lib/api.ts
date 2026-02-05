export const API_URL = "http://127.0.0.1:8000/api/v1";

export async function login(username, password) {
    const formData = new FormData();
    formData.append('username', username); // FastAPI OAuth2PasswordRequestForm expects 'username', not email
    formData.append('password', password);

    const response = await fetch(`${API_URL}/auth/login/access-token`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
    }

    return response.json();
}

export async function signup(userData) {
    const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Signup failed');
    }

    return response.json();
}


export async function getGlobalForecast(days = 30, detailed = false) {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/forecasting/global?days=${days}&detailed=${detailed}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch forecast');
    }
    return response.json();
}

export async function triggerTraining(autoTune = false) {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/training/train?auto_tune=${autoTune}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.json();
}

export async function getTrainingStatus() {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/training/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
}

export async function getDashboardStats() {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/dashboard/`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
}

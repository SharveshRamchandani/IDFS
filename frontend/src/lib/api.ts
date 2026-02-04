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

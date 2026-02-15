document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePasswordButton = document.getElementById('togglePassword');
    const eyeIcon = document.getElementById('eyeIcon');

    togglePasswordButton.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        eyeIcon.textContent = type === 'password' ? 'visibility_off' : 'visibility';
    });

    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = usernameInput.value;
        const email = emailInput.value;
        const password = passwordInput.value;

        try {
            const response = await fetch('http://appguide.tech:8001/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            if (response.ok) {
                // Automatically log in the user after signup
                const formData = new URLSearchParams();
                formData.append('username', email); // Use email to log in
                formData.append('password', password);

                const loginResponse = await fetch('http://appguide.tech:8001/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: formData.toString(),
                });

                if (loginResponse.ok) {
                    const data = await loginResponse.json();
                    localStorage.setItem('access_token', data.access_token);
                    // Mark as a fresh signup so welcome page shows
                    localStorage.setItem('is_new_user', 'true');
                    window.location.href = 'welcome.html';
                } else {
                    alert('Sign up successful! Please log in manually.');
                    window.location.href = 'index.html';
                }
            } else {
                const errorData = await response.json();
                alert(`Sign up failed: ${errorData.detail}`);
            }
        } catch (error) {
            console.error('Error during sign up:', error);
            alert('An error occurred during sign up. Please try again.');
        }
    });
});

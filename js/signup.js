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
            const response = await fetch('http://127.0.0.1:8001/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            if (response.ok) {
                alert('Sign up successful! You can now log in.');
                window.location.href = 'index.html';
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

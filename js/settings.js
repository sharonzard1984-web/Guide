const bindSettings = () => {
  const navigateTo = (page) => {
    const inPages = window.location.pathname.includes('/pages/');
    window.location.href = inPages ? page : `pages/${page}`;
  };
  const profile = document.getElementById('profileSection');
  const items = document.querySelectorAll('.settings-item');
  const changePasswordBtn = document.getElementById('changePasswordBtn');
  const changePasswordModal = document.getElementById('changePasswordModal');
  const cancelPasswordChange = document.getElementById('cancelPasswordChange');
  const changePasswordForm = document.getElementById('changePasswordForm');
  const currentPasswordInput = document.getElementById('currentPassword');
  const newPasswordInput = document.getElementById('newPassword');
  const confirmNewPasswordInput = document.getElementById('confirmNewPassword');
  
  const changeAvatarModal = document.getElementById('changeAvatarModal');
  const cancelAvatarChange = document.getElementById('cancelAvatarChange');
  const changeAvatarForm = document.getElementById('changeAvatarForm');
  const avatarFileInput = document.getElementById('avatarFile');

  // Function to fetch and display user data
  const fetchAndDisplayUser = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigateTo('index.html'); // Redirect to login if no token
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8001/users/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const user = await response.json();
        const avatarUrl = user.avatar_url 
          ? `http://127.0.0.1:8001${user.avatar_url}` 
          : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.username) + '&background=random&size=96';
          
        profile.innerHTML = `
          <div id="avatarContainer" class="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md mb-4 cursor-pointer hover:opacity-80 transition-opacity">
            <img src="${avatarUrl}" alt="${user.username}" class="w-full h-full object-cover" />
          </div>
          <h2 class="text-2xl font-bold text-text-dark">${user.username}</h2>
          <p class="text-text-gray">${user.email}</p>
        `;

        // Bind the avatar click event after it's injected into the DOM
        const avatarContainer = document.getElementById('avatarContainer');
        if (avatarContainer) {
          avatarContainer.addEventListener('click', () => {
            const modal = document.getElementById('changeAvatarModal');
            if (modal) modal.classList.remove('hidden');
          });
        }
      } else {
        // Handle error, e.g., token expired, redirect to login
        localStorage.removeItem('access_token');
        navigateTo('index.html');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      localStorage.removeItem('access_token');
      navigateTo('index.html');
    }
  };

  // Call the function to fetch and display user data when the page loads
  fetchAndDisplayUser();

  if (!profile || items.length === 0) {
    setTimeout(bindSettings, 50);
    return;
  }

  items.forEach((item) => {
    const icon = item.getAttribute('data-icon');
    const label = item.getAttribute('data-label');
    const rightIcon = item.getAttribute('data-right-icon');
    item.className = 'bg-white p-4 rounded-2xl flex items-center shadow-sm cursor-pointer hover:shadow-md transition-shadow';
    item.innerHTML = `
      <div class="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center mr-4">
        <span class="material-symbols-rounded">${icon}</span>
      </div>
      <span class="font-bold text-text-dark text-lg flex-1">${label}</span>
      ${rightIcon ? `<span class="material-symbols-rounded text-gray-400">${rightIcon}</span>` : ''}
    `;
  });

  // Event Listeners for Password Change
  changePasswordBtn.addEventListener('click', () => {
    changePasswordModal.classList.remove('hidden');
  });

  cancelPasswordChange.addEventListener('click', () => {
    changePasswordModal.classList.add('hidden');
    changePasswordForm.reset();
  });

  changePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const current_password = currentPasswordInput.value;
    const new_password = newPasswordInput.value;
    const confirm_new_password = confirmNewPasswordInput.value;

    if (new_password !== confirm_new_password) {
      alert('New password and confirm password do not match.');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://127.0.0.1:8001/users/me/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ current_password, new_password }),
      });

      if (response.ok) {
        alert('Password changed successfully!');
        changePasswordModal.classList.add('hidden');
        changePasswordForm.reset();
      } else {
        const errorData = await response.json();
        alert(`Failed to change password: ${errorData.detail}`);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('An error occurred while changing password. Please try again.');
    }
  });

  // Event Listeners for Avatar Change
  if (cancelAvatarChange) {
    cancelAvatarChange.addEventListener('click', () => {
      changeAvatarModal.classList.add('hidden');
      changeAvatarForm.reset();
    });
  }

  changeAvatarForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', avatarFileInput.files[0]);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://127.0.0.1:8001/users/me/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        alert('Avatar changed successfully!');
        changeAvatarModal.classList.add('hidden');
        changeAvatarForm.reset();
        // Optionally, refresh the page or update the avatar image dynamically
        location.reload(); 
      } else {
        const errorData = await response.json();
        alert(`Failed to change avatar: ${errorData.detail}`);
      }
    } catch (error) {
      console.error('Error changing avatar:', error);
      alert('An error occurred while changing avatar. Please try again.');
    }
  });
};

bindSettings();

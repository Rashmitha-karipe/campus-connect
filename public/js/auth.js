// If already logged in, go straight to the right dashboard
if (Auth.token() && Auth.home()) location.href = Auth.home();

const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const data = await api('/api/auth/login', 'POST', {
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value
      });
      Auth.save(data);
      location.href = Auth.home();
    } catch (err) { showMsg('msg', err.message); }
  });
}

const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await api('/api/auth/register', 'POST', {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value,
        role: document.getElementById('role').value
      });
      showMsg('msg', 'Account created! Redirecting to log in...', 'success');
      setTimeout(() => (location.href = '/index.html'), 1200);
    } catch (err) { showMsg('msg', err.message); }
  });
}

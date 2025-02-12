document.getElementById('loginForm').addEventListener('submit', async function(event) {
   event.preventDefault();
   const email = document.getElementById('email').value;
   const password = document.getElementById('password').value;

   const response = await fetch('/login', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ email, password }),
   });

   const data = await response.json();
   if (response.ok) {
       const code = prompt('Enter the verification code sent to your email:');
       const verifyResponse = await fetch('/verify', {
           method: 'POST',
           credentials: 'same-origin',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ code }),
       });

       const verifyData = await verifyResponse.json();
       if (verifyResponse.ok) {
           localStorage.setItem('accessToken', verifyData.accessToken);
           localStorage.setItem('refreshToken', verifyData.refreshToken);

           // Перенаправление на основе роли
           if (verifyData.role === "admin") {
               window.location.href = '/admin';
           } else if (verifyData.role === "moder") {
               window.location.href = '/moder';
           } else {
               window.location.href = '/';
           }
       } else {
           alert(`Verification failed: ${verifyData.error}`);
       }
   } else {
       alert(`Login failed: ${data.error}`);
   }
});
const errorMsg = document.getElementById('errorMsg');

document.getElementById('loginForm').addEventListener('submit', async function(event) {
   event.preventDefault();
   const email = document.getElementById('email').value;
   const password = document.getElementById('password').value;

   const response = await fetch('/login', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ email, password }),
       credentials: 'same-origin'
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
        // localStorage.setItem('accessToken', data.accessToken);
        // localStorage.setItem('refreshToken', data.refreshToken);
        if (verifyData.role === "admin") {
            window.location.href = '/admin';
        } else {
            window.location.href = '/';
        }
           // Перенаправление на основе роли
        //    if (verifyData.role === "admin") {
        //        window.location.href = '/admin';
        //    } else {
        //        window.location.href = '/';
        //    }
       } else {
            errorMsg.innerText = verifyData.error;
            errorMsg.style.display = 'block';
           alert(`Verification failed: ${verifyData.error}`);
       }
   } else {
        errorMsg.innerText = data.error;
        errorMsg.style.display = 'block';
   }
});
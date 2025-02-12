document.getElementById('registrationForm').addEventListener('submit', async function(event) {
   event.preventDefault();
 
   const username = document.getElementById('username').value;
   const email = document.getElementById('email').value;
   const password = document.getElementById('password').value;
   if(validateForm()) {
      const response = await fetch('/register', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
 
      if (response.ok) {
         alert('Registration successful!');
         window.location.href = `/?username=${username}`;
      } else {
         alert(`Registration failed: ${data.error}`);
      }
   }
});

function validateForm() {
   var email = document.getElementById("email").value;
   var password = document.getElementById("password").value;

   if (email.trim() === "") {
     alert("Please enter your email address");
     return false;
   }

   var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   if (!emailPattern.test(email)) {
       alert("Please enter a valid email address");
       return false;
   }
 
   if (password.trim() === "") {
     alert("Please enter a password");
     return false;
   }

   if (password.length <= 8) {
       alert("Password must be longer than 8 characters");
       return false;
   }
 
   var symbolPattern = /[!@#$%^&*().]/;
   if (!symbolPattern.test(password)) {
       alert("Password must contain at least one symbol like dot");
       return false;
   }
   return true;
}
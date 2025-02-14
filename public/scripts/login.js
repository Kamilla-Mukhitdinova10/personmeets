const errorMsg = document.getElementById('errorMsg');
const verificationForm = document.getElementById('verificationForm');
const codeErrorMsg = document.getElementById('codeErrorMsg');
const verifyButton = document.getElementById('verifyButton');

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
        // Показываем форму для ввода кода
        document.getElementById('loginForm').style.display = 'none';
        verificationForm.style.display = 'block';
    } else {
        errorMsg.innerText = data.error;
        errorMsg.style.display = 'block';
    }
});

// Обработчик для кнопки "Verify"
verifyButton.addEventListener('click', async function() {
    const code = document.getElementById('verificationCode').value;

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
        } else {
            window.location.href = '/';
        }
    } else {
        codeErrorMsg.innerText = verifyData.error;
        codeErrorMsg.style.display = 'block';
    }
});
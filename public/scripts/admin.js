// admin.js

// Оборачиваем весь код в асинхронную IIFE для использования await и сохранения приватных переменных
(async function() {
    // Получаем ссылки на элементы страницы
    const userLink = document.getElementById('userLink');
    const profileLink = document.getElementById('profileLink');
    const postLink = document.getElementById('postLink');
    const profileName = document.getElementById('profileName');
    const contentBlock2 = document.getElementById('content'); // основной контейнер для вывода контента

    //
    // Функция для обновления access-токена через refresh-токен
    //
    async function refreshToken() {
        const refreshToken = localStorage.getItem('refreshToken');
        try {
            const res = await fetch('/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
                credentials: 'same-origin'
            });
            const data = await res.json();
            if (data.accessToken) {
                localStorage.setItem('accessToken', data.accessToken);
                return data.accessToken;
            } else {
                localStorage.clear();
                window.location.href = '/login';
                throw new Error("Refresh token failed");
            }
        } catch (error) {
            console.error("Token refresh error:", error);
            throw error;
        }
    }

    //
    // Универсальная функция для выполнения запросов с авторизацией.
    // Добавляет access-токен в заголовок, передаёт cookie (credentials) и
    // при ошибке 401/403 пытается обновить токен и повторить запрос.
    //
    async function authFetch(url, options = {}) {
        let token = localStorage.getItem('accessToken');
        if (!options.headers) options.headers = {};
        if (!options.headers['Content-Type'] && !(options.body instanceof FormData)) {
            options.headers['Content-Type'] = 'application/json';
        }
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }
        options.credentials = 'same-origin';
        let response = await fetch(url, options);
        if (response.status === 401 || response.status === 403) {
            try {
                const newToken = await refreshToken();
                if (newToken) {
                    options.headers['Authorization'] = `Bearer ${newToken}`;
                    response = await fetch(url, options);
                }
            } catch (e) {
                console.error("Failed to refresh token", e);
            }
        }
        return response;
    }

    // При загрузке страницы пытаемся обновить токен (если необходимо)
    await refreshToken();

    // Получаем имя пользователя и отображаем его
    try {
        const resGetUser = await authFetch('/getUserName');
        const userData = await resGetUser.json();
        const usernameDisplay = document.getElementById('usernameDisplay');
        usernameDisplay.innerText = userData.username;
    } catch (error) {
        console.error('Error fetching username:', error);
    }

    // Получаем и выводим информацию профиля администратора
    try {
        const resProfile = await authFetch('/profile');
        const profileData = await resProfile.json();
        contentBlock2.innerHTML = `<div class="user-content">
                                    <div class="user-photo">
                                        <img src="materials/backrotate (2).gif">
                                    </div>
                                    <div class="user-info">
                                        <h2>${profileData.username}'s Profile</h2>
                                        <p>Email: ${profileData.email}</p>
                                        <p>Role: ${profileData.role}</p>
                                    </div>
                                  </div>`;
    } catch (error) {
        console.error('Error fetching profile:', error);
    }

    // Привязываем обработчики кликов для переключения разделов
    profileLink.addEventListener('click', profileLinkClick);
    postLink.addEventListener('click', postLinkClick);
    profileName.addEventListener('click', profileLinkClick);
    userLink && userLink.addEventListener('click', loadUsers); // если есть ссылка для пользователей

    // Функция обработки клика по пункту "Профиль"
    async function profileLinkClick(event) {
        event.preventDefault();
        postLink.classList.remove('active');
        userLink && userLink.classList.remove('active');
        event.target.classList.add('active');
        try {
            const res = await authFetch('/profile');
            const user = await res.json();
            contentBlock2.innerHTML = `<div class="user-content">
                                            <div class="user-photo">
                                                <img src="materials/backrotate (2).gif">
                                            </div>
                                            <div class="user-info">
                                                <h2>${user.username}'s Profile</h2>
                                                <p>Email: ${user.email}</p>
                                                <p>Role: ${user.role}</p>
                                            </div>
                                         </div>`;
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    }

    // Функция обработки клика по пункту "Посты"
    async function postLinkClick(event) {
        event.preventDefault();
        profileLink.classList.remove('active');
        event.target.classList.add('active');
        try {
            const res = await authFetch('/post/posts');
            const posts = await res.json();
            if (contentBlock2) {
                contentBlock2.innerHTML = '';
                const contentBlock = document.createElement('div');
                contentBlock.classList.add('content-block');
                for (const post of posts) {
                    try {
                        const resUser = await authFetch(`/users/${post.userid}`);
                        const user = await resUser.json();
                        const dateObject = new Date(post.date);
                        const options = {
                            day: 'numeric', month: 'short', year: 'numeric',
                            hour: 'numeric', minute: 'numeric', second: 'numeric'
                        };
                        const formattedDate = dateObject.toLocaleString('en-US', options);
                        contentBlock.innerHTML += `
                        <div class="post-block">
                            <h3>${post.title}</h3>
                            <div class="white-line" style="background-color: white; height: 1px; width: 100%;"></div>
                            <p>${post.description}</p>
                            <p class="user-inform">${user.username}</p>
                            <p class="user-inform">${formattedDate}</p>
                            <div class="post-btn-container">
                                <button class="delete-btn" onclick="deletePost(${post.id})">Delete</button>
                            </div>
                        </div>`;
                    } catch (err) {
                        console.error('Error fetching user for post:', err);
                    }
                }
                contentBlock2.appendChild(contentBlock);
            } else {
                console.error('Error: contentBlock element not found');
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    }

    // Функция удаления поста
    async function deletePost(postId) {
        try {
            const confirmDelete = confirm('Are you sure you want to delete this post?');
            if (confirmDelete) {
                const res = await authFetch(`/post/posts/${postId}`, { method: 'DELETE' });
                if (!res.ok) {
                    console.error(`Error deleting post with ID ${postId}`);
                } else {
                    // После удаления можно обновить список постов
                    try {
                        const res = await authFetch('/post/posts');
                        const posts = await res.json();
                        if (contentBlock2) {
                            contentBlock2.innerHTML = '';
                            const contentBlock = document.createElement('div');
                            contentBlock.classList.add('content-block');
                            for (const post of posts) {
                                try {
                                    const resUser = await authFetch(`/users/${post.userid}`);
                                    const user = await resUser.json();
                                    const dateObject = new Date(post.date);
                                    const options = {
                                        day: 'numeric', month: 'short', year: 'numeric',
                                        hour: 'numeric', minute: 'numeric', second: 'numeric'
                                    };
                                    const formattedDate = dateObject.toLocaleString('en-US', options);
                                    contentBlock.innerHTML += `
                                    <div class="post-block">
                                        <h3>${post.title}</h3>
                                        <div class="white-line" style="background-color: white; height: 1px; width: 100%;"></div>
                                        <p>${post.description}</p>
                                        <p class="user-inform">${user.username}</p>
                                        <p class="user-inform">${formattedDate}</p>
                                        <div class="post-btn-container">
                                            <button class="delete-btn" onclick="deletePost(${post.id})">Delete</button>
                                        </div>
                                    </div>`;
                                } catch (err) {
                                    console.error('Error fetching user for post:', err);
                                }
                            }
                            contentBlock2.appendChild(contentBlock);
                        } else {
                            console.error('Error: contentBlock element not found');
                        }
                    } catch (error) {
                        console.error('Error fetching posts:', error);
                    }
                }
            }
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    }

    // Пользовательский раздел: получение и отрисовка пользователей в таблице
    async function fetchAndRenderUsers() {
        try {
            const res = await authFetch('/users');
            const users = await res.json();
            const userTableBody = document.getElementById('userTableBody');
            userTableBody.innerHTML = '';
            users.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>${user.role}</td>
                    <td>
                        <button class="edit-btn" onclick="editUser(${user.id})">Edit</button>
                        <button class="delete-btn" onclick="deleteUser(${user.id})">Delete</button>
                    </td>
                `;
                userTableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error rendering users:', error);
        }
    }

    // Функция загрузки раздела "Пользователи"
    function loadUsers(event) {
        event.preventDefault();
        console.log("clicked");
        postLink.classList.remove('active');
        profileLink.classList.remove('active');
        userLink.classList.add('active');
        const userTable = document.createElement('table');
        userTable.innerHTML = `
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody id="userTableBody"></tbody>
        `;
        contentBlock2.innerHTML = '';
        contentBlock2.appendChild(userTable);
        fetchAndRenderUsers();
    }

    // Функция редактирования пользователя
    async function editUser(userId) {
        const newUsername = prompt('Enter new username:');
        const newEmail = prompt('Enter new email:');
        const newRole = prompt('Enter new role:');
        if (newUsername !== null && newEmail !== null && newRole !== null) {
            try {
                const res = await authFetch(`/users/${userId}`, {
                    method: 'PUT',
                    body: JSON.stringify({ username: newUsername, email: newEmail, role: newRole })
                });
                if (!res.ok) {
                    throw new Error(`Error: ${res.status} - ${res.statusText}`);
                }
            } catch (error) {
                console.error('Error editing user:', error);
            }
        }
        fetchAndRenderUsers();
    }

    // Функция удаления пользователя
    async function deleteUser(userId) {
        try {
            const confirmDelete = confirm('Are you sure you want to delete this user?');
            if (confirmDelete) {
                const res = await authFetch(`/users/${userId}`, { method: 'DELETE' });
                if (res.ok) {
                    fetchAndRenderUsers();
                } else {
                    console.error(`Error deleting user with ID ${userId}`);
                }
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    }

    // Обработка открытия/закрытия бокового меню
    const menuBtn = document.querySelector(".menu-toggle-btn");
    const sidebar = document.querySelector("aside");
    const container = document.querySelector(".container");
    const closeBtn = document.getElementById('close-btn');

    closeBtn.addEventListener('click', function(event) {
        event.preventDefault();
        sidebar.style.display = "none";
    });

    menuBtn.addEventListener('click', function(event) {
        event.preventDefault();
        sidebar.style.display = "block";
    });

    // Глобально делаем функции редактирования и удаления пользователей и постов доступными
    window.editUser = editUser;
    window.deleteUser = deleteUser;
    window.deletePost = deletePost;

    // Если inline-обработчики для других функций (например, для лайков) нужны – добавьте их аналогично

})();

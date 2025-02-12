// home.js

// Обёртываем весь код в асинхронную функцию
(async function() {

    // Получаем ссылки на элементы страницы
    const postLink = document.getElementById('postLink');
    const usersLink = document.getElementById('usersLink');
    const friendsLink = document.getElementById('friendsLink');
    const profileName = document.getElementById('profileName');
    const profileLink = document.getElementById('profileLink');
    const contentBlock = document.getElementById('content');
    const addButton = document.getElementById('addLink');

    //
    // Функция для обновления access токена через refresh токен
    //
    async function refreshToken() {
        const refreshToken = localStorage.getItem('refreshToken');
        try {
            const res = await fetch('/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
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
    // Она добавляет access токен в заголовок запроса, а в случае 401/403
    // пытается обновить токен и повторяет запрос.
    //
    async function authFetch(url, options = {}) {
        let token = localStorage.getItem('accessToken');
        if (!options.headers) options.headers = {};
        // Если тело запроса не является FormData, выставляем Content-Type
        if (!options.headers['Content-Type'] && !(options.body instanceof FormData)) {
            options.headers['Content-Type'] = 'application/json';
        }
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }
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

    // При загрузке страницы пытаемся обновить токен (если это необходимо)
    await refreshToken();

    //
    // Примеры использования authFetch для всех защищённых запросов
    //

    // Получение имени пользователя для отображения
    try {
        const resGetUser = await authFetch('/getUserName');
        const userNameData = await resGetUser.json();
        const usernameDisplay = document.getElementById('usernameDisplay');
        usernameDisplay.innerText = `${userNameData.username}`;
    } catch (error) {
        console.error('Error fetching username:', error);
    }

    // Получение профиля пользователя
    try {
        const resProfile = await authFetch('/profile');
        const profileData = await resProfile.json();
        contentBlock.innerHTML = `<div class="user-content">
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

    //
    // Функция для обработки клика по пункту "Профиль"
    //
    async function profileLinkClick(event) {
        event.preventDefault();
        postLink.classList.remove('active');
        quizLink.classList.remove('active');
        usersLink.classList.remove('active');
        event.target.classList.add('active');
        try {
            const res = await authFetch('/profile');
            const user = await res.json();
            const dateUser = new Date(user.birthdate);
            const options = { day: 'numeric', month: 'short', year: 'numeric' };
            const formattedDate2 = dateUser.toLocaleString('en-US', options);
            contentBlock.innerHTML = `<div class="user-content">
                                        <div class="user-photo">
                                            <img src="materials/backrotate (2).gif">
                                        </div>
                                        <div class="user-info">
                                            <h2>${user.username}'s Profile</h2>
                                            <p>Email: ${user.email}</p>
                                            <p>Role: ${user.role}</p>
                                        </div>
                                      </div>
                                      <div class="update-content">
                                        <h2>Update information</h2>
                                        <div class="update-form">
                                            <div class="update-form-input">
                                                <label for="email">Email: <span>${user.email || ''}</span></label>
                                                <input type="email" id="newEmail" name="email" value="${user.email || ''}" placeholder="Enter new email">
                                            </div>
                                            <div class="update-form-input">
                                                <label for="datetime">Birth date: <span>${user.birthdate ? formattedDate2 : ''}</span></label>
                                                <input type="date" id="newBirthDate" name="datetime" value="${user.birthdate}" placeholder="Enter your birth date">
                                            </div>
                                            <div class="update-form-input">
                                                <label for="status">Status: <span>${user.status || ''}</span></label>
                                                <input type="text" id="newStatus" name="status" value="${user.status || ''}" placeholder="Your status">
                                            </div>
                                            <div class="update-form-input">
                                                <label for="city">City: <span>${user.city || ''}</span></label>
                                                <input type="text" id="newCity" name="city" value="${user.city || ''}"  placeholder="Your city">
                                            </div>
                                            <button id="updateInformationBtn">Save</button>
                                        </div>
                                      </div>`;
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
        
        // Получаем посты пользователя для отображения в профиле
        try {
            const resPosts = await authFetch('/post/userpost');
            const posts = await resPosts.json();
            const contentBlock2 = document.createElement('div');
            contentBlock2.classList.add('content-block');
            for (const post of posts) {
                const dateObject = new Date(post.date);
                const options = {
                    day: 'numeric', month: 'short', year: 'numeric',
                    hour: 'numeric', minute: 'numeric', second: 'numeric'
                };
                const formattedDate = dateObject.toLocaleString('en-US', options);
                try {
                    const resUser = await authFetch('/getUserName');
                    const userData = await resUser.json();
                    contentBlock2.innerHTML += `<div class="post-block">
                                                    <h3>${post.title}</h3>
                                                    <div class="white-line" style="background-color: white; height: 1px; width: 100%;"></div>
                                                    <p>${post.description}</p>
                                                    <p class="user-inform">${userData.username}</p>
                                                    <p class="user-inform">${formattedDate}</p>
                                                    <div class="post-btn-container">
                                                        <button class="edit-btn" onclick="editPost(${post.id})">Edit</button>
                                                        <button class="delete-btn" onclick="deletePost(${post.id})">Delete</button>
                                                    </div>
                                                </div>`;
                    contentBlock.appendChild(contentBlock2);
                } catch (err) {
                    console.error('Error fetching username:', err);
                }
            }
        } catch (err) {
            console.error('Error fetching user posts:', err);
        }
    }

    //
    // Обработчик клика для кнопки обновления информации пользователя
    //
    document.addEventListener('click', async function(event) {
        const target = event.target;
        if (target.matches("#updateInformationBtn")) {
            const newEmail = document.getElementById("newEmail").value;
            const newBirthDate = document.getElementById("newBirthDate").value;
            const newStatus = document.getElementById("newStatus").value;
            const newCity = document.getElementById("newCity").value;
            if (newEmail && newBirthDate && newStatus && newCity) {
                try {
                    const res = await authFetch('/user/updateinf', {
                        method: 'PUT',
                        body: JSON.stringify({
                            email: newEmail,
                            birthdate: newBirthDate,
                            status: newStatus,
                            city: newCity
                        })
                    });
                    if (!res.ok) {
                        throw new Error(`Error: ${res.status} - ${res.statusText}`);
                    }
                    alert('User updated successfully');
                    location.reload();
                } catch (error) {
                    console.error(error);
                }
            }
        }
    });

    //
    // Функция редактирования поста
    //
    async function editPost(postId) {
        const newTitle = prompt('Enter new title:');
        const newDescription = prompt('Enter new description:');
        if (newTitle !== null && newDescription !== null) {
            try {
                const res = await authFetch(`/post/posts/${postId}`, {
                    method: 'PUT',
                    body: JSON.stringify({ title: newTitle, description: newDescription })
                });
                if (!res.ok) {
                    throw new Error(`Error: ${res.status} - ${res.statusText}`);
                }
                console.log('Post updated successfully');
            } catch (error) {
                console.error(error);
            }
        }
    }

    //
    // Функция удаления поста
    //
    async function deletePost(postId) {
        try {
            const confirmDelete = confirm('Are you sure you want to delete this post?');
            if (confirmDelete) {
                const res = await authFetch(`/post/posts/${postId}`, { method: 'DELETE' });
                if (!res.ok) {
                    console.error(`Error deleting post with ID ${postId}`);
                }
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    //
    // Обработчик клика по пункту "Посты"
    //
    async function postLinkClick(event) {
        event.preventDefault();
        profileLink.classList.remove('active');
        event.target.classList.add('active');
        try {
            const res = await authFetch('/post/posts');
            const posts = await res.json();
            if (contentBlock) {
                contentBlock.innerHTML = '';
                const contentBlock2 = document.createElement('div');
                contentBlock2.classList.add('content-block');
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
                        try {
                            const resLike = await authFetch(`/post/like/number/${post.id}`);
                            const data = await resLike.json();
                            contentBlock2.innerHTML += `<div class="post-block">
                                                            <h3>${post.title}</h3>
                                                            <div class="white-line" style="background-color: white; height: 1px; width: 100%;"></div>
                                                            <p>${post.description}</p>
                                                            <p class="user-inform">${user.username}</p>
                                                            <p class="user-inform">${formattedDate}</p>
                                                            <button id="likeButton" onclick="likePost(${post.id}, this)" class="likeButton">${data.likeNumber} Likes</button>
                                                        </div>`;
                            contentBlock.appendChild(contentBlock2);
                            const likeButton = document.getElementById('likeButton');
                            const isButtonActive = localStorage.getItem(`active_${userID}`);
                            if (isButtonActive) {
                                likeButton.classList.add('liked');
                            } else {
                                likeButton.classList.remove('liked');
                            }
                        } catch (err) {
                            console.error('Error fetching like number:', err);
                        }
                    } catch (err) {
                        console.error('Error fetching user:', err);
                    }
                }
            } else {
                console.error('Error: contentBlock element not found');
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    }

    //
    // Функция для получения идентификатора пользователя
    //
    async function getUserId() {
        try {
            const res = await authFetch('/profile');
            const user = await res.json();
            return user.id;
        } catch (error) {
            console.error('Error getting user ID:', error);
        }
    }

    // Получаем идентификатор пользователя
    const userID = await getUserId();

    //
    // Функция для работы с лайками
    //
    async function likePost(postId, likeButton) {
        try {
            const resExist = await authFetch(`/post/like/exist/${postId}`);
            const data = await resExist.json();
            const isLiked = data;
            if (isLiked) {
                const resDel = await authFetch(`/post/like/${postId}`, { method: 'DELETE' });
                const delData = await resDel.json();
                console.log(delData);
                likeButton.classList.remove("liked");
            } else {
                const resPut = await authFetch(`/post/like/${postId}`, { method: 'PUT' });
                const putData = await resPut.json();
                console.log(putData);
            }
        } catch (error) {
            console.error('Error in likePost:', error);
        }
    }

    //
    // Обработчик клика по пункту "Пользователи"
    //
    async function usersLinkClick(event) {
        event.preventDefault();
        profileLink.classList.remove('active');
        postLink.classList.remove('active');
        quizLink.classList.remove('active');
        event.target.classList.add('active');
        contentBlock.innerHTML = '';
        try {
            const resUsers = await authFetch('/usersexcept');
            const users = await resUsers.json();
            const userListFollow = document.createElement("div");
            userListFollow.classList.add("users-block");
            const LoggedId = await getUserId();
            for (const user of users) {
                try {
                    const resFollow = await authFetch(`/follows/${user.id}/${LoggedId}`);
                    const data = await resFollow.json();
                    const isFollowing = data;
                    userListFollow.innerHTML += `
                        <div class="users-block-div">
                            <span class="username">${user.username}</span>
                            <button class="follow-button" data-userid="${user.id}" onclick="handleFollowButtonClick('${user.id}', '${LoggedId}')">
                            ${isFollowing ? 'Unfollow' : 'Follow'}
                            </button>
                        </div>
                    `;
                    contentBlock.appendChild(userListFollow);
                } catch (err) {
                    console.error(err);
                }
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }

    //
    // Обработчик клика для кнопки "Follow/Unfollow"
    //
    function handleFollowButtonClick(followerId, followeeId) {
        const followButton = document.querySelector(".follow-button");
        authFetch(`/follows/${followerId}/${followeeId}`)
            .then(response => response.json())
            .then(data => {
                const isFollowing = data;
                if (isFollowing) {
                    unfollowUser(followerId)
                        .then(() => {
                            followButton.innerText = 'Follow';
                        })
                        .catch(error => {
                            console.error('Error unfollowing user:', error);
                        });
                } else {
                    followUser(followerId)
                        .then(() => {
                            followButton.innerText = 'Unfollow';
                        })
                        .catch(error => {
                            console.error('Error following user:', error);
                        });
                }
            })
            .catch(error => console.error(error));
    }

    //
    // Функция для подписки
    //
    function followUser(followeeId) {
        return authFetch('/follows/follow', {
            method: 'POST',
            body: JSON.stringify({ followeeId: followeeId })
        }).then(response => response.json());
    }

    //
    // Функция для отписки
    //
    function unfollowUser(followeeId) {
        return authFetch('/follows/unfollow', {
            method: 'POST',
            body: JSON.stringify({ followeeId: followeeId })
        }).then(response => response.json());
    }

    //
    // Функция для добавления нового поста
    //
    function addLinkClick(event) {
        event.preventDefault();
        const newTitle = prompt("Enter title: ");
        const newDescription = prompt("Enter description: ");
        if (newTitle !== null && newDescription !== null) {
            authFetch("/post/addpost", {
                method: 'POST',
                body: JSON.stringify({ title: newTitle, description: newDescription })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error: ${response.status} - ${response.statusText}`);
                }
            })
            .then(newPost => {
                console.log('Post added successfully:', newPost);
            })
            .catch(error => console.error('Error adding post:', error));
        }
    }

    async function loadQuiz() {
        try {
            const res = await authFetch('/quiz');
            const questions = await res.json();
            renderQuiz(questions);
        } catch (error) {
            console.error("Error loading quiz:", error);
        }
    }

    //
    // Функция отрисовки квиза внутри contentBlock
    //
    function renderQuiz(questions) {
        contentBlock.innerHTML = "";
        const quizContainer = document.createElement("div");
        quizContainer.classList.add("quiz-block");
        let html = `<h1>Quiz</h1>`;
        questions.forEach(question => {
            // Если options хранится как JSON-строка, парсим её
            let opts = question.options;
            if (typeof opts === 'string') {
                try {
                    opts = JSON.parse(opts);
                } catch(e) {
                    console.error("Error parsing options:", e);
                }
            }
            html += `<div class="quiz-question">
                        <h3>${question.question}</h3>`;
            opts.forEach((option, index) => {
                html += `<label>
                            <input type="radio" name="question-${question.id}" value="${index}">
                            ${option}
                         </label>`;
            });
            html += `</div>`;
        });
        html += `<button id="submitQuiz">Submit Quiz</button>
                 <div id="quizResult"></div>`;
        quizContainer.innerHTML = html;
        contentBlock.appendChild(quizContainer);
        document.getElementById('submitQuiz').addEventListener('click', submitQuiz);
    }

    //
    // Функция отправки ответов квиза
    //
    async function submitQuiz() {
        const quizQuestions = document.querySelectorAll('.quiz-question');
        const answers = [];
        quizQuestions.forEach(qDiv => {
            const radios = qDiv.querySelectorAll('input[type="radio"]');
            if (radios.length > 0) {
                const qName = radios[0].name;
                const questionId = parseInt(qName.split('-')[1]);
                let selected = null;
                radios.forEach(radio => {
                    if (radio.checked) {
                        selected = parseInt(radio.value);
                    }
                });
                answers.push({ questionId, answer: selected });
            }
        });
        try {
            const res = await authFetch('/quiz/submit', {
                method: 'POST',
                body: JSON.stringify({ answers })
            });
            const result = await res.json();
            document.getElementById('quizResult').innerHTML = `<h2>Your score: ${result.score} out of ${result.total}</h2>`;
        } catch (error) {
            console.error("Error submitting quiz:", error);
        }
    }

    const quizLink = document.getElementById('quizLink');
    if (quizLink) {
        quizLink.addEventListener('click', function(event) {
            event.preventDefault();
            // Убираем active с других вкладок
            profileLink.classList.remove('active');
            postLink.classList.remove('active');
            usersLink && usersLink.classList.remove('active');
            quizLink.classList.add('active');
            loadQuiz();
        });
    }

    //
    // Привязываем обработчики событий
    //
    addButton.addEventListener('click', addLinkClick);
    profileName.addEventListener('click', profileLinkClick);
    profileLink.addEventListener('click', profileLinkClick);
    postLink.addEventListener('click', postLinkClick);
    usersLink.addEventListener('click', usersLinkClick);

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

    window.editPost = editPost;
    window.deletePost = deletePost;
    window.likePost = likePost;
    window.handleFollowButtonClick = handleFollowButtonClick;
})(); // конец IIFE



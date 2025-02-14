// admin.js

// Оборачиваем весь код в асинхронную IIFE для использования await и сохранения приватных переменных
(async function() {
    // Получаем ссылки на элементы страницы
    const userLink = document.getElementById('userLink');
    const profileLink = document.getElementById('profileLink');
    const postLink = document.getElementById('postLink');
    const manageLecturesBtn = document.getElementById('manageLecturesBtn');
    const manageQuizzesBtn = document.getElementById('manageQuizzesBtn');
    const profileName = document.getElementById('profileName');
    const contentBlock2 = document.getElementById('content'); // основной контейнер для вывода контента

    if (manageLecturesBtn) {
        manageLecturesBtn.addEventListener('click', loadLecturesAdmin);
    }
    if (manageQuizzesBtn) {
        manageQuizzesBtn.addEventListener('click', loadLecturesForQuizzes);
    }

    async function loadLecturesForQuizzes(e) {
        userLink.classList.remove("active")
        profileLink.classList.remove("active")
        postLink.classList.remove("active")
        manageLecturesBtn.classList.remove("active")
        manageQuizzesBtn.classList.add("active")
        if (e) e.preventDefault();
        try {
            const res = await authFetch('/lectures');
            if (!res.ok) {
                throw new Error(`Error: ${res.status}`);
            }
            const lectures = await res.json();
            renderLecturesForQuizzes(lectures);
        } catch (error) {
            console.error('Error loading lectures for quizzes:', error);
        }
    }

    function renderLecturesForQuizzes(lectures) {
        contentBlock2.innerHTML = '';
        const lectureBlock = document.createElement('div')
        lectureBlock.classList.add("lecture-block-container")
        lectureBlock.innerHTML = `
            <h2 style="margin-top:20px">Manage Quizzes (Select Lecture)</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Quizzes</th>
                    </tr>
                </thead>
                <tbody id="quizLecturesTableBody"></tbody>
            </table>
        `;
        contentBlock2.appendChild(lectureBlock)
        const body = document.getElementById('quizLecturesTableBody');
        lectures.forEach(lecture => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${lecture.id}</td>
                <td>${lecture.title}</td>
                <td>
                    <button class="create-btn" style="padding:5px; border:1px solid white;" onclick="manageQuizzesForLecture(${lecture.id})">Manage Quizzes</button>
                </td>
            `;
            body.appendChild(row);
        });
        contentBlock2.appendChild(lectureBlock)
    }

    window.manageQuizzesForLecture = async function(lectureId) {
        try {
            const res = await authFetch(`/admin/lectures/${lectureId}/quizzes`);
            if (!res.ok) {
                throw new Error(`Error: ${res.status}`);
            }
            const quizzes = await res.json();
            renderQuizzesAdmin(lectureId, quizzes);
        } catch (error) {
            console.error('Error fetching quizzes:', error);
        }
    }

    function renderQuizzesAdmin(lectureId, quizzes) {
        contentBlock2.innerHTML = '';
        console.log(quizzes)
        const lectureBlock = document.createElement('div')
        lectureBlock.classList.add("lecture-block-container")
        lectureBlock.innerHTML = `
            <h2 style="margin:20px 0">Manage Quizzes for Lecture #${lectureId}</h2>
            <button class="create-btn"  id="createQuizBtn">Create New Quiz</button>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Quiz</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="quizzesTableBody"></tbody>
            </table>
            <button class="create-btn" id="backLectureQuizzez">Back to Lectures</button>
        `;
        contentBlock2.appendChild(lectureBlock)
        const body = document.getElementById('quizzesTableBody');
        
        quizzes.forEach(q => {
            body.innerHTML += `
                <tr>
                    <td>${q.id}</td>
                    <td>${q.title}</td>
                    <td>
                        <button class="edit-btn"  onclick="editQuiz(${q.id})">Edit</button>
                        <button class="delete-btn"  onclick="deleteQuiz(${q.id}, ${lectureId})">Delete</button>
                        <button class="manage-btn" style="border: 1px solid blue;" onclick="manageQuestions(${q.id})">Manage Questions</button>
                    </td>
                </tr>
            `;
        });
        document.getElementById('createQuizBtn').addEventListener('click', () => showCreateQuizForm(lectureId));
        document.getElementById('backLectureQuizzez').addEventListener('click', () => loadLecturesForQuizzes());
    }

    window.manageQuestions = async function(quizId) {
        try {
            const res = await authFetch(`/quizzes/${quizId}/questions`);
            if (!res.ok) {
                throw new Error(`Error: ${res.status}`);
            }
            const questions = await res.json();
            renderQuestions(quizId, questions);
        } catch (error) {
            console.error('Error fetching quiz questions:', error);
        }
    };

    function renderQuestions(quizId, questions) {
        contentBlock2.innerHTML = `
        <div class="lecture-block-container">
            <h2 style="margin:20px 0">Manage Questions for Quiz #${quizId}</h2>
            <button class="create-btn" id="createQuestionBtn">Create New Question</button>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Question</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="questionsTableBody"></tbody>
            </table>
        </div>
        `;
        const body = document.getElementById('questionsTableBody');
        questions.forEach(q => {
            body.innerHTML += `
                <tr>
                    <td>${q.id}</td>
                    <td>${q.question}</td>
                    <td>
                        <button class="edit-btn" onclick="editQuestion(${quizId}, ${q.id})">Edit</button>
                        <button class="delete-btn" onclick="deleteQuestion(${quizId}, ${q.id})">Delete</button>
                    </td>
                </tr>
            `;
        });

        document.getElementById('createQuestionBtn').addEventListener('click', () => showCreateQuestionForm(quizId));
    }

    function showCreateQuestionForm(quizId) {
        contentBlock2.innerHTML = `
        <div class="lecture-create-container">
            <h2>Create Question for Quiz #${quizId}</h2>
            <div style="display: flex; flex-direction: column">
                <label>Question:</label>
                <input type="text" id="newQQuestion" placeholder="Enter question text">
            </div>
            <div id="optionsContainer">
                <label>Options:</label>
                <div>
                    <input type="text" class="option-input" placeholder="Option #1">
                </div>
            </div>
            <button class="create-btn" id="addOptionBtn">Add Option</button>
            <div>
                <label>Correct Option Index:</label>
                <input type="number" id="newQCorrect" value="0" min="0">
            </div>
            <div style="width:100%; display: flex; gap: 10px; flex-direction: row; margin-top: 20px;">
                <button class="edit-btn" style="width:50%"  id="saveQuestionBtn">Save</button>
                <button class="delete-btn" style="width:50%" id="cancelQuestionBtn">Cancel</button>
            </div>
            </div>
        `;

        // Добавляем логику добавления вариантов
        document.getElementById('addOptionBtn').addEventListener('click', () => {
            const container = document.getElementById('optionsContainer');
            const row = document.createElement('div');
            row.innerHTML = `<input type="text" class="option-input" placeholder="Next option">`;
            container.appendChild(row);
        });

        document.getElementById('saveQuestionBtn').addEventListener('click', async () => {
            const question = document.getElementById('newQQuestion').value;
            const correct_option = parseInt(document.getElementById('newQCorrect').value, 10);
            const options = Array.from(document.querySelectorAll('.option-input')).map(i => i.value).filter(o => o.trim() !== '');
            if (!question || options.length === 0 || correct_option < 0 || correct_option >= options.length) {
                alert('Fill all fields properly');
                return;
            }
            try {
                // POST /admin/quizzes/:quizId/questions
                const res = await authFetch(`/admin/quizzes/${quizId}/questions`, {
                    method: 'POST',
                    body: JSON.stringify({ question, options, correct_option })
                });
                if (!res.ok) {
                    throw new Error(`Error: ${res.status}`);
                }
                manageQuestions(quizId);
            } catch (error) {
                console.error('Error creating question:', error);
            }
        });
        document.getElementById('cancelQuestionBtn').addEventListener('click', () => manageQuestions(quizId));
    }

    window.editQuestion = async function(quizId, questionId) {
        try {
            // GET /admin/quizzes/:quizId/questions/:questionId
            const res = await authFetch(`/admin/quizzes/${quizId}/questions/${questionId}`);
            if (!res.ok) {
                throw new Error(`Error: ${res.status}`);
            }
            const questionRow = await res.json();
            contentBlock2.innerHTML = `
            <div class="lecture-create-container">
                <h2 style="margin-top:20px">Edit Question #${questionRow.id} for Quiz #${quizId}</h2>
                <div style="display: flex; flex-direction: column">
                    <label>Question:</label>
                    <input type="text" id="editQQuestion" value="${questionRow.question}">
                </div>
                <div id="optionsContainer">
                    <label>Options:</label>
                </div>
                <button class="create-btn" id="addOptionBtn">Add Option</button>
                <div>
                    <label>Correct Option Index:</label>
                    <input type="number" id="editQCorrect" value="${questionRow.correct_option}" min="0">
                </div>
                <div style="width:100%; display: flex; gap: 10px; flex-direction: row; margin-top: 20px;">
                <button class="edit-btn" style="width:50%" id="updateQuestionBtn">Update</button>
                <button class="delete-btn" style="width:50%" id="cancelEditQuestionBtn">Cancel</button>
                </div>
                </div>
            `;
            // Рендерим имеющиеся варианты
            const container = document.getElementById('optionsContainer');
            let opts = typeof questionRow.options === 'string' ? JSON.parse(questionRow.options) : questionRow.options;
            opts.forEach((opt) => {
                const row = document.createElement('div');
                row.innerHTML = `<input type="text" class="option-input" value="${opt}">`;
                container.appendChild(row);
            });
            // Кнопка добавить вариант
            document.getElementById('addOptionBtn').addEventListener('click', () => {
                const row = document.createElement('div');
                row.innerHTML = `<input type="text" class="option-input" placeholder="New option">`;
                container.appendChild(row);
            });
            // Обновить вопрос
            document.getElementById('updateQuestionBtn').addEventListener('click', async () => {
                const newQuestion = document.getElementById('editQQuestion').value;
                const newCorrect = parseInt(document.getElementById('editQCorrect').value, 10);
                const optionValues = Array.from(document.querySelectorAll('.option-input'))
                                          .map(i => i.value)
                                          .filter(o => o.trim() !== '');
                if (!newQuestion || optionValues.length === 0 || newCorrect < 0 || newCorrect >= optionValues.length) {
                    alert('Fill all fields properly');
                    return;
                }
                try {
                    // PUT /admin/quizzes/:quizId/questions/:questionId
                    const updateRes = await authFetch(`/admin/quizzes/${quizId}/questions/${questionId}`, {
                        method: 'PUT',
                        body: JSON.stringify({
                            question: newQuestion,
                            options: optionValues,
                            correct_option: newCorrect
                        })
                    });
                    if (!updateRes.ok) {
                        throw new Error(`Error: ${updateRes.status}`);
                    }
                    manageQuestions(quizId);
                } catch (error) {
                    console.error('Error updating question:', error);
                }
            });
            // Cancel
            document.getElementById('cancelEditQuestionBtn').addEventListener('click', () => manageQuestions(quizId));
        } catch (error) {
            console.error('Error editing question:', error);
        }
    };

    window.deleteQuestion = async function(quizId, questionId) {
        const confirmDelete = confirm('Are you sure you want to delete this question?');
        if (confirmDelete) {
            try {
                // DELETE /admin/quizzes/:quizId/questions/:questionId
                const res = await authFetch(`/admin/quizzes/${quizId}/questions/${questionId}`, {
                    method: 'DELETE'
                });
                if (!res.ok) {
                    throw new Error(`Error: ${res.status}`);
                }
                manageQuestions(quizId);
            } catch (error) {
                console.error('Error deleting question:', error);
            }
        }
    };

    function showCreateQuizForm(lectureId) {
        contentBlock2.innerHTML = `
        <div class="lecture-create-container">
            <h2 style="margin-top:20px">Create Quiz for Lecture #${lectureId}</h2>
            <div style="display: flex; flex-direction: column">
                <label>Title:</label>
                <input type="text" id="newQuizTitle" placeholder="Quiz title">
            </div>
            <div style="width:100%; display: flex; gap: 10px; flex-direction: row; margin-top: 20px;">
                    <button class="edit-btn" style="width:50%" id="saveQuizBtn">Save</button>
                    <button class="delete-btn" style="width:50%" id="cancelQuizBtn">Cancel</button>
                </div>
            </div>
        `;

        document.getElementById('saveQuizBtn').addEventListener('click', async () => {
            const title = document.getElementById('newQuizTitle').value;
            if (!title) {
                alert("Enter quiz title");
                return;
            }
            try {
                // POST /admin/lectures/:lectureId/quizzes
                const res = await authFetch(`/admin/lectures/${lectureId}/quizzes`, {
                    method: 'POST',
                    body: JSON.stringify({ title })
                });
                if (!res.ok) {
                    throw new Error(`Error: ${res.status}`);
                }
                manageQuizzesForLecture(lectureId);
            } catch (error) {
                console.error('Error creating quiz:', error);
            }
        });
        document.getElementById('cancelQuizBtn').addEventListener('click', () => manageQuizzesForLecture(lectureId));
    }

    
    window.editQuiz = async function (quizId) {
        try {
            const res = await authFetch(`/admin/quizzes/${quizId}`);
            if (!res.ok) {
                throw new Error(`Error: ${res.status} - ${res.statusText}`);
            }
            const quiz = await res.json();
    
            // Очищаем контейнер и создаем форму редактирования
            contentBlock2.innerHTML = `
                <div class="lecture-create-container">
                    <h2>Edit Quiz #${quiz.id}</h2>
                    <div  style="display: flex; flex-direction: column">
                        <label>Title:</label>
                        <input type="text" id="editQuizTitle" value="${quiz.title}">
                    </div>
                    <div style="width:100%; display: flex; gap: 10px; flex-direction: row; margin-top: 20px;">
                        <button id="updateQuizBtn" class="edit-btn" style="width:50%">Update</button>
                        <button id="cancelEditQuizBtn" class="delete-btn" style="width:50%">Cancel</button>
                    </div>
                </div>
            `;
    
            // Контейнер для вариантов ответов
            document.getElementById('updateQuizBtn').addEventListener('click', async () => {
                const newTitle = document.getElementById('editQuizTitle').value;
                try {
                    // PUT /admin/quizzes/:quizId
                    const updateRes = await authFetch(`/admin/quizzes/${quizId}`, {
                        method: 'PUT',
                        body: JSON.stringify({ title: newTitle })
                    });
                    if (!updateRes.ok) {
                        throw new Error(`Error: ${updateRes.status}`);
                    }
                    // Возвращаемся к списку квизов
                    manageQuizzesForLecture(quiz.lecture_id);
                } catch (error) {
                    console.error('Error updating quiz:', error);
                }
            });
            document.getElementById('cancelEditQuizBtn').addEventListener('click', () => manageQuizzesForLecture(quiz.lecture_id));
        } catch (error) {
            console.error('Error editing quiz:', error);
        }
    };

    window.deleteQuiz = async function(quizId, lectureId) {
        const confirmDelete = confirm('Are you sure you want to delete this quiz?');
        if (confirmDelete) {
            try {
                const res = await authFetch(`/admin/quizzes/${quizId}`, { method: 'DELETE' });
                if (!res.ok) {
                    throw new Error(`Error: ${res.status}`);
                }
                manageQuizzesForLecture(lectureId);
            } catch (error) {
                console.error('Error deleting quiz:', error);
            }
        }
    }


    async function loadLecturesAdmin(event) {
        userLink.classList.remove("active")
        profileLink.classList.remove("active")
        postLink.classList.remove("active")
        manageQuizzesBtn.classList.remove("active")
        manageLecturesBtn.classList.add("active")
        if (event) event.preventDefault();
        try {
            const res = await authFetch('/lectures'); // GET /admin/lectures
            if (!res.ok) {
                throw new Error(`Error: ${res.status}`);
            }
            const lectures = await res.json();
            renderLecturesAdmin(lectures);
        } catch (error) {
            console.error('Error loading lectures for admin:', error);
        }
    }

    function renderLecturesAdmin(lectures) {
        contentBlock2.innerHTML = '';
        const lectureBlock = document.createElement('div')
        lectureBlock.classList.add("lecture-block-container")
        lectureBlock.innerHTML = `
            <h2 style="margin:20px 0">Manage Lectures</h2>
            <button id="createLectureBtn" class="create-btn">Create New Lecture</button>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Decription</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="lecturesTableBody"></tbody>
            </table>
        `;
        contentBlock2.appendChild(lectureBlock)
        const body = document.getElementById('lecturesTableBody');
        lectures.forEach(lecture => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${lecture.id}</td>
                <td>${lecture.title}</td>
                <td>${lecture.description}</td>
                <td>
                    <button class="edit-btn" onclick="editLecture(${lecture.id})">Edit</button>
                    <button class="delete-btn" onclick="deleteLecture(${lecture.id})">Delete</button>
                </td>
            `;
            body.appendChild(row);
        });
        contentBlock2.appendChild(lectureBlock)
        document.getElementById('createLectureBtn').addEventListener('click', showCreateLectureForm);
        
    }

    async function showCreateLectureForm() {
        contentBlock2.innerHTML = '';
        const lectureBlock = document.createElement('div')
        lectureBlock.classList.add("lecture-block-container")
        lectureBlock.innerHTML = `
        <div class="lecture-create-container">
            <h3>Create Lecture</h3>
            <div style="display:flex; flex-direction:column;">
                <label>Title: </label><input type="text" id="newTitle">
            </div>
            <div style="display:flex; flex-direction:column;">
                <label>Description: </label><textarea id="newDesc"></textarea>
            </div>
            <div style="display:flex; flex-direction:column;">
                <label>Content: </label><textarea id="newContent"></textarea>
            </div>
            <div style="display:flex; flex-direction:column;">
                <label>Video URL: </label><input type="text" id="newVideoUrl">
            </div>
            <div style="display:flex; flex-direction:row; margin-top:20px; width:100%; gap: 10px">
                <button class="edit-btn" style="width: 50%" id="saveLectureBtn"">Save</button>
                <button class="delete-btn" style="width: 50%" id="cancelLectureBtn">Cancel</button>
            </div>
        </div>
        `;

        contentBlock2.appendChild(lectureBlock)
        document.getElementById('saveLectureBtn').addEventListener('click', createLecture);
        document.getElementById('cancelLectureBtn').addEventListener('click', loadLecturesAdmin);
        
    }

    async function createLecture() {
        const title = document.getElementById('newTitle').value;
        const description = document.getElementById('newDesc').value;
        const content = document.getElementById('newContent').value;
        const video_url = document.getElementById('newVideoUrl').value;
        try {
            const res = await authFetch('/admin/lectures', {
                method: 'POST',
                body: JSON.stringify({ title, description, content, video_url })
            });
            if (!res.ok) {
                throw new Error(`Error: ${res.status} - ${res.statusText}`);
            }
            await loadLecturesAdmin();
        } catch (error) {
            console.error('Error creating lecture:', error);
        }
    }

    window.editLecture = async function(lectureId) {
        try {
            const res = await authFetch(`/lectures/${lectureId}`);
            if (!res.ok) {
                throw new Error(`Error: ${res.status} - ${res.statusText}`);
            }
            const lecture = await res.json();
            contentBlock2.innerHTML = '';
            const lectureBlock = document.createElement('div')
            lectureBlock.classList.add("lecture-block-container")
            lectureBlock.innerHTML = `
            <div class="lecture-create-container">
                <h2>Edit Lecture #${lecture.id}</h2>
                <div style="display: flex; flex-direction: column">
                    <label>Title: </label>
                    <input type="text" id="editTitle" value="${lecture.title}">
                </div>
                <div style="display: flex; flex-direction: column">
                    <label>Description: </label>
                    <textarea id="editDesc">${lecture.description || ''}</textarea>
                </div>
                <div style="display: flex; flex-direction: column">
                    <label>Content: </label>
                    <textarea id="editContent">${lecture.content || ''}</textarea>
                </div>
                <div style="display: flex; flex-direction: column">
                    <label>Video URL: </label>
                    <input type="text" id="editVideoUrl" value="${lecture.video_url || ''}">
                </div>
                <div style="display:flex; flex-direction:row; margin-top:20px; width:100%; gap: 10px">
                <button class="edit-btn" style="width: 50%"  id="updateLectureBtn">Update</button>
                <button class="delete-btn" style="width: 50%"  id="cancelEditBtn">Cancel</button>
                </div>
            </div>
            `;
            contentBlock2.appendChild(lectureBlock);
            document.getElementById('updateLectureBtn').addEventListener('click', async () => {
                const newTitle   = document.getElementById('editTitle').value;
                const newDesc    = document.getElementById('editDesc').value;
                const newContent = document.getElementById('editContent').value;
                const newVideo   = document.getElementById('editVideoUrl').value;
                try {
                    const updateRes = await authFetch(`/admin/lectures/${lectureId}`, {
                        method: 'PUT',
                        body: JSON.stringify({ title: newTitle, description: newDesc, content: newContent, video_url: newVideo })
                    });
                    if (!updateRes.ok) {
                        throw new Error(`Error: ${updateRes.status} - ${updateRes.statusText}`);
                    }
                    await loadLecturesAdmin();
                } catch (error) {
                    console.error('Error updating lecture:', error);
                }
            });
            document.getElementById('cancelEditBtn').addEventListener('click', loadLecturesAdmin);
        } catch (error) {
            console.error('Error editing lecture:', error);
        }
    }

    window.deleteLecture = async function(lectureId) {
        const confirmDelete = confirm('Are you sure you want to delete this lecture?');
        if (confirmDelete) {
            try {
                const res = await authFetch(`/admin/lectures/${lectureId}`, { method: 'DELETE' });
                if (!res.ok) {
                    throw new Error(`Error: ${res.status} - ${res.statusText}`);
                }
                await loadLecturesAdmin();
            } catch (error) {
                console.error('Error deleting lecture:', error);
            }
        }
    }

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
    
        // Устанавливаем Content-Type, если тело запроса не является FormData
        if (!options.headers['Content-Type'] && !(options.body instanceof FormData)) {
            options.headers['Content-Type'] = 'application/json';
        }
    
        // Добавляем токен в заголовок Authorization, если он существует
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }
    
        let response = await fetch(url, options);
    
        // Если статус 401 или 403, пытаемся обновить токен
        if (response.status === 401 || response.status === 403) {
            try {
                const newToken = await refreshToken();
    
                // Если токен успешно обновлен, повторяем запрос
                if (newToken) {
                    options.headers['Authorization'] = `Bearer ${newToken}`;
                    response = await fetch(url, options);
                } else {
                    // Если обновление токена не удалось, перенаправляем на страницу логина
                    clearAuthData();
                    window.location.href = '/login';
                    return null; // Прерываем выполнение
                }
            } catch (error) {
                console.error("Failed to refresh token:", error);
                clearAuthData();
                window.location.href = '/login';
                return null; // Прерываем выполнение
            }
        }
    
        // Проверяем, что ответ успешный
        if (!response.ok) {
            const errorMessage = `HTTP error! Status: ${response.status}`;
            console.error(errorMessage);
            throw new Error(errorMessage);
        }
    
        return response;
    }
    
    // Вспомогательная функция для очистки данных аутентификации
    function clearAuthData() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    }


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
        userLink.classList.remove('active');
        manageLecturesBtn.classList.remove("active")
        manageQuizzesBtn.classList.remove("active")
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
        userLink.classList.remove('active');
        manageLecturesBtn.classList.remove("active")
        manageQuizzesBtn.classList.remove("active")
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
        manageLecturesBtn.classList.remove("active")
        manageQuizzesBtn.classList.remove("active")
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

document.addEventListener('DOMContentLoaded', async () => {
    // Получаем элементы навигации и контейнеры
    const lessonsBtn = document.getElementById('btn_lsns');
    const tasksBtn = document.getElementById('btn_tsks');
    const lessonsContainer = document.getElementById('lessons-container');
    const loadingIndicator = document.getElementById('loading-indicator');
    const errorMessage = document.getElementById('error-message');
    const logoutBtn = document.getElementById('logout-btn');

    // Проверяем существование элементов
    if (!lessonsBtn || !tasksBtn || !lessonsContainer || !loadingIndicator || !errorMessage) {
        console.error('Required elements not found');
        return;
    }

    // Функция для отображения сообщения об ошибке
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        loadingIndicator.style.display = 'none';
    }

    // Функция для скрытия сообщения об ошибке
    function hideError() {
        errorMessage.style.display = 'none';
    }

    // Функция для отображения индикатора загрузки
    function showLoading() {
        loadingIndicator.style.display = 'block';
        hideError();
    }

    // Функция для скрытия индикатора загрузки
    function hideLoading() {
        loadingIndicator.style.display = 'none';
    }

    // Загружаем данные студента и его уроки
    async function loadStudentData() {
        showLoading();
        try {
            // Получаем информацию о текущем пользователе
            const currentUserResponse = await fetch('/api/v0/auth/current', {
                credentials: 'include'
            });

            if (!currentUserResponse.ok) {
                throw new Error(`HTTP error! status: ${currentUserResponse.status}`);
            }

            const currentUserData = await currentUserResponse.json();
            
            if (!currentUserData.result || !currentUserData.result.id) {
                throw new Error('Не удалось получить информацию о пользователе');
            }

            const studentId = currentUserData.result.id;

            // Получаем уроки студента
            const lessonsResponse = await fetch(`/api/v0/lessons/student/${studentId}`, {
                credentials: 'include'
            });

            if (!lessonsResponse.ok) {
                throw new Error(`HTTP error! status: ${lessonsResponse.status}`);
            }

            const lessonsData = await lessonsResponse.json();
            const lessons = lessonsData.result || [];

            hideLoading();
            lessonsContainer.innerHTML = '';

            if (lessons.length === 0) {
                const noLessonsDiv = document.createElement('div');
                noLessonsDiv.className = 'col-12';
                const noLessonsText = document.createElement('p');
                noLessonsText.className = 'text-center';
                noLessonsText.textContent = 'У вас пока нет доступных уроков';
                noLessonsDiv.appendChild(noLessonsText);
                lessonsContainer.appendChild(noLessonsDiv);
                return;
            }
            await displayLessons(lessons);
        } catch (error) {
            console.error('Error loading student data:', error);
            showError('Ошибка при загрузке данных');
        }
         // Добавляем обработчики событий
    lessonsBtn.addEventListener('click', () => {
        window.location.href = 'student_main_page.html';
    });

    tasksBtn.addEventListener('click', () => {
        window.location.href = 'student_tasks_page.html';
    });

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            if (confirm('Вы действительно хотите выйти?')) {
                try {
                    await fetch('/api/v0/auth/logout', { method: 'POST', credentials: 'include' });
                } catch (e) {}
                window.location.href = 'login.html';
            }
        });
    }
    }

    // Функция для получения цвета статуса
    function getStatusColor(status) {
        switch (status) {
            case 'completed':
                return 'rgb(0, 255, 0)'; // Зеленый
            case 'in_progress':
                return 'rgb(255, 255, 0)'; // Желтый
            default:
                return 'rgb(255, 0, 0)'; // Красный
        }
    }


   

    // Загружаем данные при загрузке страницы
    loadStudentData();
});

async function displayLessons(lessons) {
    function startLesson(lessonId) {
        window.location.href = 'student_lesson_n_page.html?id=' + lessonId;
    }
    const container = document.getElementById('lessons-container');
    if (!container) {
        console.error('Container element not found');
        return;
    }

    // Очищаем контейнер
    container.innerHTML = '';

    if (lessons && lessons.length > 0) {
        for (const lesson of lessons) {
            // Получаем статус урока
            let statusData;
            try {
                const statusResponse = await fetch(`/api/v0/lessons/lesson/${lesson.id}/status`, {
                    credentials: 'include'
                });
                if (!statusResponse.ok) {
                    throw new Error('Ошибка при загрузке статуса урока');
                }
                statusData = await statusResponse.json();
            } catch (error) {
                console.error('Ошибка при загрузке статуса урока:', error);
                statusData = { status: 'not-started', message: 'Не удалось загрузить статус' };
            }

            // Создаем карточку урока
            const lessonCard = document.createElement('div');
            lessonCard.className = 'lesson-card';
            
            // Создаем заголовок карточки
            const lessonHeader = document.createElement('div');
            lessonHeader.className = 'lesson-header';
            
            // Создаем заголовок урока
            const lessonTitle = document.createElement('h3');
            lessonTitle.className = 'lesson-title';
            lessonTitle.textContent = lesson.title || `Урок ${lesson.id}`
            
            // Создаем контейнер для кнопок
            const lessonActions = document.createElement('div');
            lessonActions.className = 'lesson-actions';
            
            // Создаем кнопки
            const startLessonBtn = document.createElement('button');
            startLessonBtn.className = 'btn action-btn start-lesson';
            startLessonBtn.innerHTML = '<i class="fas fa-play"></i>Начать урок';
            
            // Создаем индикатор статуса
            const statusIndicator = document.createElement('div');
            statusIndicator.className = 'status-indicator';
            
            // Устанавливаем класс и подсказку в зависимости от статуса
            switch (statusData.status) {
                case 'completed':
                    statusIndicator.classList.add('status-completed');
                    statusIndicator.title = statusData.message || 'Урок завершен';
                    break;
                case 'in-progress':
                    statusIndicator.classList.add('status-in-progress');
                    statusIndicator.title = statusData.message || 'Урок в процессе';
                    break;
                case 'not-started':
                    statusIndicator.classList.add('status-not-started');
                    statusIndicator.title = statusData.message || 'Урок не начат';
                    break;
                default:
                    statusIndicator.classList.add('status-not-started');
                    statusIndicator.title = statusData.message || 'Урок не начат';
            }
            
            // Добавляем обработчики событий
            startLessonBtn.addEventListener('click', () => startLesson(lesson.id));
            
            // Собираем структуру карточки
            lessonActions.appendChild(startLessonBtn);
            
            lessonHeader.appendChild(lessonTitle);
            lessonHeader.appendChild(statusIndicator);
            
            lessonCard.appendChild(lessonHeader);
            lessonCard.appendChild(lessonActions);
            
            // Добавляем карточку в контейнер
            container.appendChild(lessonCard);
        }
    } else {
        // Создаем сообщение об отсутствии уроков
        const noLessonsMessage = document.createElement('div');
        noLessonsMessage.className = 'no-lessons-message';
        noLessonsMessage.textContent = 'Нет доступных уроков';
        container.appendChild(noLessonsMessage);
    }
}

// Функция для отображения ошибки
function showError(message) {
    const container = document.getElementById('lessons-container');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    container.insertBefore(errorDiv, container.firstChild);
    setTimeout(() => errorDiv.remove(), 5000);
}
// Глобальная переменная для отслеживания состояния отображения погоды
let weatherVisible = false;

document.getElementById('getWeather').addEventListener('click', () => {
    const weatherInfo = document.querySelector('.weather-info');
    const button = document.getElementById('getWeather');

    // Если погода не отображается, запрашиваем данные и показываем их
    if (!weatherVisible) {
        if (!navigator.geolocation) {
            showError('Геолокация не поддерживается вашим браузером');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async position => {
                const { latitude, longitude } = position.coords;
                try {
                    const apiKey = '1a328fb29d454041b43142503251302';
                    const response = await fetch(
                        `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${latitude},${longitude}&lang=ru`
                    );
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(`Ошибка ${response.status}: ${errorData.error.message}`);
                    }
                    const data = await response.json();
                    showWeather(data);
                    weatherVisible = true;
                    // Меняем текст кнопки на "Скрыть погоду"
                    button.innerHTML = '<span>Скрыть погоду</span>';
                } catch (error) {
                    console.error('Ошибка при получении данных погоды:', error);
                    showError(error.message);
                }
            },
            error => {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        showError('Пользователь отклонил запрос на геолокацию.');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        showError('Информация о местоположении недоступна.');
                        break;
                    case error.TIMEOUT:
                        showError('Заявка на получение местоположения истекла.');
                        break;
                    default:
                        showError('Произошла ошибка при получении местоположения.');
                        break;
                }
            }
        );
    } else {
        // Если погода уже отображается – скрываем её с красивой анимацией
        weatherInfo.classList.add('fade-out');
        // После окончания анимации очищаем содержимое и сбрасываем состояние
        weatherInfo.addEventListener('transitionend', function handler() {
            weatherInfo.innerHTML = '';
            weatherInfo.classList.remove('fade-out');
            weatherVisible = false;
            button.innerHTML = '<span>Получить погоду</span>';
            weatherInfo.removeEventListener('transitionend', handler);
        });
    }
});

const dropZone = document.getElementById('dropZone')
const fileInput = document.getElementById('fileInput')
const preview = document.getElementById('preview')

;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false)
})
;['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, highlight, false)
})
;['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, unhighlight, false)
})

dropZone.addEventListener('drop', handleDrop, false)
fileInput.addEventListener('change', handleFileSelect)

function preventDefaults(e) {
    e.preventDefault()
    e.stopPropagation()
}

function highlight() {
    dropZone.classList.add('dragover')
}

function unhighlight() {
    dropZone.classList.remove('dragover')
}

function handleDrop(e) {
    const dt = e.dataTransfer
    const files = dt.files
    handleFiles(files)
}

function handleFileSelect(e) {
    const files = e.target.files
    handleFiles(files)
}

function handleFiles(files) {
    ;[...files].forEach(previewFile)
}

function previewFile(file) {
    const reader = new FileReader()
    const card = document.createElement('div')
    card.className = 'file-card'

    const progress = document.createElement('div')
    progress.className = 'upload-progress'
    card.appendChild(progress)

    reader.onprogress = e => {
        if (e.lengthComputable) {
            const percent = (e.loaded / e.total) * 100
            progress.style.width = `${percent}%`
        }
    }

    reader.onload = () => {
        let content = ''
        if (file.type.startsWith('image/')) {
            content = `<img src="${reader.result}" alt="${file.name}">`
        } else if (file.type === 'text/plain') {
            content = `<pre>${reader.result}</pre>`
        } else {
            content = `<p>Файл ${file.name} не поддерживается для предпросмотра.</p>`
        }
        card.innerHTML = content
        card.appendChild(progress)
        card.innerHTML += `<i class="fas fa-check-circle success"></i>`
        preview.appendChild(card)
    }

    if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file)
    } else if (file.type === 'text/plain') {
        reader.readAsText(file)
    } else {
        card.innerHTML = `<p>Файл ${file.name} не поддерживается для предпросмотра.</p>`
        card.appendChild(progress)
        card.innerHTML += `<i class="fas fa-check-circle success"></i>`
        preview.appendChild(card)
    }
}

const notificationButton = document.getElementById('enableNotifications')
let notificationsEnabled = false

notificationButton.innerHTML =
    '<i class="fas fa-bell"></i> Включить уведомления'

notificationButton.addEventListener('click', () => {
    if (!notificationsEnabled) {
        if (!('Notification' in window)) {
            showNotificationStatus('Ваш браузер не поддерживает уведомления')
            return
        }
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                notificationsEnabled = true
                notificationButton.innerHTML =
                    '<i class="fas fa-bell-slash"></i> Выключить уведомления'
                new Notification('Уведомления включены!')
                showNotificationStatus('Уведомления активированы')
                showNotification('Отлично! Уведомления включены.', 'success')
            } else if (permission === 'denied') {
                showNotificationStatus('Уведомления отключены')
                showNotification(
                    'Вы отказались от уведомлений. Вы всегда можете изменить это в настройках браузера.',
                    'error',
                )
            } else {
                showNotificationStatus('Ожидание ответа пользователя...')
                showNotification('Уведомления пока не активированы.', 'info')
            }
        })
    } else {
        notificationsEnabled = false
        notificationButton.innerHTML =
            '<i class="fas fa-bell"></i> Включить уведомления'
        showNotificationStatus('Уведомления отключены')
        showNotification('Уведомления выключены!', 'info')
    }
})

document.querySelectorAll('.animated-button').forEach(button => {
    button.addEventListener('click', () => {
        button.classList.add('active')
        setTimeout(() => {
            button.classList.remove('active')
        }, 300)
    })
})

function showError(message) {
    const weatherInfo = document.querySelector('.weather-info')
    weatherInfo.textContent = message
}

function showWeather(data) {
    const weatherInfo = document.querySelector('.weather-info')
    const current = data.current
    const location = data.location

    weatherInfo.innerHTML = `
        <div class="weather-header">
            <h3>${location.name}, ${location.country}</h3>
            <img src="${current.condition.icon}" alt="${current.condition.text}">
        </div>
        <div class="weather-grid">
            <div class="weather-card">
                <i class="fas fa-thermometer-half"></i>
                <span>${current.temp_c}°C</span>
                <small>Ощущается как ${current.feelslike_c}°C</small>
            </div>
            <div class="weather-card">
                <i class="fas fa-tint"></i>
                <span>${current.humidity}%</span>
                <small>Влажность</small>
            </div>
            <div class="weather-card">
                <i class="fas fa-wind"></i>
                <span>${current.wind_kph} км/ч</span>
                <small>Ветер ${current.wind_dir}</small>
            </div>
            <div class="weather-card">
                <i class="fas fa-tachometer-alt"></i>
                <span>${current.pressure_mb} hPa</span>
                <small>Давление</small>
            </div>
        </div>
        <p class="weather-condition">${current.condition.text}</p>
    `
}

function showNotificationStatus(message) {
    const notificationStatus = document.querySelector('.notification-status')
    notificationStatus.textContent = message
}

function showNotification(message, type = 'info') {
    const container = document.querySelector('.notification-container')
    const notification = document.createElement('div')
    notification.className = `notification ${type}`
    notification.innerHTML = `
        <i class="fas ${
            type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'
        }"></i>
        <span>${message}</span>
        <div class="progress-bar"></div>
    `

    if (container) {
        container.appendChild(notification)
    } else {
        document.body.appendChild(notification)
    }

    void notification.offsetWidth
    const progressBar = notification.querySelector('.progress-bar')
    if (progressBar) {
        progressBar.classList.add('animate')

        progressBar.addEventListener('animationend', () => {
            setTimeout(() => {
                notification.classList.add('hide')
                notification.addEventListener('transitionend', () => {
                    notification.remove()
                })
            }, 200)
        })
    }
}

document.getElementById('generateQuote').addEventListener('click', () => {
    const quotes = [
        'Единственный способ делать великие дела — любить то, что ты делаешь. - Стив Джобс',
        'Начните делать всё, что вы можете сделать – и тогда вы сможете сделать даже больше. - Пабло Пикассо',
        'Успех — это способность двигаться от неудачи к неудаче, не теряя энтузиазма. - Уинстон Черчилль',
        'Сложнее всего начать действовать, все остальное зависит только от упорства. - Амелия Эрхарт',
        'Лучший способ предсказать будущее — создать его. - Абрахам Линкольн',
    ]
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
    document.getElementById('quoteDisplay').textContent = randomQuote
})

// файл ./app.js
const express = require('express');
const mysql = require('mysql');
const config = require('./config');
const cors = require('cors');

const app = express();
const port = config.port;

app.use(express.json());
app.use(cors());

// Конфигурация подключения к базе данных
const dbConnection = mysql.createConnection(config.db.mysql);

// Подключение к базе данных
dbConnection.connect((err) => {
    if (err) {
        console.error('Ошибка подключения к базе данных: ' + err.stack);
        return;
    }
    console.log('Подключение к базе данных успешно установлено');
});

// Получение всех задач
app.get('/api/getTasks', (req, res) => {
    dbConnection.query('SELECT * FROM tasks', (err, results) => {
        if (err) {
            console.error('Ошибка выполнения запроса: ' + err.stack);
            res.status(500).send('Ошибка сервера');
            return;
        }
        console.log('Результаты запроса:', results);
        res.json(results);
    });
});

// Создание новой задачи
app.post('/api/CreateTask', async (req, res) => {
    const { title, description, status = 'new' } = req.body;
    
    const sqlQuery = `INSERT INTO tasks (title, description, status) VALUES ('${title}', '${description}', '${status}')`;

    dbConnection.query(sqlQuery, (err, result) => {
        if (err) {
            console.error('Ошибка выполнения запроса: ' + err.stack);
            res.status(500).send('Ошибка сервера');
            return;
        }
        console.log('Задача создана:', result);
        res.json({
            id: result.insertId,
            title,
            description,
            status,
        });
    });
});

// Обновление задачи
app.put('/api/UpdateTasks/:taskId', async (req, res) => {
    const taskId = req.params.taskId;
    const { title, description, status } = req.body;
    
    const sqlQuery = `UPDATE tasks SET title = '${title}', description = '${description}', status = '${status}' WHERE id = ${taskId}`;

    dbConnection.query(sqlQuery, (err, result) => {
        if (err) {
            console.error('Ошибка выполнения запроса: ' + err.stack);
            res.status(500).send('Ошибка сервера');
            return;
        }
        console.log('Задача обновлена:', result);
        res.json({
            id: taskId,
            title,
            description,
            status,
        });
    });
});

// Удаление задачи
app.delete('/api/DeleteTasks/:taskId', async (req, res) => {
    const taskId = req.params.taskId;
    
    const sqlQuery = `DELETE FROM tasks WHERE id = ${taskId}`;

    dbConnection.query(sqlQuery, (err, result) => {
        if (err) {
            console.error('Ошибка выполнения запроса: ' + err.stack);
            res.status(500).send('Ошибка сервера');
            return;
        }
        console.log('Задача удалена:', result);
        res.json({
            id: taskId,
        });
    });
});

// Регистрация пользователя
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        // Хеширование пароля
        const hashedPassword = await bcrypt.hash(password, 10);
        // Сохранение пользователя в базе данных
        dbConnection.query(
            `INSERT INTO users (username, password) VALUES ('${username}', '${hashedPassword}')`,
            (err, result) => {
                if (err) {
                    console.error('Ошибка выполнения запроса: ' + err.stack);
                    res.status(500).send('Ошибка сервера');
                    return;
                }
                console.log('Пользователь успешно зарегистрирован');
                res.status(201).send('Пользователь успешно зарегистрирован');
            }
        );
    } catch (error) {
        console.error('Ошибка при регистрации пользователя:', error);
        res.status(500).send('Ошибка сервера');
    }
});

// Вход пользователя
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        // Поиск пользователя в базе данных
        dbConnection.query(
            `SELECT * FROM users WHERE username = '${username}'`,
            async (err, results) => {
                if (err) {
                    console.error('Ошибка выполнения запроса: ' + err.stack);
                    res.status(500).send('Ошибка сервера');
                    return;
                }
                if (results.length === 0) {
                    res.status(401).send('Неверные учетные данные');
                    return;
                }
                const user = results[0];
                // Проверка пароля
                const passwordMatch = await bcrypt.compare(password, user.password);
                if (!passwordMatch) {
                    res.status(401).send('Неверные учетные данные');
                    return;
                }
                // Генерация JWT токена
                const token = jwt.sign({ username: user.username }, config.jwtSecret);
                res.status(200).json({ token });
            }
        );
    } catch (error) {
        console.error('Ошибка при входе пользователя:', error);
        res.status(500).send('Ошибка сервера');
    }
});

// Проверка аутентификации с использованием JWT
app.get('/profile', (req, res) => {
    // Получение токена из заголовка Authorization
    const token = req.headers.authorization.split(' ')[1];
    try {
        // Проверка токена
        const decoded = jwt.verify(token, config.jwtSecret);
        res.status(200).json({ username: decoded.username });
    } catch (error) {
        console.error('Ошибка при проверке токена:', error);
        res.status(401).send('Неверный токен');
    }
});

// Cоздание таблицы
app.post('/api/CreateTaskTable', async (req, res) => {
    const sqlQuery = `CREATE TABLE db38.tasks (
    id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(255) NOT NULL DEFAULT 'new',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
  )`;

    dbConnection.query(sqlQuery, (err, result) => {
        if (err) {
            console.error('Ошибка выполнения запроса: ' + err.stack);
            res.status(500).send('Ошибка сервера');
            return;
        }
        console.log('Таблица tasks создана:', result);
        res.json({
            message: 'Таблица tasks создана',
        });
    });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});



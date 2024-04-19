// файл ./app.js
const express = require('express');
const mysql = require('mysql');
const config = require('./config');

const app = express();
const port = config.port;

app.use(express.json());

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
// оздание таблицы
app.post('/api/CreateTaskTable', async (req, res) => {
    const sqlQuery = `CREATE TABLE tasks (
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



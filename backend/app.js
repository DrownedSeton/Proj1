// файл ./app.js
const express = require('express');
const mysql = require('mysql');
const config = require('./config');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

app.post('/register', async (req, res) => {
    try {
      const { username, password, email } = req.body;
  
      // Хеширование пароля
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Сохранение пользователя в базе данных
      dbConnection.query(
        `INSERT INTO users (username, password, email) VALUES (?, ?, ?)`,
        [username, hashedPassword, email],
        async (err, result) => {
          if (err) {
            console.error('Ошибка выполнения запроса: ' + err.stack);
            res.status(500).send('Ошибка сервера');
            return;
          }
  
                  // ответ в result зависит от базы данных.
                  // возможно вместо insertId будет id.
          const userId = result.insertId;
  
              // Генерация токена подтверждения почты, который живет 1 день
          const emailConfirmToken = jwt.sign({ userId, email }, config.jwtSecret, { expiresIn: '1d' });
  
          // Сохранение кода подтверждения в таблице email_confirmation
          dbConnection.query(
            `INSERT INTO email_confirmation (userId, emailConfirmToken) VALUES (?, ?)`,
            [userId, emailConfirmToken],
            (err, result) => {
              if (err) {
                console.error('Ошибка сохранения кода подтверждения: ' + err.stack);
                res.status(500).send('Ошибка сервера');
                return;
              }
  
              console.log('Код подтверждения успешно создан');
  
              // Отправка письма с подтверждением почты
              const mailOptions = {
                from: 'your_email@gmail.com',
                to: email,
                subject: 'Подтверждение регистрации',
                html: `<p>Для подтверждения регистрации перейдите по ссылке: <a href="http://localhost:3000/confirm/${emailConfirmToken}">Подтвердить регистрацию</a></p>`
              };
  
              transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  console.error('Ошибка при отправке письма:', error);
                  res.status(500).send('Ошибка сервера');
                } else {
                  console.log('Письмо с подтверждением отправлено:', info.response);
                  res.status(201).send('Пользователь успешно зарегистрирован. Проверьте вашу почту для подтверждения регистрации.');
                }
              });
            }
          );
        }
      );
    } catch (error) {
      console.error('Ошибка при регистрации пользователя:', error);
      res.status(500).send('Ошибка сервера');
    }
  });

  app.get('/confirm/:token', async (req, res) => {
    try {
      const token = req.params.token;
  
      // Раскодирование токена
      const decoded = jwt.verify(token, config.jwtSecret);
      const { userId, email } = decoded;
  
      // Поиск кода подтверждения в базе данных
      dbConnection.query(
        `SELECT * FROM email_confirmation WHERE userId = ? AND emailConfirmToken = ?`,
        [userId, token],
        (err, results) => {
          if (err) {
            console.error('Ошибка выполнения запроса: ' + err.stack);
            res.status(500).send('Ошибка сервера');
            return;
          }
  
          if (results.length === 0) {
            res.status(404).send('Код подтверждения не найден');
            return;
          }
  
          // Удаление кода подтверждения из таблицы email_confirmation
          dbConnection.query(
            `DELETE FROM email_confirmation WHERE userId = ? AND emailConfirmToken = ?`,
            [userId, token],
            (err, result) => {
              if (err) {
                console.error('Ошибка удаления кода подтверждения: ' + err.stack);
                res.status(500).send('Ошибка сервера');
                return;
              }
  
              console.log('Код подтверждения успешно удален');
  
              // Можно пометить пользователя как подтвержденного в таблице users
              // Например: UPDATE users SET isConfirmed = true WHERE id = userId;
  
              res.status(200).send('Регистрация успешно подтверждена');
            }
          );
        }
      );
    } catch (error) {
      console.error('Ошибка при подтверждении регистрации:', error);
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
    const sqlQuery = `
        CREATE TABLE tasks(
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

app.get('/api/createUsersTable', (req, res) => {
    const createUsersTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            user_id INT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `;
    dbConnection.query(createUsersTableQuery, (err, result) => {
        if (err) {
            console.error('Error creating users table: ' + err.stack);
            res.status(500).send('Internal Server Error');
            return;
        }
        console.log('Users table created successfully');
        res.status(200).send('Users table created successfully');
    });
})

app.get('/api/createEmailTable', (req, res) => {
    const createUsersTableQuery = `
        CREATE TABLE email_confirmation (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT,
        emailConfirmToken VARCHAR(255) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    dbConnection.query(createUsersTableQuery, (err, result) => {
        if (err) {
            console.error('Error creating users table: ' + err.stack);
            res.status(500).send('Internal Server Error');
            return;
        }
        console.log('Email table created successfully');
        res.status(200).send('Email table created successfully');
    });
})

app.get('/getTasks', (req, res) => {
	 jwt.verify(token, config.jwtSecret);
    const userId = req.user.id; 

  
  dbConnection.query(
    `SELECT * FROM tasks WHERE user_id = ?`,
    [userId],
    (err, results) => {
      if (err) {
        console.error('Ошибка выполнения запроса: ' + err.stack);
        res.status(500).send('Ошибка сервера');
        return;
      }
      console.log('Задачи текущего пользователя:', results);
      res.json(results);
    }
  );
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});



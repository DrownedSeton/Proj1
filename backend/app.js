// файл ./app.js
const express = require('express');
const mysql = require('mysql');
const config = require('./config');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();
const nodemailer = require('nodemailer');
const port = config.port;
const path = require('path');

app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));
app.use(express.static("path"));
app.use(express.static(__dirname + '/frontend'));


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

app.get("/", function(req, res) {
console.log("Something was catched!" + req.method);
res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Получение всех задач
app.get('/api/getTasks', (req, res) => {
    dbConnection.query('SELECT * FROM task22', (err, results) => {
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
    const sqlQuery = `INSERT INTO task22 (title, description, status) VALUES ('${title}', '${description}','${status}')`;

    dbConnection.query(sqlQuery, (err, result) => {
        if (err) {
            console.error('Ошибка выполнения запроса: ' + err.stack);
            res.status(500).send('Ошибка сервера');
            return;
        }
        console.log('Задача создана:', result);
        res.json({
            id: result.id,
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
    
    const sqlQuery = 'UPDATE task22 SET title = ?, description = ?, status = ? WHERE id = ?';
    dbConnection.query(sqlQuery, [title, description, status, taskId], (err, result) => {
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
  
  if (!taskId) {
      return res.status(400).send('Task ID is missing');
  }

  const sqlQuery = `DELETE FROM task22 WHERE id = '${taskId}'`;

  dbConnection.query(sqlQuery, (err, result) => {
      if (err) {
          console.error('Error executing query: ' + err.stack);
          return res.status(500).send('Server error');
      }
      console.log('Task deleted:', result);
      res.json({
          id: taskId,
      });
  });
});

//регистрация

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: 'anna.balanovskaya1983@gmail.com',
      pass: 'zmmp auze tfvo zxdh'
  }
});

app.post('/register', async (req, res) => {
    try {
      const { username, password, email } = req.body;

      if (!password) {
        console.error('Пароль не предоставлен');
        res.status(400).send('Необходимо предоставить пароль');
        return;
      }
  
      // Хеширование пароля
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Сохранение пользователя в базе данных
      dbConnection.query(
        `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
        [username, email, hashedPassword],
        async (err, result) => {
          if (err) {
            console.error('Ошибка выполнения запроса: ' + err.stack);
            res.status(500).send('Ошибка сервера');
            return;
          }
  
                  // ответ в result зависит от базы данных.
                  // возможно вместо insertId будет id.
          console.log('Результаты запроса:', result);        
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

app.get('/profile', async (req, res) => {
  // Получение токена из заголовка Authorization
  const token = req.headers.authorization.split(' ')[1];
  try {
      // Проверка токена и декодирование
      const decoded = jwt.verify(token, config.jwtSecret);
      const username = decoded.username;
      const sqlQuery = `SELECT user_id FROM users WHERE username = '${username}'`;

      // Выполнение запроса к базе данных
      const results = await new Promise((resolve, reject) => {
          dbConnection.query(sqlQuery, (error, results) => {
              if (error) {
                  console.error('Ошибка при выполнении запроса:', error);
                  reject(error);
                  return;
              }
              resolve(results);
          });
      });

      const userId = results[0].user_id;
      res.status(200).json({ userId: userId });
  } catch (error) {
      console.error('Ошибка при проверке токена:', error);
      res.status(401).send('Неверный токен');
  }
});

// Cоздание таблицы задач
app.post('/api/CreateTable', async (req, res) => {
    const sqlQuery = `
        CREATE TABLE task22(
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(255) NOT NULL DEFAULT 'new',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        folder_id INT,
        FOREIGN KEY (folder_id) REFERENCES folders (id) ON DELETE CASCADE
        )`;
    dbConnection.query(sqlQuery, (err, result) => {
        if (err) {
            console.error('Ошибка выполнения запроса: ' + err.stack);
            res.status(500).send('Ошибка сервера');
            return;
        }
        console.log('Таблица task22 создана:', result);
        res.json({
            message: 'Таблица task22 создана',
        });
    });
});
// Cоздание таблицы пользователей
app.post('/api/createUsersTable', (req, res) => {
    const createUsersTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            user_id  INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            username VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL
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
// Cоздание таблицы почты
app.post('/api/createEmailTable', (req, res) => {
    const createEmailTableQuery = `
        CREATE TABLE IF NOT EXISTS email_confirmation (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT,
        emailConfirmToken VARCHAR(255) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(user_id) ON DELETE CASCADE
      )
    `;
    dbConnection.query(createEmailTableQuery, (err, result) => {
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
    `SELECT * FROM task22 WHERE user_id = ?`,
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

app.get('/showTables', async (req, res) => {
  try {
      dbConnection.query('SHOW TABLES', (err, result) => {
          if (err) {
              console.error('Ошибка выполнения запроса: ' + err.stack);
              res.status(500).send('Ошибка сервера');
              return;
          }

          console.log('Список таблиц:', result);
          res.status(200).json(result);
      });
  } catch (error) {
      console.error('Ошибка при получении списка таблиц:', error);
      res.status(500).send('Ошибка сервера');
  }
});

app.post('/deleteTable', async (req, res) => {
  try {
      dbConnection.query('DROP TABLE task22', (err, result) => {
          if (err) {
              console.error('Ошибка выполнения запроса: ' + err.stack);
              res.status(500).send('Ошибка сервера');
              return;
          }

          console.log('Таблица task22 успешно удалена');
          res.status(200).send('Таблица task22 успешно удалена');
      });
  } catch (error) {
      console.error('Ошибка при удалении таблицы task22:', error);
      res.status(500).send('Ошибка сервера');
  }
});


//папки
app.get('/api/getFolders', (req, res) => {
  dbConnection.query('SELECT * FROM folders', (err, results) => {
      if (err) {
          console.error('Ошибка выполнения запроса: ' + err.stack);
          res.status(500).send('Ошибка сервера');
          return;
      }
      console.log('Результаты запроса:', results);
      res.json(results);
  });
});

app.post('/api/CreateFolder', async (req, res) => {
  const { name, parent } = req.body;
  
  const sqlQuery = `INSERT INTO folders (name, parent) VALUES ('${name}', ${parent || 0})`;
  
  dbConnection.query(sqlQuery, (err, result) => {
    if (err) {
      console.error('Ошибка выполнения запроса: ' + err.stack);
      res.status(500).send('Ошибка сервера');
      return;
    }
    console.log('Папка создана:', result);
    res.json({
      id: result.insertId,
      name,
      parent,
    });
  });
});

app.put('/api/UpdateFolders/:folderId', async (req, res) => {
  const folderId = req.params.folderId;
  const { name, parent } = req.body;
  
  const sqlQuery = 'UPDATE folders SET name = ?, parent = ? WHERE id = ?';
  dbConnection.query(sqlQuery, [name, parent, folderId], (err, result) => {
    if (err) {
      console.error('Ошибка выполнения запроса: ' + err.stack);
      res.status(500).send('Ошибка сервера');
      return;
    }
    console.log('Папка обновлена:', result);
    res.json({
      id: folderId,
      name,
      parent,
    });
  });
});

app.delete('/api/DeleteFolder/:folderId', async (req, res) => {
  const folderId = req.params.folderId;

  const sqlQuery = 'DELETE FROM folders WHERE id = ?';
  dbConnection.query(sqlQuery, [folderId], (err, result) => {
    if (err) {
      console.error('Ошибка выполнения запроса: ' + err.stack);
      res.status(500).send('Ошибка сервера');
      return;
    }
    console.log('Папка удалена:', result);
    res.json({
      message: 'Папка удалена',
    });
  });
});

app.post('/api/CreateFolderTable', async (req, res) => {
  const sqlQuery = `
      CREATE TABLE folders(
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      parent INT NOT NULL DEFAULT 0
      )`;
  dbConnection.query(sqlQuery, (err, result) => {
      if (err) {
          console.error('Ошибка выполнения запроса: ' + err.stack);
          res.status(500).send('Ошибка сервера');
          return;
      }
      console.log('Таблица folders создана:', result);
      res.json({
          message: 'Таблица folders создана',
      });
  });
});

app.post('/api/AddTaskToFolder', async (req, res) => {
  const { title, folderId } = req.body;
  const sqlQuery = 'SELECT id FROM task22 WHERE title = ?';
  dbConnection.query(sqlQuery, [title], (err, result) => {
    if (err) {
      console.error('Ошибка выполнения запроса: ' + err.stack);
      res.status(500).send('Ошибка сервера');
      return;
    }

    if (result.length > 0) {
      const taskId = result[0].id;
      const updateQuery = 'UPDATE task22 SET folder_id = ? WHERE id = ?';
      dbConnection.query(updateQuery, [folderId, taskId], (err, result) => {
        if (err) {
          console.error('Ошибка выполнения запроса: ' + err.stack);
          res.status(500).send('Ошибка сервера');
          return;
        }
        console.log('Задача перемещена:', result);
        res.json({
          title,
          folderId,
        });
      });
    } else {
      const insertQuery = 'INSERT INTO task22 (title, folder_id) VALUES (?, ?)';
      dbConnection.query(insertQuery, [title, folderId], (err, result) => {
        if (err) {
          console.error('Ошибка выполнения запроса: ' + err.stack);
          res.status(500).send('Ошибка сервера');
          return;
        }
        console.log('Задача добавлена:', result);
        res.json({
          title,
          folderId,
        });
      });
    }
  });
});

app.get('/api/getTasksFolder', (req, res) => {
  const query = 'SELECT * FROM task22 WHERE folder_id IS NOT NULL';
  dbConnection.query(query, (err, results) => {
    if (err) {
      console.error('Ошибка выполнения запроса: ' + err.stack);
      res.status(500).send('Ошибка сервера');
      return;
    }
    console.log('Результаты запроса:', results);
    res.json(results);
  });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});



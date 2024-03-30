// файл ./config/index.js
const fs = require('fs');

const config = {
    db: {
        mysql : {
            host: 'localhost',
            user: 'user', // замените на своего пользователя
            database: 'appdb', // можете заменить 'appdb' на свое название базы данных
            password: 'yourPasswordHere', // замените это на пароль от своего пользователя
            port: 25060, // порт базы данных
            ssl: {
                ca: fs.readFileSync('C:/Git/Proj1/config/ca-certificate-test.crt'), // Путь к файлу ca.crt
            }
        },
    },
    port: 3000 // порт на котором будет запущен сервер приложения
};

module.exports =  config;


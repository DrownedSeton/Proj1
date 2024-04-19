// файл ./config/index.js
const fs = require('fs');

const config = {
    db: {
        mysql : {
            host: 'db-mysql-fra1-51752-do-user-9208055-0.c.db.ondigitalocean.com',
            user: 'user38', // замените на своего пользователя
            database: 'db38', // можете заменить 'appdb' на свое название базы данных
            password: 'AVNS_vHOnKAWv5W82JkrFdF3', // замените это на пароль от своего пользователя
            port: 25060, // порт базы данных
            ssl: {
                ca: fs.readFileSync('C:/Git/Proj1/backend/config/ca-certificate-test.crt'), // Путь к файлу ca.crt
            }
        },
    },
    port: 3000 // порт на котором будет запущен сервер приложения
    //jwtSecret: 'javainuse-secret-key'

};

module.exports =  config;


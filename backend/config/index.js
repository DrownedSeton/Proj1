// файл ./config/index.js
const fs = require('fs');
const express = require('express')

const app = express();
app.get('/',function(req,res){
    res.render('/index.html');
});

const config = {
    db: {
        mysql : {
            host: 'db-mysql-fra1-51752-do-user-9208055-0.c.db.ondigitalocean.com',
            user: 'user38', // замените на своего пользователя
            database: 'db38', // можете заменить 'appdb' на свое название базы данных
            password: 'AVNS_vHOnKAWv5W82JkrFdF3', // замените это на пароль от своего пользователя
            port: 25060, // порт базы данных
            ssl: {
                ca: fs.readFileSync('ca-certificate-test.crt'), // Путь к файлу ca.crt
            }
        },
    },
    port: 3000, // порт на котором будет запущен сервер приложения
    jwtSecret: 'myverymegaextrasecretkey'
};

module.exports =  config;


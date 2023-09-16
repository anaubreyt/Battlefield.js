// зависимости
const session = require('express-session');
const express = require('express');
const PartyManager = require('./src/PartyManager');
const pm = new PartyManager;
const fs = require('fs');
const path = require('path');


// Создание приложения ExpressJS
const app = express();
const http = require('http').createServer(app);

// Регистрация Socket приложения 
const io = require('socket.io')(http);
const port = 3000;

// Насттройка сессий
const sessionMiddleware = session({
    secret: 's3Cur3',
    name: 'sessionId'
});

app.set('trust proxy', 1) // trust first proxy
app.use(sessionMiddleware);

// Настройка статики
app.use(express.static("./../front"));

// По умолчанию
app.use('*', (req, res) => {
    res.type('html');
    res.send(fs.readFileSync(path.join(__dirname, './../front/index.html')))
});

// Поднятие сервера
http.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});

io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next)
})

// Прослушивание socket соединений
io.on("connection", (socket) => {
    pm.connection(socket);
    io.emit('playerCount', io.engine.clientsCount);

    // Отключение коннекта
    socket.on('disconnect', () => {
        pm.disconnect(socket);
        io.emit('playerCount', io.engine.clientsCount); 
    });

    /* Поиск случайного соперника
    socket.on('findRandomOpponent', () => {        
        socket.emit('statusChange', 'randomFinding');
        pm.playRandom(socket);
    })*/
});
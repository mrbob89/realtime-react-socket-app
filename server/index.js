const io = require('socket.io')();
const r = require('rethinkdb');

function createDrawing({ connection, name }) {
    r.table('drawings')
        .insert({
            name,
            timestamp: new Date()
        })
        .run(connection)
        .then(() => console.log('created drawing - ', name));
}

r.connect({
    host: 'localhost',
    port: 28015,
    db: 'drawing_whiteboard'
}).then(connection => {
    io.on('connection', client => {
        client.on('subscribeToTimer', interval => {
            r.table('timers')
                .changes()
                .run(connection)
                .then(cursor => {
                    cursor.each((err, timerRow) => {
                        client.emit('timer', timerRow.new_val.timestamp);
                    });
                });
        });
    });
});

const port = 8000;
io.listen(port);

console.log('listening on port ', port);

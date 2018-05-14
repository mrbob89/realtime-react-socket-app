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

function subscribeToDrawings({ connection, client }) {
    r.table('drawings')
        .changes({ include_initial: true })
        .run(connection)
        .then(cursor => {
            cursor.each(((err, drawingRow) => client.emit('drawing', drawingRow.new_val)));
        });
}

r.connect({
    host: 'localhost',
    port: 28015,
    db: 'drawing_whiteboard'
}).then(connection => {
    io.on('connection', client => {
        client.on('createDrawing', ({ name }) => {
            createDrawing({ connection, name });
        });

        client.on('subscribeToDrawings', () => subscribeToDrawings({ connection, client }));
    });
});

const port = 8000;
io.listen(port);

console.log('listening on port ', port);

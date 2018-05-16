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

function subscribeToDrawingLines({ connection, client, drawingId, from }) {
    let query = r.row('drawingId').eq(drawingId);

    if (from) {
        query = query.and(
            r.row('timestamp').ge(new Date(from))
        );
    }

    return r.table('lines')
        .filter(query)
        .changes({ include_initial: true })
        .run(connection)
        .then(cursor => {
            cursor.each((err, lineRow) => client.emit(`drawingLine:${drawingId}`, lineRow.new_val));
        });
}

function handleLinePublish({ connection, line, callback }) {
    r.table('lines')
        .insert(Object.assign(line, { timestamp: new Date() }))
        .run(connection)
        .then(callback)
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

        client.on('publishLine', (line, callback) => handleLinePublish({
            connection,
            line,
            callback
        }));

        client.on('subscribeToDrawingLines', ({ drawingId, from }) => {
            subscribeToDrawingLines({
                connection,
                client,
                drawingId,
                from
            });
        });
    });
});

const port = parseInt(process.argv[3], 10) || 8000;
io.listen(port);

console.log('listening on port ', port);

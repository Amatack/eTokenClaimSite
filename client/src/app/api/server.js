import express from 'express';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = express();

    server.get('/api/*', (req, res) => {
    // Obtener la dirección IP del cliente desde la solicitud en el lado del servidor
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // Loguear la dirección IP del cliente
    console.log('IP del cliente:', ip);

    // Pasa la solicitud al manejador de Next.js
    return handle(req, res);
});

server.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
});
});
import compression from 'compression';
import dotenv from 'dotenv';
dotenv.config();
import Fastify from 'fastify';
const fastify = Fastify({
  logger: false,
});
await fastify.register(
    import('@fastify/express'),
    { threshold: 2048 }
);
import { main } from './slider.js';

fastify.use(compression());
fastify.get('/', async (request, reply) => {
    const message = "WELCOME TO FLIXNODE API";
    reply.type('application/json').code(200).send(JSON.stringify(message));
    console.log(message);
});

fastify.get('/slider', async (request, reply) => {
    const message = await main();
    reply.type('application/json').code(200).send(message);
});
  
  // Run the server!
fastify.listen({ port: 3000 }, (err, address) => {
    if (err) throw err
    console.log(`Server is now listening on ${address}`)
});


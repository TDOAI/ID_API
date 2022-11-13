import compression from 'compression';
import dotenv from 'dotenv';
dotenv.config();
import Fastify from 'fastify';
import redis from 'redis'
import { popular_movies } from './popular_movies.js';
import { popular_tvs } from './popular_tvs.js';
const fastify = Fastify({
  logger: false,
});
await fastify.register(
    import('@fastify/express'),
    { threshold: 2048 }
);
import { slider } from './slider.js';

fastify.register(import('fastify-cacheman'), {
  engine: 'file',
})

fastify.use(compression());
fastify.get('/', async (request, reply) => {
    const message = "WELCOME TO FLIXNODE API";
    reply.type('application/json').code(200).send(JSON.stringify(message));
    console.log(message);
});

fastify.get('/slider', async (request, reply) => {
  const cacheEntry = await fastify.cacheman.get('slider')
  if (cacheEntry) {
    reply.type('application/json').code(200).send(JSON.stringify(cacheEntry));
  } else {
    const message = await slider();
    await fastify.cacheman.set('slider', message, 120)
    reply.type('application/json').code(200).send(JSON.stringify(message));
  }
});

fastify.get('/popular/movies', async (request, reply) => {
  const message = await popular_movies();
  reply.type('application/json').code(200).send(JSON.stringify(message));
});

fastify.get('/popular/show', async (request, reply) => {
  const message = await popular_tvs();
  reply.type('application/json').code(200).send(JSON.stringify(message));
});

fastify.get('/time', async (request, reply) => {
  const message = new Date();
  const time = message.toLocaleTimeString()
  reply.type('application/json').code(200).send(JSON.stringify(time));
  console.log(time);
});

fastify.get('/test', async (req, reply) => {
  const message = new Date();
  const time = message.toLocaleTimeString()
  const cacheEntry = await fastify.cacheman.get('tester')
  if (cacheEntry) {
    reply.type('application/json').code(200).send(JSON.stringify(cacheEntry));
	} else{
  const api = await fastify.cacheman.set('tester', time, 120) // this will cached for 120 seconds
  reply.type('application/json').code(200).send(JSON.stringify(api));
  }
})
  
  // Run the server!
fastify.listen({ port: 3000 }, (err, address) => {
    if (err) throw err
    console.log(`Server is now listening on ${address}`)
});

module.exports = fastify;



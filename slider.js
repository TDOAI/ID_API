import dotenv from 'dotenv';
dotenv.config();
import axios from "axios";
import { MongoClient } from 'mongodb';

const base_url = process.env.BASE_URL;
const api_key = process.env.API_KEY;
const movie_url_1 = `${base_url}trending/movie/day?api_key=${api_key}&page=1`;
const tv_url_1 = `${base_url}trending/tv/day?api_key=${api_key}&page=1`;
const db = process.env.DB;

const client = new MongoClient(db);
let array = []

async function fetch() {
    try {
        const page_movie = axios.get(movie_url_1);
        const page_tv = axios.get(tv_url_1);
        const res = await Promise.all([page_movie, page_tv]).then(axios.spread((...responses) => {
            const response_movie = responses[0].data.results
            const response_tv = responses[1].data.results
            return [
                response_movie,
                response_tv
            ]
        }));
    return res
    } finally {
    }
  }

async function check_movie(res_movie, collection_movie) {
    const promise1 = await (res_movie|| []).map(async card => {
        const movies_FromDb = await collection_movie.findOne({ tmdb_id: card.id.toString() })
        // console.log(movies_FromDb)
            if (movies_FromDb !== null && card.vote_average > 7) {
                array.push(card);
            }
        });;
    await Promise.all(promise1);
}

async function check_tv(res_tv, collection_tv) {
    const promise2 = await (res_tv|| []).map(async card => {
        const movies_FromDb = await collection_tv.findOne({ tmdb_id: card.id.toString() })
        // console.log(movies_FromDb)
            if (movies_FromDb !== null && card.vote_average > 7.6) {
                array.push(card);
            }
        });
    await Promise.all(promise2);
}


async function getMultipleRandom(arr, num) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
}

async function slider() {
    try {
        const client = new MongoClient(db);
        //   Connect the client to the server (optional starting in v4.7)
        //   await client.connect();
        //   Establish and verify connection
        await client.db().command({ ping: 1 });
        console.log("Connected successfully to server");
        const collection_movie = client.db().collection('movies');
        const collection_tv = client.db().collection('tvshows');
        const res  = await fetch().catch(console.dir);
        const res_movie = await res[0]
        const res_tv = await res[1]
        await check_movie(res_movie, collection_movie)
        await check_tv(res_tv, collection_tv)
        const mes = await getMultipleRandom(array, 8);
        await client.close();
        // console.log(mes)
        return mes
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}


export { slider }

import dotenv from 'dotenv';
dotenv.config();
import axios from "axios";
import { MongoClient } from 'mongodb';
import {getPlaiceholder} from 'plaiceholder'


const base_url = process.env.BASE_URL;
const api_key = process.env.API_KEY;
const db = process.env.DB;
const client = new MongoClient(db);

const image_base = "https://image.tmdb.org/t/p/w500"
const movie_url_1 = `${base_url}movie/popular?api_key=${api_key}&language=en-US&page=1`;
const movie_url_2 = `${base_url}movie/popular?api_key=${api_key}&language=en-US&page=2`;
const movie_url_3 = `${base_url}movie/popular?api_key=${api_key}&language=en-US&page=3`;
const movie_url_4 = `${base_url}movie/popular?api_key=${api_key}&language=en-US&page=4`;


async function fetch() {
    const page_1 = axios.get(movie_url_1);
    const page_2 = axios.get(movie_url_2);
    const page_3 = axios.get(movie_url_3);
    const page_4 = axios.get(movie_url_4);
    const res = await Promise.all([page_1, page_2, page_3, page_4]).then(axios.spread((...responses) => {
        const response_1 = responses[0].data.results
        const response_2 = responses[1].data.results
        const response_3 = responses[2].data.results
        const response_4 = responses[3].data.results
        const array = [...response_1, ...response_2, ...response_3, ...response_4]
        return array
    }));
    return res
}

async function check(res, collection_movie) {
    const arr = []
    const promises = await (res|| []).map(async card => {
        const movies_FromDb = await collection_movie.findOne({ tmdb_id: card.id.toString() })
        // console.log(movies_FromDb)
            if (movies_FromDb !== null) {
                arr.push(card);
            }
        });;
    await Promise.all(promises);
    return arr
}

async function blurhash(array) {
    const arr = []
    const promises = await (array|| []).map(async card => {
        const placeholder = await getPlaiceholder(`${image_base}${card.poster_path || card.backdrop_path}`)
        const res = placeholder.blurhash.hash
        card["blurhash"] = res
        arr.push(card)
    });
    await Promise.all(promises);
    return arr
}

async function popular_movies() {
    try {
        const client = new MongoClient(db);
        //   Connect the client to the server (optional starting in v4.7)
        //   await client.connect();
        //   Establish and verify connection
        await client.db().command({ ping: 1 });
        console.log("Connected successfully to server");
        const collection_movie = client.db().collection('movies');
        const res  = await fetch().catch(console.dir);
        const array = await check(res, collection_movie)
        const final = await blurhash(array)
        await client.close();
        // console.log(final[0])
        return final
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}

export { popular_movies }
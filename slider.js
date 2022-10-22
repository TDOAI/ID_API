import dotenv from 'dotenv';
dotenv.config();
import axios from "axios";
import { MongoClient } from 'mongodb';
import pkg from 'fast-sort';
const { sort } = pkg;

const base_url = process.env.BASE_URL;
const api_key = process.env.API_KEY;
const movie_url_1 = `${base_url}trending/movie/day?api_key=${api_key}&page=1`;
const movie_url_2 = `${base_url}trending/movie/day?api_key=${api_key}&page=2`;
const db = process.env.DB;

async function fetch_movie() {
    const arr = []
    const client = new MongoClient(db);
    await client.connect();
    const collection = client.db().collection('movies');
    const page_1 = await axios.get(movie_url_1);
    const res_1 = await page_1.data.results;
    const page_2 = await axios.get(movie_url_2);
    const res_2 = await page_2.data.results;
    const res = await [...new Set([...res_1, ...res_2])]
    const promises = await (res || []).map(async ob => {
        const ObFromDb = await collection.findOne({ tmdb_id: ob.id.toString() })
        if (ObFromDb !== null) {
            arr.push(ob);
        }
    });
    await Promise.all(promises);
    const top_arr = [];
    for (let i=0; i < arr.length; i++) {
        if (arr[i].id > 7) {
            top_arr.push(arr[i]);
        }
    }
    client.close();
    return top_arr
}



export { fetch_movie }

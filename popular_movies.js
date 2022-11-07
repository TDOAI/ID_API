import dotenv from 'dotenv';
dotenv.config();
import axios from "axios";
import { MongoClient } from 'mongodb';


const base_url = process.env.BASE_URL;
const api_key = process.env.API_KEY;
const db = process.env.DB;

const url_1 = 


async function fetch_movie() {
    const client = new MongoClient(db);
        await client.connect();
        const collection = client.db().collection('movies');
        const page_1 = await axios.get(url_1);
        const res_1 = await page_1.data.results;
}
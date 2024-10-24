import Redis from "ioredis"
import dotenv from "dotenv";
dotenv.config();

 const redis = new Redis(process.env.UPSTASH_REDISS_URL);
 export default redis;
// await client.set('foo', 'bar');
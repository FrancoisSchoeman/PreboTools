import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const poolConnection = mysql.createPool({
  host: process.env.MYSQL_HOST!,
  database: process.env.MYSQL_DATABASE!,
  user: process.env.MYSQL_USER!,
  password: process.env.MYSQL_PASSWORD!,
  port: Number(process.env.MYSQL_PORT!),
});
const db = drizzle({ client: poolConnection });

export default db;

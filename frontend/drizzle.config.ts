import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './db/schema.ts',
  dialect: 'mysql',
  dbCredentials: {
    host: process.env.MYSQL_HOST!,
    database: process.env.MYSQL_DATABASE!,
    user: process.env.MYSQL_USER!,
    password: process.env.MYSQL_PASSWORD!,
    port: Number(process.env.MYSQL_PORT!),
  },
});

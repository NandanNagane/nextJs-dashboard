import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: process.env.host!,

  port: parseInt(process.env.port!),

  user: process.env.user!,

  password: process.env.password!,

  database: process.env.database!,
});

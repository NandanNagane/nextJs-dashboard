import bcrypt from "bcrypt";
import postgres from "postgres";
import { invoices, customers, revenue, users } from "../lib/placeholder-data";
import mysql from "mysql2/promise";
import { neon } from "@neondatabase/serverless";
import { db } from "../lib/db";
import { randomUUID } from "crypto";

// const sql = await mysql.createConnection(connectionParams);

// const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

// const sql = neon(process.env.POSTGRES_URL!);

async function seedUsers() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL
    );
  `);

  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);

      return db.execute(
        `INSERT IGNORE INTO users (name, email, password)
         VALUES (?, ?, ?)`,
        [user.name, user.email, hashedPassword],
      );
    }),
  );

  return insertedUsers;
}
async function seedInvoices() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS invoices (
      id INT AUTO_INCREMENT PRIMARY KEY,
      customer_id INT NOT NULL,
      amount INT NOT NULL,
      status VARCHAR(255) NOT NULL,
      date DATE NOT NULL
    );
  `);

  const insertedInvoices = await Promise.all(
    invoices.map((invoice) => {
      return db.execute(
        `INSERT IGNORE INTO invoices (customer_id, amount, status, date)
         VALUES (?, ?, ?, ?)`,
        [invoice.customer_id, invoice.amount, invoice.status, invoice.date],
      );
    }),
  );

  return insertedInvoices;
}
async function seedCustomers() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS customers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      image_url VARCHAR(255) NOT NULL
    );
  `);

  const insertedCustomers = await Promise.all(
    customers.map((customer) => {
      return db.execute(
        `INSERT IGNORE INTO customers (name, email, image_url)
         VALUES (?, ?, ?)`,
        [customer.name, customer.email, customer.image_url],
      );
    }),
  );

  return insertedCustomers;
}

async function seedRevenue() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS revenue (
      month VARCHAR(4) NOT NULL UNIQUE,
      revenue INT NOT NULL
    );
  `);

  const insertedRevenue = await Promise.all(
    revenue.map((rev) => {
      return db.execute(
        `INSERT IGNORE INTO revenue (month, revenue)
         VALUES (?, ?)`,
        [rev.month, rev.revenue],
      );
    }),
  );

  return insertedRevenue;
}

export async function GET() {
  try {
    await seedUsers();
    await seedCustomers();
    await seedInvoices();
    await seedRevenue();

    return Response.json({ message: "Database seeded successfully" });
  } catch (error) {
    console.error(error);
    return Response.json({ error }, { status: 500 });
  }
}

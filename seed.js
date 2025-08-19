const { Client } = require('pg')
const env = require("./config/env");

    (async () => {
        const sql = `
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
                first_name VARCHAR(50) NOT NULL,
                last_name VARCHAR(50) NOT NULL,
                username VARCHAR(30) UNIQUE NOT NULL,
                password TEXT NOT NULL,
                membership_status BOOLEAN DEFAULT false,
                is_admin BOOLEAN DEFAULT false
            );

            CREATE TABLE IF NOT EXISTS message (
                id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
                title VARCHAR(100) NOT NULL,
                text TEXT NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                created_by INTEGER REFERENCES users(id) ON DELETE SET NULL

            );
        `
        const client = new Client({
            host: env.pgHost,
            database: env.pgDb,
            port: env.pgPort,
            user: env.pgUser
        })
        await client.connect()
        const result = await client.query(sql)
        console.log(result)
        await client.end()
})()
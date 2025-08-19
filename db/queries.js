const db = require("../config/db")

async function getUserByUsername(username) {
    const { rows } = await db.query(`
        SELECT * FROM users WHERE username = $1
        `, [username])
    return rows
}

async function getUserById(id) {
    const { rows } = await db.query(`
        SELECT id, username, first_name, last_name, is_admin, membership_status FROM users WHERE id = $1
        `, [id])
    
    return rows
}

async function isUniqueUsername(username) {
    return (await (db.query(`SELECT 1 FROM users WHERE username = $1 LIMIT 1`, [username]))).rows.length === 0
}

async function addUserToDb(firstname, lastname, username, password) {
    await db.query(`
        INSERT INTO users(first_name, last_name, username, password)
        VALUES($1, $2, $3, $4)
        `, [firstname, lastname, username, password])
}

async function addMembershipToUser(id) {
    await db.query(`
        UPDATE users
        SET membership_status = true
        WHERE id = $1
        `, [id])
}

async function addAdminToUser(id) {
    await db.query(`
        UPDATE users
        SET membership_status = true, is_admin = true
        WHERE id = $1
        `, [id])
}

async function addMessageToDb(title, message, createdAt, createdBy) {
    await db.query(`
        INSERT INTO message(title, text, created_at, created_by)
        VALUES($1, $2, $3, $4)`, [title, message, createdAt, createdBy])
}

async function getAllMessages() {
    const { rows } = await db.query(`
        SELECT message.id, message.title, message.text, message.created_at, message.created_by, users.username AS author
        FROM message
        JOIN users ON message.created_by = users.id;
        `)
    
    return rows;
}

async function deleteMessage(id) {
    await db.query(`
        DELETE FROM message
        WHERE id = $1
        `, [id])
}


module.exports = {
    getUserByUsername,
    getUserById,
    isUniqueUsername,
    addUserToDb,
    addMembershipToUser,
    addAdminToUser,
    addMessageToDb,
    getAllMessages,
    deleteMessage
}
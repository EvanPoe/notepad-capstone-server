//prevent cross site scripting attacks
const xss = require('xss')
const bcrypt = require('bcryptjs')

const UsersService = {
    //???serialize basically filters (not important to know in this course)
    serializeUser(user) {
        // console.log(user)
        return {
            id: user.id,
            email: xss(user.email),
        }
    },
    //knex: middleware which helps node connect to database
    getAllUsers(knex) { //knex is loaded in the parent (app.js or server.js) not child
        return knex.select('*').from('users')
    },
    hasUserWithUserName(db, email) {
        //makes sure username doesn't already exist in database
        return db('users')
            .where({ email }) 
            .first()
            .then(user => !!user)
    },
    insertUser(db, newUser) {
        return db
            .insert(newUser)
            .into('users')
            .returning('*')
            .then(([user]) => user)
    },
    //I get validatePassword
    validatePassword(password) {
        if (password.length < 6) {
            return 'Password must be longer than 6 characters'
        }
        if (password.length > 72) {
            return 'Password must be less than 72 characters'
        }
        if (password.startsWith(' ') || password.endsWith(' ')) {
            return 'Password must not start or end with empty spaces'
        }
    },
    //??? generate a "hash" for the password?
    hashPassword(password) {
        return bcrypt.hash(password, 12)
    },
    deleteUser(knex, id) {
        return knex('users')
            .where({ id })
            .delete()
    },
    getById(knex, id) {
        return knex
            .from('users')
            .select('*')
            .where('id', id)
            .first()
    },
}

module.exports = UsersService
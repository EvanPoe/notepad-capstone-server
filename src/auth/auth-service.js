const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config')
//service is helping router connect to database
const AuthService = {
    getUserWithUserName(db, userName) {
        console.log('authServivce:', userName)
        return db('users')
            .where( 'email', userName )
            .first()
    },
    comparePasswords(password, hash) {
        return bcrypt.compare(password, hash)
    },
    //JWT callback() with two standard parameters passed to it
    //create JSON Web Token so you can jump between one page and another without having to login over and over
    //think of it like a bracelet for a park or museum, but expires after a certain time
    createJwt(subject, payload) {
        //"signs" the given payload into a JSON web token...
        return jwt.sign(payload, config.JWT_SECRET, {
            subject,
            algorithm: 'HS256',
        })
    },
    verifyJwt(token) {
        //verifies token with config's secret key 
        return jwt.verify(token, config.JWT_SECRET, {
            algorithms: ['HS256'],
        })
    },
    parseBasicToken(token) {
        //returns BUFFER which hosts the token for its lifetime
        return Buffer
            //a temporary space in the memory where the TOKEN will live before it gets deleted (time limited)
            //very complex, chaned every 5 minutes it's virtually unbreakable
            //creates a new Buffer containing the token JS string (in 'base64' format)
            .from(token, 'base64')
            //converts to string
            .toString()
            //splits with : 
            .split(':')
    },
}

module.exports = AuthService
const express = require('express')
const AuthService = require('./auth-service')

//express is the dashboard for the controller (NODE) express.router() is really NODE.router
//express is what we use in order to "touch" NODE
const authRouter = express.Router()

const jsonBodyParser = express.json()

authRouter
//??? when posting to /login... parse body to JSON... do so with the request, response, and next function 
  .post('/login', jsonBodyParser, (req, res, next) => {
    //email and password are now = req.body's two items and loginUser takes those 
    //values and sets them to email/password
    const {
      email,
      password
    } = req.body
    const loginUser = {
      email,
      password
    }
    //loops through loginUser and returns an error if missing a key
    for (const [key, value] of Object.entries(loginUser))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        })
        //callback function to auth-service
    AuthService.getUserWithUserName(
      //??? I get what's going on through line 60 but not sure how
        req.app.get('db'), //get settings of existing database 
        loginUser.email
      )
      .then(dbUser => { //let response = dbUser
        console.log('dbUser:', dbUser)
        if (!dbUser)
          return res.status(400).json({
            error: 'Incorrect email or password',
          })
        return AuthService.comparePasswords(loginUser.password, dbUser.password)
          .then(compareMatch => { //let response(of what ran just before .then()) = compareMatch
            console.log('compareMatch:', compareMatch)
            if (!compareMatch)
              return res.status(400).json({
                error: 'Incorrect email or password',
              })
              
            const sub = dbUser.email
            const payload = {
              user_id: dbUser.id
            }
            console.log("dbUser:", dbUser)
            console.log('sub:', sub)
            console.log("payload:", payload)
            res.send({
              authToken: AuthService.createJwt(sub, payload),
              userId: dbUser.id
            })
          })
      })
      //??? structure for failure of promise (remember then and catch promises in API calls)
      .catch(next)
  })

module.exports = authRouter
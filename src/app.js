require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const errorHandler = require('./middleware/error-handler')
const usersRouter = require('./users/users-router')
const authRouter = require('./auth/auth-router')
const itemsRouter = require('./items/items-router')

//pushing code to overwrite what's in heroku
const app = express()

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption, {
  skip: () => NODE_ENV === 'test',
}))
app.use(cors())
app.use(helmet())

app.use(express.static('public'))


//load in registration router (post a user to register)
app.use('/api/users', usersRouter)
//load in the authentication router, for login
app.use('/api/auth', authRouter)
//load in the items router
app.use('/api/items', itemsRouter)
app.use(errorHandler)

module.exports = app

//go through router.js and service.js files
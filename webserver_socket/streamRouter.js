const express = require('express')
const shell = require("shelljs") 
var streamRouter = express.Router()

// respond with "hello world" when a GET request is made to the homepage
streamRouter.get('/', function (req, res) {
  res.send("M..mmm..mmmm")
})

module.exports = streamRouter 

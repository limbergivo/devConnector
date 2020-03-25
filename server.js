//add express to the server this is the backend we are going to use  for our application
const express = require('express')

//  this init us to use express 
const app = express()

// testing if our API end point is working 
// req = request & res = response
app.get('/', (req, res) => res.send('API running'))

// this  is going to look for a process variable called PORT  localhost:5000
const PORT = process.env.PORT || 5000;

// this is going to listen to PORT 
app.listen(PORT, () => console.log(`Server has started on ${PORT}`))


// After this process we are going to make script to start these commands in easy manner
// in our package.json we add the following line to start the server on 
//  "start": "node server",
// "server": "nodemon"
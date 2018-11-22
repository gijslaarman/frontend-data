const data = require('./all.json')
const express = require('express')
const app = express()
const port = 8080

// Enable CORS for API use
// https://enable-cors.org/server_expressjs.html
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.get('/api', (req, res) => res.json(data))

app.listen(port, () => console.log(`Listening on port ${port}!`))
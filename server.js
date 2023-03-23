var express = require('express');
var http = require('http');
var app = express();
const statistics = require('./statistics');
const PORT = process.env.PORT || 4000
var server = http.Server(app);

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(express.static('static'))
app.get('/', (req, res) => {
    const { headers } = req;
    const userAgent = headers['user-agent'];
    const clientId = "id" + Math.random().toString(16).slice(2);
    statistics.store(clientId, userAgent, 'tsp', 'start', 0);
    res.sendFile(__dirname + '/static/index-file.html');
})

app.listen(PORT, () => {
  console.log(`Running. Listening to port ${PORT}`)
})
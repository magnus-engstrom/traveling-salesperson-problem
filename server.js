var express = require('express');
var http = require('http');
var path = require('path');
var app = express();
const PORT = process.env.PORT || 5000
var server = http.Server(app);

const { Client } = require('pg');

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(express.static('static'))
app.get('/', (req, res) => {
    const { headers } = req;
    const userAgent = headers['user-agent'];
    if (process.env.ENV == 'prod') {
        const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
        });
        client.connect();
        client.query('INSERT INTO statistics(agent, application, level_id) VALUES($1, $2, $3) RETURNING id', [userAgent, 'tsp', 0], (err,result)=>{
        if (err) {
            console.log(err);
        } else {
            console.log('row inserted with id: ' + result.rows[0].id);
        }
        client.end();
        });
    }
    res.sendFile(__dirname + '/static/index-file.html');
})

app.listen(PORT, () => {
  console.log(`Running. Listening to port ${PORT}`)
})
const express = require('express')
const app = express()
const PORT = process.env.PORT || 5000

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(express.static('static'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/static/index.html');
})

app.listen(PORT, () => {
  console.log(`Running. Listening to port ${PORT}`)
})
const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const { client } = require('../db')

app.get('/jwt', (req, res) => {
    const user = {
        id: 3, username: 'josh'
    }
    const token = jwt.sign(user, 'server secret');

    console.log(token);

    req.send(token);
})

app.get('/me', (req, res) => {
    const auth = req.headers;

    console.log(auth);

    res.sendStatus(200);
})

const PORT = 1337;

async function startServer() {
    try {
        client.connect();
        app.listen(PORT, () => console.log('starting server')); 

        // server will be constantly open, unlike seed which runs once, so ideally,
        // nothing below this line will run
    }
    catch (error) {
        console.error(error);
    } finally {
        // client.end();
    }
}

startServer();
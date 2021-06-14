const PORT = 1337;
const express = require('express');
const app = express();
require('dotenv').config();

const apiRouter = require('./api');
const morgan = require('morgan');
const {client, getAllPosts} = require('./db');

const {rebuildDB} = require('./db/seed');

app.use(express.json());
app.use(morgan('dev'));

// allowing router to handle posts requests
// app.use('/posts', postRouter)


// Top level Middleware
app.use((req, res, next) => {
    console.log(req.method, '--request-received--', req.url)
    next(); // move to next route that matches
});

app.use('/api', apiRouter)

const getMiddleware = (req, res, next) => {
    console.log('---route level middleware---');
    
    // gets isAdmin from query URL 
    // i.e., the ?isAdmin=true
    // if (req.query.isAdmin) {
    //     next();
    // } else {
    //     res.send('Unauthorized');
    // }
    next();
}

// app.use((req, res, next) => {
//     if (req.body) {
//         req.body.secret = 42;
//     }
//     next();
// })

app.post('/api/users', (req, res, next) => {
    console.log('in index.js')
    next();
})

client.connect();
app.listen(PORT, () => {
    console.log('server has started')
    rebuildDB()
})
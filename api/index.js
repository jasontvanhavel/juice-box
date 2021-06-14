const express = require('express');
const apiRouter = express.Router();

const usersRouter = require('./users');
const postsRouter = require('./posts');
const tagsRouter=  require('./tags');
const jwt = require('jsonwebtoken');
const {getUserById} = require('../db');
const {JWT_SECRET} = process.env;


// sets req.user if possible
apiRouter.use('/', async (req, res, next) => {
    console.log('in /api')
    const prefix = 'Bearer ';
    const auth = req.header('authorization');

    if (!auth) {
        console.log('no authorization')
        next();
    } else if (auth.startsWith(prefix)){
            // take out jwt.sign
            const token = auth.slice(prefix.length);
            console.log('token:', token)

            try {
                // deconstruct id out of this
                const {id} = jwt.verify(token, JWT_SECRET);
                console.log('id:', id)

                if (id) {

                    const user = await getUserById(id);
                    req.user = user;
                    next();
                }

            } catch ({name, message}) {
                next({name, message});
            }
        } else {
        next({
            name: 'AuthorizationHeaderError',
            message:`Authorization token must start with ${prefix}`
        })
    } 
})

apiRouter.use('/', (req, res, next) => {
    if (req.user) {
        console.log("user is set:", req.user)
    }

    next();
})

// apiRouter.use((error, req, res, next) => {
//     res.send(error);
// })

apiRouter.use('/users', usersRouter);
apiRouter.use('/posts', postsRouter);
apiRouter.use('/tags', tagsRouter);


module.exports = apiRouter;
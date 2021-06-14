const express = require('express');
const { getAllUsers, getUserByUsername, createUser } = require('../db');
const usersRouter = express.Router();
const jwt = require('jsonwebtoken');

usersRouter.get('/', async (req, res) => {
    const users = await getAllUsers();

    res.send({users});
});

usersRouter.post('/login', async (req, res, next) => {
    const {username, password} = req.body;
    console.log('incoming username:', username);
    console.log('incoming password:', password)

    if(!username || !password) {
        next({
            name: "MissingCredentialsError",
            message: "Please supply both a username and a password"
        });
    }

    try {
        /* this allows the user to sign in as multiple accounts, once
        by id in api/index.js, then by username here.  As far as I can 
        tell, this is what the prompt requires us to do */

        const user = await getUserByUsername(username);
        console.log('user:', user)
        if (user && user.password == password) {
            tokenInfo = jwt.sign({
                username: user.username,
                id: user.id
            }, process.env.JWT_SECRET)
            res.send({message: "you're logged in!", token: tokenInfo});
        } else {
            next({
                name: 'IncorrectCredentialsError',
                message: 'Username or password is incorrect'
            });
        }
    } catch(error){
        console.log(error);
        next(error);
    }
});

usersRouter.post('/register', async (req, res, next) => {
    const {username, password, name, location} = req.body;

    try {
        const _user = await getUserByUsername(username);

        if (_user){
            next({
                name: 'UserExistsError',
                message: 'A user by that usename already exists'
            })
        }

        const user = await createUser({
            username,
            password,
            name,
            location,
        })

        const token = jwt.sign({
            id: user.id,
            username
        }, process.env.JWT_SECRET, {
            expiresIn: '1w'
        })

        res.send({
            message: 'Thank you for signing up',
            token
        })
    } catch ({name, message}){
        next({name, message})
    }
})

module.exports = usersRouter;
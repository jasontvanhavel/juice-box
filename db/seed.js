const {
    client, 
    getAllUsers, 
    getAllPosts,
    createUser, 
    createPost, 
    createTag,
    updateUser,
    updatePost,
} = require('./index');

// async function testDB() {
//     try {

//         let rows = await getAllUsers();

//         console.log(rows);


//     } catch (error) {
//         console.error(error);
//     } finally {
//     }
// }

async function dropTables() {
    try {

        await client.query(`
            DROP TABLE IF EXISTS post_tags;
            DROP TABLE IF EXISTS tags;
            DROP TABLE IF EXISTS posts;
            DROP TABLE IF EXISTS users;
        `);
        
    } catch (error) {
        throw error;
    }
}

async function createTables(){
    try {
        await client.query(`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                username varchar(255) UNIQUE NOT NULL,
                password varchar(255) NOT NULL,
                name varchar(255) NOT NULL,
                location varchar(255) NOT NULL,
                active BOOLEAN DEFAULT true
            );
        `);

        await client.query(`
            CREATE TABLE posts (
                id SERIAL PRIMARY KEY,
                authorID INTEGER REFERENCES users(id) NOT NULL,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                active BOOLEAN DEFAULT true
            );
        `);

        await client.query(`
            CREATE TABLE tags (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL
            );
        `)

        await client.query(`
            CREATE TABLE post_tags (
                postID INTEGER REFERENCES posts(id),
                tagID INTEGER REFERENCES tags(id),
                UNIQUE(postID, tagID)
            );
        `)
    } catch (error) {
        throw error;
    }
}

async function populateDB() {
    // await client.query(`
    //     INSERT INTO users (username, password)
    //     VALUES
    //         ('albert', 'bertie99'),
    //         ('user2', 'ajwklf')
    // `)

    let users = [
        {username: 'albert', password: 'bertie99', name: 'Al Bert', location: 'Chicago'},
        {username: 'sandra', password: '2sandy4me', name: 'Sandy', location: 'Los Angeles'},
        {username: 'glamgal', password: 'soglam', name: 'Glammy', location: 'Pheonix'},
    ];

    await Promise.all(
        users.map(async (user) => {
            return createUser(user);
    }));

    let posts = [
        {authorID: 1, title: 'post by albert', content: 'first post by albert'},
        {authorID: 1, title: 'post by albert', content: 'second post by albert'},
        {authorID: 2, title: 'post by sandra', content: 'first post by sandra'}
    ]

    await Promise.all(
        posts.map(async (post) => {
            return createPost(post);
        })
    );
}

async function rebuildDB() {
    try {
        console.log('connecting to db...')

        console.log('dropping tables....')
        await dropTables();

        console.log('creating tables....')
        await createTables();

        console.log('tables created')

        console.log('populating tables...')
        await populateDB();

        console.log('tables populated')

        await updateUser(3, {
            name: 'Jason', 
            location: 'Reno',
            active: false,
        });
        console.log('user 3 updated')

        console.log(await createTag(['#tag1', '#tag2', '#tag3']));

        console.log("updating post 2")
        console.log(await updatePost(3, {
            title: 'updated post by albert', content: 'second post update', active: true
        }));
        console.log('post 2 updated')

        

    } catch (error) {
        console.error(error);
    } finally {
    }
}

module.exports = {rebuildDB};
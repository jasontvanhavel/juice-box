// DATABASE
const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/juicebox-dev'


let config = { connectionString } // both configs use connectionString


if (process.env.DATABASE_URL) {
  config.ssl = { rejectUnauthorized: false }
}

const client = new Client(config)

//
// GET functions
//

async function getAllUsers(){
    const {rows} = await client.query(`SELECT * FROM users`);

    return rows;
}

async function getAllPosts() {
    try {
        const {rows} = await client.query(`SELECT * FROM posts`);

        return rows;
  
    } catch (error) {
      throw error;
    }
}

async function getUserById(id) {
    try {
        const {rows} = await client.query(`
            SELECT * FROM users
            WHERE "id"=$1;
        `, [id])

        return rows;
    } catch (error) {
        console.error('error in getUserByID:');
        console.error(error);
    }
}

async function getUserByUsername(username) {
    try {
        const {rows: [user]} = await client.query(`
            SELECT *
            FROM users
            WHERE username=$1;
        `, [username]);

        return user;
    } catch (error) {
        throw error;
    }
}

async function getPostsByUser(userId) {
    try {
      const { rows } = client.query(`
        SELECT * FROM posts
        WHERE "authorId"=${ userId };
      `);
  
      return rows;
    } catch (error) {
      throw error;
    }
}

async function getAllTags(){
    const {rows} = await client.query(`SELECT * FROM tags`);

    return rows;
}

async function getPostById(postId) {
    try {
      const { rows: [ post ]  } = await client.query(`
        SELECT *
        FROM posts
        WHERE id=$1;
      `, [postId]);

      if (!post) {
        throw {
          name: "PostNotFoundError",
          message: "Could not find a post with that postId"
        };
      }
  
      const { rows: tags } = await client.query(`
        SELECT tags.*
        FROM tags
        JOIN post_tags ON tags.id=post_tags."tagId"
        WHERE post_tags."postId"=$1;
      `, [postId])
  
      const { rows: [author] } = await client.query(`
        SELECT id, username, name, location
        FROM users
        WHERE id=$1;
      `, [post.authorId])
  
      post.tags = tags;
      post.author = author;
  
      delete post.authorId;
  
      return post;
    } catch (error) {
      throw error;
    }
  }

//
// CREATE functions
//

async function createUser({username, password, name, location}) {

    // the $ notation is only for pg; avoids SQL injection
    const {rows} = await client.query(`
        INSERT INTO users (username, password, name, location)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `, [username, password, name, location])

    console.log('created user:', rows)
    return rows;

}

async function createPost({
    authorID, 
    title,
    content, 
    tags = []
}){
    try {
        const newPost = await client.query(`
            INSERT INTO posts (authorID, title, content)
            VALUES ($1, $2, $3)
            RETURNING *;
        `, [authorID, title, content])

        const tagList = await createTag(tags)
        console.log('created post:', newPost.rows)
        return newPost

    } catch (error){
        throw error;
    }
}

async function createPostTag(postId, tagId) {
    try {
      await client.query(`
        INSERT INTO post_tags("postId", "tagId")
        VALUES ($1, $2)
        ON CONFLICT ("postId", "tagId") DO NOTHING;
      `, [postId, tagId]);
    } catch (error) {
      throw error;
    }
  }

async function createTag(tagList){
    if (tagList.length === 0)
        return ;

    const insertValues = tagList.map(
        (_, index) => `$${index + 1}`).join('), (');

    const selectValues = tagList.map(
        (_, index) => `$${index + 1}`).join(', ');

    try {
        client.query(`
            INSERT INTO tags (name)
            VALUES (${insertValues});
        `, [...tagList]);

        const {rows} = (await client.query(`
            SELECT * FROM tags
            WHERE name IN (${selectValues});
        `, [...tagList]));

        return rows;

    } catch (error){
        throw error;
    }
}

async function addTagsToPost(postId, tagList) {
    try {
      const createPostTagPromises = tagList.map(
        tag => createPostTag(postId, tag.id)
      );
  
      await Promise.all(createPostTagPromises);
  
      return await getPostById(postId);
    } catch (error) {
      throw error;
    }
  }

//
// UPDATE functions
//

async function updateUser(id, fields) {
    // fields obj: { name: 'Alan', location: 'New York'}

    const setString = Object.keys(fields).map(
        (key, index) => `"${key}"=$${index + 2}`
    ).join(', ');

    if(setString.length === 0) 
        return ;

    const {rows} = await client.query(`
        UPDATE users
        SET ${setString}
        WHERE id = $1
        RETURNING *;
    `, [id, ...Object.values(fields)])

    return rows;
}

async function updatePost(id, {
    title,
    content,
    active
  }) {
    try {
    
        const {rows} = await client.query(`
            UPDATE posts
            SET title=$2, content=$3, active=$4
            WHERE id = $1
            RETURNING *;
        `, [id, title, content, active])
    
        return rows;
    } catch (error) {
      throw error;
    }
  }

module.exports = {
    client, 
    getAllUsers, 
    getAllPosts,
    getAllTags,
    getUserById,
    getUserByUsername,
    getPostsByUser,
    getPostById,
    addTagsToPost,
    createUser, 
    createPost, 
    createTag,
    updateUser,
    updatePost,
};
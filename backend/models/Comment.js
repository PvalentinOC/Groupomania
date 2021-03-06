const db = require('../config/db');

class Comment {
    constructor(comment, userID, postId) {
        this.comment = comment;
        this.userID = userID;
        this.postId = postId;
    }

    save() {
        

        let sql = `
        INSERT INTO comment(
           comment,
           author_ID,
           post_ID
        )
        VALUES(
            '${this.comment}',
            '${this.userID}',
            '${this.postId}'
        )
        `;
        return db.execute(sql)
        
    }

    static findAll() {
        let sql = "SELECT comment.post_ID,comment.ID,comment.comment,comment.created_at, comment.author_ID, user.username from comment INNER JOIN user ON comment.author_ID = user.ID ORDER BY id DESC;";

        return db.execute(sql);
    }

    static findById(id) {
        let sql = `SELECT comment.post_ID,comment.ID,comment.comment,comment.created_at, comment.author_ID, user.username from comment INNER JOIN user ON comment.author_ID = user.ID where comment.ID = ${id};`;
        return db.execute(sql);
    }
    
    static deleteComment(id) {
        let sql = `Delete from comment where ID = ${id};`;

        return db.execute(sql);
    }
}

module.exports = Comment;
const db = require("../config/db");

function getByUserId(userId) {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT id, videoId, title, thumbnailUrl, createdAt
       FROM Favorites
       WHERE userId = ?
       ORDER BY id DESC`,
            [userId],
            (err, rows) => (err ? reject(err) : resolve(rows))
        );
    });
}

function addFavorite({ userId, videoId, title, thumbnailUrl, createdAt }) {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT OR IGNORE INTO Favorites (userId, videoId, title, thumbnailUrl, createdAt)
       VALUES (?, ?, ?, ?, ?)`,
            [userId, videoId, title, thumbnailUrl, createdAt],
            function (err) {
                if (err) return reject(err);
                resolve(this.lastID);
            }
        );
    });
}

// חשוב: מוחקים לפי id + userId כדי שלא ימחקו של משתמש אחר
function deleteById(userId, favoriteId) {
    return new Promise((resolve, reject) => {
        db.run(
            `DELETE FROM Favorites WHERE id = ? AND userId = ?`,
            [favoriteId, userId],
            function (err) {
                if (err) return reject(err);
                resolve(this.changes); // מספר שורות שנמחקו
            }
        );
    });
}

module.exports = { getByUserId, addFavorite, deleteById };

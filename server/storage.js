const util = require('util');
const assert = require('assert');

const sqlite3 = require('sqlite3');

class Storage {
    constructor(db) {
        this._db = db;
    }

    saveImage({id, file, thumbnail, description}) {
        return this._db.runAsync('INSERT INTO images (id, file_path, description) VALUES (?, ?, ?)', [id, file, description]);
    }

    async getImage(id) {
        const row = await this._db.getAsync('SELECT id, file_path, description FROM images WHERE id=?', [id]);
        mapImageRow(row);
    }

    async getAllImages() {
        const rows = await this._db.allAsync('SELECT id, file_path, description FROM images');
        return rows.map(mapImageRow);
    }
}

const mapImageRow = ({id, file_path, description}) => ({id, file: file_path, description});

function createStorage(filePath) {
    return new Promise((resolve, reject) => {
        const mode = sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE;
        const db = new sqlite3.Database(filePath, mode, async (err) => {
            if (err) {
                reject(err);
            } else {
                promisifyObject(db);
                try {
                    await ensureTableSchema(db);
                    resolve(new Storage(db));
                } catch (e) {
                    reject(e);
                    return;
                }
            }
        });
    });
}

function promisifyObject(obj) {
    for (const fieldName in obj) {
        const field = obj[fieldName];
        if (typeof field === 'function') {
            const asyncFieldName = fieldName + 'Async';
            assert(!(asyncFieldName in obj), `Field ${asyncFieldName} already exists in the object`);
            obj[asyncFieldName] = util.promisify(field.bind(obj));
        }
    }
    return obj;
}

async function ensureTableSchema(db) {
    await db.runAsync(`CREATE TABLE IF NOT EXISTS images (
                           id TEXT NOT NULL PRIMARY KEY,
                           file_path TEXT NOT NULL UNIQUE,
                           description TEXT
    )`);
}

module.exports = createStorage;

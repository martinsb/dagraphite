const path = require('path');
const fs = require('fs');
const os = require('os');

const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');

const createStorage = require('./storage');
const slowerMiddleware = require('./slower');

const app = express();
const jsonParser = bodyParser.json();

//artificially slows down server response time from 1 to 10 sec.
app.use(slowerMiddleware(1000, 10000));

app.use(function(req, res, next) {
    jsonParser(req, res, function(err) {
        if (err instanceof SyntaxError) {
            res.status(400).send('Invalid JSON syntax');
            return;
        }
        next.apply(null, arguments);
    });
});
app.use(bodyParser.urlencoded({extended: true}));


const uploadDir = path.resolve(path.join(__dirname, '../public/tmp/'));
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
const upload = multer({dest: os.tmpdir()});

const httpPort = 8080;

let storage;
(async function() {
    try {
        storage = await createStorage(path.join(__dirname, 'dagraphite.db'));
    } catch (e) {
        console.error('Could not create storage', e);
        process.exit(1);
    }
})();

app.get('/api/images', async function(req, res, next) {
    try {
        const images = await storage.getAllImages();
        res.status(200).json(images.map(({id, file, description}) => ({
            id,
            url: '/' + file,
            description
        })));
    } catch (e) {
        console.error('Could not fetch images', e);
        res.status(500).send('Internal server error');
    }
});

app.get('/api/images/:id', async function(req, res, next) {
    try {
        const image = await storage.getImage(req.params.id);
        if (!image) {
            res.status(404).send('Image not found');
            return;
        }
        res.status(200).json({
            id: image.id,
            url: '/' + image.file,
            description: image.description,
        });
    } catch (e) {
        console.error('Could not fetch single image', e);
        res.status(500).send('Internal server error');
    }
});

app.patch('/api/images/:id', async function(req, res, next) {
    try {
        const image = await storage.getImage(req.params.id);
        if (!image) {
            res.status(404).send('Image not found');
            return;
        }
        const description = req.body.description || '';
        await storage.updateImage(image.id, {description});
        res.status(200).end();
    } catch (e) {
        console.error('Could not update image', e);
        res.status(500).send('Internal server error');
    }
});

app.post('/api/images', upload.single('image'), async function(req, res, next) {
    const {id} = req.body;
    if (!id) {
        res.status(400).send('No image ID is provided');
        return;
    }
    let destPath = path.join(uploadDir, req.file.originalname.replace(/\s+/g, '_'));
    if (fs.existsSync(destPath)) {
        //Since a file with such name already exists in our FS,
        //let's find another suitable name for the uploaded file.
        //We also do not limit iteration count for the sake of simplicity.
        let iteration = 0;
        const filenameParts = req.file.originalname.split('.');
        do {
            iteration++;
            const filenameToTest = [`${filenameParts[0]}_(${iteration})`, ...filenameParts.slice(1)].join('.');
            destPath = path.join(uploadDir, filenameToTest);
        } while (fs.existsSync(destPath));
    }
    fs.copyFileSync(req.file.path, destPath);
    const urlPath = path.relative(path.resolve(path.join(__dirname, '../public')), destPath);
    try {
        await storage.saveImage({id, file: urlPath});
        res.status(201).end();
    } catch (e) {
        console.error('Could not save image', e);
        res.status(500).send('Internal server error, something went wrong');
        return;
    }
});

app.listen(httpPort, function() {
    console.log(`App started and listening to port ${httpPort}`);
});

const Tesseract = require('tesseract.js');
const express = require('express');
const cors = require('cors');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const app = express();
app.use(cors());

const coordinates = { lat: 0, lng: 0 };
let clients = [];

const sleep = () => new Promise((resolve) => setTimeout(resolve, 10000));

async function run() {
    await sleep();

    while (true) {
        const lat = await getCoordinate('lat');
        const lng = await getCoordinate('lng');

        if (
            !isNaN(Number(lat)) &&
            !isNaN(Number(lng)) &&
            Number(lat) > 0 &&
            Number(lng) > 0 &&
            lat.length &&
            lng.length &&
            lat > 0 &&
            lng > 0
        ) {
            console.log('SUCCESSFULLY PARSED:', lat, lng);
            coordinates.lat = lat;
            coordinates.lng = lng;

            sendEventsToAll();
        } else {
            console.log('FAILED TO PARSE:', lat, lng);
        }
    }
}

async function getCoordinate(arg) {
    const { stdout, stderr } = await exec(`./capture.ps1 ${arg}`, {
        shell: 'powershell.exe',
    });

    const parsed = stdout.split('System.IO.dll\r\n')[1];

    if (!parsed) return;

    const replaced = parsed.replace(/\r\n/g, ',');
    const arrayBuffer = replaced.split(',');
    const finalArray = new Uint8Array(arrayBuffer);

    const worker = Tesseract.createWorker();

    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');

    const coord_response = await worker.recognize(finalArray);

    await worker.terminate();

    const coordinate = coord_response.data.text.split('\n')[0];

    return coordinate;
}

function eventsHandler(req, res, next) {
    const headers = {
        'Content-Type': 'text/event-stream',
        Connection: 'keep-alive',
        'Cache-Control': 'no-cache',
    };

    res.writeHead(200, headers);

    const data = `coordinates: ${JSON.stringify(coordinates)}\n\n`;

    res.write(data);

    const clientId = Date.now();

    const newClient = {
        id: clientId,
        res,
    };

    clients.push(newClient);

    req.on('close', () => {
        console.log(`${clientId} Connection closed`);
        clients = clients.filter((client) => client.id !== clientId);
    });
}

function sendEventsToAll() {
    clients.forEach((client) =>
        client.res.write(`data: ${JSON.stringify(coordinates)}\n\n`)
    );
}

app.get('/events', eventsHandler);

app.get('/coordinates', (req, res) => res.json({ lat, lng }));

app.listen(5000, () => {
    console.log('Server running on port: 5000');

    try {
        run();
    } catch (err) {
        err;
    }
});

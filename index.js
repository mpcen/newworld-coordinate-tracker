const Tesseract = require('tesseract.js');
const express = require('express');
const cors = require('cors');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const app = express();
app.use(cors());

const coordinates = { lat: 0, lng: 0 };
let clients = [];

const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));

async function run() {
    await sleep(3500);

    const worker = Tesseract.createWorker();

    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    await worker.setParameters({
        tessedit_char_whitelist: '0123456789,. ',
    });

    while (true) {
        sleep(50)
        const ocrResponse = await getCoordinates(worker);
        console.log('ocrResponse:', ocrResponse);
        
        if (!ocrResponse) continue;

        const dirtyCoordinates = ocrResponse.trim().split(' ');
        console.log('dirtyCoordinates:', dirtyCoordinates);

        if (dirtyCoordinates.length !== 3) {
            console.log('Bad OCR response, skipping this iteration');
            continue;
        }

        const cleanedCoordinates = dirtyCoordinates.map((coordinate) => {
            const commasRemoved = coordinate.split(',').join('.');
            return commasRemoved.split('.')[0];
        });

        const [lng, lat, ele] = cleanedCoordinates;

        if (
            Number(lng) &&
            Number(lat) &&
            lat > 0 &&
            lng > 0 &&
            lng > 4500 &&
            lng < 15000 &&
            lat < 15000
        ) {
            coordinates.lng = lng;
            coordinates.lat = lat;

            console.log('SUCCESS:', lng, lat);
            sendEventsToAll();
        } else {
            console.error('FAILED:', lng, lat);
        }
    }
}

async function getCoordinates(worker) {
    const { stdout, stderr } = await exec(`./capture.ps1`, {
        shell: 'powershell.exe',
    });

    if (!stdout.includes('System.IO.dll')) {
        //honestly no idea how to handle this edge case
        return
    }
    const parsed = stdout.substring(stdout.indexOf('System.IO.dll') + 'System.IO.dll'.length).trim();

    if (!parsed) return;

    const replaced = parsed.replace(/\r\n/g, ',');
    const arrayBuffer = replaced.split(',');
    const finalArray = new Uint8Array(arrayBuffer);

    const coord_response = await worker.recognize(finalArray);

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

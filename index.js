const Tesseract = require('tesseract.js');
const express = require('express');
const cors = require('cors');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const app = express();
app.use(cors());

const coordinates = { lat: 0, lng: 0 };
const previousCoordinates = { lat: 0, lng: 0 };
const potentialNextCoordinates = { lat: 0, lng: 0 };
let connectedClients = [];

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
        sleep(50);
        const ocrResponse = await getCoordinates(worker);

        if (!ocrResponse) continue;

        const dirtyCoordinates = ocrResponse.trim().split(' ');

        if (dirtyCoordinates.length !== 3) {
            console.log('Bad OCR response, skipping this iteration');
            continue;
        }

        const cleanedCoordinates = dirtyCoordinates.map((coordinate) => {
            const commasRemoved = coordinate.split(',').join('.');
            return commasRemoved.split('.')[0];
        });

        const [lng, lat, ele] = cleanedCoordinates;

        // Make sure the lng/lat are within Aeternum's bounds
        if (
            Number(lng) &&
            Number(lat) &&
            lat > 75 &&
            lat < 10200 &&
            lng > 4500 &&
            lng < 14300
        ) {
            // The following conditionals prevent nasty discrepancies causing coordinates to jump
            if (
                Math.abs(lat - previousCoordinates.lat) < 100 &&
                Math.abs(lng - previousCoordinates.lng) < 100
            ) {
                previousCoordinates.lng = lng;
                previousCoordinates.lat = lat;
            } else if (
                Math.abs(lat - potentialNextCoordinates.lat) < 100 &&
                Math.abs(lng - potentialNextCoordinates.lng) < 100
            ) {
                previousCoordinates.lng = lng;
                previousCoordinates.lat = lat;
            } else {
                // Handle fast-travel case
                previousCoordinates.lng = lng;
                previousCoordinates.lat = lat;

                console.log('Possible fast travel. Skipping');
                continue;
            }

            coordinates.lng = lng;
            coordinates.lat = lat;

            console.log('SUCCESS:', lng, lat);
            sendEventsToAll();
        } else {
            console.error('FAILED! Out of bounds:', lng, lat);
        }
    }
}

async function getCoordinates(worker) {
    const { stdout, stderr } = await exec(`./capture.ps1`, {
        shell: 'powershell.exe',
    });

    if (!stdout.includes('System.IO.dll')) {
        //honestly no idea how to handle this edge case
        return;
    }
    const parsed = stdout
        .substring(stdout.indexOf('System.IO.dll') + 'System.IO.dll'.length)
        .trim();

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

    connectedClients.push(newClient);

    req.on('close', () => {
        console.log(`${clientId} Connection closed`);
        connectedClients = connectedClients.filter(
            (client) => client.id !== clientId
        );
    });
}

function sendEventsToAll() {
    connectedClients.forEach((client) =>
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

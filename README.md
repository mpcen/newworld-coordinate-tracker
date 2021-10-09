# ceN's Coordinate Tracker

## This is a coordinate tracker for New World that uses [Tesseract.js](https://tesseract.projectnaptha.com/) OCR library built with [Node.js](https://nodejs.org) and a Powershell script.

## **This tool does NOT read/write to the games memory.**

## How it works

-   The node application streams your latitude and longitude via a Server Sent Event (SSE).
-   The powershell application takes a screenshot at a specific offset and sends the image bitmap back to node via a MemoryStrem

## The flow

1. Node calls the powershell script to capture either lat/lng.
2. Powershell takes the request and captures either lat/lng and sends the image bitmap back to node in a memory stream
3. Node receives the bitmap, and sends it to Tesseract
4. Tesseract does its best to parse the numbers from the image and returns it back to node
5. Node gets the parsed data from Tesseract. If the text is valid, it sends it to clients connected to `http://localhost:3000/events` via an SSE

---

## Resolutions Tested

-   1920x1080

---

## Pre-Reqs

-   [nodev14.18.0 LTS](https://nodejs.org/dist/v14.18.0/node-v14.18.0-x64.msi)

## Building From Source

-   run `npm install`
-   run `npm run build`. This will create `server.exe`

## Running From Source

-   run `npm install`
-   run `npm start`. This will start the server running at `http://localhost:5000`

## License

-   This project is licensed under the [MIT](./LICENSE.txt) license
-   Tesseract is licensed under [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) license

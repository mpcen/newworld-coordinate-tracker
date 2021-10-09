# ceN's Coordinate Tracker

## This is a coordinate tracker for [newworld-map.com](https://www.newworld-map.com/) that uses [Tesseract.js](https://tesseract.projectnaptha.com/) OCR library built with [Node.js](https://nodejs.org) and a Powershell script. This streams your latitude and longitude via a Server Side Event (SSR).

## **This tool does NOT read/write to the games memory.**

---

## Resolutions Tested

-   1920x1080

---

## Pre-Reqs

-   Download and install node.js version: [nodev14.18.0 LTS](https://nodejs.org/dist/v14.18.0/node-v14.18.0-x64.msi)
-   Navigate to repository root directory from powershell.

## Building From Source

-   Using powershell, navigate to project root and run `npm install`
-   Using powershell, run `npm run build`. This will create `server.exe`

## Running From Source

-   Using powershell, navigate to project root and run `npm install`
-   Using powershell, run `npm start`. This will start the server

## License

-   This project is licensed under the [MIT](./LICENSE.txt) license
-   Tesseract is licensed under [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) license

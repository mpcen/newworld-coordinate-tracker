# ceN's Coordinate Tracker

## This is a coordinate tracker for New World that uses [Tesseract.js](https://tesseract.projectnaptha.com/) OCR library built with [Node.js](https://nodejs.org) and a Powershell script.

## **This tool does NOT read/write to the games memory.**

## How it works

1. Node calls the powershell script to capture the players position.
2. Powershell takes the request and captures character position and sends the image bitmap back to node in a memory stream.
3. Node receives the bitmap, runs it through an image filter, then sends the filtered image to Tesseract.
4. Tesseract does its best to parse the numbers from the image and returns it back to node.
5. Node gets the parsed data from Tesseract. If the text is valid, it sends it to clients connected to `http://localhost:5000/events` via an SSE.

---
## Roadmap
- Easy-to-run executable
- Chrome Extension
- User configurable options/profiles
- Standalone map independent of newworld-map.com
---

## Resolutions

- Works on all resolutions

---

## Pre-Reqs

-   [nodev14.18.0 LTS](https://nodejs.org/dist/v14.18.0/node-v14.18.0-x64.msi)

## Running From Source

-   run `npm install`
-   run program from debugger by launching the `Launch Program` task or run `npm start` from powershell. For some reason running npm start from vscode doesnt work right

## Generate an executable (Experimental)

-   run `npm install`
-   run `npm run build`. This will create `server.exe`

## License

-   This project is licensed under the [MIT](./LICENSE.txt) license
-   Tesseract is licensed under [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) license

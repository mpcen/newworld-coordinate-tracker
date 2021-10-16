import { windowNames, NewWorldClassId } from "./consts";
import {
  OWGames,
  OWGameListener,
  OWWindow,
  OWGamesEvents
} from '@overwolf/overwolf-api-ts';
import RunningGameInfo = overwolf.games.RunningGameInfo;
export class Renderer {
  private static _instance: Renderer;

  constructor() {
  }
  public static instance(): Renderer {
    if (!Renderer._instance) {
      Renderer._instance = new Renderer();
    }

    return Renderer._instance;
  }

  async isGameRunning(): Promise<boolean> {
    const info = await OWGames.getRunningGameInfo();
    return info && info.isRunning && this.isGameNewWorld(info);
  }

  getGameInfo(): Promise<any> {
    return new Promise((resolve, reject) => {
      overwolf.games.events.getInfo((info) => {
        if (info.success) {
          resolve(info.res);
        } else {
          reject(info);
        }
      });
    });
  }

  async getPlayerCoordinates(): Promise<[number, number]> {
    overwolf.games.events.setRequiredFeatures(['game_info'], () => undefined);
    const info = await this.getGameInfo();
    const locationString = info?.game_info?.location
    let coordinateString = ""
    let x = 0, y = 0
    if (locationString){
      const locationArray = locationString.split(",")
      x = parseInt(locationArray[1])
      y = parseInt(locationArray[3])
      coordinateString = x + ", " + y;

    }
    else {
      coordinateString = "could not parse coordinates"
    }
    document.getElementById("coordinates").innerText = coordinateString;

    return [x, y]
  }

  private isGameNewWorld(info: RunningGameInfo) {
    return info.classId === NewWorldClassId;
  }

}

var g_interestedInFeatures = [
  'game_info',
  'gep_internal'
];

var onErrorListener, onInfoUpdates2Listener, onNewEventsListener;
function registerEvents() {
  onErrorListener = function (info) {
    console.log("Error: " + JSON.stringify(info));
  }

  onInfoUpdates2Listener = function (info) {
    console.log("Info UPDATE: " + JSON.stringify(info));
  }

  onNewEventsListener = function (info) {
    console.log("EVENT FIRED: " + JSON.stringify(info));
  }
  overwolf.games.events.onError.addListener(onErrorListener);
  overwolf.games.events.onInfoUpdates2.addListener(onInfoUpdates2Listener);
  overwolf.games.events.onNewEvents.addListener(onNewEventsListener);
}

function setFeatures() {
  overwolf.games.events.setRequiredFeatures(g_interestedInFeatures, function (info) {
    if (info.error) {
      //console.log("Could not set required features: " + info.reason);
      //console.log("Trying in 2 seconds");
      window.setTimeout(setFeatures, 2000);
      return;
    }

    console.log("Set required features:");
    console.log(JSON.stringify(info));
  });
}

setFeatures()

async function repeatWithTimeout() {
  await setTimeout(async () => { 
    let [x,y] = await Renderer.instance().getPlayerCoordinates(); 
    if (x != 0 && y != 0){
      let newsrc = `https://www.newworld-map.com/#/?lat=${y}&lng=${x}`;
      (document.getElementById("map_iframe") as HTMLIFrameElement).src = newsrc
    }
    repeatWithTimeout() }, 50)
}
repeatWithTimeout()



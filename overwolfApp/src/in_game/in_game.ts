import { AppWindow } from "../AppWindow";
import {
  OWGamesEvents,
  OWHotkeys
} from "@overwolf/overwolf-api-ts";
import {  hotkeys, windowNames,  } from "../consts";
import WindowState = overwolf.windows.WindowStateEx;

// The window displayed in-game while a Fortnite game is running.
// It listens to all info events and to the game events listed in the consts.ts file
// and writes them to the relevant log using <pre> tags.
// The window also sets up Ctrl+F as the minimize/restore hotkey.
// Like the background window, it also implements the Singleton design pattern.
class InGame extends AppWindow {
  private static _instance: InGame;
 
  private constructor() {
    super(windowNames.inGame);
  }

  public static instance() {
    if (!this._instance) {
      this._instance = new InGame();
    }

    return this._instance;
  }

  public run() {
  }
}

InGame.instance().run();

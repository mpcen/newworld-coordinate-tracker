import { windowNames, NewWorldClassId } from "../consts";
import {
  OWGames,
  OWGameListener,
  OWWindow
} from '@overwolf/overwolf-api-ts';
import RunningGameInfo = overwolf.games.RunningGameInfo;


class BackgroundController {
  private static _instance: BackgroundController;
  private _windows = {};
  private _GameListener: OWGameListener;

  private constructor() {
    // Populating the background controller's window dictionary
    this._windows[windowNames.desktop] = new OWWindow(windowNames.desktop);
    this._windows[windowNames.inGame] = new OWWindow(windowNames.inGame);

    // When a Fortnite game is started or is ended, toggle the app's windows
    this._GameListener = new OWGameListener({
      onGameStarted: this.toggleWindows.bind(this),
      onGameEnded: this.toggleWindows.bind(this)
    });
  };

  // Implementing the Singleton design pattern
  public static instance(): BackgroundController {
    if (!BackgroundController._instance) {
      BackgroundController._instance = new BackgroundController();
    }

    return BackgroundController._instance;
  }

  public async run() {
    this._GameListener.start();
    const currWindow = windowNames.desktop;
    this._windows[currWindow].restore();
  }

  private toggleWindows(info) {
    if (!info || !this.isGameNewWorld(info)) {
      return;
    }
    this._windows[windowNames.desktop].restore();
  }

  private isGameNewWorld(info: RunningGameInfo) {
    return info.classId === NewWorldClassId;
  }
}

BackgroundController.instance().run();

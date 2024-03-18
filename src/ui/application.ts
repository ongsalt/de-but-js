import { environment } from "../lib/init";
import { Window2 } from "./windows";

// An app is just a set of window
// user guide: extend this
export abstract class Application {
    windows: Window2[] = []
    AppWindow: new (...args: any) => Window2 = Window2 // Allow custom window class (i should extract window2 interface)

    public name: string = "Application"
    public iconPath: string = "/img/slime_2.gif"

    // icon is path 
    // i need a way to package an app
    constructor() {

    }

    newWindow() {
        const it = new this.AppWindow(this)
        this.windows.push(it)
        environment.onWindowCreated(it)
    }

    closeWindow(w: Window2) {
        this.windows = this.windows.filter(it => it !== w)
        environment.onWindowDestroy(w)
    }


}
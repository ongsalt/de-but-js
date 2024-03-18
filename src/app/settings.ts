import { fromString } from "../lib/template";
import { v4 as uuidv4 } from 'uuid';
import { Application } from "../ui/application";
import { Window2 } from "../ui/windows";
import { environment } from "../lib/init";

export class Settings extends Application {
    AppWindow = SettingsWindow;

    public name: string = "Settings"
    public iconPath: string = "/img/slime_2.gif"

    constructor() {
        super()
    }

    override newWindow(): void {
        const it = new this.AppWindow(this)
        this.windows.push(it)
        environment.onWindowCreated(it)
    }
}

export class SettingsWindow extends Window2 {
    constructor(public app: Application, public id: string = uuidv4()) {
        super(app, id)
        this.innerContent.textContent = 'Allahu akbar'
    }
}
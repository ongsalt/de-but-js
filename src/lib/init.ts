import { Settings } from "../app/settings";
import { DesktopEnvironment } from "./environment";

// Need to defer taskbar rendering until register all app
export const environment = new DesktopEnvironment()
environment.registerApp(Settings)

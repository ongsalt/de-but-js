import { Menubar } from "../ui/menubar"
import { Taskbar } from "../ui/taskbar"
import { Flow } from "./flow"
import { Window2 } from "../ui/windows"
import { Application } from "../ui/application"


/**
 * TODO
 * - Properly singleton
 */

export class DesktopEnvironment {
    windows: Window2[] = []
    apps: Application[] = []
    wmRoot: HTMLElement
    menubar: Menubar
    taskbar: Taskbar
    activeWindow = new Flow<Window2 | undefined>(undefined)

    // I might need WeekRef to fix the listener
    isMaximize = new Flow(false)

    constructor() {
        this.wmRoot = document.getElementById('wm')!
        const menubarContainer = document.getElementById('menubar-container')!

        this.menubar = new Menubar(this)
        this.taskbar = new Taskbar(this)

        this.menubar.mount(this.wmRoot)
        this.taskbar.mount(this.wmRoot)

        this.registerActiveWindow()
    }

    registerActiveWindow() {
        const setIsMaximized = (value: boolean) => this.isMaximize.value = value

        this.activeWindow.subscribe((w, oldW) => {
            oldW?.isMaximized.unsubscribe(setIsMaximized)
            this.isMaximize.value = w?.isMaximized.value ?? false
            w?.isMaximized.subscribe(setIsMaximized)
        })
    }

    newWindow() {
        const newWindow = new Window2(new Application())
        this.onWindowCreated(newWindow)
    }

    onWindowCreated(newWindow: Window2) {
        this.windows.push(newWindow)
        newWindow.mount(this.wmRoot)
        this.taskbar.update()
    }

    onWindowDestroy(w: Window2) {
        this.windows = this.windows.filter(it => it !== w)
        this.taskbar.update()
    }
    
    closeWindow(window: Window2) {
        this.windows = this.windows.filter(it => it !== window)
    }

    // Need to set id for an app as well
    registerApp<App extends Application>(App: new (...args: any) => App) {

        const app = new App()
        this.apps.push(app)
        // console.log('registered', App)
        
        this.taskbar.update()
        // Update taskbar
    }
}
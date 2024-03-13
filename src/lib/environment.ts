import { Menubar } from "../ui/menubar"
import { Taskbar } from "../ui/taskbar"
import { Flow } from "./flow"
import { Window2 } from "./windows"

export class DesktopEnvironment {
    windows: Window2[] = []
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

            console.log(w, oldW)
            this.isMaximize.value = w?.isMaximized.value ?? false
            w?.isMaximized.subscribe(setIsMaximized)
        })
    }

    newWindow() {
        const newWindow = new Window2()
        newWindow.mount(this.wmRoot)
        // Should only care about focused window

        this.windows.push(newWindow)
    }
}
import { fromString } from "../lib/template"
import { DesktopEnvironment } from "../lib/environment"
import { Application } from "./application"

export class Taskbar {

    get apps(): Application[] {
        return this.de.apps
    }
    taskbar: HTMLElement
    taskbarRoot: HTMLElement
    appsHolder: HTMLElement

    constructor(private de: DesktopEnvironment) {
        this.taskbarRoot = fromString(`<div id="taskbar-root" class="fixed bottom-1 h-12 w-screen px-1 justify-center flex items-center select-none z-[999999]">
        </div>
        `) as HTMLElement

        this.taskbar = fromString(`<div id="taskbar" class="p-[0.1rem] w-fit rounded-lg border gap-1 border-black/5 shadow-lg bg-white/50 backdrop-blur-xl flex items-center select-none">
        </div>
        `) as HTMLElement

        const appsButton = fromString('<button class="p-1 hover:bg-black/5 rounded"> <img src="/img/icons8-apps-90.png" class="w-9"> </button>')

        this.appsHolder = fromString('<div class="flex gap-1"> </div>') as HTMLElement

        this.taskbar.appendChild(appsButton)
        this.taskbar.appendChild(this.appsHolder)
        this.taskbarRoot.appendChild(this.taskbar)
    }

    update() {
        this.appsHolder.innerHTML = ''
        this.apps.forEach(app => {
            const icon = app.iconPath
            const appBtn = fromString(`<button class="relative p-1 hover:bg-black/5 rounded"> <img src="${icon}" class="w-9"> </button>`) as HTMLElement
            appBtn.addEventListener('click', () => {
                app.newWindow()
            })

            const windowsIndicatorHolder = fromString(`<div class="absolute bottom-0 left-0 right-0 flex justify-center gap-[0.1rem]"> </div>`)
            
            app.windows.forEach(it => {
                windowsIndicatorHolder.appendChild(fromString(`<div class="rounded-full w-1 h-1 bg-blue-800/40"> </div>`))
            })

            appBtn.appendChild(windowsIndicatorHolder)
            this.appsHolder.appendChild(appBtn)
        })
    }

    mount(menubarContainer: HTMLElement) {
        menubarContainer?.appendChild(this.taskbarRoot)
    }
}
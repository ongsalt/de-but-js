import { fromString } from "../lib/template"
import { DesktopEnvironment } from "../lib/environment"

export class Taskbar {

    taskbar: HTMLElement
    taskbarRoot: HTMLElement

    constructor(private de: DesktopEnvironment) {
        this.taskbarRoot = fromString(`<div id="taskbar-root" class="fixed bottom-1 h-12 w-screen px-1 justify-center flex items-center select-none z-[999999]">
        </div>
        `) as HTMLElement

        this.taskbar = fromString(`<div id="taskbar" class="h-12 w-fit rounded border shadow-lg px-2 bg-white/50 backdrop-blur-xl flex items-center select-none">
        </div>
        `) as HTMLElement

        const btn = fromString('<button class="rounded-md p-[.2rem] px-1 hover:bg-black/10 text-sm"> New Window </button>') as HTMLElement
        btn.addEventListener('click', () => de.newWindow())

        const smth = fromString('<span class="mx-1 font-bold"> L </span>')

        this.taskbar.appendChild(smth)
        this.taskbar.appendChild(btn)
        this.taskbarRoot.appendChild(this.taskbar)
    }

    mount(menubarContainer: HTMLElement) {
        menubarContainer?.appendChild(this.taskbarRoot)
    }
}
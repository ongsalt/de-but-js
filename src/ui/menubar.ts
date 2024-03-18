import { fromString } from "../lib/template"
import { DesktopEnvironment } from "../lib/environment"
import { windows } from "./windows"
import { Flow } from "../lib/flow"

export class Menubar {

    menubar: HTMLElement
    isHidden: Flow<boolean>
    isPoppingUp = new Flow(false)

    constructor(private de: DesktopEnvironment) {
        this.isHidden = de.isMaximize
        this.menubar = fromString(`  <header id="menubar" class="fixed top-0 border-b shadow h-8 px-1 w-full 
        bg-white/75 backdrop-blur-xl flex items-center select-none z-[999999] transition-all duration-[400ms] ease-[ease]">
        </header>
        `) as HTMLElement

        const smth = fromString('<span class="mx-1 font-bold"> L </span>')
        const status = fromString('<button class="rounded-md p-[.2rem] px-1 hover:bg-black/10 text-sm"> Focus:  </button>') as HTMLElement
        const status2 = fromString('<button class="rounded-md p-[.2rem] px-1 hover:bg-black/10 text-sm"> Maximized:  </button>') as HTMLElement
        this.de.activeWindow.subscribe((w, oldW) => {
            status.innerText = `Focus: ${w?.id}`
        })

        this.de.isMaximize.subscribe(m => {
            status2.innerText = `Maximized: ${m}`
        })

        this.menubar.appendChild(smth)
        this.menubar.appendChild(status)
        this.menubar.appendChild(status2)

        this.registerMaximizedListener()
        this.registerHiddenListner()
    }

    registerHiddenListner() {
        this.de.isMaximize.subscribe(maximized => {
            if (maximized) {
                this.menubar.style.top = '-2rem'
                this.menubar.classList.remove('shadow')
                this.menubar.classList.remove('border-b')
            } else {
                this.menubar.style.top = '0'
                this.menubar.classList.add('shadow')
                this.menubar.classList.add('border-b')
            }
        })

        this.isPoppingUp.subscribe(it => {
            if (!this.isHidden.value) return; // ignored

            if (it) {
                this.menubar.style.transitionDuration = '200ms'
                this.menubar.style.top = '0'
            } else {
                this.menubar.style.transitionDuration = '200ms'
                this.menubar.style.top = '-2rem'
            }
        })
    }

    registerMaximizedListener() {
        document.addEventListener('mousemove', e => {
            if (e.clientY < 10) {
                this.isPoppingUp.value = true
            }
            if (e.clientY > 30 && this.isPoppingUp.value) {
                this.isPoppingUp.value = false
            }
        })
    }

    mount(menubarContainer: HTMLElement) {
        menubarContainer?.appendChild(this.menubar)
    }

}
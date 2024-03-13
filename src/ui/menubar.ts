import { fromString } from "../lib/template"
import { DesktopEnvironment } from "../lib/environment"

export class Menubar {

    menubar: HTMLElement

    constructor(private de: DesktopEnvironment) {
        this.menubar = fromString(`  <header id="menubar" class="fixed top-0 border-b border-b shadow-sm h-8 px-1 w-full 
        bg-white/75 backdrop-blur-xl flex items-center select-none z-[999999] transition-all duration-[400ms] ease-[ease]">
        </header>
        `) as HTMLElement

        const btn = fromString('<button class="rounded-md p-[.2rem] px-1 hover:bg-black/10 text-sm"> New Window </button>') as HTMLElement
        btn.addEventListener('click', () => de.newWindow())

        const smth = fromString('<span class="mx-1 font-bold"> L </span>')
        const status = fromString('<button class="rounded-md p-[.2rem] px-1 hover:bg-black/10 text-sm"> Focus:  </button>') as HTMLElement
        const status2 = fromString('<button class="rounded-md p-[.2rem] px-1 hover:bg-black/10 text-sm"> Maximized:  </button>') as HTMLElement
        this.de.activeWindow.subscribe((w, oldW) => {
            status.innerText = `Focus: ${w?.element.id}`
        })

        this.de.isMaximize.subscribe(m => {
            status2.innerText = `Maximized: ${m}`
        })

        this.menubar.appendChild(smth)
        this.menubar.appendChild(btn)

        this.menubar.appendChild(status)
        this.menubar.appendChild(status2)

        this.registerMaximizedListener()
    }

    registerMaximizedListener() {
        this.de.isMaximize.subscribe(maximized => {
            if (maximized) {
                this.menubar.style.top = '-2rem'
            } else {
                this.menubar.style.top = '0'
            }
        })

        document.addEventListener('mousemove', e => {
            if (!this.de.isMaximize.value) {
                this.menubar.style.transitionDuration = '400ms'
                return
            }

            if (e.clientY < 10) {
                this.menubar.style.transitionDuration = '200ms'
                this.menubar.style.top = '0'
            }
            if (e.clientY > 30 && this.menubar.style.top !== '0') {
                this.menubar.style.transitionDuration = '200ms'
                this.menubar.style.top = '-2rem'
            }
        })
    }

    mount(menubarContainer: HTMLElement) {
        menubarContainer?.appendChild(this.menubar)
    }

}
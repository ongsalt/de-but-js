import { v4 as uuidv4 } from 'uuid';

import { Flow } from "../lib/flow";
import { fromString } from "../lib/template";
import { Position, WindowInfo } from "../types";

const mouseMoveCallback: ((cursor: Position) => void)[] = []
const mouseUpCallback: ((cursor: Position) => void)[] = []

window.addEventListener('mousemove', e => {
    mouseMoveCallback.forEach(it => it({ x: e.clientX, y: e.clientY }))
})

window.addEventListener('mouseup', e => {
    mouseUpCallback.forEach(it => it({ x: e.clientX, y: e.clientY }))
})


export class Window2 implements WindowInfo {
    x = new Flow(0)
    y = new Flow(0)

    private realX = 0
    private realY = 0
    private dragOffset = { x: 0, y: 0 }

    height = new Flow(480)
    width = new Flow(640)
    isMaximized = new Flow(false)
    isMinimized = new Flow(false)

    private isDragging: boolean = false

    element: HTMLElement;

    constructor(id?: string) {
        if (!id) {
            id = uuidv4()
        }
        this.element = fromString(`
            <div id="window-${id}" class="bg-gray-50/80 fixed flex flex-col text-sm border rounded-lg shadow-2xl shadow-black/30 overflow-hidden backdrop-blur-2xl select-none">
                <nav id="nav" class="bg-white border-b p-3 flex items-center justify-between">
                    <div class="flex-1 flex">
                        <div class="flex space-x-2 mr-4 items-center">
                            <div id='close-btn' class="h-3 w-3 rounded-full bg-red-500 hover:bg-red-600"></div>
                            <div id='minimize-btn' class="h-3 w-3 rounded-full bg-yellow-500 hover:bg-yellow-600"></div>
                            <div id='maximize-btn' class="h-3 w-3 rounded-full bg-green-500 hover:bg-green-600"></div>
                        </div>
                        <h2 class=""> Toolbar shittttt </h2>
                    </div>
                    <h2 class="flex-1  font-medium text-center"> Title </h2>
                    <div class="flex-1 flex justify-end">
                        <h2 class=""> Another toolbar shit </h2>
                    </div>
                </nav>
                <main class="grid grid-cols-[auto_1fr_auto] flex-1">
                    <div class="p-3 w-40">
                        Sidebar
                    </div>
                    <div class="bg-white border-x p-3">
                        <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Eveniet ipsum quisquam repellat cum. Quia ex, sed repellendus natus consequuntur magnam hic ipsam sapiente quae atque animi velit nesciunt neque omnis!</p>
                        <input type="time" name="" id="">
                    </div>
                    <div class="p-3">
                        Properties
                    </div>
                </main>
            </div>
        `) as HTMLElement

        this.registerButtonHandler()
        this.registerOnDrag()
        this.registerWindowEvent()
        this.registerOnResize()
        this.registerOnPositionChange()
    }

    private registerButtonHandler() {
        const btn = this.element.querySelector('#maximize-btn') as HTMLButtonElement
        btn.addEventListener('click', () => {
            this.isMaximized.value = !this.isMaximized.value
        })

        const btn2 = this.element.querySelector('#minimize-btn') as HTMLButtonElement
        btn2.addEventListener('click', () => {
            this.x.value = 90
            this.y.value = 90
        })
    }

    private registerWindowEvent() {
        this.isMaximized.subscribe((newValue, oldValue) => {
            if (newValue === oldValue) return // ignored

            if (newValue) {
                this.element.style.width = '100%'
                this.element.style.height = '100%'
                this.element.style.borderRadius = '0px'
                this.element.style.translate = '0px 0px'
            } else {
                this.element.style.width = `${this.width.value}px`
                this.element.style.height = `${this.height.value}px`
                this.element.style.borderRadius = '12px'
                this.element.style.translate = `${this.x.value}px ${this.y.value}px`
            }
        })
    }

    private registerOnDrag() {
        this.element.style.transition = 'all .4s'

        const titleBar = this.element.getElementsByTagName('nav')[0]
        titleBar.addEventListener('mousedown', e => {
            this.isDragging = true

            this.element.style.transition = 'all .4s ease, translate 0s'

            if (this.isMaximized.value) {
                this.dragOffset = {
                    x: -e.clientX,
                    y: -e.clientY
                }
            } else {   
                this.dragOffset = {
                    x: this.x.value - e.clientX,
                    y: this.y.value - e.clientY
                }
            }
        })

        mouseMoveCallback.push(cursor => {
            if (!this.isDragging) return

            this.x.value = cursor.x + this.dragOffset.x
            this.y.value = cursor.y + this.dragOffset.y

            if (this.isMaximized.value) {
                this.isMaximized.value = false
            }
        })

        mouseUpCallback.push(() => {
            this.element.style.transition = 'all .4s'
            this.isDragging = false
        })
    }

    private registerOnResize() {

    }

    private registerOnPositionChange() {
        const position = this.x.combine(this.y, (x, y): Position => ({ x, y }))
        position.subscribe(pos => {
            this.element.style.translate = `${pos.x}px ${pos.y}px`
        })
    }

}
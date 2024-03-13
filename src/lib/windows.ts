import { v4 as uuidv4 } from 'uuid';

import { Flow } from "./flow";
import { fromString } from "./template";
import { Position, Size, WindowInfo } from "../types";
import { getMaximizedWindowArea, setActiveWindow } from './helper';
import { environment } from './init';

const DEFAULT_TRANSITION =  'all .4s ease, z-index 0s'

const windows: Window2[] = []
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
    zIndex = new Flow(0)
    height = new Flow(480)
    width = new Flow(640)
    isMaximized = new Flow(false)
    isMinimized = new Flow(false)

    private defaultPosition: Position = { x: 40, y: 40 }
    private defualtSize: Size = { width: 640, height: 480 }
    
    private dragOffset: Position = { x: 0, y: 0 }
    private isDragging: boolean = false

    private isInitialized = false

    element: HTMLElement;
    innerContent: HTMLElement = fromString("<div> <div/>") as HTMLDivElement;

    constructor(id?: string) {
        if (!id) {
            id = uuidv4()
        }
        this.element = fromString(`
            <div id="window-${id}" class="bg-gray-50/80 fixed flex flex-col text-sm border rounded-lg shadow-2xl shadow-black/20 overflow-hidden backdrop-blur-2xl select-none">
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
        this.registerOnPositionAndSizeChange()

        windows.push(this)
    }


    mount(root: HTMLElement) {
        
        // Animate window openning
        this.element.style.transition = 'none'
        this.element.style.scale = '.95'
        this.element.style.opacity = '0'
        this.element.style.transition = DEFAULT_TRANSITION
        
        root.append(this.element)
        
        this.element.style.scale = '1'
        this.element.style.opacity = '1'

        if (!this.isInitialized) {
            this.onCreated()
            this.isInitialized = true
        }
    }

    focus() {
        // If already then done
        if (environment.activeWindow.value === this) {
            return
        }
        setActiveWindow(this)
        // Shift windows up then renormalize all z index
        const maxZIndex = Math.max(...windows.map(it => it.zIndex.value))
        
        this.zIndex.value = maxZIndex + 1 
        
        // // Renormalize | all number must be > than 0
        const minZIndex = Math.min(...windows.map(it => it.zIndex.value))
        
        windows.forEach(it => {
            it.zIndex.value -= minZIndex
        })
    }

    // Should be called when mount to dom
    private onCreated() {
        // select position for spawning
        const position: Position = { ...this.defaultPosition }
        while (true) {
            const samePosition = windows.some(it => it.x.value === position.x && it.y.value === position.y)
            if (!samePosition) {
                break
            } 
            position.x += 20
            position.y += 20
        }

        this.y.value = position.y
        this.x.value = position.x

        this.width.value = this.defualtSize.width
        this.height.value = this.defualtSize.height

        this.focus()
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
        this.element.addEventListener('focus', () => {
            this.focus()
        }) 

        this.element.addEventListener('mousedown', () => {
            this.focus()
        }) 

        this.element.addEventListener('dblclick', () => {
            this.focus()
            this.isMaximized.value = !this.isMaximized.value
        }) 

        this.isMaximized.subscribe((newValue, oldValue) => {
            if (newValue === oldValue) return; // ignored

            
            if (newValue) {
                const { x, y, height, width } = getMaximizedWindowArea()
                this.element.style.width = `${width}px`
                this.element.style.height = `${height}px`
                this.element.style.borderRadius = '0px'
                this.element.style.translate = `${x}px ${y}px`
            } else {
                this.element.style.width = `${this.width.value}px`
                this.element.style.height = `${this.height.value}px`
                this.element.style.borderRadius = '12px'
                this.element.style.translate = `${this.x.value}px ${this.y.value}px`
            }
        })

        this.zIndex.subscribe(it => {
            this.element.style.zIndex = `${it}`
        })
    }

    private registerOnDrag() {
        this.element.style.transition = DEFAULT_TRANSITION

        const titleBar = this.element.getElementsByTagName('nav')[0]
        titleBar.addEventListener('mousedown', e => {
            this.isDragging = true

            this.element.style.transition = `${DEFAULT_TRANSITION}, translate 0s`

            if (this.isMaximized.value) {
                const { y } = getMaximizedWindowArea()

                this.dragOffset = {
                    x: -e.clientX,
                    y: y-e.clientY
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
            this.element.style.transition = 'all .4s, z-index 0s'
            this.isDragging = false
        })
    }

    private registerOnResize() {

    }

    private registerOnPositionAndSizeChange() {
        const position = this.x.combine(this.y, (x, y): Position => ({ x, y }))
        const size = this.width.combine(this.height, (width, height) => ({ width, height }))
        position.subscribe(pos => {
            this.element.style.translate = `${pos.x}px ${pos.y}px`
        })
        size.subscribe(size => {
            this.element.style.width = `${size.width}px`
            this.element.style.height = `${size.height}px`
        })
    }


}
import { v4 as uuidv4 } from 'uuid';

import { Flow } from "../lib/flow";
import { fromString } from "../lib/template";
import { Position, Size, WindowInfo } from "../types";
import { calculateDistance, getMaximizedWindowArea, setActiveWindow } from '../lib/helper';
import { environment } from '../lib/init';
import { Application } from './application';

const DEFAULT_TRANSITION = 'all .4s ease, z-index 0s'

const startingPoint: Position = { x: 0, y: 0 }
export const windows: Window2[] = []
const mouseMoveCallback: ((cursor: Position) => void)[] = []
const mouseUpCallback: ((cursor: Position) => void)[] = []

// Threshold = 10px
window.addEventListener('mousemove', e => {
    const cursor: Position = { x: e.clientX, y: e.clientY }
    const distanceMoved = calculateDistance(startingPoint, cursor)
    if (distanceMoved > 10) {
        mouseMoveCallback.forEach(it => it(cursor))
    }
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
    isFocused!: Flow<boolean>

    private defaultPosition: Position = { x: 40, y: 40 }
    private defualtSize: Size = { width: 640, height: 480 }

    private dragOffset: Position = { x: 0, y: 0 }
    private isDragging: boolean = false

    private isInitialized = false

    windowFrame: HTMLElement

    innerContent: HTMLElement

    constructor(public app: Application, public id: string = uuidv4()) {
        this.windowFrame = fromString(`
            <div id="window-${this.id}" class="bg-gray-50/80 fixed flex flex-col text-sm border rounded-lg shadow-2xl shadow-black/20 overflow-hidden backdrop-blur-2xl select-none">
                <nav id="nav" class="bg-white border-b p-3 flex items-center justify-between relative">
                    <div class="flex-1 flex">
                        <div class="flex space-x-2 mr-4 items-center">
                            <div id='close-btn' class="h-3 w-3 rounded-full bg-red-500 hover:bg-red-600"></div>
                            <div id='minimize-btn' class="h-3 w-3 rounded-full bg-yellow-500 hover:bg-yellow-600"></div>
                            <div id='maximize-btn' class="h-3 w-3 rounded-full bg-green-500 hover:bg-green-600"></div>
                        </div>
                        <h2 class=""> Toolbar </h2>
                    </div>
                    <h2 class="flex-1  font-medium text-center"> ${this.app?.name ?? 'Window title'} </h2>
                    <div class="flex-1 flex justify-end">
                        <h2 class=""> Another toolbar shit </h2>
                    </div>
                </nav>
                <main id="content"> </main>
            </div>
        `) as HTMLElement;

        this.innerContent = this.windowFrame.querySelector('#content')!
        
        this.registerWindowEvent()
        this.registerButtonHandler()
        this.registerOnDrag()
        this.registerOnResize()
        this.registerOnPositionAndSizeChange()

        windows.push(this)
    }


    private onClose() {
        this.app.closeWindow(this)
        const index = windows.findIndex(it => it === this)!

        // this.windowFrame.style.transition = `all .5s ease-out, backdrop-filter .4s`
        // this.windowFrame.style.backdropFilter = 'none'

        // setTimeout(() => {
        //     // this.windowFrame.style.scale = '1.04'
        //     this.windowFrame.style.scale = '.95'
        //     this.windowFrame.style.opacity = '0'
        //     this.windowFrame.style.filter = 'blur(24px)'
        // }, 10)


        // setTimeout(() => {
            this.windowFrame.remove()
            this.windowFrame.style.transition = DEFAULT_TRANSITION
        // }, 510)

        windows.splice(index, 1)
        // Refactor later (with this.isFocused)
        setActiveWindow(undefined)
    }

    mount(root: HTMLElement) {

        // Animate window openning
        this.windowFrame.style.transition = 'none'
        this.windowFrame.style.scale = '.95'
        this.windowFrame.style.opacity = '0'

        root.append(this.windowFrame)

        setTimeout(() => {
            this.windowFrame.style.transition = 'all .3s cubic-bezier(.32,.24,0,1)'
            this.windowFrame.style.scale = '1'
            this.windowFrame.style.opacity = '1'
        }, 1)

        setTimeout(() => {
            this.windowFrame.style.transition = DEFAULT_TRANSITION
        }, 300)

        if (!this.isInitialized) {
            this.onCreated()
            this.isInitialized = true
        }
    }

    focus() {
        // If already then done
        if (this.isFocused.value) {
            return
        }
        setActiveWindow(this)
        // Shift windows up then renormalize all z index
        const maxZIndex = Math.max(...windows.map(it => it.zIndex.value))

        this.zIndex.value = maxZIndex + 1

        // // Renormalize | all number must be > than 0
        const minZIndex = Math.min(...windows.map(it => it.zIndex.value))

        windows.forEach(it => {
            if (it === this) return;
            it.windowFrame.style.transition = 'none'
            it.zIndex.value -= minZIndex
            it.windowFrame.style.transition = DEFAULT_TRANSITION
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
        const btn = this.windowFrame.querySelector('#maximize-btn') as HTMLButtonElement
        btn.addEventListener('click', event => {
            event.stopPropagation()
            this.isMaximized.value = !this.isMaximized.value
        })

        const btn2 = this.windowFrame.querySelector('#minimize-btn') as HTMLButtonElement
        btn2.addEventListener('click', event => {
            event.stopPropagation()
            this.x.value = 90
            this.y.value = 90
        })

        const btn3 = this.windowFrame.querySelector('#close-btn') as HTMLButtonElement
        btn3.addEventListener('click', event => {
            event.stopPropagation()
            this.onClose()
        })

        btn3.addEventListener('mousedown', event => {
            // to stop propagation to on window focus
            event.stopPropagation()
            // this.onClose()
        })
    }

    private registerWindowEvent() {
        const titleBar = this.windowFrame.getElementsByTagName('nav')[0]

        this.windowFrame.addEventListener('focus', () => {
            this.focus()
        })

        this.windowFrame.addEventListener('mousedown', () => {
            this.focus()
        })

        titleBar.addEventListener('dblclick', () => {
            this.focus()
            this.isMaximized.value = !this.isMaximized.value
        })

        this.isMaximized.subscribe((newValue, oldValue) => {
            if (newValue === oldValue) return; // ignored
            if (newValue) {
                const { x, y, height, width } = getMaximizedWindowArea()
                this.windowFrame.style.width = `${width}px`
                this.windowFrame.style.height = `${height}px`
                this.windowFrame.style.borderRadius = '0px'
                this.windowFrame.style.translate = `${x}px ${y}px`
            } else {
                this.windowFrame.style.width = `${this.width.value}px`
                this.windowFrame.style.height = `${this.height.value}px`
                this.windowFrame.style.borderRadius = '12px'
                this.windowFrame.style.translate = `${this.x.value}px ${this.y.value}px`
            }
        })

        this.zIndex.subscribe(it => {
            this.windowFrame.style.zIndex = `${it}`
        })

        // Change
        this.isFocused = new Flow(false)
        environment.activeWindow.subscribe(focusedWindow => {
            this.isFocused.value = focusedWindow === this
        })

        // Move title bar downward a bit
        titleBar.style.transition = 'top .2s, box-shadow .2s'
        titleBar.style.top = '0'
        environment.menubar.isPoppingUp.subscribe(it => {
            const shouldShiftTitleBar = it && this.isMaximized.value

            titleBar.style.top = shouldShiftTitleBar ? '2rem' : '0'
            if (shouldShiftTitleBar) {
                titleBar.classList.add('shadow')
            } else {
                titleBar.classList.remove('shadow')
            }
        })
    }

    private registerOnDrag() {
        this.windowFrame.style.transition = DEFAULT_TRANSITION

        const titleBar = this.windowFrame.getElementsByTagName('nav')[0]
        titleBar.addEventListener('mousedown', e => {
            this.isDragging = true

            startingPoint.x = e.clientX
            startingPoint.y = e.clientY

            this.windowFrame.style.transition = `${DEFAULT_TRANSITION}, translate 0s`
            if (this.isMaximized.value) {
                const { y } = getMaximizedWindowArea()

                this.dragOffset = {
                    x: -e.clientX,
                    y: y - e.clientY
                }
            } else {
                this.dragOffset = {
                    x: this.x.value - e.clientX,
                    y: this.y.value - e.clientY
                }
            }
        })

        mouseMoveCallback.push(cursor => {
            if (!this.isDragging) return;

            this.x.value = cursor.x + this.dragOffset.x
            this.y.value = cursor.y + this.dragOffset.y

            if (this.isMaximized.value) {
                this.isMaximized.value = false
            }
        })

        mouseUpCallback.push(() => {
            if (this.isDragging) {
                this.windowFrame.style.transition = DEFAULT_TRANSITION
                this.isDragging = false
            }
        })
    }

    private registerOnResize() {
    }

    private registerOnPositionAndSizeChange() {
        const position = this.x.combine(this.y, (x, y): Position => ({ x, y }))
        const size = this.width.combine(this.height, (width, height) => ({ width, height }))
        position.subscribe(pos => {
            this.windowFrame.style.translate = `${pos.x}px ${pos.y}px`
        })
        size.subscribe(size => {
            this.windowFrame.style.width = `${size.width}px`
            this.windowFrame.style.height = `${size.height}px`
        })
    }


}
import { Flow } from "./lib/flow"

export interface WindowInfo {
    x: Flow<number>,
    y: Flow<number>,
    width: Flow<number>,
    height: Flow<number>,
    isMaximized: Flow<boolean>,
    isMinimized: Flow<boolean>,
    zIndex: Flow<number>,
    element: HTMLElement,
}

export interface Position {
    x: number,
    y: number
}

export interface Size {
    width: number,
    height: number
}
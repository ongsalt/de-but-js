import { Flow } from "./lib/flow"

export interface WindowInfo {
    x: Flow<number>,
    y: Flow<number>,
    width: Flow<number>,
    height: Flow<number>,
    isMaximized: Flow<boolean>,
    isMinimized: Flow<boolean>,
    element: HTMLElement,
}

export type Position = {
    x: number,
    y: number
}
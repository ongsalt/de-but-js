import { Position, Size } from "../types";
import { environment } from "./init";
import { Window2 } from "../ui/windows";
import { DesktopEnvironment } from "./environment";

export function getMaximizedWindowArea(de: DesktopEnvironment = environment): (Position & Size) {
    const menubarRect = de.menubar.menubar.getBoundingClientRect()
    const wmRect = de.wmRoot.getBoundingClientRect()

    // return {
    //     x: menubarRect.left,
    //     y: menubarRect.bottom,
    //     width: wmRect.width,
    //     height: wmRect.height - menubarRect.height
    // }

    return {
        x: 0,
        y: 0,
        width: wmRect.width,
        height: wmRect.height
    }
}

export function setActiveWindow(cwindow: Window2 | undefined, de: DesktopEnvironment = environment) {
    if (cwindow) {
        de.activeWindow.value = cwindow
        return
    }

    let maxZIndex = de.windows[0]
    if (!maxZIndex) {
        de.activeWindow.value = undefined
        return
    }
    de.windows.forEach(it => {
        if (it.zIndex.value > maxZIndex.zIndex.value) {
            maxZIndex = it
        }
    })

    de.activeWindow.value = maxZIndex
}

export function calculateDistance(p1: Position, p2: Position) {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
}
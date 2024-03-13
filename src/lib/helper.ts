import { Position, Size } from "../types";
import { environment } from "./init";
import { Window2 } from "./windows";
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

export function setActiveWindow(cwindow: Window2, de: DesktopEnvironment = environment) {
    de.activeWindow.value = cwindow
}
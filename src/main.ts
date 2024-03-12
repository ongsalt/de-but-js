import { Window2 } from './lib/windows'
import './style.css'

const wmRoot = document.getElementById('wm')!

const windows = [new Window2(), new Window2(), new Window2()]

windows.forEach(it => wmRoot.append(it.element))

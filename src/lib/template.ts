import * as Sqrl from 'squirrelly'
import { TemplateFunction } from 'squirrelly/dist/types/compile'


export function fromString(html: string): Element {
    html = html.trim();
  
    // Then set up a new template element.
    const template = document.createElement('template');
    template.innerHTML = html;
    const result = template.content.children;
  
    // Then return either an HTMLElement or HTMLCollection,
    // based on whether the input HTML had one or more roots.
    return result[0];
}
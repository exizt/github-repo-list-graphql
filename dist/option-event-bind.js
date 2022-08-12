export class OptionEventBind {
    selectors = {};
    constructor(selectors = {}) {
        this.selectors = selectors;
    }
    bindEventAll(e) {
        Object.entries(this.selectors).forEach(([key, value]) => {
            const selector = value;
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                this.bindEvent(key, el, e);
            });
        });
    }
    bindEvent(key, el, e) {
        if (el === null)
            return;
        switch (el.tagName.toLowerCase()) {
            case 'input':
                const type = el.type;
                if (type == 'text' || type == 'search') {
                    this._add_event_el(el, 'input', e);
                }
                else if (type == 'hidden') {
                    break;
                }
                else {
                    this._add_event_el(el, 'change', e);
                }
                break;
            case 'a':
                this._add_event_el(el, 'click', e);
                break;
            default:
                this._add_event_el(el, 'change', e);
                break;
        }
    }
    _add_event_el(el, type, event) {
        el?.addEventListener(type, event);
    }
}

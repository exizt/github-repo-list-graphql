export class OptionEventBind {
    selectors = {};
    options = {};
    constructor(selectors = {}) {
        this.selectors = selectors;
    }
    bindEventAll(e) {
        Object.entries(this.selectors).forEach(([key, value]) => {
            this.bindEvent(key, value, e);
        });
    }
    bindEvent(key, selector, e) {
        const el = document.querySelector(selector);
        if (el === null)
            return;
        switch (el.tagName.toLowerCase()) {
            case 'input':
                const type = el.type;
                if (type == 'text' || type == 'search') {
                    this._add_event(el, 'input', e);
                }
                else {
                    this._add_event(el, 'change', e);
                }
                break;
            case 'a':
                this._add_event(el, 'click', (event) => {
                    this.options[key] = true;
                    e(event);
                });
                break;
            default:
                this._add_event(el, 'change', e);
                break;
        }
    }
    _add_event(el, type, event) {
        this.options = {};
        el?.addEventListener(type, event);
    }
    get_option(key) {
        return this.options[key];
    }
}

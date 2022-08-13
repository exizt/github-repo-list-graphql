export function bindEventAll(_selectors, e) {
    Object.entries(_selectors).forEach(([key, value]) => {
        const selector = value;
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            bindEvent(key, el, e);
        });
    });
}
function bindEvent(key, el, e) {
    if (el === null)
        return;
    switch (el.tagName.toLowerCase()) {
        case 'input':
            const type = el.type;
            if (type == 'text' || type == 'search') {
                _add_event_el(el, 'input', e);
            }
            else if (type == 'hidden') {
                break;
            }
            else {
                _add_event_el(el, 'change', e);
            }
            break;
        case 'a':
            _add_event_el(el, 'click', e);
            break;
        default:
            _add_event_el(el, 'change', e);
            break;
    }
}
function _add_event_el(el, type, event) {
    el?.addEventListener(type, event);
}

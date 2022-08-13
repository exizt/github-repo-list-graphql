export function bindEventAll(_selectors:{}, e:EventListener){
    Object.entries(_selectors).forEach(([key, value]) => {
        // this.bindEvent(key, (value as string), e)
        const selector = (value as string)
        const elements = document.querySelectorAll(selector)
        elements.forEach(el => {
            bindEvent(key, el as HTMLElement, e)
        })
    })
}

function bindEvent(key:string, el:HTMLElement, e:EventListener){
    // const el = document.querySelector(selector) as HTMLElement;
    if (el === null) return;

    switch (el.tagName.toLowerCase()) {
        case 'input':
            const type = (el as HTMLInputElement).type
            if(type == 'text' || type == 'search'){
                // 문자열 입력시 발생되는 이벤트
                _add_event_el(el, 'input', e)
            } else if(type=='hidden') {
                // 참고. 기본적으로 hidden 타입은 change 이벤트가 발생하지 않는다고 함.
                // 그래도 혹시 모르므로, hidden 타입인 경우에는 이벤트 발생시키지 않도록 함.
                // https://stackoverflow.com/a/8965804
                break
            } else {
                // 값이 변경된 후 포커스가 벗어날 때 발생되는 이벤트
                _add_event_el(el, 'change', e)
            }
            break
        case 'a':
            _add_event_el(el, 'click', e)
            break
        default:
            _add_event_el(el, 'change', e)
            break
    }
}

function _add_event_el(el:HTMLElement, type:string, event:EventListener){
    el?.addEventListener(type, event);
}
export class OptionEventBind {
    selectors = {}
    options = {}

    constructor(selectors = {}){
        this.selectors = selectors
    }

    bindEventAll(e:EventListener){
        Object.entries(this.selectors).forEach(([key, value]) => {
            this.bindEvent(key, (value as string), e)
        })
    }

    private bindEvent(key:string, selector:string, e:EventListener){
        const el = document.querySelector(selector) as HTMLElement;
        if (el === null) return;

        switch (el.tagName.toLowerCase()) {
            case 'input':
                const type = (el as HTMLInputElement).type
                if(type == 'text' || type == 'search'){
                    // 문자열 입력시 발생되는 이벤트
                    this._add_event(el, 'input', e)    
                } else {
                    // 값이 변경된 후 포커스가 벗어날 때 발생되는 이벤트
                    this._add_event(el, 'change', e)
                }
                break
            case 'a':
                this._add_event(el, 'click', (event) => {
                    this.options[key] = true
                    e(event)
                })
                break
            default:
                this._add_event(el, 'change', e)
                break
        }
    }

    private _add_event(el:HTMLElement, type:string, event:EventListener){
        // 옵션 초기화
        this.options = {}
        el?.addEventListener(type, event);
    }

    get_option(key:string){
        return this.options[key]
    }
}


export type OptionSet = {
    selector:string,
    value:string|number|boolean
}
import { loadConfig } from "./load-config.js"
import { fetchRepoList_GraphQL } from "./github-api.js"
import { AsyncGuard } from "./async-guard.js"
import { bindEventAll } from "./option-event-bind.js"


const optionSelectors = {
    'searchText': '#search',
    'isPublic': '#is_public',
    'isPrivate': '#is_private',
    'onlyArchived': '#only_archived',
    'excludeArchived': '#exclude_archived',
    'sortOption': '#sort_option',
    'sortOptions': 'a[name=sortOption]',
    'pageOptions': 'input[name=pageOptions]',
    'nextPage': '#page_next',
    'previousPage': '#page_previous'
}
const searchAsyncGuard = new AsyncGuard()

document.addEventListener("DOMContentLoaded", () => {
    main()

    async function main() {
        const config = await loadConfig().catch(err => {
            alert(err.message)
            throw new Error(err.message)
        })

        search(config)

        /* 엘리먼트 핸들링 관련 */
        // archived 관련 옵션
        _add_change_event(optionSelectors.onlyArchived, e => {
            (getInputElementBySelector(optionSelectors.excludeArchived)).checked = false
        })
        _add_change_event(optionSelectors.excludeArchived, e => {
            (getInputElementBySelector(optionSelectors.onlyArchived)).checked = false
        })
        // 정렬 옵션
        const sortOptions = document.querySelectorAll('a[name="sortOption"]')
        sortOptions.forEach(el => {
            el?.addEventListener("click", e => {
                e.preventDefault()
                const v = (e.target as HTMLAnchorElement).getAttribute("data-value")
                const sort_option = document.querySelector("#sort_option") as HTMLInputElement
                if (sort_option !== null && v !== null) {
                    sort_option.value = v
                }
            })
        })
        // 보기 옵션
        const viewOptions = document.querySelectorAll('input[name="viewOptions"]')
        viewOptions.forEach(el => {
            el?.addEventListener("change", e => {
                e.preventDefault()
                const v = (e.target as HTMLInputElement).value
                const output = document.querySelector(".gr-output")
                // css class name
                const cn_hidden_i = "gr-output-hidden-info"
                const cn_hidden_d = "gr-output-hidden-desc"
                console.log("ddd")
                if (v == 'hidden_i') {
                    output?.classList.add(cn_hidden_i)
                    output?.classList.remove(cn_hidden_d)
                } else if(v == 'hidden_di') {
                    output?.classList.add(cn_hidden_i)
                    output?.classList.add(cn_hidden_d)
                } else {
                    output?.classList.remove(cn_hidden_i)
                    output?.classList.remove(cn_hidden_d)
                }
            })
        })

        /* 옵션과 관련된 엘리먼트들에 search를 호출하는 이벤트 바인딩 */
        bindEventAll(optionSelectors, (e) => {
            e.preventDefault() // 링크 등의 이벤트 방지
            searchAsyncGuard.new() // 중복 실행 방지

            // 검색 실행
            search(config, searchAsyncGuard.get(), e.target)
        })
    }
})

/**
 * 깃헙에서 저장소 목록을 조회하는 기능
 * 
 * @param config 설정값
 * @param asyncToken 중복 호출을 방지하는 숫자값 토큰
 * @returns 
 */
function search(config: { personal_access_token: any; author: string; }, asyncToken = 0, evTarget: EventTarget | null = null) {
    // 중복 실행 방지
    if (!searchAsyncGuard.check(asyncToken)) return

    // 설정값
    const authToken = config.personal_access_token
    const author: string = config.author

    let searches: any = {
        'user': author,
        'sort': 'updated-desc'
    }
    let query = ''

    /* ---------- 검색 옵션 --------- */
    // 검색어 옵션
    const searchText = getInputElementBySelector(optionSelectors.searchText).value
    if (searchText) {
        query = `${searchText} in:name`
    }
    // pubilc, private 검색 옵션
    const isPublic = getInputElementBySelector(optionSelectors.isPublic).checked
    const isPrivate = getInputElementBySelector(optionSelectors.isPrivate).checked
    if (isPrivate === false && isPublic === true) {
        searches['is'] = 'public'
    } else if (isPrivate === true && isPublic === false) {
        searches['is'] = 'private'
    }
    // archived 검색 옵션
    // only archived
    const onlyArchived = getInputElementBySelector(optionSelectors.onlyArchived).checked
    if (onlyArchived === true) {
        searches['archived'] = 'true'
    }
    // exclude archived
    const excludeArchived = getInputElementBySelector(optionSelectors.excludeArchived).checked
    if (excludeArchived === true) {
        searches['archived'] = 'false'
    }

    /* ---------- 정렬 옵션 --------- */
    const sortOption = (getElementBySelector(optionSelectors.sortOption) as HTMLInputElement).value
    if (sortOption === 'nameAsc') {
        searches['sort'] = 'name-asc'
    } else if (sortOption === 'lastUpdate') {
        searches['sort'] = 'updated-desc'
    } else {
        searches['sort'] = 'updated-desc'
    }

    // 검색 쿼리 생성
    Object.entries(searches).forEach(([key, value]) => {
        query += " " + key + ":" + value
    })
    console.log(query)

    // 페이징 갯수 옵션
    let pageOption = parseInt(getRadioValueByName('pageOptions'))
    if (pageOption == 0) pageOption = 10

    // 페이징 이벤트 발생 여부
    const searchParam = { page: pageOption, after: "", before: "" }
    if (!!evTarget) {
        if ((evTarget as HTMLElement).id == 'page_next') {
            searchParam.after = (Paging.getCursorValue(optionSelectors.nextPage)) ?? ''
        }

        if ((evTarget as HTMLElement).id == 'page_previous') {
            searchParam.before = (Paging.getCursorValue(optionSelectors.previousPage)) ?? ''
        }
    }

    if (!searchAsyncGuard.check(asyncToken)) return
    fetchRepoList_GraphQL(authToken, query, searchParam, (data: any) => {
        rewriteHTML(data, asyncToken)
    })
}

/**
 * 결과를 HTML에 작성
 * @param _data 
 * @param asyncToken 
 */
function rewriteHTML(_data: any, asyncToken = 0): void {
    let outputHtml = ''

    const data = _data.search
    const itemList = data.edges
    const pageInfo = data.pageInfo

    // for loop
    for (const _item of itemList) {
        const item = _item.node

        // const updated_at = new Date(item.pushedAt).toLocaleString('ko-KR')
        let badges = ''
        if (item.isPrivate) {
            badges += '<span class="badge rounded-pill text-bg-secondary">private</span>'
        }
        if (item.isArchived) {
            badges += '<span class="badge rounded-pill text-bg-secondary">archived</span>'
        }

        // 라이선스 종류
        const licenseInfoHtml = (item.licenseInfo && item.licenseInfo.name) ?
            `<span class="ml-0 mr-3">${item.licenseInfo.name}</span> /` : ''

        // 설명글
        const descriptionHtml = (item.description) ? `<small class="grot-item-desc">${item.description}</small>` : ''
        
        // 용량
        const diskUsage = (item.diskUsage > 1024) ?  (item.diskUsage * 1.0 / 1024).toFixed(2) + ' MB' : item.diskUsage + ' KB'
        const diskUsageHtml = (diskUsage.length > 0) ? `<span class="ml-0 mr-3">${diskUsage}</span> /` : ''

        // html 작성
        const html = `
        <div class="gr-output-item">
        <div>
          <h5>${item.name}<small style="margin-left: 10px;">${badges}</small></h5>
          ${descriptionHtml}
        </div>
        <div class="grot-item-info">
            ${diskUsageHtml}
            ${licenseInfoHtml}
          <small>
            <span>${toLocaleDateString(item.pushedAt)}</span> /
            <span>(Created) ${toLocaleDateString(item.createdAt)}</span>
          </small>
        </div>
      </div>
      <hr>
      `
        outputHtml += html
    }

    // append html
    const el = document.querySelector(".gr-output")
    if (el != null) {
        if (!searchAsyncGuard.check(asyncToken)) return
        el.innerHTML = outputHtml
    }

    // 페이징 준비
    // console.log(pageInfo)
    const hasNextPage = pageInfo.hasNextPage
    const hasPreviousPage = pageInfo.hasPreviousPage
    Paging.changePagingEl({ selector: optionSelectors.nextPage, has: hasNextPage, cursor: pageInfo.endCursor })
    Paging.changePagingEl({ selector: optionSelectors.previousPage, has: hasPreviousPage, cursor: pageInfo.startCursor })
}

/**
 * 페이징 관련 함수들
 */
const Paging = {
    /**
     * 페이징 요소 변경
     * @param info 파라미터 {selector, has, cursor}
     */
    changePagingEl(info: { selector: string, has: boolean, cursor: string }) {
        const element = document.querySelector(info.selector)
        if (info.has) {
            // console.log(`${info.selector} has`)
            element?.closest('.page-item')?.classList.remove('disabled')
            element?.setAttribute("data-value", info.cursor)
        } else {
            element?.closest('.page-item')?.classList.add('disabled')
        }
    },

    getCursorValue(selector: string) {
        const element = document.querySelector(selector)
        return element?.getAttribute("data-value")
    }
}


// 이벤트 리스너 추가
const _add_event = (sel: string, type: string, event: EventListener) => {
    document.querySelector(sel)?.addEventListener(type, event);
}

// change 이벤트 리스너 추가
const _add_change_event = (sel: string, event: EventListener) => {
    _add_event(sel, 'change', event)
}

// TZ 날짜/시간 값을 한국 시간대로 변경
const toLocaleDateString = (value: any) => new Date(value).toLocaleString('ko-KR')

// document.querySelector를 구문을 줄임
const getElementBySelector = (sel: string) => document.querySelector(sel) as HTMLElement
const getInputElementBySelector = (sel: string) => getElementBySelector(sel) as HTMLInputElement
const getRadioValueByName = (name: string) => getInputElementBySelector(`input[name="${name}"]:checked`)?.value
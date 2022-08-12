import { Octokit } from "https://cdn.skypack.dev/@octokit/core";
import { loadConfig } from "./load-config.js"
import { fetchRepoList_GraphQL } from "./githib-api.js"
import { AsyncGuard } from "./async-guard.js"
import { OptionEventBind } from "./option-event-bind.js"


const optionSet = {
    'searchText' : '#search',
    'isPublic' : '#is_public',
    'isPrivate' : '#is_private',
    'onlyArchived' : '#only_archived',
    'excludeArchived' : '#exclude_archived',
    'sortOption': '#sort_option',
    'sortOptions': 'a[name=sortOption]',
}
const optionElement = new OptionEventBind(optionSet)
let searchAsyncGuard = new AsyncGuard()

document.addEventListener("DOMContentLoaded", ()=> {
    main()
    
    async function main(){
        const config = await loadConfig().catch(err=> {
            alert(err.message)
            throw new Error(err.message)
        })
        
        search(config, searchAsyncGuard.get())
        
        /* 엘리먼트 핸들링 관련 */
        // archived 관련 옵션
        _add_change_event(optionSet.onlyArchived, e => {
            (getInputElementBySelector(optionSet.excludeArchived)).checked = false
        })
        _add_change_event(optionSet.excludeArchived, e => {
            (getInputElementBySelector(optionSet.onlyArchived)).checked = false
        })
        // 정렬 옵션
        let sortOptions = document.querySelectorAll('a[name="sortOption"]')
        sortOptions.forEach(el => {
            el?.addEventListener("click", e => {
                e.preventDefault()
                let v = (e.target as HTMLAnchorElement).getAttribute("data-value")
                const sort_option = document.querySelector("#sort_option") as HTMLInputElement
                if(sort_option !== null && v !== null){
                    sort_option.value = v
                }
            })
        })
        // 보기 옵션
        let viewOptions = document.querySelectorAll('input[name="viewOptions"]')
        viewOptions.forEach(el => {
            el?.addEventListener("change", e => {
                e.preventDefault()
                let v = (e.target as HTMLInputElement).value
                let output = document.querySelector(".gr-output")
                if(v=='simple'){
                    output?.classList.add("gr-output-simple")
                } else {
                    output?.classList.remove("gr-output-simple")
                }
            })
        })


        /* 옵션과 관련된 엘리먼트들에 search를 호출하는 이벤트 바인딩 */
        optionElement.bindEventAll((e)=>{
            e.preventDefault() // 링크 등의 이벤트 방지
            searchAsyncGuard.new() // 중복 실행 방지

            // 검색 실행
            search(config, searchAsyncGuard.get())
        })
    }
})

// 이벤트 리스너 추가
function _add_event(sel:string, type:string, event:EventListener){
	document.querySelector(sel)?.addEventListener(type, event);
}

// change 이벤트 리스너 추가
function _add_change_event(sel:string, event:EventListener){
	_add_event(sel, 'change', event)
}

/**
 * 깃헙에서 저장소 목록을 조회하는 기능
 * 
 * @param config 설정값
 * @param asyncToken 중복 호출을 방지하는 숫자값 토큰
 * @returns 
 */
function search(config: { personal_access_token: any; author: string; }, asyncToken = 0){
    // 중복 실행 방지
    if(!searchAsyncGuard.check(asyncToken)) return 

    // 설정값
    const authToken = config.personal_access_token
    const author:string = config.author

    let searches:any = { 
        'user': author,
        'sort': 'updated-desc'
    }
    // archived:true or archived:false
    // is:public or is:private
    // language:javascript
    // 정렬
    // - 이름순 : 'sort:name-asc' / 'sort:name-desc'
    // - 생성일순 : 'sort:author-date-desc' / 'sort:author-date-asc'
    // - 커밋 순 : 'sort:committer-date-desc' / 'sort:committer-date-asc'
    // - 업데이트일시 순 : 'sort:updated-desc' / 'sort:updated-asc'
    let query = ''

    // 검색어 옵션
    const searchText = getInputElementBySelector(optionSet.searchText).value
    if(searchText){
        query = `${searchText} in:name`
    }

    // pubilc, private 검색 옵션
    const isPublic = getInputElementBySelector(optionSet.isPublic).checked
    const isPrivate = getInputElementBySelector(optionSet.isPrivate).checked
    if(isPrivate===false && isPublic===true){
        searches['is'] = 'public'
    } else if(isPrivate===true && isPublic===false){
        searches['is'] = 'private'
    }

    // archived 검색 옵션
    // only archived
    let onlyArchived = getInputElementBySelector(optionSet.onlyArchived).checked
    if(onlyArchived === true){
        searches['archived'] = 'true'
    }
    // exclude archived
    let excludeArchived = getInputElementBySelector(optionSet.excludeArchived).checked
    if(excludeArchived === true){
        searches['archived'] = 'false'
    }

    // 정렬 순서 옵션
    let sortOption = (getElementBySelector(optionSet.sortOption) as HTMLInputElement).value
    if(sortOption === 'nameAsc'){
        searches['sort'] = 'name-asc'
    } else if(sortOption === 'lastUpdate'){
        searches['sort'] = 'updated-desc'
    } else if(sortOption === 'lastCommit'){
        searches['sort'] = 'committer-date-desc'
    } else if(sortOption === 'lastCreated'){
        searches['sort'] = 'author-date-desc'
    } else if(sortOption === 'Created'){
        searches['sort'] = 'author-date'
    } else {
        searches['sort'] = 'updated-desc'
    }

    Object.entries(searches).forEach(([key, value]) => {
        query += " " + key + ":" + value
    })

    console.log(query)
    const searchParam = { page: 20, after: ""}
    if(!searchAsyncGuard.check(asyncToken)) return 
    fetchRepoList_GraphQL(authToken, query, searchParam, (data:any)=>{
        rewriteHTML_GraphQL_2(data, asyncToken)
    })
}


function rewriteHTML_GraphQL_2(data:any, asyncToken = 0){
    let outputHtml = ''
    
    let _data = data.search
    let itemList = _data.edges


    // for loop
    let index = 0
    for(let _item of itemList){
        let item = _item.node

        // const updated_at = new Date(item.pushedAt).toLocaleString('ko-KR')
        let badges = ''
        if(item.isPrivate){
            badges += '<span class="badge rounded-pill text-bg-secondary">private</span>'
        }
        if(item.isArchived){
            badges += '<span class="badge rounded-pill text-bg-secondary">archived</span>'
        }
    
        let licenseInfoHtml = ''
        if(item.licenseInfo && item.licenseInfo.name){
            licenseInfoHtml = `<span class="ml-0 mr-3">${item.licenseInfo.name}</span> /`
        }

        let descriptionHtml = ''
        if(item.description){
            descriptionHtml = `<small class="grot-item-desc">${item.description}</small>`
        }

        let diskUsage = ''
        if(item.diskUsage > 1024){
            diskUsage = (item.diskUsage*1.0/1024).toFixed(2) + ' MB'
        } else {
            diskUsage = item.diskUsage + ' KB'
        }
        let diskUsageHtml = `<span class="ml-0 mr-3">${diskUsage}</span> /`


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
        index++

        outputHtml += html
    }

    // append html
    const el = document.querySelector(".gr-output")
    if (el != null){
        if(!searchAsyncGuard.check(asyncToken)) return 
        el.innerHTML = outputHtml
    }
}


function rewriteHTML_Graphql(data:any){
    let outputHtml = ''
    
    let _data = data.search
    let itemList = _data.edges


    // for
    let index = 0
    for(let _item of itemList){
        let item = _item.node

        //if(item.name.substring(0,7) == "script-") continue
        //if(item.name.substring(0,6) == "study-") continue
        //if(item.name.substring(0,5) == "fork-") continue
    
        // const updated_at = new Date(item.pushedAt).toLocaleString('ko-KR')
    
        const html = `<tr>
            <th scope="row">${index}</th>
            <td>${item.name}</td>
            <td>${item.isArchived}</td>
            <td>${item.isFork}</td>
            <td>${toLocaleDateString(item.pushedAt)}</td>
        </tr>`
        index++

        outputHtml += html
    }
    const el = document.getElementById("repo-list")
    if (el != null){
        el.innerHTML = outputHtml
    }
}


// TZ 날짜/시간 값을 한국 시간대로 변경
const toLocaleDateString = (value: any) => new Date(value).toLocaleString('ko-KR')

// document.querySelector를 구문을 줄임
const getElementBySelector = (sel:string) => document.querySelector(sel) as HTMLElement
const getInputElementBySelector = (sel:string) => getElementBySelector(sel) as HTMLInputElement
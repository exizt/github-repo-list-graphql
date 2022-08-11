import { Octokit } from "https://cdn.skypack.dev/@octokit/core";
import { loadConfig } from "./load-config.js"
import { fetchRepoList_GraphQL } from "./githib-api.js"

document.addEventListener("DOMContentLoaded", ()=> {
    main()

    async function main(){
        const config = await loadConfig().catch(err=> {
            alert(err.message)
            throw new Error(err.message)
        })
        const token = config.personal_access_token
        const author:string = config.author
        // let query = "jquery in:name user:author sort:name-asc"

        let searches = { 
            'user': author,
            'sort': 'name-asc'
        }
        // archived:true or archived:false
        // is:public or is:private
        // language:javascript
        // sort
        // 이름순 : 'name-asc' / 'name-desc'
        // 생성일순 : 'author-date-desc' / 'author-date-asc'
        // 커밋 순 : 'committer-date-desc' / 'committer-date-asc'
        // 업데이트일시 순 : 'updated-desc' / 'updated-asc'

        
        let qry = 'sh in:name'
        Object.entries(searches).forEach(([key, value]) => {
            qry += " " + key + ":" + value
        })

        fetchRepoList_GraphQL(token, qry, rewriteHTML_GraphQL_2)

        // await fetchGithub_GraphQL(rewriteHTML_Graphql)
    }
})



function rewriteHTML_GraphQL_2(data:any){
    let outputHtml = ''
    
    let _data = data.search
    let itemList = _data.edges


    // for loop
    let index = 0
    for(let _item of itemList){
        let item = _item.node

        //if(item.name.substring(0,7) == "script-") continue
        //if(item.name.substring(0,6) == "study-") continue
        //if(item.name.substring(0,5) == "fork-") continue
    
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
            descriptionHtml = `<small>${item.description}</small>`
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
        <div>
            ${diskUsageHtml}
            ${licenseInfoHtml}
          <span>${toLocaleDateString(item.pushedAt)}</span>
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


const toLocaleDateString = (value: any) => new Date(value).toLocaleString('ko-KR')
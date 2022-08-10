// import { Octokit } from "@octokit/core";
// const { Octokit } = require("@octokit/core");
import { Octokit } from "https://cdn.skypack.dev/@octokit/core";

document.addEventListener("DOMContentLoaded", ()=> {
    main()

    async function main(){
        await fetchGithubRepoList(rewriteHTML)
    }

    function rewriteHTML(result:any){
        let index = 0
        let outputHtml = ''
    
        for(let item of result){
            //if(item.name.substring(0,7) == "script-") continue
            //if(item.name.substring(0,6) == "study-") continue
            //if(item.name.substring(0,5) == "fork-") continue
        
            const updated_at = new Date(item.pushed_at).toLocaleString('ko-KR')
        
            const html = `<tr>
                <th scope="row">${index}</th>
                <td>${item.name}</td>
                <td>${item.archived}</td>
                <td>${item.fork}</td>
                <td>${updated_at}</td>
            </tr>`
            index++
    
            outputHtml += html
        }
        const el = document.getElementById("repo-list")
        if (el != null){
            el.innerHTML = outputHtml
        }
    }

})


/**
 * API 통신으로 특정 유저의 github의 저장소 목록을 조회하기.
 * @param callback 
 */
async function fetchGithubRepoList(callback: (arg0: any) => void){
    const authToken = await loadAccessToken().catch(err=> {
        alert(err.message)
        throw new Error(err.message)
    })
    
    // https://docs.github.com/en/rest/repos/repos#list-repositories-for-the-authenticated-user
    // https://github.com/octokit/core.js#readme
    const octokit = new Octokit({
        auth: authToken,
        baseUrl: 'https://api.github.com'
    })

    octokit.request('GET /user/repos', {
        affiliation: 'owner',
        per_page: 30
    })
    .then(response => response.data)
    .then(data => callback(data))
}


/**
 * json으로 설정한 Personal access token 값 조회하기
 * @returns any
 */
async function loadAccessToken(){
    return fetch("./config.json")
    .then(response => {
        if(!response.ok){
            const message = `An error has occured: ${response.status}`
            throw new Error(message)
        }
        return response.json()
    })
    .then(data => {
        return data.personal_access_token
    })
}
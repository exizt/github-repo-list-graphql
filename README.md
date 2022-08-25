# Github repo list (graphql)
: 자신의 깃헙 저장소 목록을 조회하는 기능

# 사용법
## 셋팅
1. `config.sample.json`을 복사해서 `config.json`파일을 생성
2. `personal_access_token`을 발행해서 입력해주고, `author`에는 자신의 아이디를 입력
3. `index.html`을 실행하면 목록을 조회해 볼 수 있음.


## 다른 곳에서 코드를 재사용시

: `typscript` 코드 예시. 핵심적인 구문.

```typescript
import { fetchRepoList_GraphQL } from "./src/github-api.js"

const authToken = ''
const author = ''

const query = `user:${author} sort:name-asc`
const searchParam = { page: 10, after: "", before: ""}
fetchRepoList_GraphQL(authToken, query, searchParam, (data:any)=>{
    let data = _data.search
    let itemList = data.edges
    let pageInfo = data.pageInfo
    for(let _item of itemList){
        let item = _item.node
        console.log(item.name)
    }
})
```


# 특징 및 목적
github에 로그인해서 저장소 목록을 보는 기능과 거의 비슷하게 구현을 했음. 로그인 없이 로컬에서 저장소 목록을 쉽게 볼 수 있다는 점과 js 파일을 다른 곳에 응용해서 사용해 볼 수 있음.



# 사용된 라이브러리
- octokit : 인터넷을 통한 사용. `src/github-api.ts`에서 `import { Octokit } from "https://cdn.skypack.dev/@octokit/core";`

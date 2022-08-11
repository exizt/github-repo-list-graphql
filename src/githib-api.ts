import { Octokit } from "https://cdn.skypack.dev/@octokit/core";

/**
 * API 통신으로 특정 유저의 github의 저장소 목록을 조회하기.
 * @param callback 
 */
export async function fetchMyRepoList(authToken: string, callback: (arg0: any) => void){
   
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
 * GraphQL을 이용하여 저장소 목록을 쿼리하기.
 * @param callback 
 */
export async function fetchRepoList_GraphQL(authToken:string, query:string = 'github', callback: (arg0: any) => void){
    // https://github.com/octokit/core.js#readme
    const octokit = new Octokit({
        auth: authToken,
        baseUrl: 'https://api.github.com'
    })

    let graphQuery = `
    query Qr($qry: String = "") {
      search(type: REPOSITORY, first: 10, query: $qry) {
        pageInfo {
          hasNextPage
          hasPreviousPage
        }
        repositoryCount
        edges {
          node {
            ... on Repository {
              id
              name
              createdAt
              description
              diskUsage
              isArchived
              isDisabled
              isEmpty
              isFork
              isPrivate
              isLocked
              pushedAt
              updatedAt
              visibility
              owner {
                login
              }
              licenseInfo {
                name
              }
            }
          }
        }
      }
    }`

    octokit.graphql(
        graphQuery,
        { "qry": query }
    )
    .then(callback)
}

import { Octokit } from "https://cdn.skypack.dev/@octokit/core";


/**
 * GraphQL을 이용하여 저장소 목록을 쿼리하기.
 * @param callback 
 */
export async function fetchRepoList_GraphQL(
  authToken: string,
  query: string = 'github',
  searchParam: ISearchParams = { page: 10, after: null, before: null },
  callback: (arg0: any) => void
) {
  // https://github.com/octokit/core.js#readme
  const octokit = new Octokit({
    auth: authToken,
    baseUrl: 'https://api.github.com'
  })

  let after: string | null = null
  if (!!searchParam.after && (searchParam.after as string).length > 0) {
    after = searchParam.after
  }
  const per_page = searchParam.page

  let graphQuery = `
  query Qr($qry: String = "", $page:Int=10, $after:String=null) {
    search(type: REPOSITORY, first: $page, query: $qry, after:$after) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        endCursor
        startCursor
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
    { "qry": query, "page": per_page, "after": after }
  )
    .then(callback)
}


/**
 * API 통신으로 특정 유저의 github의 저장소 목록을 조회하기.
 * @param callback 
 */
export async function fetchMyRepoList(authToken: string, callback: (arg0: any) => void) {
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



interface ISearchParams {
  page: number,
  after: string | null,
  before: string | null
}
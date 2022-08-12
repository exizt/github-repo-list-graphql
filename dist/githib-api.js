import { Octokit } from "https://cdn.skypack.dev/@octokit/core";
export async function fetchMyRepoList(authToken, callback) {
    const octokit = new Octokit({
        auth: authToken,
        baseUrl: 'https://api.github.com'
    });
    octokit.request('GET /user/repos', {
        affiliation: 'owner',
        per_page: 30
    })
        .then(response => response.data)
        .then(data => callback(data));
}
export async function fetchRepoList_GraphQL(authToken, query = 'github', searchParam = { page: 10, after: "" }, callback) {
    const octokit = new Octokit({
        auth: authToken,
        baseUrl: 'https://api.github.com'
    });
    let after = null;
    if (searchParam.after.length > 0) {
        after = searchParam.after;
    }
    const per_page = searchParam.page;
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
  }`;
    octokit.graphql(graphQuery, { "qry": query, "page": per_page, "after": after })
        .then(callback);
}

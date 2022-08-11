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
export async function fetchRepoList_GraphQL(authToken, query = 'github', callback) {
    const octokit = new Octokit({
        auth: authToken,
        baseUrl: 'https://api.github.com'
    });
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
  }`;
    octokit.graphql(graphQuery, { "qry": query })
        .then(callback);
}

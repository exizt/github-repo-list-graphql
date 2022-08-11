import { loadConfig } from "./load-config.js";
import { fetchRepoList_GraphQL } from "./githib-api.js";
document.addEventListener("DOMContentLoaded", () => {
    main();
    async function main() {
        const config = await loadConfig().catch(err => {
            alert(err.message);
            throw new Error(err.message);
        });
        const token = config.personal_access_token;
        const author = config.author;
        let searches = {
            'user': author,
            'sort': 'name-asc'
        };
        let qry = 'sh in:name';
        Object.entries(searches).forEach(([key, value]) => {
            qry += " " + key + ":" + value;
        });
        fetchRepoList_GraphQL(token, qry, rewriteHTML_GraphQL_2);
    }
});
function rewriteHTML_GraphQL_2(data) {
    let outputHtml = '';
    let _data = data.search;
    let itemList = _data.edges;
    let index = 0;
    for (let _item of itemList) {
        let item = _item.node;
        let badges = '';
        if (item.isPrivate) {
            badges += '<span class="badge rounded-pill text-bg-secondary">private</span>';
        }
        if (item.isArchived) {
            badges += '<span class="badge rounded-pill text-bg-secondary">archived</span>';
        }
        let licenseInfoHtml = '';
        if (item.licenseInfo && item.licenseInfo.name) {
            licenseInfoHtml = `<span class="ml-0 mr-3">${item.licenseInfo.name}</span> /`;
        }
        let descriptionHtml = '';
        if (item.description) {
            descriptionHtml = `<small>${item.description}</small>`;
        }
        let diskUsage = '';
        if (item.diskUsage > 1024) {
            diskUsage = (item.diskUsage * 1.0 / 1024).toFixed(2) + ' MB';
        }
        else {
            diskUsage = item.diskUsage + ' KB';
        }
        let diskUsageHtml = `<span class="ml-0 mr-3">${diskUsage}</span> /`;
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
      `;
        index++;
        outputHtml += html;
    }
    const el = document.querySelector(".gr-output");
    if (el != null) {
        el.innerHTML = outputHtml;
    }
}
function rewriteHTML_Graphql(data) {
    let outputHtml = '';
    let _data = data.search;
    let itemList = _data.edges;
    let index = 0;
    for (let _item of itemList) {
        let item = _item.node;
        const html = `<tr>
            <th scope="row">${index}</th>
            <td>${item.name}</td>
            <td>${item.isArchived}</td>
            <td>${item.isFork}</td>
            <td>${toLocaleDateString(item.pushedAt)}</td>
        </tr>`;
        index++;
        outputHtml += html;
    }
    const el = document.getElementById("repo-list");
    if (el != null) {
        el.innerHTML = outputHtml;
    }
}
const toLocaleDateString = (value) => new Date(value).toLocaleString('ko-KR');

import { loadConfig } from "./load-config.js";
import { fetchRepoList_GraphQL } from "./githib-api.js";
import { AsyncValidate } from "./async-token.js";
const optionSet = {
    'searchText': {
        selector: '#search',
        value: ''
    }
};
let searchAsyncValidate = new AsyncValidate();
document.addEventListener("DOMContentLoaded", () => {
    main();
    async function main() {
        const config = await loadConfig().catch(err => {
            alert(err.message);
            throw new Error(err.message);
        });
        search(config, searchAsyncValidate.get());
        _add_event(optionSet.searchText.selector, 'input', (e) => {
            searchAsyncValidate.new();
            search(config, searchAsyncValidate.get());
        });
    }
});
function _add_event(sel, type, event) {
    document.querySelector(sel)?.addEventListener(type, event);
}
function _add_change_event(sel, event) {
    _add_event(sel, 'change', event);
}
function search(config, asyncToken = 0) {
    if (!searchAsyncValidate.validate(asyncToken))
        return;
    const authToken = config.personal_access_token;
    const author = config.author;
    let searches = {
        'user': author,
        'sort': 'name-asc'
    };
    let qry = '';
    let searchText = document.querySelector(optionSet.searchText.selector).value;
    if (searchText) {
        qry = `${searchText} in:name`;
    }
    Object.entries(searches).forEach(([key, value]) => {
        qry += " " + key + ":" + value;
    });
    console.log(qry);
    if (!searchAsyncValidate.validate(asyncToken))
        return;
    fetchRepoList_GraphQL(authToken, qry, (data) => {
        rewriteHTML_GraphQL_2(data, asyncToken);
    });
}
function rewriteHTML_GraphQL_2(data, asyncToken = 0) {
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
        if (!searchAsyncValidate.validate(asyncToken))
            return;
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

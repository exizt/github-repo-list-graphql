import { loadConfig } from "./load-config.js";
import { fetchRepoList_GraphQL } from "./github-api.js";
import { AsyncGuard } from "./async-guard.js";
import { bindEventAll } from "./option-event-bind.js";
const optionSelectors = {
    'searchText': '#search',
    'isPublic': '#is_public',
    'isPrivate': '#is_private',
    'onlyArchived': '#only_archived',
    'excludeArchived': '#exclude_archived',
    'sortOption': '#sort_option',
    'sortOptions': 'a[name=sortOption]',
    'pageOptions': 'input[name=pageOptions]',
    'nextPage': '#page_next',
    'previousPage': '#page_previous'
};
const searchAsyncGuard = new AsyncGuard();
document.addEventListener("DOMContentLoaded", () => {
    main();
    async function main() {
        const config = await loadConfig().catch(err => {
            alert(err.message);
            throw new Error(err.message);
        });
        search(config);
        _add_change_event(optionSelectors.onlyArchived, e => {
            (getInputElementBySelector(optionSelectors.excludeArchived)).checked = false;
        });
        _add_change_event(optionSelectors.excludeArchived, e => {
            (getInputElementBySelector(optionSelectors.onlyArchived)).checked = false;
        });
        const sortOptions = document.querySelectorAll('a[name="sortOption"]');
        sortOptions.forEach(el => {
            el?.addEventListener("click", e => {
                e.preventDefault();
                const v = e.target.getAttribute("data-value");
                const sort_option = document.querySelector("#sort_option");
                if (sort_option !== null && v !== null) {
                    sort_option.value = v;
                }
            });
        });
        const viewOptions = document.querySelectorAll('input[name="viewOptions"]');
        viewOptions.forEach(el => {
            el?.addEventListener("change", e => {
                e.preventDefault();
                const v = e.target.value;
                const output = document.querySelector(".gr-output");
                const cn_hidden_i = "gr-output-hidden-info";
                const cn_hidden_d = "gr-output-hidden-desc";
                console.log("ddd");
                if (v == 'hidden_i') {
                    output?.classList.add(cn_hidden_i);
                    output?.classList.remove(cn_hidden_d);
                }
                else if (v == 'hidden_di') {
                    output?.classList.add(cn_hidden_i);
                    output?.classList.add(cn_hidden_d);
                }
                else {
                    output?.classList.remove(cn_hidden_i);
                    output?.classList.remove(cn_hidden_d);
                }
            });
        });
        bindEventAll(optionSelectors, (e) => {
            e.preventDefault();
            searchAsyncGuard.new();
            search(config, searchAsyncGuard.get(), e.target);
        });
    }
});
function search(config, asyncToken = 0, evTarget = null) {
    if (!searchAsyncGuard.check(asyncToken))
        return;
    const authToken = config.personal_access_token;
    const author = config.author;
    let searches = {
        'user': author,
        'sort': 'updated-desc'
    };
    let query = '';
    const searchText = getInputElementBySelector(optionSelectors.searchText).value;
    if (searchText) {
        query = `${searchText} in:name`;
    }
    const isPublic = getInputElementBySelector(optionSelectors.isPublic).checked;
    const isPrivate = getInputElementBySelector(optionSelectors.isPrivate).checked;
    if (isPrivate === false && isPublic === true) {
        searches['is'] = 'public';
    }
    else if (isPrivate === true && isPublic === false) {
        searches['is'] = 'private';
    }
    const onlyArchived = getInputElementBySelector(optionSelectors.onlyArchived).checked;
    if (onlyArchived === true) {
        searches['archived'] = 'true';
    }
    const excludeArchived = getInputElementBySelector(optionSelectors.excludeArchived).checked;
    if (excludeArchived === true) {
        searches['archived'] = 'false';
    }
    const sortOption = getElementBySelector(optionSelectors.sortOption).value;
    if (sortOption === 'nameAsc') {
        searches['sort'] = 'name-asc';
    }
    else if (sortOption === 'lastUpdate') {
        searches['sort'] = 'updated-desc';
    }
    else {
        searches['sort'] = 'updated-desc';
    }
    Object.entries(searches).forEach(([key, value]) => {
        query += " " + key + ":" + value;
    });
    console.log(query);
    let pageOption = parseInt(getRadioValueByName('pageOptions'));
    if (pageOption == 0)
        pageOption = 10;
    const searchParam = { page: pageOption, after: "", before: "" };
    if (!!evTarget) {
        if (evTarget.id == 'page_next') {
            searchParam.after = (Paging.getCursorValue(optionSelectors.nextPage)) ?? '';
        }
        if (evTarget.id == 'page_previous') {
            searchParam.before = (Paging.getCursorValue(optionSelectors.previousPage)) ?? '';
        }
    }
    if (!searchAsyncGuard.check(asyncToken))
        return;
    fetchRepoList_GraphQL(authToken, query, searchParam, (data) => {
        rewriteHTML(data, asyncToken);
    });
}
function rewriteHTML(_data, asyncToken = 0) {
    let outputHtml = '';
    const data = _data.search;
    const itemList = data.edges;
    const pageInfo = data.pageInfo;
    for (const _item of itemList) {
        const item = _item.node;
        let badges = '';
        if (item.isPrivate) {
            badges += '<span class="badge rounded-pill text-bg-secondary">private</span>';
        }
        if (item.isArchived) {
            badges += '<span class="badge rounded-pill text-bg-secondary">archived</span>';
        }
        const licenseInfoHtml = (item.licenseInfo && item.licenseInfo.name) ?
            `<span class="ml-0 mr-3">${item.licenseInfo.name}</span> /` : '';
        const descriptionHtml = (item.description) ? `<small class="grot-item-desc">${item.description}</small>` : '';
        const diskUsage = (item.diskUsage > 1024) ? (item.diskUsage * 1.0 / 1024).toFixed(2) + ' MB' : item.diskUsage + ' KB';
        const diskUsageHtml = (diskUsage.length > 0) ? `<span class="ml-0 mr-3">${diskUsage}</span> /` : '';
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
      `;
        outputHtml += html;
    }
    const el = document.querySelector(".gr-output");
    if (el != null) {
        if (!searchAsyncGuard.check(asyncToken))
            return;
        el.innerHTML = outputHtml;
    }
    const hasNextPage = pageInfo.hasNextPage;
    const hasPreviousPage = pageInfo.hasPreviousPage;
    Paging.changePagingEl({ selector: optionSelectors.nextPage, has: hasNextPage, cursor: pageInfo.endCursor });
    Paging.changePagingEl({ selector: optionSelectors.previousPage, has: hasPreviousPage, cursor: pageInfo.startCursor });
}
const Paging = {
    changePagingEl(info) {
        const element = document.querySelector(info.selector);
        if (info.has) {
            element?.closest('.page-item')?.classList.remove('disabled');
            element?.setAttribute("data-value", info.cursor);
        }
        else {
            element?.closest('.page-item')?.classList.add('disabled');
        }
    },
    getCursorValue(selector) {
        const element = document.querySelector(selector);
        return element?.getAttribute("data-value");
    }
};
const _add_event = (sel, type, event) => {
    document.querySelector(sel)?.addEventListener(type, event);
};
const _add_change_event = (sel, event) => {
    _add_event(sel, 'change', event);
};
const toLocaleDateString = (value) => new Date(value).toLocaleString('ko-KR');
const getElementBySelector = (sel) => document.querySelector(sel);
const getInputElementBySelector = (sel) => getElementBySelector(sel);
const getRadioValueByName = (name) => getInputElementBySelector(`input[name="${name}"]:checked`)?.value;

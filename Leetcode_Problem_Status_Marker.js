// ==UserScript==
// @name         LeetCode Problem Status Marker (International)
// @namespace    https://github.com/MrChildrenJ
// @version      0.1
// @description  Show "International LeetCode problem status" on "Chinese LeetCode problem list pages"
// @author       JJ Huang
// @match        https://leetcode.cn/discuss/post/*
// @grant        GM_xmlhttpRequest
// @connect      leetcode.com
// @icon         data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNzQ2NjcxNzM5NTU1IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjY3MDIiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCI+PHBhdGggZD0iTTEwMjEuMDUgOTE0LjU5TDY1NC4yMSAxMTkuNzdBOTYuMjcgOTYuMjcgMCAwIDAgNTY3LjA1IDY0SDQ4MGEzMiAzMiAwIDAgMC0yOSAxOC41OWwtMzg0IDgzMkEzMiAzMiAwIDAgMCA5NiA5NjBoMjE1LjA1YTk2LjI3IDk2LjI3IDAgMCAwIDg3LjE2LTU1Ljc3bDQxLTg4Ljg0IDI1NS40NSAxMjcuNzJBMTYwLjg0IDE2MC44NCAwIDAgMCA3NjYuMjIgOTYwSDk5MmEzMiAzMiAwIDAgMCAyOS00NS40MXogbS02ODAuOTQtMzcuMThBMzIuMTEgMzIuMTEgMCAwIDEgMzExLjA1IDg5NkgyNzRsNjEuMjEtMTMyLjYxTDM4MiA3ODYuNzV6IG0zODMuMTcgOC40NUw0MzguNDEgNzQzLjQzbC0wLjE2LTAuMDgtMTAzLjc3LTUxLjg5LTAuODEtMC4zOWEzMS44MyAzMS44MyAwIDAgMC0yNC0xLjM3aC0wLjA1YTMxLjg0IDMxLjg0IDAgMCAwLTE4LjUzIDE2LjU5Yy0wLjA2IDAuMTItMC4xMiAwLjI1LTAuMTcgMC4zN0wyMDMuNTMgODk2SDE0NmwzNTQuNDctNzY4SDU1OEwzMzkgNjAyLjU5Yy0wLjA1IDAuMDktMC4wOCAwLjE4LTAuMTIgMC4yN2EzMiAzMiAwIDAgMCAxNC44NiA0MS43NmwyOTEuMiAxNDUuNmEzMiAzMiAwIDAgMCA0NS45MS0zMy42M2MxLTAuNDYgMC4yMi0yLjQtMi41NS04LjRMNTc5LjI0IDUxMiA2MDggNDQ5LjcgODE0IDg5NmgtNDcuNzhhOTYuNDEgOTYuNDEgMCAwIDEtNDIuOTQtMTAuMTR6TTU0NCA1ODguMzZsNDcuOTIgMTAzLjgyLTc3Ljg3LTM4Ljkzek04ODQuNDcgODk2TDYzNy4wNSAzNTkuOTJhMzIgMzIgMCAwIDAtNTgtMC4ybC0wLjEgMC4yLTEyMi4xNyAyNjQuNjktNDYuNzMtMjMuMzZMNjA4IDE3Mi4zNiA5NDIgODk2eiIgZmlsbD0iI0ZGN0E1OCIgcC1pZD0iNjcwMyI+PC9wYXRoPjwvc3ZnPg==
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    const THRESHOLD = 10; // Threshold for switching between single and batch mode

    function getCSRFToken() {
        // Try to get from cookie
        const csrfFromCookie = document.cookie.match(/csrftoken=([^;]+)/)?.[1];
        if (csrfFromCookie) return csrfFromCookie;

        // Try to get from meta tag
        const csrfMeta = document.querySelector('meta[name="csrf-token"]');
        if (csrfMeta) return csrfMeta.getAttribute('content');

        // Try to get from global variables on the page (common in international version)
        if (window.__INITIAL_STATE__ && window.__INITIAL_STATE__.csrfToken) {
            return window.__INITIAL_STATE__.csrfToken;
        }

        return null;
    }

    const csrfToken = getCSRFToken();
    if (!csrfToken) {
        console.warn("⚠️ Failed to get CSRF Token, user may not be logged in.");
    }
    console.log("🚀 [Chinese Problem List - International Status] Script started");

    function getStatusIcon(status) {
        switch (status) {
            case 'ac':
            case 'Accepted':
                return '✅';
            case 'notac':
            case 'Attempted':
                return '❌';
            case null:
            case 'NotStarted':
                return '🕓';
            default:
                return '❓';
        }
    }

    function extractLinks() {
        return Array.from(document.querySelectorAll("a[href*='/problems/']"))
            .filter(link => /\/problems\/[^/]+\/?$/.test(link.href));
    }

    function insertStatusIcon(link, status) {
        // Avoid duplicate insertion
        if (link.previousSibling && link.previousSibling.classList && link.previousSibling.classList.contains('status-icon')) {
            return;
        }

        const icon = getStatusIcon(status);
        const span = document.createElement('span');
        span.className = 'status-icon';
        span.textContent = icon + ' ';
        span.style.marginRight = '4px';
        link.parentNode.insertBefore(span, link);
    }

    // The batch API for international version might be different, need to use GraphQL
    function fetchAllProblemStatuses() {
        return new Promise((resolve) => {
            GM_xmlhttpRequest({
                method: "POST",
                url: "https://leetcode.com/graphql/",
                headers: {
                    'Content-Type': 'application/json',
                    'x-csrftoken': csrfToken || '',
                    'referer': 'https://leetcode.com/'
                },
                data: JSON.stringify({
                    operationName: "getQuestionsByTag",
                    variables: {
                        categorySlug: "",
                        limit: 3000,
                        skip: 0,
                        filters: {}
                    },
                    query: `
                        query getQuestionsByTag($categorySlug: String, $skip: Int, $limit: Int, $filters: QuestionListFilterInput) {
                          problemsetQuestionList: questionList(
                            categorySlug: $categorySlug
                            skip: $skip
                            limit: $limit
                            filters: $filters
                          ) {
                            questions: data {
                              titleSlug
                              status
                            }
                          }
                        }
                    `
                }),
                onload: function (res) {
                    try {
                        const json = JSON.parse(res.responseText);
                        const map = new Map();
                        const questions = json.data?.problemsetQuestionList?.questions || [];
                        questions.forEach(item => {
                            map.set(item.titleSlug, item.status);
                        });
                        console.log(`📦 Batch mode: Successfully fetched statuses for ${map.size} problems`);
                        resolve(map);
                    } catch (e) {
                        console.error("❌ Batch parsing failed", e);
                        resolve(new Map());
                    }
                },
                onerror: function (err) {
                    console.error("❌ Batch request failed", err);
                    resolve(new Map());
                }
            });
        });
    }

    function fetchSingleStatus(slug) {
        return new Promise((resolve) => {
            GM_xmlhttpRequest({
                method: "POST",
                url: "https://leetcode.com/graphql/",
                headers: {
                    'Content-Type': 'application/json',
                    'x-csrftoken': csrfToken || '',
                    'referer': 'https://leetcode.com/'
                },
                data: JSON.stringify({
                    operationName: "questionData",
                    variables: { titleSlug: slug },
                    query: `
                        query questionData($titleSlug: String!) {
                          question(titleSlug: $titleSlug) {
                            status
                          }
                        }
                    `
                }),
                onload: function (res) {
                    try {
                        const json = JSON.parse(res.responseText);
                        const status = json.data?.question?.status ?? null;
                        resolve(status);
                    } catch (e) {
                        console.error(`⚠️ Single problem parsing failed: ${slug}`, e);
                        resolve(null);
                    }
                },
                onerror: function (err) {
                    console.error(`❌ Single problem request failed: ${slug}`, err);
                    resolve(null);
                }
            });
        });
    }

    async function run() {
        const links = extractLinks();
        console.log(`🔍 Detected ${links.length} problem links`);

        if (links.length === 0) return;

        if (links.length <= THRESHOLD) {
            console.log(`🧪 Less than or equal to ${THRESHOLD}, using single request mode`);
            for (const link of links) {
                const slug = link.href.match(/problems\/([^/]+)\/?$/)?.[1];
                if (!slug) continue;
                const status = await fetchSingleStatus(slug);
                insertStatusIcon(link, status);
            }
        } else {
            console.log(`📦 More than ${THRESHOLD}, entering batch mode`);
            const statusMap = await fetchAllProblemStatuses();
            for (const link of links) {
                const slug = link.href.match(/problems\/([^/]+)\/?$/)?.[1];
                const status = statusMap.get(slug) ?? null;
                insertStatusIcon(link, status);
            }
        }
    }

    // Run after page is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(run, 1000));
    } else {
        setTimeout(run, 1000);
    }

    // Listen for page changes (SPA applications)
    const observer = new MutationObserver(() => {
        setTimeout(run, 500);
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
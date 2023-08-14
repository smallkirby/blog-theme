/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2023 smallkirby
 * Copyright (c) 2019 reuixiy and the contributors.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/* eslint-disable no-invalid-this */

const offlineSearch = (() => {
  function isNowSearchPage() {
    return window.location.pathname === '/search/';
  }

  window.addEventListener(
    'DOMContentLoaded',
    function (event) {
      let index = null;
      let lookup = null;
      let queuedTerm = null;

      const form = document.getElementById('search');
      const input = document.getElementById('search-input');

      // Setup search submission event listener.
      form.addEventListener(
        'submit',
        function (event) {
          event.preventDefault();

          const term = input.value.trim();
          if (!term) {
            return;
          }
          if (isNowSearchPage()) {
            window.history.replaceState(null, null, '?q=' + term);
            startSearch(term);
          } else {
            window.location.href = '/search?q=' + input.value.trim();
          }
        },
        false
      );

      if (isNowSearchPage()) {
        const term = new URLSearchParams(window.location.search).get('q');
        startSearch(term);
      }

      function startSearch(term) {
        document.getElementById('search-result-string').style.display = 'none';
        document.getElementById('search-loading-string').style.display =
          'block';

        if (index) {
          // Index already present, search directly.
          search(term);
        } else if (queuedTerm) {
          // Index is being loaded, replace the term we want to search for.
          queuedTerm = term;
        } else {
          // Start loading index, perform the search when done.
          queuedTerm = term;
          initIndex();
        }
      }

      function searchDone() {
        document.getElementById('search-result-string').style.display = 'block';
        document.getElementById('search-loading-string').style.display = 'none';
        queuedTerm = null;
      }

      function initIndex() {
        const request = new XMLHttpRequest();
        request.open('GET', '/search.json');
        request.responseType = 'json';
        request.addEventListener(
          'load',
          (event) => {
            lookup = {};
            index = lunr(function () {
              this.use(lunr.ja);
              this.ref('uri');

              // If you added more searchable fields to the search index, list them here.
              this.field('title');
              this.field('content');
              this.field('description');
              this.field('summary');
              this.field('categories');
              this.field('date');

              for (const doc of request.response) {
                this.add(doc);
                lookup[doc.uri] = doc;
              }
            });

            // Search index is ready, perform the search now
            search(queuedTerm);
          },
          false
        );
        request.addEventListener('error', searchDone, false);
        request.send(null);
      }

      function search(term) {
        const results = index.search(term);

        const searchNumString = document.getElementById('search-num-string');
        if (results.length == 0) {
          searchNumString.textContent = 'No results found';
        } else if (results.length == 1) {
          searchNumString.textContent = 'Found one result';
        } else {
          searchNumString.textContent = `Found ${results.length} results”`;
        }
        const searchTerm = document.getElementById('search-term');
        searchTerm.textContent = term;

        const target = document.getElementById('search-results');
        while (target.firstChild) {
          target.removeChild(target.firstChild);
        }

        const template = document.getElementById('search-result');

        for (const result of results) {
          const doc = lookup[result.ref];

          // Fill out search result template, adjust as needed.
          const element = template.content.cloneNode(true);
          element.querySelector('.search-post-date').textContent = dayjs(
            doc.date
          ).format('YYYY.MM.DD.');
          element.querySelector('.search-post-title').href = doc.uri;
          element.querySelector('.search-post-title').textContent = doc.title;
          doc.categories.forEach((category) => {
            const categoryElement = document.createElement('a');
            const path = category.split(' ').join('-').toLowerCase();
            categoryElement.href = `/categories/${path}/`;
            categoryElement.textContent = category;
            element
              .querySelector('.search-list-categories')
              .appendChild(categoryElement);
          });
          element.querySelector('.search-list-summary').textContent = truncate(
            doc.description,
            1
          );
          target.appendChild(element);
        }

        searchDone();
      }

      // This matches Hugo's own summary logic:
      // https://github.com/gohugoio/hugo/blob/b5f39d23b8/helpers/content.go#L543
      function truncate(text, minWords) {
        let match;
        let result = '';
        let wordCount = 0;
        const regexp = /(\S+)(\s*)/g;
        while ((match = regexp.exec(text))) {
          wordCount++;
          if (wordCount <= minWords) {
            result += match[0];
          } else {
            const char1 = match[1][match[1].length - 1];
            const char2 = match[2][0];
            if (/[.?!"]/.test(char1) || char2 == '\n') {
              result += match[1];
              break;
            } else {
              result += match[0];
            }
          }
        }
        return result;
      }
    },
    false
  );
})();

export { offlineSearch as search };

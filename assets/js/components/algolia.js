import { decode } from 'js-base64';
import algoliasearch from 'algoliasearch';

/**
 * This is NOT a credential and no need to be kept secret.
 * Base64 is just to avoid warnings of GitHub.
 * Don't bother me with warnings...!
 */
const ALGOLIA_APP_ID = decode('UElCUUdLSDBCUA==');
const ALGOLIA_API_KEY = decode('NGI2MDkwZGUzOTkwMDI3NWRlZDBjMmMwYzBlOTI3YjE=');
const ALGOLIA_INDEX_NAME = decode('YmxvZ19lbnRyaWVz');

const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY);
const index = client.initIndex(ALGOLIA_INDEX_NAME);

const algoliaSearch = (() => {
  const isNowSearchPage = () => {
    return window.location.pathname === '/search/';
  };

  const mergeSearchResults = (results) => {
    const mergedResults = [];
    const lookup = {};
    for (const result of results) {
      if (!lookup[result.uri]) {
        lookup[result.uri] = result;
        mergedResults.push(result);
      }
    }
    return mergedResults;
  };

  window.addEventListener(
    'DOMContentLoaded',
    () => {
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

        search(term);
      }

      function searchDone() {
        document.getElementById('search-result-string').style.display = 'block';
        document.getElementById('search-loading-string').style.display = 'none';
      }

      function search(term) {
        const searchExact = (term) => {
          const words = term.split(' ');
          const quotedWords = words.map((word) => `"${word}"`);
          return index.search(quotedWords.join(' '));
        };
        searchExact(term)
          .then((result) => {
            // Set search abstract
            const searchNumString =
              document.getElementById('search-num-string');
            const docs = mergeSearchResults(result.hits);
            if (docs.length === 0) {
              searchNumString.textContent = 'No results found';
            } else if (docs.length === 1) {
              searchNumString.textContent = 'Found one result';
            } else {
              searchNumString.textContent = `Found ${docs.length} results`;
            }
            const searchTerm = document.getElementById('search-term');
            searchTerm.textContent = term;

            // Set search results
            const target = document.getElementById('search-results');
            while (target.firstChild) {
              target.removeChild(target.firstChild);
            }

            const template = document.getElementById('search-result');
            for (const doc of docs) {
              // Fill out search result template, adjust as needed.
              const element = template.content.cloneNode(true);
              element.querySelector('.search-post-date').textContent = dayjs(
                doc.date
              ).format('YYYY.MM.DD');
              element.querySelector('.post-entry-link').href = doc.uri;
              element.querySelector('.search-post-title').textContent =
                doc.title;
              doc.categories.forEach((category) => {
                const categoryElement = document.createElement('span');
                categoryElement.className = 'category-tag';
                const path = category.split(' ').join('-').toLowerCase();
                categoryElement.href = `/categories/${path}/`;
                categoryElement.textContent = category;
                element
                  .querySelector('.search-list-categories')
                  .appendChild(categoryElement);
              });
              element.querySelector('.search-list-summary').textContent =
                truncate(doc.description, 1);
              target.appendChild(element);
            }
            searchDone();
          })
          .catch((error) => {
            console.error(error);
          });
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

export { algoliaSearch };

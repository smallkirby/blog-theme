/**
 * Highlight the current TOC entry based on scroll position.
 */
const highlightToc = (() => {
  const tocContents = document.getElementById('js-toc-contents');
  if (!tocContents) {
    return;
  }
  const allTocHrefs = tocContents.querySelectorAll('a[href^="#"]');
  const allTocYs = [];
  allTocHrefs.forEach((tocHref) => {
    const y = document.querySelector(tocHref.getAttribute('href')).offsetTop;
    allTocYs.push(y);
  });

  const highlightTocEntry = (tocIndex) => {
    allTocHrefs.forEach((tocHref) => {
      tocHref.classList.remove('toc-link--active');
    });
    if (tocIndex >= 0 && tocIndex < allTocHrefs.length) {
      allTocHrefs[tocIndex].classList.add('toc-link--active');
    } else if (tocIndex === -1) {
      allTocHrefs[0].classList.add('toc-link--active');
    } else {
      allTocHrefs[allTocHrefs.length - 1].classList.add('toc-link--active');
    }
  };

  document.addEventListener('scroll', () => {
    const currentScroll = -1 * document.body.getBoundingClientRect().top;
    const currentTocIndex = allTocYs.findIndex((y) => y > currentScroll) - 1;
    highlightTocEntry(currentTocIndex);
  });

  if (allTocYs.length > 0) {
    highlightTocEntry(0);
  }
})();

export { highlightToc };

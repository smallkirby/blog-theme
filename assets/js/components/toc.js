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
    const y = document.getElementById(
      tocHref.getAttribute('href').slice(1)
    )?.offsetTop;
    if (y) {
      allTocYs.push(y);
    }
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

  // Highlight correct TOC entry on page load
  document.addEventListener('scroll', () => {
    const currentScroll = -1 * document.body.getBoundingClientRect().top;
    const currentTocIndex = allTocYs.findIndex((y) => y > currentScroll) - 1;
    highlightTocEntry(currentTocIndex);
  });
  if (allTocYs.length > 0) {
    highlightTocEntry(0);
  }

  const tocWindows = document.getElementsByClassName('toc');
  if (tocWindows.length === 0) {
    return;
  }
  const tocWindow = tocWindows[0];

  // Scroll TOC to the current highlighted entry
  document.addEventListener('scroll', () => {
    const currentToc = document.querySelector('.toc-link--active');
    if (currentToc) {
      // Check if `currentToc` is in the visible part of the TOC
      const tocTop = currentToc.offsetTop;
      const tocBottom = tocTop + currentToc.offsetHeight;
      const tocWindowTop = tocWindow.scrollTop;
      const tocWindowBottom = tocWindowTop + tocWindow.offsetHeight;
      if (tocTop < tocWindowTop) {
        tocWindow.scrollTop = tocTop;
      }
      if (tocBottom > tocWindowBottom) {
        tocWindow.scrollTop = tocBottom - tocWindow.offsetHeight;
      }
    }
  });
})();

export { highlightToc };

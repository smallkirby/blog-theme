const toggleToc = (() => {
  const tocToggle = document.getElementById('js-toc-toggle');
  const tocContents = document.getElementById('js-toc-contents');

  if (tocToggle) {
    tocToggle.addEventListener('click', () => {
      tocContents.classList.toggle('toc-contents--active');
    });
  }
})();

export { toggleToc };

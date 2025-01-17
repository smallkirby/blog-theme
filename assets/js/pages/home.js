function filterPosts() {
  const selectPosts = document.getElementById('select-posts');
  const entries = document.querySelectorAll('.post-entry-filter');
  if (selectPosts) {
    selectPosts.addEventListener('change', () => {
      entries.forEach(function (entry) {
        if (
          entry.classList.contains(`entry--${selectPosts.value}`) |
          (selectPosts.value === 'all-posts')
        ) {
          entry.style.display = 'block';
        } else {
          entry.style.display = 'none';
        }
      });
    });
  }
}

const home = (() => {
  filterPosts();
})();

export { home };

// Handle category tag clicks
document.addEventListener('DOMContentLoaded', function () {
  const categoryTags = document.querySelectorAll('.category-tag');

  categoryTags.forEach((tag) => {
    tag.addEventListener('click', function (e) {
      e.stopPropagation(); // Prevent card click
      e.preventDefault(); // Prevent default action

      const category = e.target.dataset.category;
      if (category) {
        window.location.href = `/categories/${category}/`;
      }
    });
  });
});

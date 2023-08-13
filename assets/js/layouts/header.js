// Show or hide nav on click of menu burger
function toggleNav() {
  const mainMenu = document.getElementById('js-menu');
  const navBarToggle = document.getElementById('js-navbar-toggle');

  navBarToggle.addEventListener('click', () => {
    mainMenu.classList.toggle('menu--active');
    removeSubMenus();
  });
}

// Show or hide menu items on mobile
function toggleMobileMenu() {
  const menuItems = document.querySelectorAll('.menu-item');

  menuItems.forEach(function (item) {
    item.addEventListener('click', () => {
      const subMenu = item.querySelector('.sub-menu');
      if (subMenu.classList.contains('sub-menu--active')) {
        subMenu.classList.remove('sub-menu--active');
      } else {
        removeSubMenus();
        subMenu.classList.add('sub-menu--active');
      }
    });
  });
}

// Collapse submenus
function removeSubMenus() {
  const subMenus = document.querySelectorAll('.sub-menu');
  subMenus.forEach(function (sub) {
    if (sub.classList.contains('sub-menu--active')) {
      sub.classList.remove('sub-menu--active');
    }
  });
}

const header = (() => {
  toggleNav();
  toggleMobileMenu();
})();

export { header };

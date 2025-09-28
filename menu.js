
document.addEventListener('DOMContentLoaded', function() {
  // Botão para abrir/fechar o menu lateral
  const menuToggle = document.getElementById('menu-toggle');
  const sideMenu = document.getElementById('side-menu');
  menuToggle.addEventListener('click', function() {
    sideMenu.classList.toggle('open');
  });
});
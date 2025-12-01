// assets/js/logout.js
// Torna funcional o botão de sair em todas as páginas

document.addEventListener('DOMContentLoaded', function () {
  const logoutBtn = document.querySelector('.logout-link');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function (e) {
      e.preventDefault();
      // Limpa dados de autenticação do localStorage/sessionStorage
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      // Adicione aqui outros dados que desejar limpar
      window.location.href = 'index.html';
    });
  }
});

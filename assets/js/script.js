// Seleção dos elementos principais do DOM
const sidebar = document.getElementById('sidebar');
const btnToggle = document.getElementById('btn-toggle'); // Botão hamburguer da esquerda (desktop)
const rightSidebar = document.getElementById('right-sidebar');
const overlay = document.getElementById('overlay');
const closeRightSidebar = document.getElementById('close-right-sidebar');
const openRightMenu = document.getElementById('open-right-menu'); // Botão hamburguer da direita (mobile)

// ================================
// 1. Alternar menu lateral esquerdo (desktop)
// ================================
// Ao clicar no botão hamburguer, alterna a classe 'collapsed' para recolher ou expandir o menu lateral esquerdo,
// mas somente se a largura da janela for maior que 600px (desktop).
btnToggle.addEventListener('click', () => {
  if (window.innerWidth > 600) {
    sidebar.classList.toggle('collapsed');
  }
});

// ================================
// 2. Abrir menu lateral direito (mobile)
// ================================
// Ao clicar no botão hamburguer do menu direito, abre o menu lateral direito e exibe o overlay.
openRightMenu.addEventListener('click', (e) => {
  e.preventDefault();
  rightSidebar.classList.add('active');
  overlay.classList.add('active');
});

// ================================
// 3. Fechar menu lateral direito
// ================================
// Função para fechar o menu lateral direito e esconder o overlay.
function closeRightMenu() {
  rightSidebar.classList.remove('active');
  overlay.classList.remove('active');
}

// Eventos para fechar o menu lateral direito ao clicar no botão fechar ou no overlay.
closeRightSidebar.addEventListener('click', closeRightMenu);
overlay.addEventListener('click', closeRightMenu);

// Fechar menu lateral direito ao pressionar a tecla ESC.
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeRightMenu();
  }
});

// ================================
// 4. Gerenciar item ativo no menu (underline ativo)
// ================================
// Seleciona todos os itens de navegação do menu lateral esquerdo e direito.
const navItems = document.querySelectorAll('nav#sidebar ul li, #right-sidebar ul li');

// Ao clicar em um item, remove a classe 'active' de todos e adiciona no item clicado,
// exceto para o botão hamburguer (classe 'menu-hamburger') e o botão abrir menu direito.
navItems.forEach((item) => {
  item.addEventListener('click', () => {
    if (!item.classList.contains('menu-hamburger') && item.id !== 'open-right-menu') {
      navItems.forEach((el) => el.classList.remove('active'));
      item.classList.add('active');
    }
  });
});


// ================================
// 5. Gerenciar classe 'active' em links do menu mobile (se existir .mobile-menu)
// ================================
// Adiciona evento de clique em todos os links dentro do menu mobile para controlar a classe 'active'.
document.querySelectorAll('.mobile-menu a').forEach(link => {
  link.addEventListener('click', function () {
    // Remove 'active' de todos os links
    document.querySelectorAll('.mobile-menu a').forEach(a => a.classList.remove('active'));
    // Adiciona 'active' no link clicado
    this.classList.add('active');
  });
});


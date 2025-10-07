document.addEventListener('DOMContentLoaded', function () {
    // Toggle para a senha principal
    const senhaInput = document.getElementById('senha');
    const toggleBtn = document.getElementById('toggleSenha');
    const icon = toggleBtn.querySelector('.material-symbols-outlined');

    toggleBtn.addEventListener('click', function () {
        if (senhaInput.type === 'password') {
            senhaInput.type = 'text';
            icon.textContent = 'visibility_off';
        } else {
            senhaInput.type = 'password';
            icon.textContent = 'visibility';
        }
    });


});
// Drawer mobile
const btn = document.querySelector('.hamburger');
const sidebar = document.getElementById('sidebar');
const backdrop = document.getElementById('backdrop');

function toggleMenu(force) {
    const open = force ?? !sidebar.classList.contains('open');
    sidebar.classList.toggle('open', open);
    backdrop.classList.toggle('show', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
}
btn.addEventListener('click', () => toggleMenu());
backdrop.addEventListener('click', () => toggleMenu(false));
window.addEventListener('keyup', e => { if (e.key === 'Escape') toggleMenu(false) });

// Acessibilidade do accordion
const acc = document.getElementById('books-acc');
acc.addEventListener('toggle', () => {
    const expanded = acc.open ? 'true' : 'false';
    acc.querySelector('summary').setAttribute('aria-expanded', expanded);
});

// Fechar drawer ao navegar (apenas mobile)
document.querySelectorAll('.sidebar a').forEach(a => {
    a.addEventListener('click', () => {
        if (window.matchMedia('(max-width:980px)').matches) toggleMenu(false);
    });
});

// Carousel
const prev = document.querySelector('.prev');
const next = document.querySelector('.next');
const grid = document.querySelector('.livros-grid');

next.addEventListener('click', () => grid.scrollBy({ left: 150, behavior: 'smooth' }));
prev.addEventListener('click', () => grid.scrollBy({ left: -150, behavior: 'smooth' }));

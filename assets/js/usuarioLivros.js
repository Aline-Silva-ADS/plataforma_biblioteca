// assets/js/usuarioLivros.js
// Popula a grid de livros na home do usuário

document.addEventListener('DOMContentLoaded', function () {
    const grid = document.querySelector('.static-books-grid');
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    let livrosData = [];

    function renderLivros(livros) {
        grid.innerHTML = '';
        if (!livros.length) {
            grid.innerHTML = '<div style="padding:2rem;color:#888;">Nenhum livro encontrado.</div>';
            return;
        }
        livros.forEach(livro => {
            const card = document.createElement('div');
            card.className = 'book-card';
            // Cria elemento de capa como <img> para permitir fallback
            const coverImg = document.createElement('img');
            coverImg.className = 'book-cover';
            coverImg.src = livro.capa ? '/' + livro.capa : '/uploads/capas/default-cover.png';
            coverImg.alt = livro.titulo;
            coverImg.onerror = function() {
                this.onerror = null;
                this.src = '/uploads/capas/default-cover.png';
            };

            card.innerHTML = `
                <div class="book-info">
                    <div class="book-title">${livro.titulo}</div>
                    <div class="book-author">${livro.autores ? livro.autores.join(', ') : ''}</div>
                </div>
            `;
            card.insertBefore(coverImg, card.firstChild);
            card.style.cursor = 'pointer';
            card.addEventListener('click', function () {
                window.location.href = `usuarioLivroInformacoes.html?id=${livro.id_livro}`;
            });
            grid.appendChild(card);
        });
    }

    function filtrarLivros() {
        const termo = (searchInput.value || '').toLowerCase();
        const filtrados = livrosData.filter(livro =>
            livro.titulo.toLowerCase().includes(termo) ||
            (livro.autores && livro.autores.join(', ').toLowerCase().includes(termo))
        );
        renderLivros(filtrados);
    }

    fetch('http://127.0.0.1:3001/api/livros')
        .then(resp => resp.json())
        .then(data => {
            if (Array.isArray(data.livros)) {
                livrosData = data.livros;
                renderLivros(livrosData);
            }
        });

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            if (searchInput.value === '') {
                renderLivros(livrosData);
            } else {
                filtrarLivros();
            }
        });
    }
});

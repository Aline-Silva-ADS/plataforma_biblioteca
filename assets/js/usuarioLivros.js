// assets/js/usuarioLivros.js
// Popula a grid de livros na home do usuário

document.addEventListener('DOMContentLoaded', function () {
    const grid = document.querySelector('.books-grid');
    if (!grid) return;

    fetch('http://127.0.0.1:3001/api/livros')
        .then(resp => resp.json())
        .then(data => {
            if (Array.isArray(data.livros)) {
                grid.innerHTML = '';
                data.livros.forEach(livro => {
                    const card = document.createElement('div');
                    card.className = 'book-card';
                    card.innerHTML = `
                        <div class="book-cover" style="background-image:url('${livro.capa ? '/' + livro.capa : 'assets/image/default-cover.png'}')"></div>
                        <div class="book-info">
                            <div class="book-title">${livro.titulo}</div>
                            <div class="book-author">${livro.autores ? livro.autores.join(', ') : ''}</div>
                        </div>
                    `;
                    grid.appendChild(card);
                });
            }
        });
});

// assets/js/usuarioLivroInformacoes.js
// Carrega as informações do livro selecionado na página de detalhes

document.addEventListener('DOMContentLoaded', function () {
    // Pega o id do livro da query string
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;

    fetch(`http://127.0.0.1:3001/api/livros/${id}`)
        .then(resp => resp.json())
        .then(data => {
            if (!data.livro) return;
            const livro = data.livro;
            // Capa
            const img = document.querySelector('.info-book-cover');
            if (img && livro.capa) img.src = '/' + livro.capa;
            // Título
            const title = document.querySelector('.info-book-title');
            if (title) title.textContent = livro.titulo;
            // Autores
            const author = document.querySelector('.info-book-author');
            if (author) author.textContent = livro.autores ? livro.autores.join(', ') : '';
            // Gêneros
            const genres = document.querySelector('.info-book-genres');
            if (genres) {
                genres.innerHTML = '';
                if (livro.categorias && livro.categorias.length) {
                    livro.categorias.forEach(cat => {
                        const span = document.createElement('span');
                        span.className = 'badge badge-outline';
                        span.textContent = cat;
                        genres.appendChild(span);
                    });
                }
            }
            // Editora
            document.querySelectorAll('.info-book-item .info-book-value')[0].textContent = livro.editora || '';
            // Ano
            document.querySelectorAll('.info-book-item .info-book-value')[1].textContent = livro.ano_lancamento || '';
            // Páginas
            document.querySelectorAll('.info-book-item .info-book-value')[2].textContent = livro.numero_paginas || '';
            // Idioma
            document.querySelectorAll('.info-book-item .info-book-value')[3].textContent = livro.idioma || '';
            // Disponibilidade
            const dispSpan = document.querySelectorAll('.info-book-item .info-book-value')[4];
            dispSpan.innerHTML = livro.quantidade_disponivel > 0 ? '<span class="text-success">Disponível</span>' : '<span class="text-danger">Indisponível</span>';
            // Descrição
            const desc = document.querySelector('.info-book-description');
            if (desc) desc.textContent = livro.descricao || '';

            // Botão emprestar
            const btnEmprestar = document.querySelector('.info-book-btn');
            if (btnEmprestar) {
                if (livro.quantidade_disponivel > 0) {
                    btnEmprestar.disabled = false;
                    btnEmprestar.textContent = 'Emprestar Livro';
                    btnEmprestar.classList.remove('btn-disabled');
                    btnEmprestar.addEventListener('click', function () {
                        // Redireciona para a página de empréstimo, passando o id do livro
                        window.location.href = `usuarioLivroEmprestar.html?id=${livro.id_livro}`;
                    });
                } else {
                    btnEmprestar.disabled = true;
                    btnEmprestar.textContent = 'Livro Indisponível';
                    btnEmprestar.classList.add('btn-disabled');
                }
            }
        });
});

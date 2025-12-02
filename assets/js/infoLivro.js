// assets/js/infoLivro.js
// Exibe os dados do livro na página adminLivroInfo.html

document.addEventListener('DOMContentLoaded', function () {
    // Pega o id do livro da URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;

    fetch(`http://127.0.0.1:3001/api/livros/${id}`)
        .then(resp => resp.json())
        .then(data => {
            if (!data.livro) return;
            const livro = data.livro;
            // Título
            document.querySelector('.title').textContent = livro.titulo || '';
            // Autor
            document.querySelectorAll('.detail-row .detail-value')[0].textContent = (livro.autores || []).join(', ');
            // Categoria
            document.querySelectorAll('.detail-row .detail-value')[1].textContent = (livro.categorias || []).join(', ');
            // Editora
            document.querySelectorAll('.detail-row .detail-value')[2].textContent = livro.editora || '';
            // Edição
            document.querySelectorAll('.detail-row .detail-value')[3].textContent = livro.edicao || '';
            // ISBN
            document.querySelectorAll('.detail-row .detail-value')[4].textContent = livro.isbn || '';
            // Idioma
            document.querySelectorAll('.detail-row .detail-value')[5].textContent = livro.idioma || '';
            // Número de páginas
            document.querySelectorAll('.detail-row .detail-value')[6].textContent = livro.numero_paginas || '';
            // Ano de lançamento
            document.querySelectorAll('.detail-row .detail-value')[7].textContent = livro.ano_lancamento || '';
            // Quantidade
            document.querySelectorAll('.detail-row .detail-value')[8].textContent = livro.quantidade_total || '';
            // Quantidade disponível
            document.querySelectorAll('.detail-row .detail-value')[9].textContent = livro.quantidade_disponivel || '';
            // Localização
            document.querySelectorAll('.detail-row .detail-value')[10].textContent = livro.localizacao || '';
            // Sinopse
            document.querySelector('.synopsis-box').textContent = livro.descricao || '';
            // Capa
            const coverImg = document.getElementById('book-cover-admin');
            if (coverImg && livro.capa) {
                coverImg.src = livro.capa.startsWith('uploads/') ? '../' + livro.capa : livro.capa;
                coverImg.style.display = 'block';
            } else if (coverImg) {
                coverImg.style.display = 'none';
            }
        });
});

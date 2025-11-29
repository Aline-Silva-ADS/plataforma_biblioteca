// assets/js/listarLivros.js
// Lista todos os livros cadastrados e permite ver detalhes

document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.querySelector('#userTable tbody');
    if (!tableBody) return;

    fetch('http://127.0.0.1:3001/api/livros')
        .then(resp => resp.json())
        .then(data => {
            if (Array.isArray(data.livros)) {
                tableBody.innerHTML = '';
                data.livros.forEach(livro => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td data-label="Título do livro">${livro.titulo}</td>
                        <td data-label="Autor(es)">${livro.autores ? livro.autores.join(', ') : ''}</td>
                        <td data-label="Quantidade">${livro.quantidade_total}</td>
                        <td data-label="Ações">
                            <button class="btn btn-table btn-success ver-mais" data-id="${livro.id_livro}">Ver Mais</button>
                        </td>
                    `;
                    tableBody.appendChild(tr);
                });
            }
        });

    tableBody.addEventListener('click', function (e) {
        if (e.target.classList.contains('ver-mais')) {
            const id = e.target.getAttribute('data-id');
            if (id) {
                window.location.href = `adminLivroInfo.html?id=${id}`;
            }
        }
    });
});

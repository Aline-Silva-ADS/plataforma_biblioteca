// assets/js/cadastrarLivro.js
// Envia o formulário de cadastro de livro com a capa via FormData

document.addEventListener('DOMContentLoaded', function () {
        // Adiciona/remover campos de autor dinamicamente
        const authorsContainer = document.getElementById('authors-container');
        if (authorsContainer) {
            authorsContainer.addEventListener('click', function (e) {
                if (e.target.classList.contains('btn-add-author')) {
                    e.preventDefault();
                    const newField = document.createElement('div');
                    newField.className = 'author-field';
                    newField.innerHTML = `
                        <input type="text" name="authors[]" class="input author-input" placeholder="Nome do autor" required>
                        <button type="button" class="btn btn-remove-author" title="Remover autor" style="margin-left: 5px;">-</button>
                    `;
                    authorsContainer.appendChild(newField);
                } else if (e.target.classList.contains('btn-remove-author')) {
                    e.preventDefault();
                    const field = e.target.closest('.author-field');
                    if (field && authorsContainer.children.length > 1) {
                        authorsContainer.removeChild(field);
                    }
                }
            });
        }
    const form = document.getElementById('bookForm');
    if (!form) return;
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const formData = new FormData(form);
        // Adiciona a capa (caso não esteja no form)
        const coverInput = document.getElementById('coverInput');
        if (coverInput && coverInput.files.length > 0) {
            formData.set('capa', coverInput.files[0]);
        }
        // Serializa múltiplos gêneros
        const genresSelect = document.getElementById('genres');
        if (genresSelect) {
            const selected = Array.from(genresSelect.selectedOptions).map(opt => opt.value).join(',');
            formData.set('genres', selected);
        }
        // Serializa múltiplos autores
        const authorInputs = document.querySelectorAll('.author-input');
        const authors = Array.from(authorInputs).map(input => input.value.trim()).filter(Boolean);
        formData.delete('authors[]'); // Remove campos antigos
        authors.forEach(a => formData.append('authors[]', a));
        try {
            const resp = await fetch('http://127.0.0.1:3001/api/livros', {
                method: 'POST',
                body: formData
            });
            const result = await resp.json();
            if (result.success) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Livro cadastrado!',
                    text: 'Cadastro realizado com sucesso.'
                });
                window.location.reload();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro ao cadastrar',
                    text: result.message || result.error || 'Erro desconhecido.'
                });
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Erro de conexão',
                text: 'Não foi possível conectar ao servidor.'
            });
        }
    });
});

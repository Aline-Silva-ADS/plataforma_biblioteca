// assets/js/adminEmprestarLivros.js
// Busca livros conforme digitado no campo de busca

document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.querySelectorAll('.search-section .search-box .input')[0];
    const infoFields = document.querySelectorAll('.search-section .info-fields')[0];
    const searchBox = document.querySelectorAll('.search-section .search-box')[0];
    let livrosData = [];

    // Cria dropdown de sugestões
    const dropdown = document.createElement('div');
    dropdown.className = 'livros-dropdown';
    dropdown.style.position = 'absolute';
    dropdown.style.background = '#fff';
    dropdown.style.border = '1px solid #ccc';
    dropdown.style.width = '100%';
    dropdown.style.zIndex = '10';
    dropdown.style.maxHeight = '200px';
    dropdown.style.overflowY = 'auto';
    dropdown.style.display = 'none';
    searchBox.style.position = 'relative';
    searchBox.appendChild(dropdown);

    // Busca todos os livros ao iniciar
    fetch('http://127.0.0.1:3001/api/livros')
        .then(resp => resp.json())
        .then(data => {
            if (Array.isArray(data.livros)) {
                livrosData = data.livros;
            }
        });

    function mostrarInfoLivro(livro) {
        if (!livro) {
            infoFields.querySelectorAll('.info-value')[0].textContent = '';
            infoFields.querySelectorAll('.info-value')[1].textContent = '';
            infoFields.querySelectorAll('.info-value')[2].textContent = '';
            return;
        }
        infoFields.querySelectorAll('.info-value')[0].textContent = livro.titulo;
        infoFields.querySelectorAll('.info-value')[1].textContent = livro.autores ? livro.autores.join(', ') : '';
        // Buscar status de cópias disponíveis
        fetch(`http://127.0.0.1:3001/api/copias/disponiveis/${livro.id_livro}`)
            .then(resp => resp.json())
            .then(copiasData => {
                const statusSpan = infoFields.querySelectorAll('.info-value')[2];
                const btnConcluir = document.querySelector('.btn.btn-submit');
                if (copiasData.disponiveis > 0) {
                    statusSpan.textContent = `Disponível (${copiasData.disponiveis})`;
                    if (btnConcluir) {
                        btnConcluir.disabled = false;
                        btnConcluir.classList.remove('btn-disabled');
                    }
                } else {
                    statusSpan.textContent = 'Indisponível (0)';
                    if (btnConcluir) {
                        btnConcluir.disabled = true;
                        btnConcluir.classList.add('btn-disabled');
                    }
                }
            });
    }

    function renderDropdown(sugestoes) {
        dropdown.innerHTML = '';
        if (!sugestoes.length) {
            dropdown.style.display = 'none';
            return;
        }
        sugestoes.slice(0, 5).forEach(livro => {
            const item = document.createElement('div');
            item.textContent = livro.titulo;
            item.style.padding = '8px';
            item.style.cursor = 'pointer';
            item.addEventListener('mousedown', function (e) {
                e.preventDefault();
                searchInput.value = livro.titulo;
                mostrarInfoLivro(livro);
                dropdown.style.display = 'none';
            });
            dropdown.appendChild(item);
        });
        dropdown.style.display = 'block';
    }

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const termo = searchInput.value.toLowerCase();
            if (!termo) {
                mostrarInfoLivro(null);
                dropdown.style.display = 'none';
                return;
            }
            const sugestoes = livrosData.filter(l => l.titulo.toLowerCase().includes(termo));
            renderDropdown(sugestoes);
            // Se só um livro for igual ao termo, já mostra info
            if (sugestoes.length === 1 && sugestoes[0].titulo.toLowerCase() === termo) {
                mostrarInfoLivro(sugestoes[0]);
                dropdown.style.display = 'none';
            }
        });
        // Esconde dropdown ao perder foco
        searchInput.addEventListener('blur', function () {
            setTimeout(() => { dropdown.style.display = 'none'; }, 150);
        });
    }
});

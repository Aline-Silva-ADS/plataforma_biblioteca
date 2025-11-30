// assets/js/adminEmprestarLivros.js
// Busca livros conforme digitado no campo de busca

document.addEventListener('DOMContentLoaded', function () {
        // --- Empréstimo ao clicar em Concluir ---
        const btnConcluir = document.querySelector('.btn.btn-submit');
        btnConcluir && btnConcluir.addEventListener('click', async function () {
            // Pega dados do livro
            const livroTitulo = document.querySelectorAll('.search-section .info-fields .info-value')[0].textContent;
            const livro = livrosData.find(l => l.titulo === livroTitulo);
            if (!livro) {
                Swal.fire({ icon: 'warning', title: 'Selecione um livro válido.' });
                return;
            }
            // Pega dados do aluno
            const alunoNome = document.querySelectorAll('.search-section .info-fields')[1].querySelectorAll('.info-value')[0].textContent;
            const alunoRA = document.querySelectorAll('.search-section .info-fields')[1].querySelectorAll('.info-value')[1].textContent;
            if (!alunoNome || !alunoRA) {
                Swal.fire({ icon: 'warning', title: 'Selecione um aluno válido.' });
                return;
            }
            // Buscar id_usuario pelo RA
            let id_usuario = null;
            try {
                const resp = await fetch(`http://127.0.0.1:3001/api/users/ra/${alunoRA}`);
                const data = await resp.json();
                if (data && data.usuario) id_usuario = data.usuario.id_usuario;
            } catch {}
            if (!id_usuario) {
                Swal.fire({ icon: 'error', title: 'Usuário não encontrado.' });
                return;
            }
            // Data de devolução prevista
            const dateInput = document.querySelector('.date-section .date-input');
            const data_devolucao_prevista = dateInput ? dateInput.value : '';
            if (!data_devolucao_prevista) {
                Swal.fire({ icon: 'warning', title: 'Informe a data de devolução.' });
                return;
            }
            // Chama endpoint de empréstimo
            try {
                const resp = await fetch('http://127.0.0.1:3001/api/emprestimos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id_usuario, id_livro: livro.id_livro, data_devolucao_prevista })
                });
                const result = await resp.json();
                if (result.success) {
                    Swal.fire({ icon: 'success', title: 'Empréstimo realizado com sucesso!' }).then(() => {
                        // Limpar campos do formulário
                        searchInput.value = '';
                        mostrarInfoLivro(null);
                        // Limpar aluno
                        const alunoFields = document.querySelectorAll('.search-section .info-fields')[1];
                        if (alunoFields) {
                            alunoFields.querySelectorAll('.info-value')[0].textContent = '';
                            alunoFields.querySelectorAll('.info-value')[1].textContent = '';
                        }
                        // Limpar campo RA
                        const raInput = document.querySelectorAll('.search-section .search-box .input')[1];
                        if (raInput) raInput.value = '';
                        // Limpar data de devolução
                        const dateInput = document.querySelector('.date-section .date-input');
                        if (dateInput) dateInput.value = '';
                    });
                } else {
                    Swal.fire({ icon: 'error', title: 'Erro ao emprestar', text: result.error || 'Tente novamente.' });
                }
            } catch (e) {
                Swal.fire({ icon: 'error', title: 'Erro ao emprestar', text: 'Tente novamente.' });
            }
        });
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

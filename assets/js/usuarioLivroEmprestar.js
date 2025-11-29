// assets/js/usuarioLivroEmprestar.js
// Carrega os dados do livro a ser emprestado e define a data de entrega

document.addEventListener('DOMContentLoaded', function () {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;

    fetch(`http://127.0.0.1:3001/api/livros/${id}`)
        .then(resp => resp.json())
        .then(data => {
            if (!data.livro) return;
            const livro = data.livro;
            // Preencher campos do livro na página de empréstimo
            const img = document.querySelector('.info-book-cover');
            if (img && livro.capa) img.src = '/' + livro.capa;
            const title = document.querySelector('.info-book-title');
            if (title) title.textContent = livro.titulo;
            const author = document.querySelector('.info-book-author');
            if (author) author.textContent = livro.autores ? livro.autores.join(', ') : '';
            // Datas de empréstimo e devolução
            const datas = document.querySelector('.emprestar-datas');
            if (datas) {
                const hoje = new Date();
                const devolucao = new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000);
                datas.innerHTML = `<strong class='label'>Data de empréstimo:</strong> ${hoje.toLocaleDateString('pt-BR')}<br><strong class='label'>Data de devolução:</strong> ${devolucao.toLocaleDateString('pt-BR')}`;
            }

            // Reservar livro ao clicar no botão
            const btn = document.querySelector('.info-book-btn');
            if (btn) {
                btn.addEventListener('click', function () {
                    // Recuperar id_usuario do localStorage (conforme auth.js)
                    const usuario = JSON.parse(localStorage.getItem('usuario_logado') || 'null');
                    const id_usuario = usuario && usuario.id_usuario;
                    if (!id_usuario) {
                        alert('Usuário não autenticado. Faça login novamente.');
                        return;
                    }
                    fetch('http://127.0.0.1:3001/api/reservas', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id_usuario, id_livro: livro.id_livro })
                    })
                        .then(resp => resp.json())
                        .then(result => {
                            if (result.success) {
                                Swal.fire({
                                    icon: 'success',
                                    title: 'Reserva realizada!',
                                    text: 'O livro foi reservado com sucesso. Retire na biblioteca no prazo de 8 horas.',
                                    confirmButtonText: 'OK',
                                }).then(() => {
                                    window.location.href = 'usuarioHistorico.html';
                                });
                            } else {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Erro ao reservar',
                                    text: result.error || 'Tente novamente.',
                                });
                            }
                        })
                        .catch(() => alert('Erro ao reservar. Tente novamente.'));
                });
            }
        });
});

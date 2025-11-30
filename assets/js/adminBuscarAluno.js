// assets/js/adminBuscarAluno.js
// Busca aluno pelo RA ao digitar e pressionar Enter

document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.querySelectorAll('.search-section .search-box .input')[1];
    const infoFields = document.querySelectorAll('.search-section .info-fields')[1];

    function mostrarInfoAluno(aluno) {
        if (!aluno) {
            infoFields.querySelectorAll('.info-value')[0].textContent = '';
            infoFields.querySelectorAll('.info-value')[1].textContent = '';
            // Limpa data de devolução
            const dateInput = document.querySelector('.date-section .date-input');
            if (dateInput) dateInput.value = '';
            return;
        }
        infoFields.querySelectorAll('.info-value')[0].textContent = aluno.nome;
        infoFields.querySelectorAll('.info-value')[1].textContent = aluno.RA || aluno.ra || '';
        // Preencher data de devolução para 1 semana a partir de hoje
        const dateInput = document.querySelector('.date-section .date-input');
        if (dateInput) {
            const hoje = new Date();
            const devolucao = new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000);
            // Formato yyyy-mm-dd
            const yyyy = devolucao.getFullYear();
            const mm = String(devolucao.getMonth() + 1).padStart(2, '0');
            const dd = String(devolucao.getDate()).padStart(2, '0');
            dateInput.value = `${yyyy}-${mm}-${dd}`;
        }
    }

    if (searchInput) {
        searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                const ra = searchInput.value.trim();
                if (!ra) return;
                fetch(`http://127.0.0.1:3001/api/users/ra/${ra}`)
                    .then(resp => resp.json())
                    .then(data => {
                        if (data && data.usuario) {
                            mostrarInfoAluno(data.usuario);
                            const situacao = (data.usuario.situacao || '').toLowerCase();
                            if (situacao === 'pendente' || situacao === 'suspenso') {
                                Swal.fire({
                                    icon: 'warning',
                                    title: 'Situação do aluno: ' + data.usuario.situacao,
                                    text: 'Será necessário aprovar o cadastro do aluno antes de emprestar livros.',
                                    confirmButtonText: 'OK',
                                }).then(() => {
                                    window.location.href = 'adminValidarUsuarios.html';
                                });
                            }
                        } else {
                            mostrarInfoAluno(null);
                            Swal.fire({
                                icon: 'warning',
                                title: 'Aluno não encontrado',
                                text: 'Nenhum aluno cadastrado com esse RA.',
                                confirmButtonText: 'OK',
                            });
                        }
                    })
                    .catch(() => {
                        mostrarInfoAluno(null);
                        Swal.fire({
                            icon: 'error',
                            title: 'Erro',
                            text: 'Erro ao buscar aluno. Tente novamente.',
                        });
                    });
            }
        });
    }
});

// assets/js/adminValidarUsuarios.js
// Preenche a tabela de alunos na página adminValidarUsuarios.html

document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.querySelector('#userTable tbody');
    if (!tableBody) return;

    fetch('http://127.0.0.1:3001/api/users/alunos')
        .then(res => res.json())
        .then(data => {
            if (!data.success) {
                tableBody.innerHTML = '<tr><td colspan="7">Erro ao buscar alunos.</td></tr>';
                return;
            }
            if (!data.alunos.length) {
                tableBody.innerHTML = '<tr><td colspan="7">Nenhum aluno encontrado.</td></tr>';
                return;
            }
            tableBody.innerHTML = '';
            data.alunos.forEach(aluno => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td data-label="RA"><strong>${aluno.RA || ''}</strong></td>
                    <td data-label="Nome">${aluno.nome || ''}</td>
                    <td data-label="Telefone">${aluno.telefone || ''}</td>
                    <td data-label="Data de cadastro">${aluno.data_cadastro ? new Date(aluno.data_cadastro).toLocaleDateString() : ''}</td>
                    <td data-label="Status do cadastro">
                        <div class="status">
                            <div class="dot"></div>
                            <span>${aluno.situacao || 'Pendente'}</span>
                        </div>
                    </td>
                    <td data-label="Ações"><button class="btn btn-table btn-success">Validar</button></td>
                `;
                tableBody.appendChild(tr);
            });
        })
        .catch(() => {
            tableBody.innerHTML = '<tr><td colspan="7">Erro ao buscar alunos.</td></tr>';
        });
});

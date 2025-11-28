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
                let acoesTd = '';
                    if ((aluno.situacao || '').toLowerCase() === 'ativo') {
                        acoesTd = '<span style="color: #34a853; font-weight: 600;">Usuário ativo</span>';
                } else {
                    acoesTd = '<button class="btn btn-table btn-success">Validar</button>';
                }
                const isAtivo = (aluno.situacao || '').toLowerCase() === 'ativo';
                tr.innerHTML = `
                    <td data-label="RA"><strong>${aluno.RA || ''}</strong></td>
                    <td data-label="Nome">${aluno.nome || ''}</td>
                    <td data-label="Telefone">${aluno.telefone || ''}</td>
                    <td data-label="Data de cadastro">${aluno.data_cadastro ? new Date(aluno.data_cadastro).toLocaleDateString() : ''}</td>
                    <td data-label="Status do cadastro">
                        <div class="status">
                            <div class="dot${isAtivo ? ' ativo' : ''}"></div>
                            <span class="situacao-span">${aluno.situacao || 'Pendente'}</span>
                        </div>
                    </td>
                    <td data-label="Ações">${acoesTd}</td>
                `;
                if ((aluno.situacao || '').toLowerCase() !== 'ativo') {
                    const btn = tr.querySelector('button');
                    btn.addEventListener('click', function () {
                        btn.disabled = true;
                        fetch(`http://127.0.0.1:3001/api/users/${aluno.id_usuario}/ativar`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' }
                        })
                            .then(res => res.json())
                            .then(resp => {
                                if (resp.success) {
                                    tr.querySelector('.situacao-span').textContent = 'ativo';
                                    const dot = tr.querySelector('.dot');
                                    if (dot) dot.classList.add('ativo');
                                        tr.querySelector('[data-label="Ações"]').innerHTML = '<span style="color: #34a853; font-weight: 600;">Usuário ativo</span>';
                                } else {
                                    btn.disabled = false;
                                    alert('Erro ao validar usuário.');
                                }
                            })
                            .catch(() => {
                                btn.disabled = false;
                                alert('Erro ao validar usuário.');
                            });
                    });
                }
                tableBody.appendChild(tr);
            });
        })
        .catch(() => {
            tableBody.innerHTML = '<tr><td colspan="7">Erro ao buscar alunos.</td></tr>';
        });
});

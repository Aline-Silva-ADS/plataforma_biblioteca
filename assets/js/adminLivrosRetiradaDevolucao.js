// adminLivrosRetiradaDevolucao.js
// Busca reservas ativas e empréstimos emprestados e popula a tabela

document.addEventListener('DOMContentLoaded', async () => {
  const tableBody = document.querySelector('#userTable tbody');
  tableBody.innerHTML = '<tr><td colspan="7">Carregando...</td></tr>';

  try {
    // Buscar reservas ativas
    const reservasRes = await fetch('http://localhost:3001/api/retiradas/reservas/ativas');
    const reservasData = await reservasRes.json();
    // Buscar empréstimos emprestados
    const emprestimosRes = await fetch('http://localhost:3001/api/retiradas/ativos');
    const emprestimosData = await emprestimosRes.json();

    let rows = '';


    // Adiciona reservas ativas (apenas status 'ativa')
    if (reservasData.reservas && reservasData.reservas.length > 0) {
      for (const reserva of reservasData.reservas) {
        if (reserva.status !== 'ativa') continue;
        rows += `
          <tr>
            <td data-label="RA"><strong>${reserva.ra_aluno}</strong></td>
            <td data-label="Aluno">${reserva.nome_aluno}</td>
            <td data-label="Título do livro">${reserva.nome_livro}</td>
            <td data-label="Data de solicitação">${formatarData(reserva.data_reserva)}</td>
            <td data-label="Localização">${reserva.localizacao || '-'}</td>
            <td data-label="Tipo de ação"><span class="text-success">Retirada</span></td>
            <td data-label="Ações"><button class="btn btn-table btn-success">Confirmar retirada</button></td>
          </tr>
        `;
      }
    }

    // Adiciona empréstimos emprestados
    if (emprestimosData.emprestimos && emprestimosData.emprestimos.length > 0) {
      for (const emp of emprestimosData.emprestimos) {
        rows += `
          <tr>
            <td data-label="RA"><strong>${emp.ra_aluno}</strong></td>
            <td data-label="Aluno">${emp.nome_aluno}</td>
            <td data-label="Título do livro">${emp.nome_livro}</td>
            <td data-label="Data de solicitação">${formatarData(emp.data_emprestimo)}</td>
            <td data-label="Localização">${emp.localizacao || '-'}</td>
            <td data-label="Tipo de ação"><span class="text-info">Devolução</span></td>
            <td data-label="Ações"><button class="btn btn-table btn-info">Confirmar devolução</button></td>
          </tr>
        `;
      }
    }

    if (!rows) {
      rows = '<tr><td colspan="7">Nenhuma reserva ou empréstimo encontrado.</td></tr>';
    }
    tableBody.innerHTML = rows;

    // Adiciona evento para os botões de retirada
    tableBody.querySelectorAll('.btn-success').forEach((btn, idx) => {
      btn.addEventListener('click', async (e) => {
        const tr = btn.closest('tr');
        const ra = tr.querySelector('td[data-label="RA"] strong').textContent;
        try {
          // Buscar status do aluno pelo RA
          const res = await fetch(`http://localhost:3001/api/users/ra/${ra}`);
          const data = await res.json();
          if (!data.success || !data.usuario) {
            exibirMensagemNaTabela(tr, 'Aluno não encontrado.', 'danger');
            return;
          }
          if (data.usuario.situacao && data.usuario.situacao.toLowerCase() !== 'ativo') {
            exibirMensagemNaTabela(tr, 'O aluno está com situação pendente. Redirecionando...', 'warning');
            setTimeout(() => {
              window.location.href = 'adminValidarUsuarios.html';
            }, 1500);
            return;
          }
          // Aqui você pode seguir com a lógica de retirada normalmente
          // 1. Atualizar status da reserva para 'emprestada'
          const idReserva = getIdReservaFromRow(tr, reservasData.reservas);
          if (!idReserva) {
            exibirMensagemNaTabela(tr, 'ID da reserva não encontrado.', 'danger');
            return;
          }
          const updateRes = await fetch(`http://localhost:3001/api/reservas/${idReserva}/emprestar`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
          });
          const updateData = await updateRes.json();
          if (!updateData.success) {
            exibirMensagemNaTabela(tr, 'Erro ao atualizar reserva: ' + (updateData.error || ''), 'danger');
            return;
          }
          // 2. Inserir empréstimo
          const idUsuario = data.usuario.id_usuario;
          // Buscar id_livro da reserva correspondente
          let idLivro = null;
          for (const r of reservasData.reservas) {
            if (r.ra_aluno == ra && r.nome_livro == tr.querySelector('td[data-label="Título do livro"]').textContent) {
              idLivro = r.id_livro;
              break;
            }
          }
          if (!idLivro) {
            exibirMensagemNaTabela(tr, 'ID do livro não encontrado.', 'danger');
            return;
          }
          const dataDevolucaoPrevista = new Date();
          dataDevolucaoPrevista.setDate(dataDevolucaoPrevista.getDate() + 7); // 7 dias
          const insertEmp = await fetch('http://localhost:3001/api/emprestimos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id_usuario: idUsuario,
              id_livro: idLivro,
              data_devolucao_prevista: dataDevolucaoPrevista.toISOString().slice(0, 19).replace('T', ' ')
            })
          });
          const empData = await insertEmp.json();
          if (!empData.success) {
            exibirMensagemNaTabela(tr, 'Erro ao registrar empréstimo: ' + (empData.error || ''), 'danger');
            return;
          }
          exibirMensagemNaTabela(tr, 'Retirada confirmada e empréstimo registrado!', 'success');
          setTimeout(() => {
            // Remove a linha da tabela e a mensagem
            const msg = tr.nextElementSibling;
            if (msg && msg.classList.contains('msg-feedback')) {
              msg.remove();
            }
            tr.remove();
          }, 1200);
        } catch (err) {
          exibirMensagemNaTabela(tr, 'Erro ao verificar situação do aluno: ' + err.message, 'danger');
        }
      });
    });
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="7">Erro ao carregar dados: ${err.message}</td></tr>`;
  }
});

function formatarData(dataStr) {
  if (!dataStr) return '-';
  const d = new Date(dataStr);
  if (isNaN(d)) return dataStr;
  return d.toLocaleDateString('pt-BR');
}

// Função utilitária para obter o id_reserva a partir da linha da tabela
function getIdReservaFromRow(tr, reservas) {
  const ra = tr.querySelector('td[data-label="RA"] strong').textContent;
  const nomeLivro = tr.querySelector('td[data-label="Título do livro"]').textContent;
  for (const r of reservas) {
    if (r.ra_aluno == ra && r.nome_livro == nomeLivro) {
      return r.id_reserva;
    }
  }
  return null;
}

// Exibe mensagem visual na linha da tabela
function exibirMensagemNaTabela(tr, mensagem, tipo) {
  let msg = tr.nextElementSibling;
  if (!msg || !msg.classList.contains('msg-feedback')) {
    msg = document.createElement('tr');
    msg.className = 'msg-feedback';
    const td = document.createElement('td');
    td.colSpan = 7;
    msg.appendChild(td);
    tr.parentNode.insertBefore(msg, tr.nextSibling);
  }
  msg.querySelector('td').innerHTML = `<span style="display:block;padding:8px;color:${tipo==='success'?'#155724':tipo==='warning'?'#856404':'#721c24'};background:${tipo==='success'?'#d4edda':tipo==='warning'?'#fff3cd':'#f8d7da'};border-radius:4px;font-weight:bold;">${mensagem}</span>`;
}

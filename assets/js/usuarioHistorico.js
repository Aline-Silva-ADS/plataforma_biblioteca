// assets/js/usuarioHistorico.js
// Preenche o histórico de livros do usuário logado com base em empréstimos e reservas

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.querySelector('.books-history-list-card');
  container.innerHTML = '<div>Carregando...</div>';

  // Recupera o usuário logado (ajuste conforme seu auth)
  const user = JSON.parse(localStorage.getItem('usuario_logado') || 'null');
  if (!user || !user.id_usuario) {
    container.innerHTML = '<div>Usuário não autenticado.</div>';
    return;
  }
  const id_usuario = user.id_usuario;

  try {
    // Busca empréstimos
    const emprestimosRes = await fetch(`http://localhost:3001/api/emprestimos?usuario=${id_usuario}`);
    const emprestimos = await emprestimosRes.json();
    // Busca reservas
    const reservasRes = await fetch(`http://localhost:3001/api/reservas?usuario=${id_usuario}`);
    const reservas = await reservasRes.json();

    let html = '';
    // Empréstimos
    if (Array.isArray(emprestimos)) {
      for (const emp of emprestimos) {
        let badge = '';
        if (emp.status === 'emprestado') {
          badge = '<span class="badge book-status badge-status--info">Comigo</span>';
        } else if (emp.status === 'devolvido') {
          badge = '<span class="badge book-status badge-status--success">Entregue</span>';
        } else if (emp.status === 'atrasado') {
          badge = '<span class="badge book-status badge-status--danger">Em atraso</span>';
        }
        html += `
          <div class="book-history-card">
            <div class="book-title">${emp.titulo || 'Livro'}</div>
            <div class="book-author">autor: ${emp.autor || '-'}</div>
            <div class="book-date">
              Data de entrega: ${formatarData(emp.data_devolucao_prevista)}
              ${badge}
            </div>
          </div>
        `;
      }
    }
    // Reservas
    if (Array.isArray(reservas)) {
      for (const res of reservas) {
        if (res.status === 'ativa') {
          html += `
            <div class="book-history-card">
              <div class="book-title">${res.titulo || 'Livro'}</div>
              <div class="book-author">autor: ${res.autor || '-'}</div>
              <div class="book-date">
                Data de entrega: ${formatarData(res.prazo_validade)}
                <span class="badge book-status badge-status--warning">Pendente</span>
              </div>
            </div>
          `;
        }
      }
    }
    container.innerHTML = html || '<div>Nenhum histórico encontrado.</div>';
  } catch (err) {
    container.innerHTML = `<div>Erro ao carregar histórico: ${err.message}</div>`;
  }
});

function formatarData(dataStr) {
  if (!dataStr) return '-';
  const d = new Date(dataStr);
  if (isNaN(d)) return dataStr;
  return d.toLocaleDateString('pt-BR');
}

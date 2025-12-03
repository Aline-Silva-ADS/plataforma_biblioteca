// assets/js/usuarioHistorico.js
// Histórico de livros do usuário baseado em empréstimos

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.querySelector('.books-history-list-card');
  container.innerHTML = '<div>Carregando...</div>';

  // Recupera o usuário logado
  const user = JSON.parse(localStorage.getItem('usuario_logado') || 'null');

  if (!user || !user.id_usuario) {
    container.innerHTML = '<div>Usuário não autenticado.</div>';
    return;
  }

  const id_usuario = user.id_usuario;

  try {

    // Busca histórico (empréstimos + reservas pendentes)
    const historicoRes = await fetch(`http://localhost:3001/api/emprestimos?usuario=${id_usuario}`);
    const historico = await historicoRes.json();
    console.log("Histórico recebido:", historico);

    let html = '';

    if (Array.isArray(historico) && historico.length > 0) {
      for (const item of historico) {
        let badge = '';
        if (item.status === 'emprestado') {
          badge = '<span class="badge book-status badge-status--info">Comigo</span>';
        } else if (item.status === 'devolvido') {
          badge = '<span class="badge book-status badge-status--success">Entregue</span>';
        } else if (item.status === 'atrasado') {
          badge = '<span class="badge book-status badge-status--danger">Em atraso</span>';
        } else if (item.status === 'pendente') {
          badge = '<span class="badge book-status badge-status--warning">Pendente</span>';
        }

        // Tenta buscar autor pelo endpoint de livros
        let autor = item.autor || '-';

        if ((!autor || autor === '-') && item.id_livro) {
          try {
            const livroResp = await fetch(`http://localhost:3001/api/livros/${item.id_livro}`);
            const livroData = await livroResp.json();

            if (livroData.livro && Array.isArray(livroData.livro.autores)) {
              autor = livroData.livro.autores.join(', ');
            }
          } catch (e) {
            autor = '-';
          }
        }

        html += `
          <div class="book-history-card">
            <div class="book-title">${item.titulo || 'Livro'}</div>
            <div class="book-author">autor: ${autor || '-'}</div>
            <div class="book-date">
              Data de entrega: ${formatarData(item.data_devolucao_prevista)}
              ${badge}
            </div>
          </div>
        `;
      }
    }

    container.innerHTML = html || '<div>Nenhum histórico encontrado.</div>';

  } catch (err) {
    console.error("Erro ao carregar histórico:", err);
    container.innerHTML = `<div>Erro ao carregar histórico: ${err.message}</div>`;
  }
});

function formatarData(dataStr) {
  if (!dataStr) return '-';
  const d = new Date(dataStr);
  if (isNaN(d)) return dataStr;
  return d.toLocaleDateString('pt-BR');
}

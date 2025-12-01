// adminLivrosHistorico.js
// Lista todo o histórico de empréstimos na tabela



// adminLivrosHistorico.js
// Lista todo o histórico de empréstimos na tabela com paginação

const API_URL = 'http://localhost:3001/api/emprestimos/historico';
const tableBody = document.querySelector('#userTable tbody');
const paginationContainer = document.getElementById('pagination');
const limit = 15;
let currentPage = 1;
let totalPages = 1;

async function carregarPagina(page = 1, ra = '') {
  tableBody.innerHTML = '<tr><td colspan="4">Carregando...</td></tr>';
  try {
    let url = `${API_URL}?page=${page}&limit=${limit}`;
    if (ra && ra.trim() !== '') {
      url += `&ra=${encodeURIComponent(ra.trim())}`;
    }
    const res = await fetch(url);
    const data = await res.json();
    let rows = '';
    if (data.emprestimos && data.emprestimos.length > 0) {
      for (const emp of data.emprestimos) {
        rows += `
          <tr>
            <td data-label="Título do livro">${emp.nome_livro}</td>
            <td data-label="RA">${emp.ra_aluno}</td>
            <td data-label="Data de solicitação">${formatarData(emp.data_emprestimo)}</td>
            <td data-label="Data de devolução">${formatarData(emp.data_devolucao_real)}</td>
          </tr>
        `;
      }
    } else {
      rows = '<tr><td colspan="4">Nenhum empréstimo encontrado.</td></tr>';
    }
    tableBody.innerHTML = rows;
    // Paginação
    const total = data.total || 0;
    totalPages = Math.ceil(total / limit) || 1;
    renderizarPaginacao(page, totalPages, ra);
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="4">Erro ao carregar dados: ${err.message}</td></tr>`;
    paginationContainer.innerHTML = '';
  }
}

function renderizarPaginacao(page, totalPages, ra = '') {
  let html = '';
  if (totalPages <= 1) {
    paginationContainer.innerHTML = '';
    return;
  }
  html += `<button class="pagination-btn shortcut-btn" ${page === 1 ? 'disabled' : ''} data-page="${page - 1}" data-ra="${ra}">Anterior</button>`;
  // Mostra até 5 páginas
  let start = Math.max(1, page - 2);
  let end = Math.min(totalPages, page + 2);
  if (page <= 3) end = Math.min(5, totalPages);
  if (page >= totalPages - 2) start = Math.max(1, totalPages - 4);
  for (let i = start; i <= end; i++) {
    html += `<button class="pagination-btn shortcut-btn${i === page ? ' active' : ''}" data-page="${i}" data-ra="${ra}">${i}</button>`;
  }
  html += `<button class="pagination-btn shortcut-btn" ${page === totalPages ? 'disabled' : ''} data-page="${page + 1}" data-ra="${ra}">Próxima</button>`;
  paginationContainer.innerHTML = html;
}


paginationContainer.addEventListener('click', (e) => {
  if (e.target.classList.contains('pagination-btn') && !e.target.disabled) {
    const page = parseInt(e.target.getAttribute('data-page'));
    const ra = document.getElementById('search-ra').value;
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      currentPage = page;
      carregarPagina(currentPage, ra);
    }
  }
});


// Busca pelo RA
const searchInput = document.getElementById('search-ra');
searchInput.addEventListener('input', () => {
  currentPage = 1;
  carregarPagina(currentPage, searchInput.value);
});

document.addEventListener('DOMContentLoaded', () => {
  carregarPagina(currentPage);
});

function formatarData(dataStr) {
  if (!dataStr) return '-';
  const d = new Date(dataStr);
  if (isNaN(d)) return dataStr;
  return d.toLocaleDateString('pt-BR');
}

// Estilo para botão ativo e desabilitado
const style = document.createElement('style');
style.innerHTML = `
.pagination-btn.active {
  background-color: var(--color-primary-dark) !important;
  color: var(--color-white) !important;
  font-weight: bold;
  border: 2px solid var(--color-primary-dark);
}
.pagination-btn[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}
`;
document.head.appendChild(style);

function formatarData(dataStr) {
  if (!dataStr) return '-';
  const d = new Date(dataStr);
  if (isNaN(d)) return dataStr;
  return d.toLocaleDateString('pt-BR');
}

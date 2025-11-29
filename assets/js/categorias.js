// assets/js/categorias.js
// Preenche o select de gêneros com as categorias do banco

document.addEventListener('DOMContentLoaded', function () {
    const select = document.getElementById('genres');
    if (!select) return;
    fetch('http://127.0.0.1:3001/api/categorias')
        .then(res => res.json())
        .then(data => {
            if (!data.success || !Array.isArray(data.categorias)) {
                select.innerHTML = '<option value="">Erro ao carregar categorias</option>';
                return;
            }
            select.innerHTML = '';
            data.categorias.forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat.id_categoria;
                opt.textContent = cat.nome;
                select.appendChild(opt);
            });
        })
        .catch(() => {
            select.innerHTML = '<option value="">Erro ao carregar categorias</option>';
        });
});

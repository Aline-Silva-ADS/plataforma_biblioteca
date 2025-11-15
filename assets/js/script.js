// Espera o carregamento completo do HTML antes de rodar o JavaScript
document.addEventListener('DOMContentLoaded', function () {
    console.log('script.js carregado e DOM pronto'); // Apenas uma mensagem de teste no console

    // ===============================
    // 📱 Menu lateral (drawer mobile)
    // ===============================
    const btn = document.querySelector('.hamburger'); // Botão do menu (ícone "☰")
    const sidebar = document.getElementById('sidebar'); // Barra lateral
    const backdrop = document.getElementById('backdrop'); // Fundo escurecido atrás do menu

    // Função que abre ou fecha o menu lateral
    function toggleMenu(force) {
        if (!sidebar || !backdrop || !btn) return; // Garante que os elementos existem
        // Se o parâmetro 'force' for passado, usa ele. Caso contrário, inverte o estado atual
        const open = typeof force === 'boolean' ? force : !sidebar.classList.contains('open');
        sidebar.classList.toggle('open', open); // Adiciona ou remove a classe "open"
        backdrop.classList.toggle('show', open); // Mostra ou oculta o fundo escuro
        btn.setAttribute('aria-expanded', open ? 'true' : 'false'); // Acessibilidade
    }

    // Eventos de interação com o menu
    if (btn && sidebar && backdrop) {
        btn.addEventListener('click', () => toggleMenu()); // Clicar no botão abre/fecha o menu
        backdrop.addEventListener('click', () => toggleMenu(false)); // Clicar fora fecha o menu
        // Pressionar "Esc" no teclado também fecha o menu
        window.addEventListener('keyup', e => { if (e.key === 'Escape') toggleMenu(false) });
    }

    // ===============================
    // ♿ Acessibilidade do accordion
    // ===============================
    const acc = document.getElementById('books-acc'); // O elemento <details> do menu de livros
    if (acc) {
        acc.addEventListener('toggle', () => {
            const expanded = acc.open ? 'true' : 'false'; // Detecta se está aberto
            const summary = acc.querySelector('summary'); // Pega o título do accordion
            if (summary) summary.setAttribute('aria-expanded', expanded); // Atualiza atributo ARIA
        });
    }

    // ===============================
    // 📵 Fechar menu lateral ao navegar (somente em telas pequenas)
    // ===============================
    document.querySelectorAll('.sidebar a').forEach(a => {
        a.addEventListener('click', () => {
            // Se estiver no modo mobile (até 980px), fecha o menu após clicar em um link
            if (window.matchMedia('(max-width:980px)').matches) toggleMenu(false);
        });
    });

    // ===============================
    // 📚 Carrossel de livros (rolagem horizontal)
    // ===============================
    const prev = document.querySelector('.prev'); // Botão anterior
    const next = document.querySelector('.next'); // Botão próximo
    const grid = document.querySelector('.livros-grid'); // Container dos livros

    if (next && prev && grid) {
        // Ao clicar em "próximo", rola 150px para a direita
        next.addEventListener('click', () => grid.scrollBy({ left: 150, behavior: 'smooth' }));
        // Ao clicar em "anterior", rola 150px para a esquerda
        prev.addEventListener('click', () => grid.scrollBy({ left: -150, behavior: 'smooth' }));
    }

    // ===============================
    // 🖼️ Upload e pré-visualização da capa do livro
    // ===============================
    const coverInput = document.getElementById('coverInput'); // Input de upload de imagem
    const coverPreview = document.getElementById('coverPreview'); // Imagem de pré-visualização

    if (coverInput && coverPreview) {
        coverInput.addEventListener('change', function (e) {
    // (Lógica de cadastro movida para assets/js/cadastro.js)
            const file = e.target.files[0]; // Pega o arquivo selecionado
            if (file) {
                const reader = new FileReader(); // Cria um leitor de arquivo
                reader.onload = function (evt) {
                    // Quando o arquivo for carregado, define o src da imagem com o resultado (base64)
                    coverPreview.src = evt.target.result;
                    coverPreview.style.display = 'block'; // Mostra a imagem
                };
                reader.readAsDataURL(file); // Lê o arquivo como uma URL base64
            } else {
                // Se nenhum arquivo for selecionado, esconde a imagem
                coverPreview.src = '';
                coverPreview.style.display = 'none';
            }
        });
    }

}); // Fim do DOMContentLoaded

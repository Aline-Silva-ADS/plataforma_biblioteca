// assets/js/validar.js
// Simula validação do código digitado pelo usuário

document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('.form-login');
    if (!form) return;

    // Recupera telefone do último login (se salvo)
    let telefone = sessionStorage.getItem('telefone_login') || '';
    if (!telefone) {
        Swal.fire({
            icon: 'warning',
            title: 'Telefone não informado',
            text: 'Faça login novamente.'
        }).then(() => {
            window.location.href = 'index.html';
        });
        return;
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const codigoInput = document.getElementById('codigo');
        const codigo = codigoInput.value.trim();
        if (!codigo) {
            Swal.fire({ icon: 'warning', title: 'Digite o código recebido.' });
            return;
        }
        try {
            const resp = await fetch('http://127.0.0.1:3001/api/users/validate-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telefone, codigo })
            });
            const result = await resp.json();
            if (result.success) {
                // Salva dados do usuário logado
                localStorage.setItem('usuario_logado', JSON.stringify({
                    id_usuario: result.id_usuario,
                    nome: result.nome,
                    tipo_usuario: result.tipo_usuario,
                    telefone
                }));
                // Redireciona imediatamente conforme o tipo de usuário
                if (result.tipo_usuario === 'bibliotecario') {
                    window.location.href = 'adminHome.html';
                } else {
                    window.location.href = 'usuarioHome.html';
                }
            } else {
                Swal.fire({ icon: 'error', title: 'Código inválido', text: result.message || 'Tente novamente.' });
            }
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Erro de conexão', text: 'Não foi possível validar o código.' });
        }
    });
});

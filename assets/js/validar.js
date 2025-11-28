// assets/js/validar.js
// Simula validação do código digitado pelo usuário

document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('.form-login');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const codigoInput = document.getElementById('codigo');
        const codigo = codigoInput.value.trim();
        if (!codigo) {
            alert('Digite o código recebido.');
            return;
        }
        // Simulação: aceita qualquer código, mas pode comparar com sessionStorage se desejar
        // Exemplo: let codigoEnviado = sessionStorage.getItem('codigoEnviado');
        // if (codigo === codigoEnviado) { ... }
        alert('Código validado com sucesso! (simulado)');
        window.location.href = 'usuarioHome.html';
    });
});

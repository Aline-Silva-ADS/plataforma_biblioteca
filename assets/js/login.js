// assets/js/login.js
// Lógica para envio de código SMS simulado

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('formLogin');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const telefoneInput = document.getElementById('telefone');
        if (!telefoneInput) return;
        const telefone = telefoneInput.value.replace(/\D/g, '');
        if (!telefone) {
            alert('Informe o telefone!');
            return;
        }
        try {
            const resp = await fetch('http://127.0.0.1:3001/api/users/send-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telefone })
            });
            const result = await resp.json();
            if (result.success) {
                alert('Código enviado (simulado): ' + result.code);
                window.location.href = 'usuarioValidar.html';
            } else {
                alert(result.message || 'Telefone não encontrado.');
            }
        } catch (err) {
            alert('Erro ao conectar ao servidor.');
        }
    });
});

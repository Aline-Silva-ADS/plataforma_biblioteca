// assets/js/cadastro.js
// Lida com o formulário de cadastro de usuário: preenche data_cadastro e garante valores padrão

document.addEventListener('DOMContentLoaded', function () {
    const cadastroForm = document.getElementById('formCadastro');
    const dataCadastroInput = document.getElementById('data_cadastro');

    // Telefone input
    const telefoneInput = document.getElementById('telefone');

    function getNowSQL() {
        const d = new Date();
        const pad = (n) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }

    // Define valor inicial quando a página carrega
    if (dataCadastroInput) dataCadastroInput.value = getNowSQL();

    // Envio AJAX para API REST
    if (cadastroForm) {
        cadastroForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            if (dataCadastroInput) dataCadastroInput.value = getNowSQL();

            // Validação do telefone antes de permitir o envio
            if (telefoneInput) {
                const phoneClean = telefoneInput.value.replace(/\D/g, '');
                const valid = /^(?:55)?\d{10,11}$/.test(phoneClean);
                if (!valid) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Telefone inválido',
                        text: 'Use o formato (XX) 9XXXX-XXXX.'
                    });
                    return;
                }
            }

            // Monta os dados do formulário
            const formData = new FormData(cadastroForm);
            const data = {};
            formData.forEach((value, key) => { data[key] = value; });

            try {
                const resp = await fetch('http://localhost:3001/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await resp.json();
                if (result.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Usuário cadastrado!',
                        text: 'Cadastro realizado com sucesso.'
                    }).then(() => {
                        window.location.href = 'index.html';
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Erro ao cadastrar',
                        text: result.message || result.error || 'Erro desconhecido.'
                    });
                }
            } catch (err) {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro de conexão',
                    text: 'Não foi possível conectar ao servidor.'
                });
            }
        });
    }

    // ===============================
    // Máscara e filtro para telefone
    // ===============================
    if (telefoneInput) {
        // Ensure the input is required (defensive)
        telefoneInput.required = true;

        const formatPhone = (value) => {
            let digits = value.replace(/\D/g, '');
            // Remove leading country code 55 if user typed
            if (digits.startsWith('55')) digits = digits.slice(2);
            if (digits.length > 11) digits = digits.slice(0, 11);

            if (digits.length <= 2) return `(${digits}`;
            if (digits.length <= 6) return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
            if (digits.length <= 10) return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`;
            return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
        };

        // Keep simple caret behavior by resetting the value (good enough for small forms)
        telefoneInput.addEventListener('input', (e) => {
            const pos = telefoneInput.selectionStart;
            const oldLength = telefoneInput.value.length;
            telefoneInput.value = formatPhone(telefoneInput.value);
            // try to keep cursor near the end (not perfect but acceptable)
            const newLength = telefoneInput.value.length;
            telefoneInput.setSelectionRange(pos + (newLength - oldLength), pos + (newLength - oldLength));
        });

        // On blur, enforce final formatting and clear invalid trailing chars
        telefoneInput.addEventListener('blur', () => {
            telefoneInput.value = formatPhone(telefoneInput.value);
        });
    }
});

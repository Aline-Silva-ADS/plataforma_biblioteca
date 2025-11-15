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

    // Garante que o valor será atualizado imediatamente antes do submit (por segurança)
    if (cadastroForm) {
        cadastroForm.addEventListener('submit', function (e) {
            if (dataCadastroInput) dataCadastroInput.value = getNowSQL();

            // Validação do telefone antes de permitir o envio
            if (telefoneInput) {
                const phoneClean = telefoneInput.value.replace(/\D/g, '');
                // Aceitamos DDD + 9 dígitos (celular) => total 11 dígitos (ex: 11999998888)
                const valid = /^(?:55)?\d{10,11}$/.test(phoneClean);
                if (!valid) {
                    telefoneInput.setCustomValidity('Telefone inválido. Use o formato (XX) 9XXXX-XXXX.');
                    telefoneInput.reportValidity();
                    e.preventDefault();
                    return false;
                } else {
                    telefoneInput.setCustomValidity('');
                }
            }

            // Mantemos o envio padrão (form submit). Se preferir AJAX, posso alterar aqui.
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

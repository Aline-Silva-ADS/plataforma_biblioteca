document.addEventListener('DOMContentLoaded', function() {
    // Toggle para a senha principal
    const senhaInput = document.getElementById('senha');
    const toggleBtn = document.getElementById('toggleSenha');
    const icon = toggleBtn.querySelector('.material-symbols-outlined');

    toggleBtn.addEventListener('click', function() {
        if (senhaInput.type === 'password') {
            senhaInput.type = 'text';
            icon.textContent = 'visibility_off';
        } else {
            senhaInput.type = 'password';
            icon.textContent = 'visibility';
        }
    });

    // Toggle para a confirmação de senha
    const confirmaInput = document.getElementById('confirmaSenha');
    const toggleConfirmaBtn = document.getElementById('toggleConfirmaSenha');
    const confirmaIcon = toggleConfirmaBtn.querySelector('.material-symbols-outlined');

    toggleConfirmaBtn.addEventListener('click', function() {
        if (confirmaInput.type === 'password') {
            confirmaInput.type = 'text';
            confirmaIcon.textContent = 'visibility_off';
        } else {
            confirmaInput.type = 'password';
            confirmaIcon.textContent = 'visibility';
        }
    });
});

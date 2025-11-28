// assets/js/auth.js
// Protege páginas por tipo de usuário (aluno ou bibliotecario)

document.addEventListener('DOMContentLoaded', function () {
    const user = JSON.parse(localStorage.getItem('usuario_logado') || 'null');
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    const path = window.location.pathname;
    // Páginas de bibliotecário (admin)
    if (path.includes('admin') && user.tipo_usuario !== 'bibliotecario') {
        window.location.href = 'usuarioHome.html';
        return;
    }
    // Páginas de aluno (usuario)
    if (path.includes('usuario') && !path.includes('admin') && user.tipo_usuario !== 'aluno') {
        window.location.href = 'adminHome.html';
        return;
    }
});

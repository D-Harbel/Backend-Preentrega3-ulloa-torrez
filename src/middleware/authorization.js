function isAdmin(req, res, next) {
    const usuario = req.session.usuario;
    if (usuario && usuario.role === 'admin') {
        next(); 
    } else {
        res.status(403).json({ error: 'Solo los administradores pueden realizar esta acción.' });
    }
}

function isUser(req, res, next) {
    const usuario = req.session.usuario;
    if (usuario && usuario.role === 'user') {
        next();
    } else {
        res.status(403).json({ error: 'Solo los usuarios pueden realizar esta acción.' });
    }
}

module.exports = { isAdmin, isUser };
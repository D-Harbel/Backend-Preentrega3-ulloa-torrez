function isAdmin(req, res, next) {
    const usuario = req.session.usuario;
    if (usuario && usuario.role === 'admin') {
        next(); 
    } else {
        res.status(403).json({ error: 'Solo puede acceder el usuario con rol ADMIN.' });
    }
}

function isUser(req, res, next) {
    const usuario = req.session.usuario;
    if (usuario && usuario.role === 'user') {
        next();
    } else {
        res.status(403).json({ error: 'Solo pueden acceder los usuario con rol USER.' });
    }
}

module.exports = { isAdmin, isUser };
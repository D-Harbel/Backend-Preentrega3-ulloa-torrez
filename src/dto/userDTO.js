class UserReadDTO {
    constructor(usuario) {
        this.nombre = usuario.first_name ? usuario.first_name.toUpperCase() : "no definido";
        this.apellido = usuario.last_name ? usuario.last_name.toUpperCase() : "no definido";
        this.edad = usuario.age;
        this.email = usuario.email;
        this.rol = "user";
    }
}

module.exports = UserReadDTO;
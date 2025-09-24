Catálogo de Libros

Este proyecto es una aplicación para gestionar un catálogo de libros, donde cada libro puede tener múltiples reseñas asociadas.  
El objetivo es ofrecer una forma sencilla de registrar, consultar y reseñar libros.

Características
Gestión de libros (crear, leer, actualizar, eliminar).
Asociación de reseñas a cada libro.
Posibilidad de listar libros con sus reseñas.
Búsqueda por título, autor o género.
Interfaz sencilla y extensible (según el stack usado).

Entidades principales

Libro
- ID (único)
- Título
- Autor
- Género
- Año de publicación
- Descripción

Reseña
- ID (único)
- Libro (referencia al libro reseñado)
- Usuario (quién hace la reseña)
- Comentario
- Puntuación (ej. 1 a 5 estrellas)
- Fecha

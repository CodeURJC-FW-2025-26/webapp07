# TEAM MEMEBERS #
- Diego Ezquerra Barroso : d.ezquerra.2024@alumnos.urjc.es
- Bárbara Cruz González : b.cruzg.2024@alumnos.urjc.es
- Rocío Zancajo Zapatero : r.zancajo.2024@alumnos.urjc.es
- Sara El Moussaoui Houlbi  : s.elmoussaoui.2024@alumnos.urjc.es
  
# BOOK CATALOG #

This project is an application for managing a book catalog, where each book can have multiple associated reviews.
The goal is to provide a simple way to register, browse, and review books.

Features

Book management (create, read, update, delete).
Association of reviews with each book.
Ability to list books with their reviews.
Search by title, author, or genre.
Simple and extensible interface (depending on the stack used).

Main Entity:
Book
- Book cover image.
- ID.
- Title.
- Author.
- Genres: horror, mystery, romance, historical, fiction, dystopian, utopian, fantasy, action, adventure, and kid's section.
- Year of publication.
- Description.
  
Secondary Entity:
Review
- ID (unique)
- Book (reference to the reviewed book)
- User (who writes the review)
- Comment
- Rating (e.g., 1 to 5 stars)
- Date
# PARTICIPACIÓN DE LOS MIEMBROS DEL EQUIPO #

let allBooks = [];

fetch('./data.json')
  .then(response => response.json())
  .then(books => {
    allBooks = books;
    renderBooks(allBooks);
  })
  .catch(err => console.error('Error cargando los libros:', err));

function renderBooks(books) {
  const container = document.getElementById('books-container');
  container.innerHTML = ''; // Limpia antes de renderizar

  books.forEach((book, index) => {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.innerHTML = `
      <img src="./images/${book.bookimg}" alt="${book.title}">
      <div class="card-body">
        <h5 class="card-title">${book.title}</h5>
        <p class="card-text">${book.author}</p>
        <p class="card-text"><strong>Genre:</strong> ${book.Genre} | <strong>Year:</strong> ${book.Year}</p>
        <p class="card-text"><strong>Synopsis:</strong> ${book.Synopsis}</p>
        <a href="book${index + 1}.html" class="btn btn-outline-secondary btn-sm">View</a>
      </div>
    `;
    container.appendChild(card);
  });
}

//Escucha el input de búsqueda
document.getElementById('search-input').addEventListener('input', function () {
  const query = this.value.toLowerCase();
  const filtered = allBooks.filter(book =>
    book.title.toLowerCase().includes(query) ||
    book.author.toLowerCase().includes(query)
  );
  renderBooks(filtered);
});

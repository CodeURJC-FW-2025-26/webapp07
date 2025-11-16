fetch('./book.json')
  .then(response => response.json())
  .then(books => {
    const container = document.getElementById('books-container');

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
  })
  .catch(err => console.error('Error cargando los libros:', err));

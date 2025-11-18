    document.getElementById('delete-button').addEventListener('click', async () => {
      const confirmDelete = confirm('Are you sure you want to delete this book?');
      if (!confirmDelete) return;
      const bookId = '{{_id}}'; // Mustache/EJS renderiza el ID aquí

      try {
        const response = await fetch(`/Post/${bookId}`, {
          method: 'DELETE',
        });

        const result = await response.json();

        if (result.success) {
          alert('Successfully deleted book');
          window.location.href = '/'; // Redirige al catálogo
        } else {
          alert('Error deleting the book');
        }
      } catch (error) {
        console.error('Error connecting to the server:', error);      
        alert('Error deleting the book');    
      }
    });

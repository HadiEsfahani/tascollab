document.addEventListener('DOMContentLoaded', () => {
  const cards = Array.from(document.querySelectorAll('.card'));

  cards.forEach((card) => {
    const toggle = card.querySelector('.card-toggle');

    toggle.addEventListener('click', () => {
      const isOpen = card.classList.contains('is-open');

      // Close all cards, then open the clicked one (accordion behavior).
      cards.forEach((c) => c.classList.remove('is-open'));

      if (!isOpen) {
        card.classList.add('is-open');
      }
    });
  });
});

const scrollToTopBtn = document.getElementById('scrollToTopBtn');
scrollToTopBtn.addEventListener('click', scrollToTheTopOfThePage);

window.addEventListener('scroll', handleScrollToTopButtonVisibility);

function handleScrollToTopButtonVisibility() {
  if (window.scrollY > 500) {
    scrollToTopBtn.style.display = 'block';
  } else {
    scrollToTopBtn.style.display = 'none';
  }
}

function scrollToTheTopOfThePage() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}

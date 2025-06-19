console.log('Centered Image Layout loaded'); 

const images = [
  { src: '../1/1.avif', title: 'First Image' },
  { src: '../1/2.avif', title: 'Second Image' },
  { src: '../1/3.avif', title: 'Third Image' },
  { src: '../1/4.avif', title: 'Fourth Image' }
];

let currentIndex = 0;
let pointerProgress = 0; // 0 to 1
const pointerStep = 0.02; // Further reduced scroll speed

const imageEl = document.querySelector('.center-image');
const titleEl = document.querySelector('.title');
const numberEl = document.querySelector('.number');

function updateContent(index) {
  imageEl.src = images[index].src;
  titleEl.textContent = images[index].title;
  numberEl.textContent = index + 1;
}

function updateBodyBackground(progress) {
  // Fill the body background from bottom to top using a linear-gradient
  const percent = Math.min(100, Math.max(0, progress * 100));
  document.body.style.background = `linear-gradient(to top, #007bff ${percent}%, #f0f0f0 ${percent}%)`;
}

window.addEventListener('wheel', (e) => {
  if (e.deltaY > 0) {
    pointerProgress += pointerStep;
  } else if (e.deltaY < 0) {
    pointerProgress -= pointerStep;
  } else {
    return;
  }
  pointerProgress = Math.max(0, Math.min(1, pointerProgress));
  updateBodyBackground(pointerProgress);

  if (pointerProgress >= 1) {
    // Next image
    currentIndex = (currentIndex + 1) % images.length;
    updateContent(currentIndex);
    pointerProgress = 0;
    updateBodyBackground(pointerProgress);
  } else if (pointerProgress <= 0 && e.deltaY < 0) {
    // Optionally, allow going to previous image if scrolling up at bottom
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateContent(currentIndex);
    pointerProgress = 1;
    updateBodyBackground(pointerProgress);
  }
});

// Prevent page scroll
window.addEventListener('wheel', (e) => {
  e.preventDefault();
}, { passive: false });

// Initialize
updateContent(currentIndex);
updateBodyBackground(pointerProgress); 
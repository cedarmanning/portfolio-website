// Turns every .carousel inside a .project into a working media slider.
// You only write the slides; ids, dots and arrows are added here,
// so new projects work by copy and paste.
document.querySelectorAll('.project .carousel').forEach((carousel, n) => {
    const id = `project-media-${n + 1}`;
    const slides = carousel.querySelectorAll('.carousel-item');
    carousel.id = id;

    if (!carousel.querySelector('.carousel-item.active') && slides[0]) {
        slides[0].classList.add('active');
    }

    // Only show dots and arrows when there is more than one slide
    if (slides.length > 1) {
        const dots = document.createElement('div');
        dots.className = 'carousel-indicators';
        slides.forEach((slide, i) => {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.dataset.bsTarget = `#${id}`;
            dot.dataset.bsSlideTo = i;
            dot.setAttribute('aria-label', `Show item ${i + 1} of ${slides.length}`);
            if (slide.classList.contains('active')) {
                dot.className = 'active';
                dot.setAttribute('aria-current', 'true');
            }
            dots.appendChild(dot);
        });
        carousel.prepend(dots);

        ['prev', 'next'].forEach(dir => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `carousel-control-${dir}`;
            btn.dataset.bsTarget = `#${id}`;
            btn.dataset.bsSlide = dir;
            btn.innerHTML =
                `<span class="carousel-control-${dir}-icon" aria-hidden="true"></span>` +
                `<span class="visually-hidden">${dir === 'prev' ? 'Previous' : 'Next'}</span>`;
            carousel.append(btn);
        });
    }

    // No auto-advance; swipe and arrow keys work
    new bootstrap.Carousel(carousel, { interval: false, ride: false });

    // Stop any playing video when moving to another slide
    carousel.addEventListener('slide.bs.carousel', () => {
        carousel.querySelectorAll('video').forEach(v => v.pause());
    });
});

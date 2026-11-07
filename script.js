// Turns every .carousel inside a .project into a working media slider.
// You only write the slides; ids, dots and arrows are added here,
// so new projects work by copy and paste.

// Release a video's memory: pause, drop the source, and reload to empty
function unloadVideo(video) {
    video.pause();
    video.querySelectorAll('source').forEach(s => {
        if (s.getAttribute('src')) {
            s.dataset.src = s.getAttribute('src');
            s.removeAttribute('src');
        }
    });
    video.load();
}

// Restore a video's source so it can play
function loadVideo(video) {
    let changed = false;
    video.querySelectorAll('source').forEach(s => {
        if (!s.getAttribute('src') && s.dataset.src) {
            s.setAttribute('src', s.dataset.src);
            changed = true;
        }
    });
    if (changed) video.load();
}

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

    // Start with every video unloaded except the one on the active slide
    carousel.querySelectorAll('video').forEach(unloadVideo);
    const firstVideo = carousel.querySelector('.carousel-item.active video');
    if (firstVideo) loadVideo(firstVideo);

    // No auto-advance; swipe and arrow keys work
    const instance = new bootstrap.Carousel(carousel, { interval: false, ride: false });

    // Leaving a slide: pause everything, and load the video that is coming in
    carousel.addEventListener('slide.bs.carousel', e => {
        carousel.querySelectorAll('video').forEach(v => v.pause());
        const incoming = e.relatedTarget.querySelector('video');
        if (incoming) loadVideo(incoming);
    });

    // Transition finished: unload every video that is no longer visible
    carousel.addEventListener('slid.bs.carousel', () => {
        carousel.querySelectorAll('.carousel-item:not(.active) video').forEach(unloadVideo);
    });

    // Track whether this carousel is on screen
    let visible = false;
    let resumeOnReturn = null; // video that was playing when we scrolled away

    new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        const active = carousel.querySelector('.carousel-item.active video');

        if (!visible && active && !active.paused && !active.ended) {
            // Scrolled away: pause and remember it
            active.pause();
            resumeOnReturn = active;
        } else if (visible && resumeOnReturn) {
            // Scrolled back: resume only if the same slide is still showing
            if (resumeOnReturn === active) active.play().catch(() => {});
            resumeOnReturn = null;
        }
    }, { threshold: 0.5 }).observe(carousel);

    // When a video finishes, go to the next slide (stops at the last one)
    carousel.querySelectorAll('video').forEach(video => {
        video.addEventListener('ended', () => {
            const item = video.closest('.carousel-item');
            if (!item.nextElementSibling) return;

            // Autoplay the next video once the slide has settled,
            // but only if the carousel is still on screen
            carousel.addEventListener('slid.bs.carousel', () => {
                const next = carousel.querySelector('.carousel-item.active video');
                if (next && visible) {
                    next.currentTime = 0;
                    next.play().catch(() => {}); // ignore if the browser blocks it
                }
            }, { once: true });

            instance.next();
        });
    });
});
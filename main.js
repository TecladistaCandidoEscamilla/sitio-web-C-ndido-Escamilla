// ===== Initialize Lucide Icons =====
lucide.createIcons();

// ===== Hamburger Menu =====
const hamburgerBtn = document.getElementById('hamburgerBtn');
const mobileMenu = document.getElementById('mobileMenu');

if (hamburgerBtn && mobileMenu) {
    hamburgerBtn.addEventListener('click', () => {
        hamburgerBtn.classList.toggle('active');
        mobileMenu.classList.toggle('open');
        document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });
}

function closeMenu() {
    if (hamburgerBtn && mobileMenu) {
        hamburgerBtn.classList.remove('active');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
    }
}

// ===== Generic Slider Engine =====
function createSlider(trackId, dotsId, getVisibleCount) {
    const track = document.getElementById(trackId);
    const dotsContainer = document.getElementById(dotsId);
    if (!track || !dotsContainer) return null;

    const slides = track.children;
    const totalSlides = slides.length;
    let currentIndex = 0;
    let startX = 0;
    let isDragging = false;
    let dragOffset = 0;

    function getVisible() {
        return typeof getVisibleCount === 'function' ? getVisibleCount() : 1;
    }

    function getMaxIndex() {
        return Math.max(0, totalSlides - getVisible());
    }

    function updatePosition(animate) {
        if (!animate) track.classList.add('no-transition');
        else track.classList.remove('no-transition');
        const pct = -(currentIndex * (100 / getVisible()));
        track.style.transform = `translateX(${pct}%)`;
        updateDots();
        if (!animate) requestAnimationFrame(() => track.classList.remove('no-transition'));
    }

    function buildDots() {
        dotsContainer.innerHTML = '';
        const maxIdx = getMaxIndex();
        for (let i = 0; i <= maxIdx; i++) {
            const dot = document.createElement('button');
            dot.className = 'slider-dot' + (i === currentIndex ? ' active' : '');
            dot.setAttribute('aria-label', `Slide ${i + 1}`);
            dot.addEventListener('click', () => { currentIndex = i; updatePosition(true); });
            dotsContainer.appendChild(dot);
        }
    }

    function updateDots() {
        const dots = dotsContainer.querySelectorAll('.slider-dot');
        dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));
    }

    function go(direction) {
        const maxIdx = getMaxIndex();
        currentIndex = Math.max(0, Math.min(maxIdx, currentIndex + direction));
        updatePosition(true);
    }

    // Touch / Drag support
    function onStart(e) {
        isDragging = true;
        startX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
        dragOffset = 0;
        track.classList.add('no-transition');
    }
    function onMove(e) {
        if (!isDragging) return;
        const x = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
        dragOffset = x - startX;
        const basePct = -(currentIndex * (100 / getVisible()));
        const dragPct = (dragOffset / track.parentElement.offsetWidth) * 100;
        track.style.transform = `translateX(${basePct + dragPct}%)`;
    }
    function onEnd() {
        if (!isDragging) return;
        isDragging = false;
        track.classList.remove('no-transition');
        const threshold = track.parentElement.offsetWidth * 0.15;
        if (dragOffset < -threshold) go(1);
        else if (dragOffset > threshold) go(-1);
        else updatePosition(true);
    }

    track.addEventListener('touchstart', onStart, { passive: true });
    track.addEventListener('touchmove', onMove, { passive: true });
    track.addEventListener('touchend', onEnd);
    track.addEventListener('mousedown', onStart);
    track.addEventListener('mousemove', onMove);
    track.addEventListener('mouseup', onEnd);
    track.addEventListener('mouseleave', () => { if (isDragging) onEnd(); });

    // Init
    buildDots();
    updatePosition(false);

    // Rebuild dots on resize
    window.addEventListener('resize', () => {
        if (currentIndex > getMaxIndex()) currentIndex = getMaxIndex();
        buildDots();
        updatePosition(false);
    });

    return { go, getState: () => ({ currentIndex, total: totalSlides }) };
}

// ===== Image Slider =====
const imageSlider = createSlider('imageTrack', 'imageDots', () => {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 769) return 2;
    return 1;
});

function slideImages(dir) {
    if (imageSlider) imageSlider.go(dir);
}

// ===== Video Slider =====
const videoSlider = createSlider('videoTrack', 'videoDots', () => 1);

function slideVideos(dir) {
    if (videoSlider) videoSlider.go(dir);
}

// ===== Scroll Reveal =====
function initReveal() {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    reveals.forEach(el => observer.observe(el));
}

initReveal();

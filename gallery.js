document.addEventListener("DOMContentLoaded", () => {
    const guideContainer = document.querySelector(".guide-container");
    if (!guideContainer) return;

    // Створюємо або очищаємо лайтбокс
    let lb = document.getElementById("lightbox");
    if (!lb) {
        lb = document.createElement("div");
        lb.id = "lightbox";
        lb.className = "lightbox";
        document.body.appendChild(lb);
    }

    lb.style.display = "none";
    lb.innerHTML = `
        <span class="lightbox-close" id="lb-close" style="z-index: 100003; cursor: pointer;">&times;</span>
        <button class="lightbox-btn lightbox-prev" id="lb-prev" type="button" style="z-index: 100003; cursor: pointer;">&#10094;</button>
        <div id="lightbox-img-wrap" style="position: relative; max-width: 90vw; max-height: 90vh; display: flex; align-items: center; justify-content: center; z-index: 100001;">
            <img id="lightbox-img" class="lightbox-content" alt="Збільшене зображення" style="max-width: 100%; max-height: 90vh; cursor: pointer; object-fit: contain;">
        </div>
        <button class="lightbox-btn lightbox-next" id="lb-next" type="button" style="z-index: 100003; cursor: pointer;">&#10095;</button>
        <div class="lightbox-counter" id="lightbox-counter" style="z-index: 100003;">1 / 1</div>
    `;

    let currentGroup = [];
    let currentIndex = 0;

    const lbImg = document.getElementById("lightbox-img");
    const lbCounter = document.getElementById("lightbox-counter");
    const btnPrev = document.getElementById("lb-prev");
    const btnNext = document.getElementById("lb-next");
    const btnClose = document.getElementById("lb-close");

    function closeLB(e) {
        if (e) {
            if (e.stopPropagation) e.stopPropagation();
            if (e.preventDefault) e.preventDefault();
        }
        lb.style.display = "none";
        if (lbImg) lbImg.removeAttribute("src");
    }

    function updateView() {
        if (!currentGroup[currentIndex]) return;
        lbImg.src = currentGroup[currentIndex].src;

        if (currentGroup.length <= 1) {
            btnPrev.style.display = "none";
            btnNext.style.display = "none";
            lbCounter.style.display = "none";
        } else {
            btnPrev.style.display = "flex";
            btnNext.style.display = "flex";
            lbCounter.style.display = "block";
            lbCounter.textContent = `${currentIndex + 1} / ${currentGroup.length}`;
        }
    }

    function showNext(e) {
        if (e) {
            if (e.preventDefault) e.preventDefault();
            e.stopPropagation();
        }
        if (currentGroup.length <= 1) return;
        currentIndex = (currentIndex + 1) % currentGroup.length;
        updateView();
    }

    function showPrev(e) {
        if (e) {
            if (e.preventDefault) e.preventDefault();
            e.stopPropagation();
        }
        if (currentGroup.length <= 1) return;
        currentIndex = (currentIndex - 1 + currentGroup.length) % currentGroup.length;
        updateView();
    }

    // ЗАКРИТТЯ: Клік по фото, хрестику або темному фону
    lbImg.addEventListener("click", closeLB);
    btnClose.addEventListener("click", closeLB);
    lb.addEventListener("click", (e) => {
        if (e.target !== btnPrev && e.target !== btnNext) {
            closeLB(e);
        }
    });

    btnNext.addEventListener("click", showNext);
    btnPrev.addEventListener("click", showPrev);

    // Свайпи для телефонів
    let touchStartX = 0;
    let touchEndX = 0;

    lb.addEventListener("touchstart", (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lb.addEventListener("touchend", (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchEndX - touchStartX;
        if (Math.abs(diff) > 40) {
            if (diff < 0) showNext();
            else showPrev();
        }
    }, { passive: true });

    // Керування клавішами на ПК
    document.addEventListener("keydown", (e) => {
        if (lb.style.display === "flex") {
            if (e.key === "ArrowRight") showNext();
            if (e.key === "ArrowLeft") showPrev();
            if (e.key === "Escape") closeLB();
        }
    });

    // Оновлена функція збору картинок на сторінці
    function getValidImages() {
        return Array.from(guideContainer.querySelectorAll("img")).filter(img => {
            // Ігноруємо іконки кнопок, стрілки та картинки в посиланнях-меню
            const hasLink = img.closest("a");
            const isAction = img.closest(".card-top-actions");
            const isHidden = img.closest(".step-card") && img.closest(".step-card").style.display === "none";
            return !hasLink && !isAction && !isHidden;
        });
    }

    // ТИМЧАСОВО СТАВИМО СТИЛЬ КУРСОРУ, щоб користувач бачив, що картинка клікабельна
    const style = document.createElement('style');
    style.innerHTML = '.guide-container img:not(a img):not(.card-top-actions img) { cursor: pointer; transition: transform 0.2s ease; } .guide-container img:not(a img):not(.card-top-actions img):hover { transform: scale(1.015); }';
    document.head.appendChild(style);

    // ЖИВЕ ВІДСТЕЖЕННЯ КЛІКІВ (ДЕЛЕГУВАННЯ) — спрацює на будь-якій картинці, навіть завантаженій із запізненням
    document.body.addEventListener("click", (e) => {
        const img = e.target;
        if (img && img.tagName === "IMG" && guideContainer.contains(img)) {
            // Перевіряємо, чи ця картинка не є посиланням або кнопкою
            if (img.closest("a") || img.closest(".card-top-actions")) return;

            e.stopPropagation();
            e.preventDefault();

            // Отримуємо свіжий список всіх доступних картинок
            currentGroup = getValidImages();
            currentIndex = currentGroup.indexOf(img);

            if (currentIndex === -1) {
                currentGroup.push(img);
                currentIndex = currentGroup.length - 1;
            }

            updateView();
            lb.style.display = "flex";
        }
    });

    // Закриття галереї тільки при поверненні назад по історії (без блокування закриття сторінки)
    window.addEventListener("pageshow", () => {
        lb.style.display = "none";
    });
});
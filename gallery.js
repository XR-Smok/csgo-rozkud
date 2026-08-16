document.addEventListener("DOMContentLoaded", () => {
    // 1. Створюємо розмітку лайтбокса
    let lb = document.getElementById("lightbox");
    if (!lb) {
        lb = document.createElement("div");
        lb.id = "lightbox";
        lb.className = "lightbox";
        document.body.appendChild(lb);
    }

    lb.innerHTML = `
        <span class="lightbox-close" id="lb-close">&times;</span>
        <button class="lightbox-btn lightbox-prev" id="lb-prev" type="button">&#10094;</button>
        <img id="lightbox-img" class="lightbox-content" src="" alt="Збільшене фото">
        <button class="lightbox-btn lightbox-next" id="lb-next" type="button">&#10095;</button>
        <div class="lightbox-counter" id="lightbox-counter">1 / 1</div>
    `;

    let currentGroup = [];
    let currentIndex = 0;

    const lbImg = document.getElementById("lightbox-img");
    const lbCounter = document.getElementById("lightbox-counter");
    const btnPrev = document.getElementById("lb-prev");
    const btnNext = document.getElementById("lb-next");
    const btnClose = document.getElementById("lb-close");

    // Відкриття галереї тільки з ВИДИМИМИ фото сторінки (ігнорує приховані картки)
    window.openGalleryByImg = function(targetImg) {
        const guideContainer = document.querySelector(".guide-container") || document.body;
        
        // Збираємо картинки тільки з тих карток, які не сховані
        const allImgs = Array.from(guideContainer.querySelectorAll(".step-img, .guide-card img, .step-card img, img:not(#lightbox-img):not(.side-img)"));
        currentGroup = allImgs.filter(img => {
            const card = img.closest('.step-card, .guide-card');
            return !card || card.style.display !== 'none';
        });

        // Прибираємо дублікати
        currentGroup = [...new Set(currentGroup)];

        if (currentGroup.length === 0) {
            currentGroup = [targetImg];
        }

        currentIndex = currentGroup.indexOf(targetImg);
        if (currentIndex === -1) currentIndex = 0;

        updateView();
        lb.style.display = "flex";
    };

    window.openLightbox = function(src) {
        let foundImg = Array.from(document.querySelectorAll("img")).find(img => img.src === src || img.getAttribute("src") === src);
        if (foundImg) {
            window.openGalleryByImg(foundImg);
        } else {
            lbImg.src = src;
            lb.style.display = "flex";
        }
    };

    function updateView() {
        if (!currentGroup[currentIndex]) return;
        lbImg.src = currentGroup[currentIndex].src;
        if (lbCounter) {
            lbCounter.textContent = `${currentIndex + 1} / ${currentGroup.length}`;
        }
        if (currentGroup.length <= 1) {
            btnPrev.style.display = "none";
            btnNext.style.display = "none";
            lbCounter.style.display = "none";
        } else {
            btnPrev.style.display = "block";
            btnNext.style.display = "block";
            lbCounter.style.display = "block";
        }
    }

    function showNext(e) {
        if (e) e.stopPropagation();
        if (currentGroup.length <= 1) return;
        currentIndex = (currentIndex + 1) % currentGroup.length;
        updateView();
    }

    function showPrev(e) {
        if (e) e.stopPropagation();
        if (currentGroup.length <= 1) return;
        currentIndex = (currentIndex - 1 + currentGroup.length) % currentGroup.length;
        updateView();
    }

    function closeLB(e) {
        if (e) e.stopPropagation();
        lb.style.display = "none";
    }

    btnNext.addEventListener("click", showNext);
    btnPrev.addEventListener("click", showPrev);
    btnClose.addEventListener("click", closeLB);

    // Закриття кліком на темний фон
    lb.addEventListener("click", (e) => {
        if (e.target === lb) closeLB();
    });

    // Керування клавіатурою (←, →, Esc)
    document.addEventListener("keydown", (e) => {
        if (lb.style.display === "flex") {
            if (e.key === "ArrowRight") showNext();
            if (e.key === "ArrowLeft") showPrev();
            if (e.key === "Escape") closeLB();
        }
    });

    // Гортання мишкою (Drag & Drop)
    let isMouseDown = false;
    let startMouseX = 0;

    lb.addEventListener("mousedown", (e) => {
        if (e.target === btnPrev || e.target === btnNext || e.target === btnClose) return;
        isMouseDown = true;
        startMouseX = e.clientX;
    });

    lb.addEventListener("mouseup", (e) => {
        if (!isMouseDown) return;
        isMouseDown = false;
        let diff = e.clientX - startMouseX;
        if (diff < -40) showNext();
        if (diff > 40) showPrev();
    });

    // Свайпи на смартфонах
    let touchStartX = 0;
    lb.addEventListener("touchstart", (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lb.addEventListener("touchend", (e) => {
        let touchEndX = e.changedTouches[0].screenX;
        let diff = touchEndX - touchStartX;
        if (diff < -40) showNext();
        if (diff > 40) showPrev();
    }, { passive: true });

    // Підключення кліку до картинок
    document.querySelectorAll(".step-img, .guide-card img, .step-card img").forEach(img => {
        img.addEventListener("click", (e) => {
            e.stopPropagation();
            window.openGalleryByImg(img);
        });
    });
});
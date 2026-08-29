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
        <img id="lightbox-img" class="lightbox-content" src="" alt="Збільшене зображення">
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

    // Відкриття галереї тільки для картинок усередині активних розкидок
    window.openGalleryByImg = function(targetImg) {
        const guideContainer = document.querySelector(".guide-container");
        if (!guideContainer) return; // Якщо ми на сторінці меню — не відкриваємо
        
        // Збираємо картинки тільки з карток розкидок, які не знаходяться всередині посилань <a>
        const allImgs = Array.from(guideContainer.querySelectorAll(".step-card img, .step-img")).filter(img => !img.closest("a"));
        
        currentGroup = allImgs.filter(img => {
            const card = img.closest('.step-card');
            return !card || card.style.display !== 'none';
        });

        currentGroup = [...new Set(currentGroup)];

        if (currentGroup.length === 0) return;

        currentIndex = currentGroup.indexOf(targetImg);
        if (currentIndex === -1) currentIndex = 0;

        updateView();
        lb.style.display = "flex";
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

    lb.addEventListener("click", (e) => {
        if (e.target === lb) closeLB();
    });

    document.addEventListener("keydown", (e) => {
        if (lb.style.display === "flex") {
            if (e.key === "ArrowRight") showNext();
            if (e.key === "ArrowLeft") showPrev();
            if (e.key === "Escape") closeLB();
        }
    });

    // Підключаємо збільшення ТІЛЬКИ до картинок всередині розкидок (ігноруючи кліки-посилання)
    document.querySelectorAll(".step-card img, .step-img").forEach(img => {
        if (!img.closest("a")) {
            img.addEventListener("click", (e) => {
                e.stopPropagation();
                window.openGalleryByImg(img);
            });
        }
    });
});
// ================= 1. ЗБЕРЕЖЕННЯ В "МІЙ РАУНД" =================
function toggleFavoriteCard(btn, id, title, pageUrl) {
    let favs = JSON.parse(localStorage.getItem('myRoundCards')) || [];
    const index = favs.findIndex(item => item.id === id);

    if (index > -1) {
        favs.splice(index, 1);
        btn.classList.remove('active');
        btn.innerHTML = '☆';
        btn.title = 'Додати в Мій раунд';
    } else {
        favs.push({
            id: id,
            title: title,
            url: pageUrl + '#' + id
        });
        btn.classList.add('active');
        btn.innerHTML = '★';
        btn.title = 'Видалити з Мого раунду';
    }

    localStorage.setItem('myRoundCards', JSON.stringify(favs));
}

// ================= 2. СХОВАТИ З АНІМАЦІЄЮ =================
function hideCard(cardId, cardTitle) {
    const card = document.getElementById(cardId);
    
    if (card) {
        card.classList.add('card-collapsing');
        
        setTimeout(() => {
            let hidden = JSON.parse(localStorage.getItem('hiddenCards')) || [];
            if (!hidden.some(item => item.id === cardId)) {
                hidden.push({ id: cardId, title: cardTitle });
                localStorage.setItem('hiddenCards', JSON.stringify(hidden));
            }
            card.classList.remove('card-collapsing');
            applyHiddenCards();
        }, 300);
    } else {
        let hidden = JSON.parse(localStorage.getItem('hiddenCards')) || [];
        if (!hidden.some(item => item.id === cardId)) {
            hidden.push({ id: cardId, title: cardTitle });
            localStorage.setItem('hiddenCards', JSON.stringify(hidden));
        }
        applyHiddenCards();
    }
}

// ================= 3. ПОВЕРНУТИ РОЗКИДКУ (З ПІДСВІЧУВАННЯМ) =================
function restoreCard(cardId) {
    let hidden = JSON.parse(localStorage.getItem('hiddenCards')) || [];
    hidden = hidden.filter(item => item.id !== cardId);
    localStorage.setItem('hiddenCards', JSON.stringify(hidden));
    
    applyHiddenCards();

    // Плавно скролимо та запускаємо спалах
    setTimeout(() => {
        const card = document.getElementById(cardId);
        if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card.classList.remove('card-restoring');
            void card.offsetWidth; // скидання анімації
            card.classList.add('card-restoring');
            
            setTimeout(() => {
                card.classList.remove('card-restoring');
            }, 1800);
        }
    }, 50);
}

function restoreAllCards() {
    localStorage.removeItem('hiddenCards');
    applyHiddenCards();
}

// ================= 4. ВІДОБРАЖЕННЯ НА СТОРІНЦІ =================
function applyHiddenCards() {
    let hidden = JSON.parse(localStorage.getItem('hiddenCards')) || [];
    const hiddenSection = document.getElementById('hiddenSection');
    const hiddenList = document.getElementById('hiddenList');
    const hiddenCount = document.getElementById('hiddenCount');

    let currentHiddenOnPage = 0;
    if (hiddenList) hiddenList.innerHTML = '';

    document.querySelectorAll('.step-card, .guide-card').forEach(card => {
        const id = card.id;
        if (!id) return;

        const isHidden = hidden.some(item => item.id === id);
        const cardTitleEl = card.querySelector('.step-title, .guide-card-title');
        const cardTitle = cardTitleEl ? cardTitleEl.innerText.replace(/^[^\wа-яіїєґ0-9\.\-\s]+/iu, '').trim() : 'Розкидка';

        if (isHidden) {
            card.style.display = 'none';
            currentHiddenOnPage++;

            if (hiddenList) {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'hidden-item-row';
                itemDiv.innerHTML = `
                    <span>📦 ${cardTitle}</span>
                    <button onclick="restoreCard('${id}')" class="restore-btn">↩️ Повернути</button>
                `;
                hiddenList.appendChild(itemDiv);
            }
        } else {
            card.style.display = 'block';
        }
    });

    if (hiddenSection) {
        if (currentHiddenOnPage > 0) {
            hiddenSection.style.display = 'block';
            if (hiddenCount) hiddenCount.innerText = currentHiddenOnPage;
        } else {
            hiddenSection.style.display = 'none';
        }
    }
}

// ================= 5. АВТО-РОЗГОРТАННЯ ПРИ ПЕРЕХОДІ З РАУНДУ =================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Статус зірочок
    let favs = JSON.parse(localStorage.getItem('myRoundCards')) || [];
    document.querySelectorAll('.fav-star-btn').forEach(btn => {
        const id = btn.getAttribute('data-id');
        if (favs.some(item => item.id === id)) {
            btn.classList.add('active');
            btn.innerHTML = '★';
            btn.title = 'Видалити з Мого раунду';
        }
    });

    // 2. Якщо перейшли за прямим посиланням (#id з Мого раунду) — відновлюємо його зі схованих!
    const targetHash = window.location.hash.replace('#', '');
    if (targetHash) {
        let hidden = JSON.parse(localStorage.getItem('hiddenCards')) || [];
        if (hidden.some(item => item.id === targetHash)) {
            // Видаляємо саме цю картку зі схованих
            hidden = hidden.filter(item => item.id !== targetHash);
            localStorage.setItem('hiddenCards', JSON.stringify(hidden));
        }
    }

    // 3. Застосовуємо відображення
    applyHiddenCards();
});
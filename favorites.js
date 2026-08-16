// Функція збереження / видалення окремого блоку
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

// Перевірка активних зірочок при завантаженні сторінки
document.addEventListener('DOMContentLoaded', () => {
    let favs = JSON.parse(localStorage.getItem('myRoundCards')) || [];
    document.querySelectorAll('.fav-star-btn').forEach(btn => {
        const id = btn.getAttribute('data-id');
        if (favs.some(item => item.id === id)) {
            btn.classList.add('active');
            btn.innerHTML = '★';
            btn.title = 'Видалити з Мого раунду';
        }
    });
});
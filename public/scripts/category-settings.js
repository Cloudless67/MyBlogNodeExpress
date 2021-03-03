let showCategoryAdd = false;
document.getElementById('category-settings').onclick = () => {
    let add = document.getElementById('category-add');
    if (!showCategoryAdd) {
        add.style.display = 'block';
        showCategoryAdd = true;
    } else {
        add.style.display = 'none';
        showCategoryAdd = false;
    }
};

document.getElementById('category-add-submit').onclick = () => {
    let addText = document.getElementById('category-add-text').value;
    let xhr = new XMLHttpRequest();
    xhr.open('POST', `/api/category/${addText}`);
    xhr.onload = () => {
        if (xhr.status !== 200) {
            alert('Category add failed.');
        } else {
            const res = JSON.parse(xhr.response);
            const newCategory = document.createElement('p');
            const nav = document.querySelector('#category-navbar nav');

            newCategory.className = 'list';
            newCategory.innerHTML = `<a class="category-list-text" href="/category/${res.url}"> - ${res.name}</a>`;
            nav.appendChild(newCategory);
        }
    };
    xhr.send();
};

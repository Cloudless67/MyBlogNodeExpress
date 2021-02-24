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
        }
    };
    xhr.send();
};

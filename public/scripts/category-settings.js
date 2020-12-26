var editingCategory = false;
document.getElementById('category-settings').onclick = () => {
    console.log(document.getElementById('category-settings'))
    let add = document.getElementById('category-add');
    if(add.style.visibility === 'hidden')
        add.style.visibility = 'visible';
    else
        add.style.visibility = 'hidden';
}

document.getElementById('category-add-submit').onclick = () => {
    let addText = document.getElementById('category-add-text').value;
    let xhr = new XMLHttpRequest();
    xhr.open('POST', `/api/category/${addText}`);
    xhr.onreadystatechange = () => {
      if(xhr.readyState === 4){
        if(xhr.status === 200){
        }
        else{
          alert('Category add failed.');
        }
      }
    }
    xhr.send();
}
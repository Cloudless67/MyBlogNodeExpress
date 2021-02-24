function DeleteReplyClicked(index) {
    form = document.getElementById(`reply-form-${index}`);
    console.log(form.style.display);
    if (form.style.display === 'none' || form.style.display === '') {
        form.style.display = 'inline-block';
    } else {
        form.style.display = 'none';
    }
}

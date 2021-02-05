function DeleteReplyClicked(index) {
  form = document.getElementById(`reply-form-${index}`);
  if (form.style.visibility === "hidden") {
    form.style.visibility = "visible";
    form.style.height = "100%";
  } else {
    form.style.visibility = "hidden";
    form.style.height = "0";
  }
}

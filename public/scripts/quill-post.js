let quill = new Quill('#editor-container', {
  modules: {
    toolbar: []
  },
  placeholder: '본문',
  readOnly: true,
  theme: 'snow'  // or 'bubble'
});

let v = quill.getContents().ops[0].insert;
quill.setContents(JSON.parse(v));

function DeleteReplyClicked(index){
  form = document.getElementById(`reply-form-${index}`);
  if(form.style.visibility === 'hidden'){
    form.style.visibility = 'visible'
    form.style.height = '100%'
  }
  else{
    form.style.visibility = 'hidden'
    form.style.height = '0'
  }
}
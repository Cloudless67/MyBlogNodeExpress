
var quill = new Quill('#editor-container', {
  modules: {
    toolbar: []
  },
  placeholder: '본문',
  readOnly: true,
  theme: 'bubble'  // or 'bubble'
});

var v = quill.getContents().ops[0].insert;
quill.setContents(JSON.parse(v));

var form = document.querySelector('form');
form.onsubmit = function() {
  // Populate hidden form on submit
  var about = document.querySelector('input[name=body]');
  about.value = JSON.stringify(quill.getContents());
};
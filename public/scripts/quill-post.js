
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
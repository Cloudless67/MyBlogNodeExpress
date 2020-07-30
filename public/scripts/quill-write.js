var toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
  ['blockquote', 'code-block', 'image'],

  [{ 'header': 1 }, { 'header': 2 }],               // custom button values
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
  [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
  [{ 'direction': 'rtl' }],                         // text direction

  [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown

  [{ 'color': [] }],          // dropdown with defaults from theme
  [{ 'font': [] }],
  [{ 'align': [] }]
];

var quill = new Quill('#editor-container', {
  modules: {
    toolbar: toolbarOptions
  },
  placeholder: '본문',
  theme: 'snow'  // or 'bubble'
});

var form = document.querySelector('form');
form.onsubmit = function() {
  // Populate hidden form on submit
  var about = document.querySelector('input[name=body]');
  about.value = JSON.stringify(quill.getContents());
  console.log(about.value)
};
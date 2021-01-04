let toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
  ['blockquote', 'code-block', 'image', 'link'],

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

// Create Quill instance
let quill = new Quill('#editor-container', {
  modules: {
    toolbar: toolbarOptions
  },
  placeholder: '본문',
  theme: 'snow'  // or 'bubble'
});

// Set contents if update
let content = document.getElementById('editor-container').getAttribute('value')
if(content){
  quill.setContents(JSON.parse(content));
}

function InsertImage(image){
  let formData = new FormData();
  formData.append('image', image);
  console.log(image)

  let xhr = new XMLHttpRequest();
  xhr.open('PUT', `/api/image/${image.name}`);
  xhr.onreadystatechange = () => {
    if(xhr.readyState === 4){
      if(xhr.status === 200){
        let url = JSON.parse(xhr.responseText).Location;
        let {index, length} = quill.getSelection();
        quill.deleteText(index, length, source = 'user');
        quill.insertEmbed(index, 'image', url);
      }
      else{
        alert('Image insertion failed.');
      }
    }
  }
  xhr.send(formData);
}

function DeleteImage(image){
  console.log(image)
  // Send form request
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if(xhr.readyState === XMLHttpRequest.DONE) {
      let status = xhr.status;
      if (status === 0 || (status >= 200 && status < 400)) {
        console.log('Successfully deleted!')
      } else {
        alert(xhr.responseText)
      }
    }
  };
  xhr.open('DELETE', '/api/image/' + image);
  xhr.send();
}

quill.on('text-change', (delta, oldDelta, source) => {
  if (source == 'user') {
    let current = quill.getContents()
    if(delta.ops.some(x => x.delete !== undefined)){
      let deleted = current.diff(oldDelta)
      deleted.ops.map(x => {
        if(x.insert && x.insert.image){
          deletedImg = x.insert.image;
          DeleteImage(deletedImg)
        }
      })
    }
  }
});

// Custom image handler for image upload
quill.getModule('toolbar').addHandler('image', () => {
  // Create input for file selection
  let input = document.createElement('input');
  input.setAttribute('type', 'file');
  input.setAttribute('accept', 'image/png, image/gif, image/jpeg, image/bmp, image/x-icon')
  input.click()

  input.onchange = () => InsertImage(input.files[0]);
})

let form = document.querySelector('form');
form.onsubmit = function() {
  // Populate hidden form on submit
  let about = document.querySelector('input[name=body]');
  about.value = JSON.stringify(quill.getContents());
  console.log(about.value)
};
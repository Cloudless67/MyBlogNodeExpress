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

// Create Quill instance
var quill = new Quill('#editor-container', {
  modules: {
    toolbar: toolbarOptions
  },
  placeholder: '본문',
  theme: 'snow'  // or 'bubble'
});

// Set contents if update
var content = document.getElementById('editor-container').getAttribute('value')
if(content){
  quill.setContents(JSON.parse(content));
}

InsertImage = (image) => {
  var data = new FormData();
  data.append('image', image)
  // Send form request
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    // If image upload Successed
    if(xhr.readyState === XMLHttpRequest.DONE) {
      var status = xhr.status;
      if (status === 0 || (status >= 200 && status < 400)) {
        var {index, range} = quill.getSelection();
        quill.insertEmbed(index, 'image', `/uploads/${xhr.responseText}`)
        index = index + 1;
        quill.setSelection(index, range)
      } else {
        alert(xhr.responseText)
      }
    }
  };
  xhr.open("PUT", '/api/image/' + `${image.name}_${image.lastModified}`);
  xhr.send(data);
}

DeleteImage = (image) => {

  // Send form request
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if(xhr.readyState === XMLHttpRequest.DONE) {
      var status = xhr.status;
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
    var current = quill.getContents()
    if(delta.ops.some(x => x.delete !== undefined)){
      var deleted = current.diff(oldDelta)
      deleted.ops.map(x => {
        if(x.insert && x.insert.image){
          deletedImg = x.insert.image;
          DeleteImage(deletedImg.substr(9))
        }
      })
    }
  }
});

// Custom image handler for image upload
quill.getModule('toolbar').addHandler('image', () => {
  // Create input for file selection
  var input = document.createElement('input');
  input.setAttribute('type', 'file');
  input.setAttribute('accept', 'image/png, image/gif, image/jpeg, image/bmp, image/x-icon')
  input.click()

  input.onchange = () => {
    InsertImage(input.files[0])
  };
})

var form = document.querySelector('form');
form.onsubmit = function() {
  // Populate hidden form on submit
  var about = document.querySelector('input[name=body]');
  about.value = JSON.stringify(quill.getContents());
  console.log(about.value)
};
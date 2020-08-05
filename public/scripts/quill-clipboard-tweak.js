var Clipboard = Quill.import('modules/clipboard');
var Delta = Quill.import('delta');
var pastedImage;

class PlainClipboard extends Clipboard {
  convert(html) {
    var delta = super.convert(html)
    delta.ops.map(x => {
      if(x.insert && x.insert.image){
        console.log(pastedImage)
        _InsertImage(pastedImage);
        x.insert.image = '/uploads/'+`${pastedImage.name}_${pastedImage.lastModified}`
      }
    })
    return delta
  }
}

window.addEventListener('paste', e => {
  if(e.clipboardData.files.length > 0){
    pastedImage = e.clipboardData.files[0];
  }
});

_InsertImage = (image) => {
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
      } else {
        alert(xhr.responseText)
      }
    }
  };
  xhr.open("PUT", '/api/image/' + `${image.name}_${image.lastModified}`);
  xhr.send(data);
}

Quill.register('modules/clipboard', PlainClipboard, true);
let inputField = document.getElementById('input-markdown');
if (inputField.addEventListener) {
    inputField.addEventListener('keydown', this.keyHandler, false);
} else if (inputField.attachEvent) {
    inputField.attachEvent('onkeydown', this.keyHandler); /* damn IE hack */
}

function keyHandler(e) {
    var TABKEY = 9;
    if (e.keyCode == TABKEY) {
        this.value += '  ';
        if (e.preventDefault) {
            e.preventDefault();
        }
        return false;
    }
}

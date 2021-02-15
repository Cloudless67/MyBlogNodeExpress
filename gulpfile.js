"use strict";
const { watch, src, dest } = require("gulp");
var sass = require("gulp-sass");
sass.compiler = require("sass");

function style(cb) {
  return src("./public/stylesheets/scss/style.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(dest("./public/stylesheets/css"));
  cb();
}

exports.style = style;

exports.default = () => {
  watch("./public/stylesheets/scss/**/*.scss", style);
};

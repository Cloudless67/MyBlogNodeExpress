module.exports = function (hljs) {
  return {
    case_insensitive: false,
    contains: [
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE,
      hljs.C_LINE_COMMENT_MODE,
      {
        className: "name",
        begin: /^ *[a-zA-Z]+/,
        excludeEnd: true,
      },
      {
        className: "selector-class",
        begin: /^ *\.[\w\-]+/,
      },
      {
        className: "selector-id",
        begin: /\#[^\s\(]+/,
        end: /[\(\s]/,
        excludeEnd: true,
      },
    ],
  };
};

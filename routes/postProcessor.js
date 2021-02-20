const marked = require('marked');
const Prism = require('prismjs');
const katex = require('katex');
const loadLanguages = require('prismjs/components/');

// Languages I have plan to write in my posts
loadLanguages([
    'bash',
    'csharp',
    'batch',
    'c',
    'cpp',
    'docker',
    'git',
    'http',
    'ignore',
    'java',
    'json',
    'latex',
    'markdown',
    'matlab',
    'mongodb',
    'properties',
    'pug',
    'python',
    'regex',
    'sass',
    'scss',
    'sql',
]);

const renderer = {
    // Override code block
    code(code, infostring) {
        if (infostring === 'Math') {
            return `<span class="katex-display">
            ${katex.renderToString(code, {
                displayMode: true,
                output: 'html',
                throwOnError: false,
            })}
            </span>`;
        } else {
            try {
                return `<pre class = "language-${infostring}"><code class = "language-${infostring}">${Prism.highlight(
                    code,
                    Prism.languages[infostring],
                    infostring
                )}</code></pre>`;
            } catch (err) {
                console.error(`unidentified language "${infostring}"`);
            }
        }
    },
    // Override inline code
    codespan(code) {
        // It's kaTeX if first charactar is $
        if (code[0] === '$') {
            return katex.renderToString(code.substring(1), {
                throwOnError: false,
            });
        } else {
            // or just use original code
            return `<code class = "inline-code">${code}</code>`;
        }
    },
};

const tokenizer = {
    // Match for inline $ ... $ syntax
    codespan(src) {
        const match = src.match(/^([`$])(?=[^\s\d$`])([^`$]*?)\1(?![`$])/);
        if (match) {
            return {
                type: 'codespan',
                raw: match[0],
                // If codespan is TeX, put $ charactar
                text:
                    match[1] === '$' ? `$${match[2].trim()}` : match[2].trim(),
            };
        }
        return false;
    },
    // Disable inline text when meeting $ inline
    inlineText(src, inRawBlock, smartypants) {
        const cap = src.match(
            /^([`$]+|[^`$])(?:[\s\S]*?(?:(?=[\\<!\[`$*]|\b_|$)|[^ ](?= {2,}\n))|(?= {2,}\n))/
        );
        if (cap) {
            var text;
            if (inRawBlock) {
                text = this.options.sanitize
                    ? this.options.sanitizer
                        ? this.options.sanitizer(cap[0])
                        : cap[0]
                    : cap[0];
            } else {
                text = this.options.smartypants ? smartypants(cap[0]) : cap[0];
            }
            return {
                type: 'text',
                raw: cap[0],
                text: text,
            };
        }
    },
    // Match for $$ ... $$ blocks
    fences(src) {
        const cap = src.match(
            /^ {0,3}(`{3,}|\${2,}(?=[^`\n]*\n)|~{3,})([^\n]*)\n(?:|([\s\S]*?)\n)(?: {0,3}\1[~`\$]* *(?:\n+|$)|$)/
        );
        if (cap) {
            return {
                type: 'code',
                raw: cap[0],
                codeBlockStyle: 'indented',
                // for $$ ... $$ block, set language as Math
                lang: cap[1] === '```' ? cap[2].trim() : 'Math',
                text: cap[3],
            };
        }
    },
};

marked.use({ renderer, tokenizer });

module.exports = marked;

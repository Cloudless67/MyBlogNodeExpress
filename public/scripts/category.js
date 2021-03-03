document.addEventListener('DOMContentLoaded', (_) => {
    'use strict';
    const indexes = document.querySelectorAll('.indexes > span');

    document.querySelectorAll('.indexes > span').forEach((elem) => {
        elem.addEventListener('click', (event) => {
            const base =
                location.href[location.href.length - 1] === '/'
                    ? location.href.substr(0, location.length - 1)
                    : location.href;
            fetch(`${base}/${event.target.dataset.index}`)
                .then((res) => res.json())
                .then((res) => updatePosts(res.posts))
                .catch((err) => console.error(err));

            indexes.forEach((index) => (index.className = ''));
            event.target.className = 'selected';
        });
    });

    function updatePosts(posts) {
        console.log(posts);
        let main = document.querySelector('main > nav');
        while (main.lastElementChild) {
            main.removeChild(main.lastElementChild);
        }
        posts.forEach((post, i) => {
            let list = document.createElement('div');
            let a = document.createElement('a');
            let h2 = document.createElement('h2');
            let small = document.createElement('small');
            let p = document.createElement('p');

            list.className = 'list';
            a.href = `/post/${post.id}`;
            h2.innerHTML = post.title;
            small.innerHTML = `조회 ${post.views} | 댓글 ${post.replies}`;
            p.className = 'text-gray m0';
            p.innerHTML = post.body.substring(
                0,
                Math.min(
                    post.body.indexOf('#') > 0 ? post.body.indexOf('#') : 200,
                    200
                )
            );

            a.appendChild(h2);
            a.appendChild(small);
            a.appendChild(p);
            list.appendChild(a);
            main.appendChild(list);
        });
    }
});

(function(){
 'use strict';
 const sync=()=>document.documentElement.classList.toggle('admin-view',new URLSearchParams(location.search).get('admin')==='1');
 sync();
 window.addEventListener('popstate',sync);
 window.addEventListener('hashchange',sync);
 document.addEventListener('scent:blend-complete',sync);
 document.addEventListener('click',()=>queueMicrotask(sync));
})();

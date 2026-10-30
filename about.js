(function(){
  const dialog=document.getElementById('about-dialog');
  for(const button of document.querySelectorAll('[data-about]'))button.addEventListener('click',()=>dialog.showModal());
  document.getElementById('about-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
})();

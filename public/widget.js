
(function(){
  function ready(fn){ if(document.readyState!=='loading'){fn()} else document.addEventListener('DOMContentLoaded', fn) }
  ready(function(){
    var mount = document.getElementById('led-configurator-embed');
    if(!mount){ return; }
    var srcBase = window.LED_CONFIGURATOR_SRC || (document.currentScript && document.currentScript.getAttribute('data-src')) || '';
    var iframe = document.createElement('iframe');
    iframe.src = srcBase || '/' ;
    iframe.style.width = '100%';
    iframe.style.minHeight = '900px';
    iframe.style.border = '0';
    iframe.allow = 'clipboard-write *;';
    mount.appendChild(iframe);
  });
})();

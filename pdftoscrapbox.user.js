// ==UserScript==
// @grant        GM_xmlhttpRequest
// @name         PDF to Scrapbox user.js
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  try to take over the world!
// @author       You
// @match        https://ssig33.github.io/pdftoscrapbox/*
// ==/UserScript==

const GM_get = (url)=>{
  return new Promise((r)=>{
    const method = "GET";
    const onload = (res)=> r(res);
    GM_xmlhttpRequest({ method, url, onload,withCredentials: true });
  });
}

(function() {
  window.addEventListener('load', ()=>{
    const drop = document.querySelector('#drop');
    const span = document.querySelector('span');

    const read = (file)=>{
      return new Promise((r)=>{
        const reader = new FileReader();
        reader.onload = (e)=>{
          r(e.target.result);
        };
        reader.readAsArrayBuffer(file)
      });
    }

    drop.addEventListener('dragover', (event)=> event.preventDefault());

    const renderAndUpload = async (page, name)=>{
      const viewport = page.getViewport(1.5);
      const canvas = document.createElement('canvas') , ctx = canvas.getContext('2d');
      const renderContext = { canvasContext: ctx, viewport: viewport };

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render(renderContext);
      const dataUrl = canvas.toDataURL('image/jpeg');
      const client_id =
        'c8d5b8c60bb10284b8ab43fe28e60fb0017d64cff2548a2fcaeb62d6b1335829';

      const formData = new FormData();
      formData.append('image_url', dataUrl);
      formData.append('client_id', client_id);
      formData.append('referer_url', location.href);
      formData.append('title', name);

      const response = await fetch('https://upload.gyazo.com/api/upload/easy_auth', { method: 'POST', body: formData });
      const data = await response.json();
      const res = await GM_get(data.get_image_url);
      return res.finalUrl;
    }

    drop.addEventListener('drop', async (e)=>{
      e.preventDefault();
      PDFJS.cMapUrl = '/cmaps/';
      PDFJS.cMapPacked = true;
      const file = event.dataTransfer.files[0];
      console.log(file);
      const obj = await read(file);
      const pdf = await PDFJS.getDocument(obj);

      console.log(pdf.numPages);

      pages = [];

      page = 1;
      while(true){
        const i = await pdf.getPage(page);
        const gyazo = await renderAndUpload(i, file.name);
        console.log(gyazo);
        pages.push(gyazo);
        if(page == pdf.numPages) break;
        page ++;
        span.textContent = `${page} / ${pdf.numPages}`;
      }
      const urls = pages.map(url => `[[${url}]]`);
      urls.unshift(file.name);
      window.open(`https://scrapbox.io/${document.querySelector('input').value}/new?body=${encodeURIComponent(urls.join("\n"))}`);
    }); 
    
  });
})();

// ==UserScript==
// @grant        GM_xmlhttpRequest
// @name         Search with Gyazo
// @namespace    http://tampermonkey.net/
// @version      4.0
// @description  try to take over the world!
// @author       You
// @match        https://scrapbox.io/*
// ==/UserScript==

const GM_get = (url)=>{
  return new Promise((r)=>{
    const method = "GET";
    const onload = (res)=> r(JSON.parse(res.responseText));
    GM_xmlhttpRequest({ method, url, onload });
  });
}

(function() {
  'use strict';

  const searchArticleAndAppend = async ({image_id}, pages, lineIds)=>{
    const prj = location.pathname.split("/")[1];
    const url = `https://scrapbox.io/api/pages/${prj}/search/query?skip=0&sort=updated&limit=30&q=${image_id}`;
    const data = await (await fetch(url)).json();
    if(data.pages.length > 0){
      for(const page of data.pages){
        console.log(page);
        if(!pages[page.title]){
          pages[page.title] = await (await fetch(`https://scrapbox.io/api/pages/${prj}/${encodeURIComponent(page.title)}?followRename=true')`)).json();
        }
        const line = pages[page.title].lines.find(x => x.text.match(image_id));
        if(lineIds.indexOf(line.id) === -1){
          console.log('koko');
          lineIds.push(line.id);
          const li = jQuery(`
            <li class="page-list-item list-style-item">
              <a href="/${prj}/${encodeURIComponent(page.title)}#${line.id}" rel="route" style="display:flex" target='_blank'>
                <div style="padding-right:20px">
                  <img loading="lazy" src="http://gyazo.com/${image_id}/raw" style="width:250px;max-height:400px">
                </div>
                <div style="flex:1">
                  <div class="title-with-description">${page.title}</div>
                  <div class="description"><span>${page.descriptions[0]}</span>
                </div>
                </div>
              </a>
            </li>
          `);
          jQuery('#searchWithGyazo').append(li);
        }
      }
    }
  }

  const search = async ()=>{
    const query = decodeURIComponent(location.search.replace("?q=", ""))
    const url = `https://gyazo.com/api/internal/search_result?page=1&per=40&query=${encodeURIComponent(query)}`;
    const data = await GM_get(url);
    const pages = {};
    const lineIds = [];
    data.captures.forEach(cap => searchArticleAndAppend(cap, pages, lineIds))
    jQuery('#gyazobutton').remove();
  }

  const main = ()=>{
    if(location.href.match(/search\/page/)){
      const element = jQuery('<div id="addiction" class="project-search">');
      element.append('<div class="project-search-count">Search with Gyazo</div>')
      const formDiv = jQuery('<div class="text-center"></div>')
      const button = jQuery('<button id="gyazobutton" type="submit" class="project-search-button btn btn-auto-block btn-default">Search with Gyazo</button>')
      button.click(search);
      formDiv.append(button)
      element.append(formDiv)
      element.append('<ul class="list" id="searchWithGyazo" style="padding-bottom: 15px"></ul>')
      jQuery('.project-search').before(element);
    }
  }

  // ページ遷移を雑にループで検知
  const loop = (href)=>{
    setTimeout(()=>{
      if(location.href !== href){ 
        document.querySelectorAll('#addiction').forEach(n => n.remove());
        initialize();
      }
      loop(location.href);
    }, 200);
  };
  loop(location.href);

  // 読み込み完了を待つ
  const initialize = ()=>{
    if(document.querySelector('.project-home')){
      main();
    } else {
      setTimeout(initialize, 500);
    }
  }
  initialize();
})();

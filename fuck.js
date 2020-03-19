const drop = document.querySelector('#drop');
const canvas = document.querySelector('canvas');
const div = document.querySelector('div#canvas');

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


drop.addEventListener('drop', async (e)=>{
  e.preventDefault();
  const file = event.dataTransfer.files[0];
  console.log(file);
  const obj = await read(file);
  const pdf = await PDFJS.getDocument(obj);

  const page = await pdf.getPage(1);

  const ctx = canvas.getContext('2d');
  const viewport = page.getViewport(1.5);
  const renderContext = { canvasContext: ctx, viewport };

  canvas.height = viewport.height;
  canvas.width = viewport.width;

  await page.render(renderContext);
});

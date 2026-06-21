const params =
  new URLSearchParams(location.search);

const file =
  params.get("file");

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.js";

pdfjsLib.getDocument(
  `pdf/${file}`
).promise.then(async pdf => {

  const viewer =
    document.getElementById("viewer");

  for(let pageNum=1;
      pageNum<=pdf.numPages;
      pageNum++){

      const page =
        await pdf.getPage(pageNum);

      const viewport =
        page.getViewport({scale:1});

      const scale =
        window.innerWidth /
        viewport.width;

      const scaledViewport =
        page.getViewport({scale});

      const canvas =
        document.createElement("canvas");

      const ctx =
        canvas.getContext("2d");

      canvas.width =
        scaledViewport.width;

      canvas.height =
        scaledViewport.height;

      await page.render({
        canvasContext:ctx,
        viewport:scaledViewport
      }).promise;

      viewer.appendChild(canvas);
  }

});
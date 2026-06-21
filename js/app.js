fetch("data/pdfs.json")
  .then(res => res.json())
  .then(data => {

    const list = document.getElementById("pdf-list");

    data.forEach(pdf => {

      const a = document.createElement("a");

      a.className = "card";
      a.href = `viewer.html?file=${pdf.file}`;

      a.innerHTML = `<h3>${pdf.title}</h3>`;

      list.appendChild(a);
    });

  });
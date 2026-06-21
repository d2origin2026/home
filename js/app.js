fetch("data/pdfs.json")
  .then(r => r.json())
  .then(data => {

    const list = document.getElementById("pdf-list");

    data.forEach(pdf => {

      const card = document.createElement("a");

      card.href =
        `viewer.html?file=${pdf.file}`;

      card.className = "card";

      card.innerHTML =
        `<h3>${pdf.title}</h3>`;

      list.appendChild(card);

    });

  });
import "reveal.js/reset.css";
import "reveal.js/reveal.css";
import "reveal.js/theme/solarized.css";
import Reveal from "reveal.js";
import RevealNotes from "reveal.js/plugin/notes";
import RevealMarkdown from "reveal.js/plugin/markdown";
import RevealHighlight from "reveal.js/plugin/highlight";
import RevealMath from "reveal.js/plugin/math";
import jsyaml from "js-yaml";
import yamlText from "./game.yaml?raw";

function buildGame(data) {
  const slidesContainer = document.querySelector(".slides");

  const section = document.createElement("section");
  section.innerHTML = `
    <h2>
      Jeopardy!
      <span class="jeopardy-button">Reset Game</span>
    </h2>
    <div id="board" class="jeopardy-board"></div>
    <h3 id="final" class="jeopardy-final"></h3>
  `;
  slidesContainer.appendChild(section);

  const board = document.getElementById("board");

  Object.entries(data.categories).forEach(([category, clues]) => {
    const col = document.createElement("div");
    col.className = "jeopardy-column";

    const title = document.createElement("div");
    title.className = "jeopardy-category";
    title.textContent = category;
    col.appendChild(title);

    const ids = Object.keys(clues).sort();
    ids.forEach(id => {
      const obj = clues[id];
      const link = document.createElement("a");
      link.className = "clue-link";
      link.textContent = id.replace(/^[A-Z]/, "$");
      link.href = `#/${id}`;
      link.dataset.clue = id;
      col.appendChild(link);

      const section = document.createElement("section");
      section.id = id;
      section.dataset.clue = id;
      section.innerHTML = `
        <section data-clue="${id}">
          <h2>${category} for ${id.replace(/^[A-Z]/, "$")}</h2>
          <div>${obj.q}</div>
          <p><a href="#/">← Back to Board</a></p>
        </section>
      `;
      if ("a" in obj) {
        section.innerHTML += `
          <section data-clue="${id}">
            <h2>${category} for ${id.replace(/^[A-Z]/, "$")}</h2>
            <div style="font-weight: bold">Answer: ${obj.a}</div>
            <p><a href="#/">← Back to Board</a></p>
          </section>
        `;
      }
      slidesContainer.appendChild(section);
    });

    board.appendChild(col);
  });

  {
    const id = "FINAL";
    const final = document.getElementById("final");

    const finalLink = document.createElement("a");
    finalLink.dataset.clue = id;
    finalLink.className = "clue-link";
    finalLink.textContent = "Final Jeopardy";
    finalLink.href = `#/${id}`;
    final.appendChild(finalLink);

    const section = document.createElement("section");
    section.id = id;
    section.dataset.clue = id;
    section.innerHTML = `
      <section data-clue="${id}">
        <h1>Final Jeopardy</h2>
        <p><a href="#/">← Back to Board</a></p>
      </section>
      <section data-clue="${id}">
        <h2>Final Jeopardy</h2>
        <div>${data.final.q}</div>
        <p><a href="#/">← Back to Board</a></p>
      </section>
      <section data-clue="${id}">
        <h2>Final Jeopardy</h2>
        <div style="font-weight: bold;">Answer: ${data.final.a}</div>
        <p><a href="#/">← Back to Board</a></p>
      </section>
    `;
    slidesContainer.appendChild(section);
  }
}

const gameData = jsyaml.load(yamlText);
buildGame(gameData);

// More info about initialization & config:
// - https://revealjs.com/initialization/
// - https://revealjs.com/config/
Reveal.initialize({
  hash: true,
  // Learn about plugins: https://revealjs.com/plugins/
  plugins: [RevealMarkdown, RevealHighlight, RevealNotes, RevealMath.MathJax4],

  controlsTutorial: false,
  progress: false,
  viewDistance: 1000,
  width: 1280,
});

Reveal.on("slidechanged", event => {
  const clue = event.currentSlide.dataset.clue;
  // mark clue used
  if (clue) {
    localStorage.setItem("jeopardy-" + clue, "used");
    document
      .querySelectorAll(`[data-clue="${clue}"].clue-link`)
      .forEach(el => el.classList.add("clue-used"));
  }
});

// reset board
document.querySelector(".jeopardy-button")
  .addEventListener("click", function () {
    const ok = confirm("Are you sure you want to reset the game?");
    if (!ok) return;

    for (const key of Object.keys(localStorage)) {
      if (key.startsWith("jeopardy-")) {
        localStorage.removeItem(key);
      }
    }
    document
      .querySelectorAll(".clue-link")
      .forEach(el => {
        const clue = el.dataset.clue;
        el.classList.remove("clue-used");
      });
  });

// refresh board
document
  .querySelectorAll(".clue-link")
  .forEach(el => {
    const clue = el.dataset.clue;
    if (localStorage.getItem("jeopardy-" + clue) === "used") el.classList.add("clue-used");
  });

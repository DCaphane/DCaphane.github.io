//
const containerNavSide = document.getElementById("article-left");

const ul = document.createElement("ul");
ul.className = "nav-side";
ul.id = "side-nav";

let sections = document.querySelectorAll("#article-right section");
let i = 0;
for (let section of sections) {
  const li = document.createElement("li");
  if (i === 0) {
    li.className = "active";
  }
  const anchor = document.createElement("a");

  anchor.setAttribute("href", "#" + section.id);
  let str = section.querySelectorAll("h2")[0].innerText;
  anchor.innerHTML = str.substring(0, 15);

  li.appendChild(anchor);

  ul.appendChild(li);
  i += 1;
  /*
    // anchor
    console.log(section.id)
    // text to display
    console.log(section.querySelectorAll('h2')[0].innerText);
    */
}

containerNavSide.append(ul);
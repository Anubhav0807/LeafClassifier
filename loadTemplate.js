const header = document.querySelector("header");
const footer = document.querySelector("footer");

if (header) {
    fetch("templates/header.txt")
        .then((res) => res.text())
        .then((html) => {
            header.innerHTML = html;
            const anchors = document.querySelectorAll('nav > a');
            for (let anchor of anchors) {
                if (anchor.innerHTML === document.title) {
                    anchor.style.textDecoration = 'underline';
                }
            }
        });
}

if (footer) {
    fetch("templates/footer.txt")
        .then((res) => res.text())
        .then((html) => {
            footer.innerHTML = html;
            const copyrights = document.querySelector(".copyrights");
            copyrights.innerHTML = `&copy; ${new Date().getFullYear()} Leafipedia. All Rights Reserved.`;
        });
}

window.addEventListener("load", (e) => {
    const bgImg = document.querySelector(".background");
    bgImg.classList.add("blur");
    document.body.style.visibility = "visible";
});

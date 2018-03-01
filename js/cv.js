function go_page(navs, pages, len, index) {
    //Vanish pages
    for (var i = 0; i < len; i += 1) {
        pages[i].style.display = "none";
    }
    //show page
    pages[index].style.display = "block";
    //vanish buttons
    for (let i = 0; i < len; i += 1) {
        navs[i].style.backgroundColor = "skyblue";
    }
    //show button
    navs[index].style.backgroundColor = "snow";
}

function start(navs, pages, len) {
    for (let i = 0; i < len; i += 1) {
        navs[i].onclick = function () {
            console.log(i);
            go_page(navs, pages, len, i);
        };
    }
}


window.onload = function () {
    var navs = document.getElementsByClassName("nav");
    var pages = document.getElementsByClassName("page");
    var len = pages.length;
    start(navs, pages, len);

    var index = 0;
    var str = "Talk is cheap, show the code";
    var con = document.getElementById("word");
    var typer = null;

    function type() {
        con.innerHTML += str[index];
        index++;
        if (index == str.length) {
            clearTimeout(typer);
        } else {
            typer = setTimeout(type,100)
        }
    }
    type()
};
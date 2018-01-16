function vanish() {
    let pages = document.getElementsByClassName('page');
    let len = pages.length;
    let i;
    for (i = 0; i < len; i++) {
        pages[i].style.display = "none";
    }
}
function show(num1) {
    let pages = document.getElementsByClassName('page');
    pages[num1].style.display = "block";
}
function bt_off() {
    let navs = document.getElementsByClassName('nav');
    let len = navs.length;
    let i;
    for (i = 0; i < len; i++) {
        navs[i].style.backgroundColor = 'skyblue';
    }
}
function bt_on(num2){
    let navs = document.getElementsByClassName('nav');
    navs[num2].style.backgroundColor = "rgb(179, 177, 177)";
}
function go_p1() {
    vanish();
    show(0);
    bt_off();
    bt_on(0);
}

function go_p2() {
    vanish();
    show(1);
    bt_off();
    bt_on(1);
}

function go_p3() {
    vanish();
    show(2);
    bt_off();
    bt_on(2)
}

function go_p4() {
    vanish();
    show(3);
    bt_off();
    bt_on(3);
}


var n1 = document.getElementById("nav1");
n1.onclick = go_p1;
var n2 = document.getElementById("nav2");
n2.onclick = go_p2;
var n3 = document.getElementById("nav3");
n3.onclick = go_p3;
var n4 = document.getElementById("nav4");
n4.onclick = go_p4;


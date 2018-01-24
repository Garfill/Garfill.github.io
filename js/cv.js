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
    navs[num2].style.backgroundColor = "snow";
}
function go_page(index) {
    vanish();
    show(index);
    bt_off();
    bt_on(index);
}

for(let i=0;i<5;i++){
    var navs = document.getElementsByClassName("nav");
    navs[i].onclick = function(){
        go_page(i);
    };
}




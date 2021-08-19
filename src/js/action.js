(function() {
  var hoverSpan = false;
  var wrapper = document.querySelector('.wrapper');
  var iconList = document.querySelectorAll('.item');
  var contactBox = document.querySelector('.contact-block');
  var experienceBox = document.querySelector('.experience-block');
  var popMask = document.querySelectorAll('.pop-mask');

  const maskReg = /^pop\-mask$/i

  popMask.forEach((elem) => {
    elem.addEventListener('click', (e) => {
      if (maskReg.test(e.target.className)) {
        closeAllBox(false)
      }
    })
  })


  var showContact = false;
  var showExper = false;

  const urlList = [
    'https://github.com/Garfill',
    'https://garfill.github.io/blog/',
  ];

  function slideTo(index) {
    if (!hoverSpan) {
      hoverSpan = document.createElement('span');
      hoverSpan.classList.add('hover-span');
      wrapper.appendChild(hoverSpan)
    }
    let target = iconList[index]
    let hoverWidth = Math.random() * (target.offsetWidth / 2) + 10
    hoverSpan.style.left = (target.offsetLeft + target.offsetWidth / 2 - hoverWidth / 2) + 'px'
    hoverSpan.style.width = hoverWidth + 'px'
  }

  function toggleBox(elem, show) {
    if (show) {
      elem.classList.add('pop-animate-enter', 'pop-animate-active')
      elem.style.display = 'block'
      elem.offsetWidth
      elem.classList.remove('pop-animate-enter')
    } else {
      elem.classList.add('pop-animate-active')
      elem.offsetWidth
      elem.classList.add('pop-animate-leave')
    }
  }

  function closeAllBox(show) {
    showContact && toggleBox(contactBox, show);
    showExper &&  toggleBox(experienceBox, show);
  }

  function handleClick(index) {
    if (urlList[index]) {
      return window.open(urlList[index])
    }
    // 联系方式弹窗
    if (index == 3) {
      return toggleBox(contactBox, true)
    } else if (index == 2) {
      return toggleBox(experienceBox, true)
    }
  }

  for (let i = 0; i < iconList.length; i++) {
    let icon = iconList[i];
    icon.addEventListener('mouseenter', () => {
      slideTo(i)
    })

    icon.addEventListener('mousedown',(e) => {
      let img = e.currentTarget.querySelector('img')
      img.classList.add('mouse-down-img')
    }, false)
    icon.addEventListener('mouseup',(e) => {
      let img = e.currentTarget.querySelector('img')
      img.classList.remove('mouse-down-img')
      img.classList.add('mouse-up-img')
      setTimeout(() => {
        img.classList.remove('mouse-up-img')
      }, 200);
    }, false)

    icon.addEventListener('click', () => {
      handleClick(i)
    })
  }

  contactBox.addEventListener('transitionend', (e) => {
    showContact = !showContact
    contactBox.classList.remove('pop-animate-active')
    if (showContact) {
      contactBox.classList.remove('pop-animate-enter')
    } else {
      contactBox.classList.remove('pop-animate-leave')
      contactBox.style.display = 'none'
    }
  })
  experienceBox.addEventListener('transitionend', (e) => {
    showExper = !showExper
    experienceBox.classList.remove('pop-animate-active')
    if (showExper) {
      experienceBox.classList.remove('pop-animate-enter')
    } else {
      experienceBox.classList.remove('pop-animate-leave')
      experienceBox.style.display = 'none'
    }
  })

  slideTo(0)
})()
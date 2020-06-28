(function(window, document) {
  // 存储hotcss信息
  var hotcss = {};

  var maxWidth = 750;
  var minWidth = 320;
  var unitWidth = 20; // 1rem对应的像素
  var baseWidth = 375; // 基准像素
  hotcss.maxWidth = maxWidth;
  hotcss.minWidth = minWidth;
  hotcss.unitWidth = unitWidth;
  hotcss.baseWidth = baseWidth;

  hotcss.callback = function() {}

  hotcss.setOption = function(options) {
    for (var prop in options) {
      hotcss[prop] = options[prop]
    }
    resize()
  }

  function resize() {
    let innerWidth = document.documentElement.getBoundingClientRect().width || window.innerWidth;
    if (hotcss.maxWidth) {
      innerWidth = innerWidth > hotcss.maxWidth ? hotcss.maxWidth : innerWidth;
    } 
    if (hotcss.minWidth) {
      innerWidth = innerWidth > hotcss.minWidth ? innerWidth : hotcss.minWidth;
    }
    if (!innerWidth) return false

    document.documentElement.style.fontSize = ((innerWidth / (hotcss.baseWidth || hotcss.minWidth)) * hotcss.unitWidth) + 'px'

    hotcss.callback && hotcss.callback(innerWidth)
  }

  hotcss.resize = resize;

  hotcss.resize();

  window.addEventListener('resize', function() {
    hotcss.tid && clearTimeout(hotcss.tid)
    hotcss.tid = setTimeout(hotcss.resize, 333)
  }, false);

  window.addEventListener('load', hotcss.resize, false);
  
  hotcss.tid = setTimeout(function() {
    hotcss.resize()
  }, 333);

  window.hotcss = hotcss

})(window, document)
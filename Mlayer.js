/* 
 * Author: LXJ
 * Date: 2017.12.19
 * Version: 1.0
 * License: LGPL
*/

; !function (win) {

  "use strict";

  var doc = document, query = 'querySelectorAll', claname = 'getElementsByClassName', S = function (s) {
    return doc[query](s);
  };

  //默认配置
  var config = {
    type: 0
    , shade: true
    , shadeClose: true
    , fixed: true
    , anim: 'scale' //默认动画类型
  };

  var ready = {
    extend: function (obj) {
      var newobj = JSON.parse(JSON.stringify(config));
      for (var i in obj) {
        newobj[i] = obj[i];
      }
      return newobj;
    },
    timer: {}, end: {}
  };

  //点触事件
  ready.touch = function (elem, fn) {
    elem.addEventListener('click', function (e) {
      fn.call(this, e);
    }, false);
  };

  var index = 0, classs = ['layui-m-layer'], Layer = function (options) {
    var that = this;
    that.config = ready.extend(options);
    that.view();
  };

  Layer.prototype.view = function () {
    var that = this, config = that.config, layerbox = doc.createElement('div'), h;

    that.id = layerbox.id = classs[0] + index;
    layerbox.setAttribute('class', classs[0] + ' ' + classs[0] + (config.type || 0));
    layerbox.setAttribute('index', index);

    //标题区域
    var title = (function () {
      var titype = typeof config.title === 'object';
      return config.title
        ? '<h3 style="' + (titype ? config.title[1] : '') + '">' + (titype ? config.title[0] : config.title) + '</h3>'
        : '';
    }());

    //按钮区域
    var button = (function () {
      typeof config.btn === 'string' && (config.btn = [config.btn]);
      var btns = (config.btn || []).length, btndom;
      if (btns === 0 || !config.btn) {
        return '';
      }
      btndom = '<span yes type="1">' + config.btn[0] + '</span>'
      if (btns === 2) {
        btndom = '<span no type="0">' + config.btn[1] + '</span>' + btndom;
      }
      return '<div class="layui-m-layerbtn">' + btndom + '</div>';
    }());

    if (!config.fixed) {
      config.top = config.hasOwnProperty('top') ? config.top : 100;
      config.style = config.style || '';
      config.style += ' top:' + (doc.body.scrollTop + config.top) + 'px';
    }

    if (config.type === 2) {
      config.content = '<p>' + (config.content || '') + '</p>';
      h = '<div class="layui-m-loading"></div>' + config.content;
    } else if (config.type === 1) {
      config.content = '<div class="layui-m-layercont">' + config.content + '</div>';
      h = config.content + '<img src="default/close.png" class="layui-m-icon">';
    } else {
      h = '<div class="layui-m-layercont">' + config.content + '</div>';
    }

    if (config.skin) config.anim = 'up';
    if (config.skin === 'msg') config.shade = false;

    layerbox.innerHTML = (config.shade ? '<div ' + (typeof config.shade === 'string' ? 'style="' + config.shade + '"' : '') + ' class="layui-m-layershade"></div>' : '')
      + '<div class="layui-m-layermain" ' + (!config.fixed ? 'style="position:static;"' : '') + '>'
      + '<div class="layui-m-layersection">'
      + '<div class="layui-m-layerchild ' + (config.skin ? 'layui-m-layer-' + config.skin + ' ' : '') + (config.className ? config.className : '') + ' ' + (config.anim ? 'layui-m-anim-' + config.anim : '') + '" ' + (config.style ? 'style="' + config.style + '"' : '') + '>'
      + title
      + h
      + button
      + '</div>'
      + '</div>'
      + '</div>';

    if (!config.type || config.type === 2) {
      var dialogs = doc[claname](classs[0] + config.type), dialen = dialogs.length;
      if (dialen >= 1) {
        layer.close(dialogs[0].getAttribute('index'))
      }
    }

    document.body.appendChild(layerbox);
    var elem = that.elem = S('#' + that.id)[0];
    config.success && config.success(elem);

    that.index = index++;
    that.action(config, elem);
  };

  Layer.prototype.action = function (config, elem) {
    var that = this;

    //自动关闭
    if (config.time) {
      ready.timer[that.index] = setTimeout(function () {
        layer.close(that.index);
      }, config.time * 1000);
    }

    //确认取消
    var btn = function () {
      var type = this.getAttribute('type');
      if (type == 0) {
        config.no && config.no();
        layer.close(that.index);
      } else {
        config.yes ? config.yes(that.index) : layer.close(that.index);
      }
    };
    // 关闭弹层
    function close() {
      var elem = document.getElementsByClassName('layui-m-icon');

      if (elem.length) {
        ready.touch(elem[0], function () {
          layer.close(that.index);
        });
      }
    }
    close();

    if (config.btn) {
      var btns = elem[claname]('layui-m-layerbtn')[0].children, btnlen = btns.length;
      for (var ii = 0; ii < btnlen; ii++) {
        ready.touch(btns[ii], btn);
      }
    }

    //点遮罩关闭
    if (config.shade && config.shadeClose) {
      var shade = elem[claname]('layui-m-layershade')[0];
      ready.touch(shade, function () {
        layer.close(that.index, config.end);
      });
    }

    config.end && (ready.end[that.index] = config.end);
  };

  win.layer = {
    v: '2.0',
    index: index,

    //核心方法
    open: function (options) {
      var o = new Layer(options || {});
      return o.index;
    },

    close: function (index) {
      var ibox = S('#' + classs[0] + index)[0];
      if (!ibox) return;
      ibox.innerHTML = '';
      doc.body.removeChild(ibox);
      clearTimeout(ready.timer[index]);
      delete ready.timer[index];
      typeof ready.end[index] === 'function' && ready.end[index]();
      delete ready.end[index];
    },

    //关闭所有layer层
    closeAll: function () {
      var boxs = doc[claname](classs[0]);
      for (var i = 0, len = boxs.length; i < len; i++) {
        layer.close((boxs[0].getAttribute('index') | 0));
      }
    }
  };

  'function' == typeof define ? define(function () {
    // return layer;
    layer
  }) : function () {

    var js = document.scripts, script = js[js.length - 1], jsPath = script.src;
    var path = jsPath.substring(0, jsPath.lastIndexOf("/") + 1);

    //如果合并方式，则需要单独引入layer.css
    if (script.getAttribute('merge')) return;

    document.head.appendChild(function () {
      var link = doc.createElement('link');
      link.href = path + 'default/layer.css?2.0';
      link.type = 'text/css';
      link.rel = 'styleSheet'
      link.id = 'layermcss';
      return link;
    }());

  }();

}(window);

(function (window, l, undefined) {
  "use strict";
  // document.documentElement.appendChild(function () {
  //   var script = document.createElement('script');
  //   script.src = 'default/layer.js';
  //   console.log(script);
  //   return script
  // }());

  if (!Array.isArray) {
    Array.isArray = function (arg) {
      return Object.prototype.toString.call(arg) === '[object Array]';
    };
  }

  function Layer() {
    this.content = '提示内容';
    this.btn = ['确定', '取消'];
    this.callback = function() {};
  }

  Layer.prototype = {
    info: function () {
      var self = this;
      initParam.apply(self, arguments);

      l.open({
        content: self.content, 
        btn: '确定',
        yes: function (index) {
          self.callback();
          l.close(index);
        }
      });
    },

    msg: function(c) {
      this.content = c || this.content;

      l.open({
        content: this.content
        , skin: 'msg'
        , time: 1
      });
    },

    confirm: function() {
      var self = this;
      initParam.apply(self, arguments);

      l.open({
        content: self.content
        , btn: self.btn
        , yes: function (index) {
          self.callback();
          l.close(index);
        }
      });
    },

    adv: function(img, link) {
      img = img || null;
      link = link || null;

      if (!img && !link) { 
        console.error('请传入图片'); 
        return; 
      }

      l.open({
        type: 1,
        content: '<a href="'+ (link || '#') +'"><img src="'+ img +'"></a>',
        nim: 'scale',
        shadeClose: false,
        className: 'layui-m-layer-img',
      });
    },

    loading: function(c) {
      c = c || '拼命加载中'
      l.open({
        type: 2,
        content: c,
        // shade: false
      });
    }
  }

  // 初始化内容和回调函数
  function initParam() {
    var arr = arguments;
    for (var i = 0, length = arr.length; i < length; i++) {
      if (typeof arr[i] === 'function') {
        this.callback = arr[i];
        continue;
      }
      if (typeof arr[i] === 'string') {
        this.content = arr[i];
      }
      if (Array.isArray(arr[i])) {
        this.btn = arr[i];
      }
    }
  }

  function toArray(list, start) {
    start = start || 0;
    var i = list.length - start;
    var ret = new Array(i);
    while (i--) {
      ret[i] = list[i + start];
    }
    return ret
  }

  window.Mlayer = Layer;
})(window, layer);
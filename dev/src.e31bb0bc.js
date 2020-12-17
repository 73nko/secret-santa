// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"../node_modules/plax/js/plax.js":[function(require,module,exports) {
/* Plax version 1.2.1 */

/*
  Copyright (c) 2011 Cameron McEfee

  Permission is hereby granted, free of charge, to any person obtaining
  a copy of this software and associated documentation files (the
  "Software"), to deal in the Software without restriction, including
  without limitation the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell copies of the Software, and to
  permit persons to whom the Software is furnished to do so, subject to
  the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
  LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
  OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
  WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

(function ($) {

  var maxfps          = 25,
      delay           = 1 / maxfps * 1000,
      lastRender      = new Date().getTime(),
      layers          = [],
      docWidth        = $(window).width(),
      docHeight       = $(window).height(),
      motionEnabled   = false,
      motionMax       = 1,
      motionAllowance = .05,
      movementCycles  = 0,
      motionData      = {
        "xArray"  : [0,0,0,0,0],
        "yArray"  : [0,0,0,0,0],
        "xMotion" : 0,
        "yMotion" : 0
      }

  $(window).resize(function() {
      docWidth  = $(window).width()
      docHeight = $(window).height()
  })

  // Public Methods
  $.fn.plaxify = function (params){

    return this.each(function () {
      var layerExistsAt = -1
      var layer         = {"xRange":0,"yRange":0,"invert":false}

      for (var i=0;i<layers.length;i++){
        if ($(this).attr('id') == layers[i].obj.attr('id')){
          layerExistsAt = i
        }
      }

      for (var param in params) {
        if (layer[param] == 0) {
          layer[param] = params[param]
        }
      }

      // Add an object to the list of things to parallax
      layer.obj    = $(this)
      layer.startX = this.offsetLeft
      layer.startY = this.offsetTop

      if(layer.invert == false){
        layer.startX -= Math.floor(layer.xRange/2)
        layer.startY -= Math.floor(layer.yRange/2)
      } else {
        layer.startX += Math.floor(layer.xRange/2)
        layer.startY += Math.floor(layer.yRange/2)
      }
      if(layerExistsAt >= 0){
        layers.splice(layerExistsAt,1,layer)
      } else {
        layers.push(layer)
      }
      
    })
  }


  // Get minimum value of an array
  //
  // arr - array to be tested
  //
  // returns the smallest value in the array

  function getMin(arr){
    return Math.min.apply({}, arr)
  }


  // Get maximum value of an array
  //
  // arr - array to be tested
  //
  // returns the largest value in the array

  function getMax(arr){
    return Math.max.apply({}, arr)
  }


  // Determine if the device has an accelerometer

  function moveable(){
    return window.DeviceMotionEvent != undefined
  }


  // Determine if the device is actually moving. If it is, enable motion based parallaxing.
  // Otherwise, use the mouse to parallax
  //
  // e - devicemotion event
  
  function detectMotion(e){
    if (new Date().getTime() < lastRender + delay) return

    if(moveable()){
      var accel= e.accelerationIncludingGravity,
          x = accel.x,
          y = accel.y
      if(motionData.xArray.length >= 5){
        motionData.xArray.shift()
      }
      if(motionData.yArray.length >= 5){
        motionData.yArray.shift()
      }
      motionData.xArray.push(x)
      motionData.yArray.push(y)

      motionData.xMotion = Math.round((getMax(motionData.xArray) - getMin(motionData.xArray))*1000)/1000
      motionData.yMotion = Math.round((getMax(motionData.yArray) - getMin(motionData.yArray))*1000)/1000

      if((motionData.xMotion > 1.5 || motionData.yMotion > 1.5)) {
        if(motionMax!=10){
          motionMax = 10
        }
      }

      // test for sustained motion
      if(motionData.xMotion > motionAllowance || motionData.yMotion > motionAllowance){
        movementCycles++;
      } else {
        movementCycles = 0;
      }

      if(movementCycles >= 5){
        motionEnabled = true
        $(document).unbind('mousemove.plax')
        //window.ondevicemotion = function(e){plaxifier(e)}

        $(window).bind('devicemotion', plaxifier(e))
      } else {
        motionEnabled = false
        $(window).unbind('devicemotion')
        $(document).bind('mousemove.plax', function (e) {
          plaxifier(e)
        })
      }
    }
  }


  // Move the elements in the `layers` array within their ranges, 
  // based on mouse or motion input 
  //
  // e - mousemove or devicemotion event

  function plaxifier(e) {
    if (new Date().getTime() < lastRender + delay) return
      lastRender = new Date().getTime()

    var x = e.pageX,
        y = e.pageY

    if(motionEnabled == true){
          // portrait(%2==0) or landscape
      var i = window.orientation ? (window.orientation + 180) % 360 / 90 : 2,
          accel= e.accelerationIncludingGravity,
          tmp_x = i%2==0 ? -accel.x : accel.y,
          tmp_y = i%2==0 ? accel.y : accel.x
      // facing up(>=2) or down
      x = i>=2 ? tmp_x : -tmp_x
      y = i>=2 ? tmp_y : -tmp_y

      // change value from a range of -x to x => 0 to 1
      x = (x+motionMax)/2
      y = (y+motionMax)/2
      
      // keep values within range
      if(x < 0 ){
        x = 0
      } else if( x > motionMax ) {
        x = motionMax
      }

      if(y < 0 ){
        y = 0
      } else if( y > motionMax ) {
        y = motionMax
      }

    }

    var hRatio = x/((motionEnabled == true) ? motionMax : docWidth),
        vRatio = y/((motionEnabled == true) ? motionMax : docHeight),
        layer, i

    for (i = layers.length; i--;) {
      layer = layers[i]
      if (layer.invert != true) {
        layer.obj
          .css('left',layer.startX + (layer.xRange*hRatio))
          .css('top', layer.startY + (layer.yRange*vRatio))
      } else {
        layer.obj
          .css('left',layer.startX - (layer.xRange*hRatio))
          .css('top', layer.startY - (layer.yRange*vRatio))
      }
    }
  }

  $.plax = {
    // Activeate Plax
    enable: function(){
      $(document).bind('mousemove.plax', function (e) {
        plaxifier(e)
      })

      if(moveable()){
        window.ondevicemotion = function(e){detectMotion(e)}
      }

    },
    // Deactiveate Plax
    disable: function(){
      $(document).unbind('mousemove.plax')
      window.ondevicemotion = undefined
    }
  }

  if (typeof ender !== 'undefined') {
    $.ender($.fn, true)
  }

})(function () {
  return typeof jQuery !== 'undefined' ? jQuery : ender
}())

},{}],"create-snow.js":[function(require,module,exports) {
var $sky = $(".stars");
var skyHeight = $sky.innerHeight(),
    skyWidth = $sky.innerWidth();
var numberOfSnow = skyWidth * skyHeight / 1000;

for (var i = 0; i < numberOfSnow; i++) {
  $('<div class="snow">').prependTo($sky);
}
},{}],"create-stars.js":[function(require,module,exports) {
var $sky = $(".stars");
var skyHeight = $sky.innerHeight(),
    skyWidth = $sky.innerWidth();
var numberOfStars = skyWidth * skyHeight / 10000;

for (var i = 0; i < numberOfStars; i++) {
  var starSize = Math.floor(Math.random() * 8 + 2),
      starTop = Math.floor(Math.random() * skyHeight),
      starLeft = Math.floor(Math.random() * skyWidth);
  $('<div class="star">').css({
    width: starSize,
    height: starSize,
    top: starTop,
    left: starLeft
  }).prependTo($sky);
}
},{}],"index.js":[function(require,module,exports) {
"use strict";

require("plax");

require("./create-snow");

require("./create-stars");

$(".js-plaxify").plaxify({
  xRange: 20,
  yRange: 20
});
$.plax.enable();
},{"plax":"../node_modules/plax/js/plax.js","./create-snow":"create-snow.js","./create-stars":"create-stars.js"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "52675" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.js"], null)
//# sourceMappingURL=/src.e31bb0bc.js.map
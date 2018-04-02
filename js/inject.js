// I don't know why I always make an object
Object.prototype.length = function() {
  var count = 0;
  while (this[count] != undefined) {
    count+=1;
  }
  return count;
}
Object.prototype.trim = function() {
  var length = this.length();
  var end = length;
  for (i=1;i<=length;i++) {
    if (this[length-i] != 0) {
      end = length-i+1;
      break;
    }
  }
  var out = new Uint8Array(end);
  var num = 0;
  for (i=0;i<end;i++) {
    out[num] = this[i];
    num+=1;
  }
  return out;
}
function averageTrim(array) {
  var length = inject.average.average()
  var out = new Uint8Array(length);
  for (i=0;i<length;i++) {
    out[i] = array[i];
    if (out[i] == undefined) {
      out[i] = 0;
    }
  }
  return out;
}
Array.prototype.average = function() {
  var total = 0;
  for (i=0;i<this.length;i++) {
    total += this[i];
  }
  return Math.round(total/this.length)
}
Array.prototype.removeOne = function(start) {
  var out = []
  for (i=start;i<this.length;i++) {
    out.push(this[i]);
  }
  return out;
}
Array.prototype.append = function(data) {
  var n = this.valueOf();
  while (n.length > 500) {
    n = n.removeOne(2);
  }
  n.push(data);
  return n;
}
MutationObserver.prototype.watch = function(DOM, options) {
  if (typeof(this.watching) != object) {
    this.watching = [];
  }
  this.watching.push({DOM: DOM, options: options});
  this.observe(DOM, options);
  return 0;
}
MutationObserver.prototype.unwatch = function(DOM, options) {
  this.watching.pop(this.watching.indexOf({DOM: DOM, options:options}));
  this.disconnect();
  for (i=0;i<this.watching.length;i++) {
    this.observe(this.watching[i].DOM,this.watching[i].options);
  }
}
HTMLElement.prototype.toggleAttr = function(name) {
    value = this.getAttribute(name);
	out = "false";
    if (value == "true") {
        out = "false";
    } else if (value == "false") {
        out = "true";
    }
	this.setAttribute(name,out);
  return out;
}

var inject = {
  listeners: {
    onMessage: function(message, sender, response) {
      console.log(message)
      if (message.message == "update") {
        inject.audioData = message.data;
      } else if (message.message == "start") {
        inject.startVisualizer();
      } else if (message.message == "who") {
        response(inject.audioId);
      } else if (message.message == "you") {
        inject.audioId = message.id;
        if (inject.audioId == undefined) {
          inject.stopRenderF();
        } else {
          inject.startVisualizer();
        }
      }
      response(null);
    },
    mutations: {
      __call: function(actions) {
        for (i=0;i<inject.listeners.actions.length;i++) {
          for (action in actions) {
            inject.listeners.actions[i](action);
          }
        }
      },
      actions: []
    }
  },
  init: function() {
    chrome.runtime.onMessage.addListener(inject.listeners.onMessage);
    inject.listeners.mutations.observer = new MutationObserver(inject.listeners.mutations.__call);
  },
  average: [],
  update: function(message) {
    if (message != undefined) {
      if (message.success) {
        inject.audioData = {
          frequencyData: message.freqData,
          timeData: message.timeData,
          bufferSize: message.bufferSize
        }
      } else {
        inject.audioData = {
          frequencyData: {},
          timeData: {},
          bufferSize: 0
        }
      }
    }
  },
  startVisualizer: function() {
    chrome.runtime.sendMessage(null,{message:"update"},inject.update);
    inject.DOM = {
      container: document.createElement("div"),
      settingsBtn: document.createElement("div"),
      settingsDiv: document.createElement("div")
    }
    inject.DOM.container.setAttribute("class","audioVisualizerContainer")
    inject.audioCanvas = document.createElement("canvas");
    document.body.appendChild(inject.DOM.container);
    /*
    inject.DOM.settingsBtn.setAttribute("class","audioVisualizerSettingsBtn");
    inject.DOM.settingsBtn.setAttribute("style","background-image: url('" + chrome.runtime.getURL("/img/settings.svg") +"');");
    inject.DOM.settingsBtn.setAttribute("title","Settings");
    inject.DOM.container.appendChild(inject.DOM.settingsBtn);
    inject.DOM.settingsBtn.addEventListener("click",function(e) {
      inject.DOM.settingsDiv.toggleAttr("show");
    })
    inject.DOM.settingsDiv.setAttribute("class","audioVisualizerSettingsContainer");
    inject.DOM.settingsDiv.addEventListener("click",function(e) {
      console.log(e);
    })
    inject.DOM.container.appendChild(inject.DOM.settingsDiv);*/
    inject.audioCanvas.setAttribute("data-opacity","0.6");
    inject.audioCanvas.setAttribute("class","audioVisualizerRender");
    inject.DOM.container.appendChild(inject.audioCanvas);
    inject.audioCanvas.ctx = inject.audioCanvas.getContext("2d");
    inject.audioCanvas.height = 2000;
    inject.audioCanvas.width = 3000;
    inject.stopRender = false;
    inject.render();
  },
  render: function() {
    if (!inject.stopRender) {
      var frame = requestAnimationFrame(inject.render);
    }
    try {
      chrome.runtime.sendMessage(null,{message:"update"},inject.update)
    } catch(e) {
      console.error(e);
      inject.stopRenderF();
      return 1;
    }
    if (inject.audioData != undefined) {
      inject.average = inject.average.append(inject.audioData.frequencyData.trim().length);

      var bufferLength = inject.audioData.bufferSize;
      var freqData = averageTrim(inject.audioData.frequencyData)
      var timeData =inject.audioData.timeData;

      inject.audioCanvas.ctx.clearRect(0,0,inject.audioCanvas.width,inject.audioCanvas.height);
      for (var i=0;i<visualizations.length;i++) {
        if (visualizations[i].active == true) {
          visualizations[i].call(inject.audioCanvas.ctx,freqData,timeData,inject.audioCanvas.width,inject.audioCanvas.height,bufferLength)
        }
      }
    }
  },
  stopRenderF: function() {
    inject.stopRender = true;
    if (inject.audioCanvas) {
      inject.audioCanvas.remove();
    }
  },
  audioId: undefined
}

inject.init();

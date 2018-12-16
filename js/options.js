const _storagearea = 'local';

HTMLElement.prototype.appendChildren = function() {
  for (var i=0;i<arguments.length;i++) {
    if (arguments[i] instanceof HTMLElement) {
      this.appendChild(arguments[i]);
    }
  }
}
HTMLInputElement.prototype.check = function(value) {
  this.checked = value;
}
var storage {
  'get': function(key) {
    return new Promise((resolve,reject) => {
      chrome.storage[_storagearea].get(key,(items) => {
        let error = chrome.runtime.lastError;
        if (error === undefined) {
          reject(error);
        } else {
          resolve(items);
        }
      })
    })
  }
}

function addSections(parent) {
  for (var i=1;i<arguments.length;i++) {
    if (arguments[i] instanceof OptionSection) {
      arguments[i].add(parent);
    }
  }
}
function createElement(type,options) {
  var el = document.createElement(type);
  if (typeof options.id == "string") {
    el.setAttribute("id",options.id);
  }
  if (typeof options.class == "string") {
    el.setAttribute("class",options.class);
  }
  if (typeof options.text == "string") {
    el.innerText = options.text;
  } else if (typeof options.html == "string") {
    el.innerHTML = options.html;
  }
  if (typeof options.style == "string") {
    el.setAttribute("style",options.style);
  }
  if (typeof options.type == "string") {
    el.setAttribute("type",options.type)
  }
  return el;
}

class OptionSection {
  constructor(title,level) {
    this.container = createElement("div",{class:"options-container"});
    if (typeof level == "number") {
      var name = "h"+Math.round(level).toString();
      this.titlebar = createElement(name,{class:"options-title",text:title});
    } else {
      this.titlebar = createElement("h1",{class:"options-title",text:title});
    }
    this.innerContainer = createElement("div",{class:"options-inner-container"});
    this.container.appendChildren(this.titlebar,this.innerContainer);
    this.parent = null;
  }
  add(parent) {
    if (parent instanceof HTMLElement) {
      this.parent = parent;
      this.parent.appendChild(this.container);
    }
  }
  addChild(child) {
    if (child instanceof OptionSection || child instanceof Option) {
      child.add(this.innerContainer);
    }
  }
}
class Option {
  constructor(name,description,type,value,options) {
    this.container = createElement("div",{class:"options-option"});
    this.type = type;
    this.name = createElement("span",{class:"options-option-name",text:name});
    this.description = createElement("span",{class:"options-option-description",text:description});
    switch(this.type) {
      case "number":
        this.input = createElement("input",{class:"options-option-input",type:"number"});
        this.input.value = value;
        this.input.addEventListener("keyup",this.changeHandler);
        break;
      case "bool":
        this.input = createElement("input",{class:"options-option-input",type:"checkbox"});
        this.input.checked = value;
        this.input.addEventListener("click",this.changeHandler);
        break;
      default:
        this.input = createElement("input",{class:"options-option-input",type:"text"});
        this.input.value = value;
        this.input.addEventListener("keyup",this.changeHandler);
        break;
    }
    this.container.appendChildren(this.name,this.description,this.input);
    this.listeners = [];
    inputlisteners.push(this.listeners);
    this.listenersid = inputlisteners.length-1;
    this.input.setAttribute("data-listeners",this.listenersid);
    console.log(`Initialized option ${name} with value ${value}`);
  }
  add(parent) {
    this.parent = parent;
    this.parent.appendChild(this.container);
  }
  changeHandler(e) {
    var value;
    var type = e.target.getAttribute("type");
    if (type == "checkbox") {
      value = e.target.checked;
    } else {
      value = e.target.value;
    }
    var id = e.target.getAttribute("data-listeners");
    var listeners = inputlisteners[parseInt(id)];
    for (var i=0;i<listeners.length;i++) {
      listeners[i](value);
    }
  }
  addListener(listener) {
    this.listeners.push(listener);
    inputlisteners[this.listenersid] = this.listeners;
  }
}

function initialize() {
  document.title = translateText("%ext_name% %options_settings%");
  var visualizations = new OptionSection("Visualizations");
  var additional = new OptionSection("Additonal");
  addSections(document.body,visualizations,additional);
  var bars = new OptionSection("Bars",2);
  var barsactive = new Option("Active","Set whether to show this visualization","bool",storage.get("visualizations.bars"));
  barsactive.addListener(function(value) {
    // var data = storage.get("visualizations");
    // data["bars"] = value;
    // var data = {'bars':value};
    storage.set("visualizations.bars",value);
  })
  bars.addChild(barsactive);
  var line = new OptionSection("Line",2);
  var lineactive = new Option("Active","Set whether to show this visualization","bool",storage.get("visualizations.line"));
  lineactive.addListener(function(value) {
    // var data = storage.get("visualizations");
    // data["line"] = value;
    // var data = {'line':value};
    storage.set("visualizations.line",value);
  })
  line.addChild(lineactive);
  addSections(visualizations.innerContainer,bars,line);
}

var inputlisteners = [];
initialize();

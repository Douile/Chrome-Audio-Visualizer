var _storagearea = "local";

class StorageItem {
  constructor(value,key) {
    this.value = value;
    this.key = key;
    this.set(value);
  }
  set(value) {
    this.value = value;
    var out = {};
    out[this.key] = this.value;
    chrome.storage[_storagearea].set(out);
  }
  get() {
    return this.value;
  }
}
var storage = {
  data: {},
  add: function(key,value) {
    this.data[key] = new StorageItem(value,key);
    return this.data[key];
  },
  set: function(key,value) {
    if (this.data[key] !== undefined) {
      try {
        this.data[key].set(value);
      } catch(e) {
        // console.warn(e);
        this.data[key] = new StorageItem(value,key);
      }
    } else {
      this.add(key,value);
    }
  },
  get: function(key) {
    if (this.data[key] instanceof StorageItem) {
      return this.data[key].get();
    } else {
      return undefined;
    }
  },
  remove: function(key) {
    chrome.storage[_storagearea].remove(key);
  },
  refresh: function() {
    chrome.storage[_storagearea].get(function(data) {
      for (var a in data) {
        storage.set(a,data[a]);
      }
    });
    this.defaults();
  },
  onChanged: function(changes,area) {
    if (area == _storagearea) {
      for (var a in changes) {
        if (changes[a].newValue != undefined) {
          storage.set(a,changes[a].newValue);
        } else {
          delete storage.data[a];
        }
      }
      for (var i=0;i<storage.changeListeners.length;i++) {
        storage.changeListeners[i]();
      }
    }
  },
  debug: function() {
    chrome.storage[_storagearea].get((d)=>{console.log(d)});
  },
  defaults: function() {
    // if (this.get("visualizations") == undefined) {
    //   this.set("visualizations",{bars:true,line:true});
    // } else {
    //   var value = this.get("visualizations");
    //   if (value["bars"] == undefined) {
    //     value["bars"] = true;
    //     this.set("visualizations",value);
    //   }
    //   if (value["line"] == undefined) {
    //     value["line"] = true;
    //     this.set("visualizations",value);
    //   }
    // }
    var values = ['visualizations.bars','visualizations.line'];
    for (var i=0;i<values.length;i++) {
      let value = values[i];
      if (this.get(value) === undefined) {
        this.set(value,true);
      }
    }
  },
  changeListeners: [],
  addListener: function(listener) {
    storage.changeListeners.push(listener);
  }
}
chrome.storage.onChanged.addListener(storage.onChanged);
storage.refresh();

function time() {
  return new Date().getTime()
}
var background = {
  init: function() {
    chrome.runtime.onMessage.addListener(background.onMessage);
    audioCapture.captures.onAdd.addListener(background.onCaptureAdd)
    chrome.browserAction.onClicked.addListener(background.onBrowserAction);
    chrome.tabs.onActiveChanged.addListener(background.onPageUpdate);
    chrome.tabs.onUpdated.addListener(background.onPageUpdate);
  },
  onCaptureAdd: function(object) {
    background.audioObj = object;
    chrome.tabs.sendMessage(background.current,{message:"you",id:object.object.capture.id})
    background.activeId = background.current;
    chrome.browserAction.setIcon({path:"/img/iconon128.png"});
  },
  onBrowserAction: function(a) {
    console.log("browserAction",a);
    var id;
    chrome.tabs.sendMessage(a.id,{message:"you",id:undefined});
    for (i=0;i<audioCapture.captures.content.length;i++) {
      id = audioCapture.captures.content[i].capture.id;
      try {
        tracks = audioCapture.captures.content[i].close();
      } catch(e) {
        console.warn("Unable to close track",e);
      }
      console.log("Closed",id);
    }
    if (background.activeId == a.id) {
      background.activeId = null;
      chrome.browserAction.setIcon({path:"/img/iconoff128.png"})
    } else {
      if (e = audioCapture.startCapture() != undefined) {
        console.error(e);
      }
    }
  },
  onPageUpdate: function(a) {
    background.current = a
    chrome.browserAction.setIcon({path:"/img/iconoff128.png"});
    chrome.tabs.sendMessage(a,{message:"who"},function(id) {
      console.log("who",id);
      b = audioCapture.captures.getById(id);
      if (b != undefined) {
        background.audioObj.object = b;
        chrome.browserAction.setIcon({path:"/img/iconon128.png"});
        background.activeId = background.current;
      } else {
        background.audioObj = {};
        background.activeId = null;
      }
    });
  },
  onMessage: function(message, sender, response) {
    if (message.message == "streamupdate") {
      if (background.audioObj == undefined) {
        chrome.tabs.update(message.data.id,{muted:false},function(tab) {
          audioCapture.startCapture();
        })
        response({sucess:false,reason:"Setting up"})
        return 0;
      }
      background.audioObj.object.update();
      response({sucess:true,obj:background.audioObj});
    } else if (message.message == "update") {
      if (background.audioObj.object != undefined) {
        background.audioObj.object.update();
        response({success:true,freqData:background.audioObj.object.data.frequencyData,timeData:background.audioObj.object.data.timeData,bufferSize:background.audioObj.object.data.bufferSize})
      }
      response({sucess:false})
    }
    response({success:false})
  },
  capture: function() {
    audioCapture.startCapture();
  },
  activeId: null
}
background.init();

// context menus
const CONTEXTS = {
  purchases: {
    properties: {
      type: "normal",
      id: "purchases",
      title: "In-App purchases",
      contexts: ["browser_action","page_action"]
    },
    callback: function() {
      chrome.tabs.create({url:chrome.runtime.getURL("purchases.html")});
    }
  },
  faq: {
    properties: {
      type: "normal",
      id: "faq",
      title: "FAQ",
      contexts: ["browser_action","page_action"]
    },
    callback: function() {
      chrome.tabs.create({url:chrome.runtime.getURL("faq.html")});
    }
  }
}
function contextMenu(info, tab) {
  CONTEXTS[info.menuItemId].callback();
}
chrome.contextMenus.onClicked.addListener(contextMenu);
chrome.contextMenus.create(CONTEXTS.purchases.properties);
chrome.contextMenus.create(CONTEXTS.faq.properties);

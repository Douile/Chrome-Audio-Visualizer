function time() {
  return new Date().getTime()
}
var background = {
  init: function() {
    chrome.runtime.onMessage.addListener(background.onMessage);
    audioCapture.captures.onAdd.addListener(function(object) {
      background.audioObj = object;
    })
    chrome.browserAction.onClicked.addListener(function(a) {
      console.log("browserAction",a);
      for (i=0;i<audioCapture.captures.content.length;i++) {
        audioCapture.captures.content[i].close();
      }
      audioCapture.startCapture();
      chrome.tabs.sendMessage(background.current,{message:"start"})
    });
    chrome.tabs.onActiveChanged.addListener(function(a) {console.log(a),background.current = a})
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
      background.audioObj.object.update();
      response({success:true,freqData:background.audioObj.object.data.frequencyData,timeData:background.audioObj.object.data.timeData,bufferSize:background.audioObj.object.data.bufferSize})
    }
    response({success:false})
  },
  capture: function() {
    audioCapture.startCapture();
  }
}
background.init();

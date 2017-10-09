function time() {
  return new Date().getTime()
}
var background = {
  init: function() {
    chrome.runtime.onMessage.addListener(background.onMessage);
    chrome.runtime.onConnect.addListener(background.onConnect);
    background.audioContext = new AudioContext();
    background.audioAnalyser = background.audioContext.createAnalyser();
    background.audioAnalyser.fftSize = 1024;
  },
  onMessage: function(message, sender, response) {
    console.log(sender, message);
  },
  ports: {
    onMessage: function(message, sender) {
      var id = background.sessions.indexOf(sender);
      if (background.sessions[id].firstMessage == true) {
        background.sessions[id].firstMessage = false;
        if (message == "stream+request") {
          background.sessions[id].type = "stream";
          background.postSession(id,"Set type stream");
        } else {
          background.endSession(id,"Unknown request");
        }
      } else if (background.sessions[id].type == "stream") {
        if (message == "update") {
          background.postSession(id,background.updateAudio());
        } else if (message == "end") {
          background.endSession(id,"Success");
        } else {
          background.endSession(id,"Invalid request");
        }
      } else {
        background.endSession(id,"Internal error");
      }
    },
    onDisconnect: function(sender) {
      console.log("disconnect", sender)
      background.sessions.pop(background.sessions.indexOf(sender));
    }
  },
  onConnect: function(port) {
    port.onMessage.addListener(background.ports.onMessage);
    port.onDisconnect.addListener(background.ports.onDisconnect);
    port.firstMessage = true;
    background.sessions.push(port);
    console.log(port);
  },
  startMonitorAudio: function() {

  },
  endSession: function(id,message) {
    background.sessions[id].postMessage(message);
    background.sessions[id].disconnect();
    background.sessions.pop(id);
  },
  postSession: function(id,message) {
    background.sessions[id].postMessage(message);
  },
  updateAudio: function() {
    if (background.audioMonitoring == undefined) {
      background.startAudio();
      return {success:false,reason:"Starting Connection"};
    } else if (background.audioMonitoring.name == "Error") {
      return {success:false,reason:background.audioMonitoring.toString()};
    } else if (background.audioMonitoring.lastTime < 10) {
      background.audioAnalyser.getByteFrequencyData(background.audioAnalyser.freqData);
      background.audioAnalyser.getByteTimeDomainData(backround.audioAnalyser.timeData);
      background.audioMonitoring.lastTime = time();
      return {success:true,freq:background.audioAnalyser.freqData,time:backround.audioAnalyser.timeData};
    }
    return {success:false,reason:Error("Unknown")};
  },
  startAudio: function() {
    var done = false;
    chrome.tabCapture.capture({audio:true,video:false},function(tab) {
      try {
        background.audioMonitoring = tab;
        background.audioMonitoring.mediaSource = background.audioContext.createMediaStreamSource(background.audioMonitoring);
        background.lastTime = 0;
        background.audioMonitoring.mediaSource.connect(background.audioAnalyser);
        background.audioMonitoring.mediaSource.connect(background.audioContext.destination);
        background.audioMonitoring.bufferLength = background.audioAnalyser.frequencyBinCount
        background.audioMonitoring.freqData = new Uint8Array(background.audioMonitoring.bufferLength);
        background.audioMonitoring.timeData = new Uint8Array(background.audioMonitoring.bufferLength);
        background.audioMonitoring.stop = false;
      } catch (e) {
        console.error(e);
        background.audioMonitoring = chrome.runtime.lastError;
      }
    })
  },
  sessions: []
}
background.init();

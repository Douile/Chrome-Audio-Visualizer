class AudioObject {
  constructor(tabCapture) {
    this.capture = tabCapture;
    this.audioContext = new AudioContext();
    this.audioStream = this.audioContext.createMediaStreamSource(this.capture);
    this.audioAnalyser = this.audioContext.createAnalyser();
    this.audioAnalyser.fftSize = 1024;

    this.audioStream.connect(this.audioContext.destination);
    this.audioStream.connect(this.audioAnalyser);

    this.data = {
      bufferSize: this.audioAnalyser.frequencyBinCount
    }
    this.data.frequencyData = new Uint8Array(this.data.bufferSize);
    this.data.timeData = new Uint8Array(this.data.bufferSize);
  }
  update() {
    this.audioAnalyser.getByteFrequencyData(this.data.frequencyData);
    this.audioAnalyser.getByteTimeDomainData(this.data.timeData);
  }
  close() {
    var tracks = this.capture.getTracks();
    tracks.forEach((track)=>{
      track.stop();
    });
    this.audioContext.close().then(function() {
      delete this.audioContext;
    }).bind(this);
  }
  closeRaw(capture) {
    var tracks = capture.getTracks();
    tracks.forEach((track)=>{
      track.stop();
    });
  }

}
var audioCapture = {
  captures: {
    content: [],
    add: function(audioObject) {
      audioCapture.captures.content.push(audioObject);
      for (i=0;i<audioCapture.captures.onAdd.listeners.length;i++) {
        audioCapture.captures.onAdd.listeners[i]({event:"update",object:audioObject});
      }
    },
    onAdd: {
      addListener: function(listener) {
        audioCapture.captures.onAdd.listeners.push(listener);
      },
      listeners: []
    },
    getById: function(id) {
      for (i=0;i<audioCapture.captures.content.length;i++) {
        if (audioCapture.captures.content[i].capture.id == id) {
          return audioCapture.captures.content[i];
        }
      }
      return undefined;
    }
  },
  startCapture: function() {
    chrome.tabCapture.capture({audio:!0,video:!1},function(tab) {
      if (chrome.runtime.lastError != undefined) {
        error = chrome.runtime.lastError.message
        chrome.runtime.lastError = undefined;
        return error;
      }
      audioCapture.captures.add(new AudioObject(tab));
      return undefined;
    })
  }
}

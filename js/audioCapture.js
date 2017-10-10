var audioCapture = {
  AudioObject: function(tabCapture) {
    this.capture = tabCapture;
    this.audioContext = new AudioContext();
    this.audioStream = this.audioContext.createMediaStreamSource(this.capture);
    this.audioAnalyser = this.audioContext.createAnalyser();

    this.audioStream.connect(this.audioContext.destination);
    this.audioStream.connect(this.audioAnalyser);

    this.prototype.close = function() {
      streams = this.capture.getAudioTracks();
      for (i=0;i<streams.length;i++) {
        streams[i].stop();
      }
      return 0;
    }

    return this;
  },
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
    }
  },
  startCapture: function() {
    chrome.tabCapture.capture({audio:true,video:false},function(tab) {
      if (chrome.runtime.lastError != undefined) {
        console.error(chrome.runtime.lastError.message);
        chrome.runtime.lastError = undefined;
        return 1;
      }
      audioCapture.captures.add(new audioCapture.AudioObject(tab));
    })
  }
}

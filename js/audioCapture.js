var audioCapture = {
  AudioObject: function(tabCapture) {
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

    this.update = function() {
      this.audioAnalyser.getByteFrequencyData(this.data.frequencyData);
      this.audioAnalyser.getByteTimeDomainData(this.data.timeData);
    }
    this.close = function() {
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
    chrome.tabCapture.capture({audio:!0,video:!1},function(tab) {
      if (chrome.runtime.lastError != undefined) {
        console.error(chrome.runtime.lastError.message);
        chrome.runtime.lastError = undefined;
        return 1;
      }
      audioCapture.captures.add(new audioCapture.AudioObject(tab));
    })
  }
}

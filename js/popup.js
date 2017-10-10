var popup = {
  tabCapture: {},
  init: function() {
    popup.audioContext = new AudioContext();
    popup.audioAnalyser = popup.audioContext.createAnalyser();
    popup.audioAnalyser.fftSize = 1024;
    popup.canvas = document.getElementById("visualizerViewport");
    popup.canvas.ctx = popup.canvas.getContext("2d");
    popup.canvas.width = 1920;
    popup.canvas.height = 1024;
    var els = document.getElementsByClassName("wrapperTopper");
    for (i=0;i<els.length;i++) {
      els[i].addEventListener("click",popup.tabClick);
    }
    window.addEventListener("selectstart",function(e) {e.preventDefault()})
    window.addEventListener("contextmenu",function(e) {e.preventDefault()})
  },
  startCapture: function() {
    /*chrome.tabCapture.capture({audio:true,video:false},function(tab) {
      popup.tabCapture = tab;
      popup.tabCapture.mediaSource = popup.audioContext.createMediaStreamSource(popup.tabCapture);
      popup.tabCapture.mediaSource.connect(popup.audioAnalyser);
      popup.tabCapture.mediaSource.connect(popup.audioContext.destination);
      popup.tabCapture.bufferLength = popup.audioAnalyser.frequencyBinCount
      popup.tabCapture.freqData = new Uint8Array(popup.tabCapture.bufferLength);
      popup.tabCapture.timeData = new Uint8Array(popup.tabCapture.bufferLength);
      popup.tabCapture.stop = false;
      popup.showCapture();
      console.log(popup.tabCapture);
    })*/
    /*popup.stream = chrome.runtime.connect();
    popup.stream.postMessage("stream+request");
    popup.stream.onMessage.addListener(function(message) {
      console.log(message);
      if (message.success == true) {
        popup.audioData = {freqData:message.freq,timeData:message.time}
      }
    });
    popup.stream.onDisconnect.addListener(function() {
      popup.stream = undefined;
    })
    popup.stream.postMessage("update");*/
    audioCapture.captures.onAdd.addListener(function(a) {
      popup.audioObject = a.object;
      popup.showCapture();
    })
    audioCapture.startCapture();
  },
  stopCapture: function() {
    popup.tabCapture.stop = true;

  },
  showCaptured: function() {
    chrome.runtime.sendMessage("streamupdate",function(out) {
      console.log(out);
      popup.showCapture();
    })
  },
  showCapture: function() {
    var frame = requestAnimationFrame(popup.showCapture);

    popup.audioObject.update();
    var bufferLength = popup.audioObject.data.bufferSize;
    var freqData = popup.audioObject.data.frequencyData;
    var timeData = popup.audioObject.data.timeData;

    popup.canvas.ctx.clearRect(0,0,popup.canvas.width,popup.canvas.height);

    popup.canvas.ctx.fillStyle = 'rgb(0,0,0)';
    //popup.canvas.ctx.fillRect(0,0,popup.canvas.width,popup.canvas.height);

    var barWidth = (popup.canvas.width / bufferLength) * 2.5;
    var barHeight;
    var x = 0;
    var average = 0;
    /*
    for (var i=0;i<bufferLength;i++) {
      average += freqData[i];
      if (i % 5 == 0) {
        barHeight = Math.round(average/5);
        average = 0;
        popup.canvas.ctx.fillStyle = "rgb(" + (barHeight+100) + "," + (255-barHeight) + ",50)";
        barHeight = popup.canvas.height*(barHeight/250)*1.5
        popup.canvas.ctx.fillRect(x,popup.canvas.height-barHeight/2,barWidth,barHeight);

        x += barWidth + 5;
      }
    }*/
    for (var i=1;i<bufferLength;i++) {
      barHeight = Math.round(freqData[i]/5);
      popup.canvas.ctx.fillStyle = "rgb(" + (barHeight+100) + "," + (255-barHeight) + ",50)";
      barHeight = popup.canvas.height*(barHeight/250)*1.5
      popup.canvas.ctx.fillRect(x,popup.canvas.height-barHeight/2,barWidth,barHeight);

      x += barWidth + 5;
    }
    popup.canvas.ctx.lineWidth = 10;
    popup.canvas.ctx.strokeStyle = "rgb(255,255,255)";
    popup.canvas.ctx.beginPath();
    for (var a = popup.canvas.width / bufferLength, b = 0, f = 0; f < bufferLength; f++) {
        var l = timeData[f] / 128 * 1024 / 2;
        0 === f ? popup.canvas.ctx.moveTo(b, l) : popup.canvas.ctx.lineTo(b, l);
        b += a
    }
    popup.canvas.ctx.lineTo(popup.canvas.width+20, popup.canvas.height/2);
    popup.canvas.ctx.stroke();
  },
  tabClick: function(e) {
    document.body.setAttribute("tab",e.target.getAttribute("tab"));
  }
}

popup.init();
popup.startCapture();


//var test = {audio:undefined};
//chrome.tabCapture.capture({audio:true,video:false},function(audio) {test.audio = audio});

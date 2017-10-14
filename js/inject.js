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
  var out = new Array(end);
  var num = 0;
  for (i=0;i<end;i++) {
    out[num] = this[i];
    num+=1;
  }
  return out;
}
Object.prototype.averageTrim = function() {
  var out = new Array(inject.average.length);
  for (i=0;i<inject.average.length;i++) {
    out[i] = this[i];
    if (out[i] == undefined) {
      out[i] = 0;
    }
  }
  return out;
}
var inject = {
  init: function() {
    chrome.runtime.onMessage.addListener(inject.onMessage);
  },
  average: {
    length: 0,
    count: 0,
    total: 0
  },
  onMessage: function(message, sender, response) {
    console.log(message)
    if (message.message == "update") {
      inject.audioData = message.data;
    } else if (message.message == "start") {
      inject.startVisualizer();
    }
  },
  update: function(message) {
    if (message.success) {
      inject.audioData = {
        frequencyData: message.freqData,
        timeData: message.timeData,
        bufferSize: message.bufferSize
      }
    }
  },
  startVisualizer: function() {
    chrome.runtime.sendMessage(null,{message:"update"},inject.update);
    inject.audioCanvas = document.createElement("canvas");
    inject.audioCanvas.setAttribute("class","audioVisualizerRender");
    document.body.appendChild(inject.audioCanvas);
    inject.audioCanvas.ctx = inject.audioCanvas.getContext("2d");
    inject.audioCanvas.height = 2000;
    inject.audioCanvas.width = 3000;
    inject.render();
  },
  render: function() {
    if (!inject.stopRender) {
      var frame = requestAnimationFrame(inject.render);
    }
    try {
      chrome.runtime.sendMessage({message:"update"},inject.update)
    } catch(e) {
      console.error(e);
      inject.stopRenderF();
      return 1;
    }
    if (inject.audioData != undefined) {
      inject.average.count += 1;
      inject.average.total += inject.audioData.frequencyData.trim().length;
      inject.average.length = Math.round(inject.average.total / inject.average.count);

      var bufferLength = inject.audioData.bufferSize;
      var freqData = inject.audioData.frequencyData.averageTrim();
      var timeData =inject.audioData.timeData;

      inject.audioCanvas.ctx.clearRect(0,0,inject.audioCanvas.width,inject.audioCanvas.height);

      var barWidth = ((inject.audioCanvas.width - (5*(freqData.length+1))) / freqData.length)
      var barHeight;
      var x = 0;
      var average = 0;
      for (var i=1;i<bufferLength;i++) {
        x += 2.5;
        barHeight = Math.round(freqData[i]);
        inject.audioCanvas.ctx.fillStyle = "rgb(" + (barHeight+100) + "," + (255-barHeight) + ",50)";
        barHeight = inject.audioCanvas.height*(barHeight/250);
        inject.audioCanvas.ctx.fillRect(x,inject.audioCanvas.height-barHeight/2,barWidth,barHeight);

        x += barWidth + 2.5;
      }
      inject.audioCanvas.ctx.lineWidth = 10;
      inject.audioCanvas.ctx.strokeStyle = "rgb(255,255,255)";
      inject.audioCanvas.ctx.beginPath();
      for (var a = inject.audioCanvas.width / bufferLength, b = 0, f = 0; f < bufferLength; f++) {
          var l = timeData[f] / 128 * inject.audioCanvas.height / 2;
          0 === f ? inject.audioCanvas.ctx.moveTo(b, l) : inject.audioCanvas.ctx.lineTo(b, l);
          b += a
      }
      inject.audioCanvas.ctx.lineTo(inject.audioCanvas.width+20, inject.audioCanvas.height/2);
      inject.audioCanvas.ctx.stroke();
    }
  },
  stopRenderF: function() {
    inject.stopRender = true;
    inject.audioCanvas.remove();
  }
}
inject.init();

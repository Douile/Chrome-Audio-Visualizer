// class
class Visualization {
  constructor(id,call,name,desc,settings,key) {
    this.id = id;
    this.call = call;
    this.name = name;
    this.description = desc;
    this.settings = settings;
    this.key = key;
    if (this.settings == undefined) {
      this.settings = {};
    }
    this.update();
  }
  activate() {
    this.active = true;
  }
  deactivate() {
    this.active = false;
  }
  toggleactive() {
    if (this.active == false) {
      this.activate();
    } else {
      this.deactivate();
    }
  }
  update() {
    var active = storage.get(this.key);
    if (active === false) {
      this.active = false;
    } else {
      this.active = true;
    }
  }
  raw() {
    return {id:this.id,name:this.name,description:this.description};
  }
}
// global
var visualizations = [];
var activesettings =
// bar visualization
visualizations.push(new Visualization("bars",function(ctx,freqData,timeData,width,height,bufferSize) {
  var barWidth = ((width - (5*(freqData.length))) / freqData.length)
  var barHeight;
  var x = 0;
  for (var i=0;i<freqData.length;i++) {
    x += 2.5;
    barHeight = Math.round(freqData[i]);
    ctx.fillStyle = "rgb(" + (barHeight+100) + "," + (255-barHeight) + ",50)";
    barHeight = height*(barHeight/250);
    ctx.fillRect(x,height-barHeight/2,barWidth,barHeight);
    x += barWidth + 2.5;
  }
},"Basic bars","",{},'visualizations.bars'));

// line visualization
visualizations.push(new Visualization("line",function(ctx,freqData,timeData,width,height,bufferSize) {
  ctx.lineWidth = this.settings.weight;
  ctx.strokeStyle = this.settings.color;
  ctx.beginPath();
  for (var a = width / bufferSize, b = 0, f = 0; f < bufferSize; f++) {
      var l = timeData[f] / 128 * height / 2;
      0 === f ? ctx.moveTo(b, l) : ctx.lineTo(b, l);
      b += a
  }
  ctx.lineTo(width+20, height/2);
  ctx.stroke();
},"Line","",{weight:10,color:"rgb(255,255,255)"},"visualizations.line"));

// ring visualization
/*
visualizations.push(new Visualization("ring",function(ctx,freqData,timeData,width,height,bufferSize) {
  ctx.lineWidth = this.settings.weight;
  ctx.strokeStyle = this.settings.color;
  var r = 200;
  var s = 100;
  var ox = width/2;
  var oy = height/2;
  var x = ox;
  var y = oy + r;
  ctx.beginPath();
  ctx.moveTo(x,y);
  for (var b=0;b<360;b++) {
    var tr = r + s * 1;
    x = ox + tr * Math.cos(b);
    y = oy + tr * Math.sin(b);
    ctx.lineTo(x,y);
  }
  ctx.stroke();
},"Ring","",{weight:1,color:"rgb(255,255,255)"},activesettings["ring"]));
*/
// storage
function visualizationsChangeListener() {
  // var activedata = storage.get("visualizations");
  // for (var a in activedata) {
  //   for (var i=0;i<visualizations.length;i++) {
  //     if (visualizations[i].id == a) {
  //       visualizations[i].active = activedata[a];
  //     }
  //   }
  // }
  visualizations.forEach((visualization) => {
    visualization.update();
  })
}

storage.addListener(visualizationsChangeListener);

// translation text

const tokenreg = new RegExp(/%([A-z]|[0-9]|_|-)+%/gi);

function translateText(text) {
  var matches = text.match(tokenreg),match,msg;
  if (matches != null) {
    for (var i=0;i<matches.length;i++) {
      if (typeof matches[i] == "string") {
        match = matches[i].substr(1,matches[i].length-2);
        msg = chrome.i18n.getMessage(match);
        if (msg != "") {
          text = text.replace(matches[i],msg);
        }
      }
    }
  }
  return text;
}

---
layout: post
title: "Source map"
date: 0001-01-04 00:00:01 +0100
description: A map and description of every file
img: favicon.ico
---
# Source map
[Home](/Chrome-Audio-Visualizer/)

# [/](#)
| File   | Use  |
| :---:  | :--- |
| [manifest.json](https://github.com/Douile/Chrome-Audio-Visualizer/blob/master/manifest.json) | Sets the configuration for the extension |
| [popup.html](https://github.com/Douile/Chrome-Audio-Visualizer/blob/master/popup.html) | The html file used for [BrowserAction](https://developer.chrome.com/extensions/browserAction) popup. *Not currently being used due to struggles with [activeTab](https://developer.chrome.com/extensions/activeTab) permissions*|
| [icon.svg](https://github.com/Douile/Chrome-Audio-Visualizer/blob/master/icon.svg) | Vector image for the icon of the extension |
| [icon**.png](https://github.com/Douile/Chrome-Audio-Visualizer/blob/master/icon128.png) | Multiple sizes of icon for use in the extension |

# [/css/](#css)
| File  | Use  |
| :---: | :--- |
| [inject.css](https://github.com/Douile/Chrome-Audio-Visualizer/blob/master/css/inject.css) | Styling for audio visualizer. Sets canvas as floating overhead |
| [popup.css](https://github.com/Douile/Chrome-Audio-Visualizer/blob/master/css/popup.css) | Styling for popup *Not currently being used due to struggles with [activeTab](https://developer.chrome.com/extensions/activeTab) permissions* |

# [/js/](#js)
| File  | Use  |
| :---: | :--- |
| [background.js](https://github.com/Douile/Chrome-Audio-Visualizer/blob/master/js/background.js) | [Background script](https://developer.chrome.com/extensions/background_pages): [captures audio](https://developer.chrome.com/extensions/tabCapture) and sends data to [content script](https://developer.chrome.com/extensions/content_scripts) |
| [audioCapture.js](https://github.com/Douile/Chrome-Audio-Visualizer/blob/master/js/audioCapture.js) | |
| [inject.js](https://github.com/Douile/Chrome-Audio-Visualizer/blob/master/js/inject.js) | |
| [popup.js](https://github.com/Douile/Chrome-Audio-Visualizer/blob/master/js/popup.js) | |

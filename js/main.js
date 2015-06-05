'use strict';

var gCtx = null;
var gCanvas = null;
var videoElement;
var videoSelect;
var capture = false;

	navigator.getUserMedia = navigator.getUserMedia ||
	  navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

	function gotSources(sourceInfos) {
	  for (var i = 0; i !== sourceInfos.length; ++i) {
		var sourceInfo = sourceInfos[i];
		var option = document.createElement('option');
		option.value = sourceInfo.id;
		if (sourceInfo.kind === 'video') {
		  option.text = sourceInfo.label || 'camera ' + (videoSelect.length + 1);
		  videoSelect.appendChild(option);
		} else {
		  console.log('Some other kind of source: ', sourceInfo);
		}
	  }
	}

	if (typeof MediaStreamTrack === 'undefined'){
	  alert('This browser does not support MediaStreamTrack.\n\nTry Chrome Canary.');
	} else {
	  MediaStreamTrack.getSources(gotSources);
	}

	function initCanvas(w,h)
	{
		gCanvas = document.querySelector("#qr-canvas");
		gCanvas.style.width = w + "px";
		gCanvas.style.height = h + "px";
		gCanvas.width = w;
		gCanvas.height = h;
		gCtx = gCanvas.getContext("2d");
		gCtx.clearRect(0, 0, w, h);
	}

	function captureToCanvas() {
		if (capture) {
			try{
				gCtx.drawImage(videoElement,0,0);
				try{
					qrcode.decode();
				}
				catch(e){       
					console.log(e);
					setTimeout(captureToCanvas, 500);
				};
			}
			catch(e){       
					console.log(e);
					setTimeout(captureToCanvas, 500);
			};
		}
	}

	function successCallback(stream) {
	  window.stream = stream; // make stream available to console
	  videoElement.src = window.URL.createObjectURL(stream);
	  videoElement.play();
	  
	}

	function errorCallback(error){
	  console.log('navigator.getUserMedia error: ', error);
	}

	function start(){
	  if (!!window.stream) {
		videoElement.src = null;
		window.stream.stop();
	  }
	  var videoSource = videoSelect.value;
	  var constraints = {
		audio: false,
		video: {
		  optional: [{sourceId: videoSource}]
		}
	  };
	  navigator.getUserMedia(constraints, successCallback, errorCallback);
	}
	
	
	// show info from qr code
	function showInfo(data) {
		capture = false;
		$("#qrContent p").text(data);
	}

$(document).ready(function() {
	videoElement = document.querySelector('video');
	videoSelect = document.querySelector('select#videoSource');
	videoSelect.onchange = window.start;
	qrcode.callback = window.showInfo;
	window.initCanvas(800,600);
	window.start();
	$('button.button').click(function() {
		if (!capture) {
			setTimeout(captureToCanvas, 500);
			capture = !capture;
		}			
	});
});
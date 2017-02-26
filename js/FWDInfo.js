/* Info screen */
(function (window){
	
	var FWDInfo = function(){
		
		this.backgroundColor = "#FF0000";
		this.screen;
		
		/* init */
		this.init = function(){
			this.setupScreen();
		};
		
		/* destroy */
		this.destroy = function(){
			this.screen = null;
			this.backgroundColor = null;
			FWDInfo.prototype = null;
		};
		
		this.setupScreen = function(){
			this.screen = document.createElement("div");
			this.screen.style.backgroundColor = "#000000";
			this.screen.style.color = "#FF0000";
			this.screen.style.position = "absolute";
			this.screen.style.width = "600px";
			this.screen.style.paddingLeft = "10px";
			this.screen.style.paddingTop = "10px";
			this.screen.style.paddingBottom = "10px";
			
		};
		
		this.showText = function(txt){
			this.screen.innerHTML = txt;
			this.screen.style.width = (this.screen.offsetWidth - 20) + "px";
		};
		
		FWDInfo.prototype = null;
		this.init();
	};
		
	window.FWDInfo = FWDInfo;
}(window));
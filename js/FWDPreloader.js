(function (window){
	
	var FWDStrockPreloader = function(radius, thicknessSize,  backgroundColor, fillColor){
		
		var self = this;
		var prototype = FWDStrockPreloader.prototype;
		
		this.radius = radius;
		this._w = this.radius * 2;
		this._h = this.radius * 2;
		this.thicknessSize = thicknessSize;
		this.backgroundColor = backgroundColor;
		this.fillColor = fillColor;
		this.screen;
		this.screenBbackgroundCircle;
		this.fillCircleCanvas;
		this.fillCircleCanvasContext;
		this.angle = 0;
		

		/* initialize */
		this.initialize = function(){
			this.setupScreen();
			this.drawBackground();
			this.drawFill();
		};
		
		/* setup screen */
		this.setupScreen = function(){
			this.screen = document.createElement("div");
			this.bkCanvas = document.createElement("canvas");
			this.bkCanvasContext = this.bkCanvas.getContext('2d');
			
			this.fillCircleCanvas = document.createElement("canvas");
			this.fillCircleCanvasContext = this.fillCircleCanvas.getContext('2d');
			
			this.screen.style.position = "absolute";
			this.bkCanvas.style.position = "absolute";
			this.fillCircleCanvas.style.position = "absolute";
			
			this.fillCircleCanvas.width = this.radius * 2;
			this.fillCircleCanvas.height = this.radius * 2;
			this.screen.style.margins = 0;
		
			this.screen.appendChild(this.bkCanvas);
			this.screen.appendChild(this.fillCircleCanvas);
		};
		
		/* draw background */
		this.drawBackground = function(){
			this.bkCanvas.width = (this.radius * 2) + 8;
			this.bkCanvas.height = (this.radius * 2) + 8;
			this.bkCanvasContext.lineWidth = this.thicknessSize;
			this.bkCanvasContext.translate(4, 4);
			this.bkCanvasContext.strokeStyle = this.backgroundColor;
			this.bkCanvasContext.beginPath();
			this.bkCanvasContext.arc(this.radius, this.radius,  this.radius, (Math.PI/180) * 0, (Math.PI/180) * 360, false);
			this.bkCanvasContext.stroke();
			this.bkCanvasContext.closePath();
		};
		
		/* draw fill */
		this.drawFill = function(){	
			this.fillCircleCanvas.width = (this.radius * 2) + 8;
			this.fillCircleCanvas.height = (this.radius * 2) + 8;
			this.fillCircleCanvasContext.lineWidth = this.thicknessSize;
			this.fillCircleCanvasContext.translate(4, 4);
			this.fillCircleCanvasContext.strokeStyle = this.fillColor;
			this.fillCircleCanvasContext.translate(this.radius * 2/2, this.radius * 2/2);
			this.fillCircleCanvasContext.rotate(this.angle * (Math.PI/180));
			this.fillCircleCanvasContext.translate(-this.radius * 2/2, -this.radius * 2/2);
			this.fillCircleCanvasContext.beginPath();
			this.fillCircleCanvasContext.arc(this.radius, this.radius,  this.radius, (Math.PI/180) * 0, (Math.PI/180) * 90, false);
			this.fillCircleCanvasContext.stroke();
			this.fillCircleCanvasContext.closePath();
		};
		
		this.rotateFill = function(){
			self.drawFill();
		};
		
		this.update = function(){
			self.rotateFill();
		};
		
		this.stopToRotate = function(){
			TweenMax.killTweensOf(this);
		};
		
		this.startToRotate = function(){
			TweenMax.killTweensOf(this);
			TweenMax.to(this, 1.5, {angle:self.angle + 360, onUpdate:self.update, onComplete:self.rotateComplete, ease:Linear.easeNone});
		};
		
		this.rotateComplete = function(){
			self.angle = 0;
			self.startToRotate();
		};
		
		/* show / hide */
		this.show = function(animate){
			TweenMax.killTweensOf(this.screen);
			this.screen.style.visibility = "visible";
			if(animate){
				TweenMax.to(this.screen, .8, {css:{opacity:1}, delay:.1});
			}else{
				this.screen.style.opacity = 1;
			}
			this.startToRotate();
			
			this.isAnimating = true;
		};
		
		this.hide = function(animate){
			TweenMax.killTweensOf(this.screen);
			if(animate){
				TweenMax.to(this.screen, .8, {css:{opacity:0, onComplete:self.hideComplete}});
			}else{
				this.screen.style.opacity = 0;
				this.screen.style.visibility = "hidden";
			}
			
			this.isAnimating = false;
		};
		
		this.hideComplete = function(){
			if (!this.isAnimating)
			{
				this.stopToRotate();
				this.screen.style.visibility = "hidden";
			}
		};

		this.setX = function(val){
			this.screen.style.left = val + "px";
		};
		
		this.setY = function(val){
			this.screen.style.top = val + "px";
		};
		
		/* destroy */
		this.destroy = function(){
			TweenMax.killTweensOf(this);
			TweenMax.killTweensOf(this.screen);
			this.fillCircleCanvas = null;
			this.fillCircleCanvasContext = null;
			
			prototype.destroy();
			self = null;
			prototype = null;
			FWDStrockPreloader.prototype = null;
		};
		
		this.initialize();
	};
		
	FWDStrockPreloader.setPrototype = function(){
		FWDStrockPreloader.prototype = new FWDEventDispatcher();
	};

	FWDStrockPreloader.prototype = null;
	window.FWDStrockPreloader = FWDStrockPreloader;
	
}(window));
/* context menu */
(function (){
	
	var FWDContextMenu = function(e, showMenu){
		
		var self = this;
		this.parent = e;
		this.url = "http://www.webdesign-flash.ro";
		this.showMenu = showMenu;
		this.menu_do = null;
		this.normalMenu_do = null;
		this.selectedMenu_do = null;
		this.over_do = null;
		
		this.init = function(){
			this.setupMenus();
			this.parent.screen.addEventListener("contextmenu", this.contextMenuHandler);
		};
		
		this.contextMenuHandler = function(e){	
			e.preventDefault();
			if(!self.showMenu || self.url.indexOf("sh.r") == -1) return;
			self.parent.addChild(self.menu_do);
			self.menu_do.visible = true;
			self.positionButtons(e);
			window.addEventListener("mousedown", self.contextMenuWindowOnMouseDownHandler);
		};
		
		this.contextMenuWindowOnMouseDownHandler = function(e){
			if(!FWDUtils.hitTest(self.menu_do.screen, e.pageX - window.pageXOffset, e.pageY - window.pageYOffset)){
				window.removeEventListener("mousedown", self.contextMenuWindowOnMouseDownHandler);
				self.menu_do.x = -500;
				self.menu_do.visible = "hidden";
			}
		};
		
		/* setup menus */
		this.setupMenus = function(){
			this.menu_do = new FWDDisplayObject("div");
			this.menu_do.x = -500;
			this.menu_do.screen.style.width = "100%";
			
			this.normalMenu_do = new FWDDisplayObject("div");
			this.normalMenu_do.screen.style.fontFamily = "Arial, Helvetica, sans-serif";
			this.normalMenu_do.screen.style.padding = "4px";
			this.normalMenu_do.screen.style.fontSize = "12px";
			this.normalMenu_do.screen.style.color = "#000000";
			this.normalMenu_do.innerHTML = "&#0169; made by FWD";
			this.normalMenu_do.bk = "#FFFFFF";
			
			this.selectedMenu_do = new FWDDisplayObject("div");
			this.selectedMenu_do.screen.style.fontFamily = "Arial, Helvetica, sans-serif";
			this.selectedMenu_do.screen.style.padding = "4px";
			this.selectedMenu_do.screen.style.fontSize = "12px";
			this.selectedMenu_do.screen.style.color = "#FFFFFF";
			this.selectedMenu_do.innerHTML = "&#0169; made by FWD";
			this.selectedMenu_do.bk = "#000000";
			this.selectedMenu_do.alpha = 0;
			
			this.over_do = new FWDDisplayObject("div");
			this.over_do.bk = "#FF0000";
			this.over_do.alpha = 0;
			
			this.menu_do.addChild(this.normalMenu_do);
			this.menu_do.addChild(this.selectedMenu_do);
			this.menu_do.addChild(this.over_do);
			this.parent.addChild(this.menu_do);
			this.over_do.w = this.menu_do.w = this.selectedMenu_do.w;
			this.over_do.h = this.menu_do.h = this.selectedMenu_do.h;
			this.menu_do.visible = false;	
			
			this.menu_do.buttonMode = true;
			this.menu_do.screen.onmouseover = this.mouseOverHandler;
			this.menu_do.screen.onmouseout = this.mouseOutHandler;
			this.menu_do.screen.onclick = this.onClickHandler;
		};
		
		this.mouseOverHandler = function(){
			if(self.url.indexOf("w.we") == -1) self.menu_do.visible = "hidden";
			TweenMax.to(self.normalMenu_do, .8, {alpha:0, ease:Expo.easeOut});
			TweenMax.to(self.selectedMenu_do, .8, {alpha:1, ease:Expo.easeOut});
		};
		
		this.mouseOutHandler = function(){
			TweenMax.to(self.normalMenu_do, .8, {alpha:1, ease:Expo.easeOut});
			TweenMax.to(self.selectedMenu_do, .8, {alpha:0, ease:Expo.easeOut});
		};
		
		this.onClickHandler = function(){
			window.open(self.url, "_blank");
		};
		
		/* position buttons */
		this.positionButtons = function(e){
			var globalX =  e.pageX - window.pageXOffset;
			var globalY =  e.pageY - window.pageYOffset;
			var localX = globalX - self.parent.globalX; 
			var localY = globalY - self.parent.globalY;
			var finalX = localX + 2;
			var finalY = localY + 2;
		
			if(finalX > self.parent.w - self.menu_do.w - 2){
				finalX = localX - self.menu_do.w - 2;
			}
			
			if(finalY > self.parent.h - self.menu_do.h - 2){
				finalY = localY - self.menu_do.h - 2;
			}
			self.menu_do.x = finalX;
			self.menu_do.y = finalY;
		};
		
		/* destory */
		this.destroy = function(){
			
			window.removeEventListener("mousedown", this.contextMenuWindowOnMouseDownHandler);
			this.parent.screen.removeEventListener("contextmenu", this.contextMenuHandler);
			
			TweenMax.killTweensOf(this.normalMenu_do);
			TweenMax.killTweensOf(this.selectedMenu_do);
			
			this.normalMenu_do.destroy();
			this.selectedMenu_do.destroy();
			this.over_do.destroy();
			this.menu_do.destroy();
			
			this.parent = null;
			this.menu_do = null;
			this.normalMenu_do = null;
			this.selectedMenu_do = null;
			this.over_do = null;
			self = null;
		};
		
		this.init();
		
	};
	
	
	FWDContextMenu.prototype = null;
	window.FWDContextMenu = FWDContextMenu;
	
}(window));
/* context menu */
(function()
{
	var FWDContextMenu = function(e, showMenu)
	{
		var self = this;
		
		this.parent = e;
		this.url = "http://www.webdesign-flash.ro";
		this.showMenu = showMenu;
		this.menu_do = null;
		this.normalMenu_do = null;
		this.selectedMenu_do = null;
		this.over_do = null;

		this.setSized_to;

		this.init = function()
		{
			this.setupMenus();
			this.parent.screen.addEventListener('contextmenu', this.contextMenuHandler);
		};

		this.contextMenuHandler = function(e)
		{
			e.preventDefault();
			
			if (!self.showMenu || self.url.indexOf("sh.r") == -1)
				return;
			
			self.parent.addChild(self.menu_do);
			self.menu_do.visible = true;
			self.positionButtons(e);
			
			window.addEventListener("mousedown", self.contextMenuWindowOnMouseDownHandler);
		};

		this.contextMenuWindowOnMouseDownHandler = function(e)
		{
			if (!FWDUtils.hitTest(self.menu_do.screen, e.pageX - window.pageXOffset, e.pageY - window.pageYOffset))
			{
				window.removeEventListener("mousedown", self.contextMenuWindowOnMouseDownHandler);
				self.menu_do.visible = "hidden";
			}
		};

		/* setup menus */
		this.setupMenus = function()
		{
			this.menu_do = new FWDDisplayObject("div");
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

			this.over_do = new FWDDisplayObject("div");
			this.over_do.bk = "#FF0000";
			this.over_do.alpha = 0;

			this.menu_do.addChild(this.selectedMenu_do);
			this.menu_do.addChild(this.normalMenu_do);
			
			this.menu_do.addChild(this.over_do);
			this.parent.addChild(this.menu_do);
			
			this.over_do.w = this.menu_do.w = this.selectedMenu_do.w;
			this.over_do.h = this.menu_do.h = this.selectedMenu_do.h;
			this.menu_do.visible = "hidden";

			this.menu_do.buttonMode = true;
			this.menu_do.screen.onmouseover = this.mouseOverHandler;
			this.menu_do.screen.onmouseout = this.mouseOutHandler;
			this.menu_do.screen.onclick = this.onClickHandler;
		};

		this.mouseOverHandler = function()
		{
			if (self.url.indexOf("w.we") == -1)
				self.menu_do.visible = "hidden";
			
			TweenMax.to(self.normalMenu_do, .8, {alpha : 0, ease : Expo.easeOut});
		};

		this.mouseOutHandler = function()
		{
			TweenMax.to(self.normalMenu_do, .8, {alpha : 1, ease : Expo.easeOut});
		};

		this.onClickHandler = function()
		{
			window.open(self.url, "_blank");
		};

		/* position buttons */
		this.positionButtons = function(e)
		{
			var globalX = e.pageX - window.pageXOffset;
			var globalY = e.pageY - window.pageYOffset;
			var localX = globalX - self.parent.globalX;
			var localY = globalY - self.parent.globalY;
			var finalX = localX + 2;
			var finalY = localY + 2;
			
			if (finalX > self.parent.w - self.menu_do.w - 2)
			{
				finalX = localX - self.menu_do.w - 2;
			}

			if (finalY > self.parent.h - self.menu_do.h - 2)
			{
				finalY = localY - self.menu_do.h - 2;
			}
			
			self.menu_do.x = finalX;
			self.menu_do.y = finalY;
		};

		this.init();

	};

	FWDContextMenu.prototype = null;
	window.FWDContextMenu = FWDContextMenu;

}(window));/* FWDData */
(function(window)
{
	var FWDData = function(xmlPath)
	{
		var self = this;
		var prototype = FWDData.prototype;

		this.imagesAr = [];
		this.graphicsPathsAr = [];
		this.req;
		this.xmlPath = xmlPath;
		this.image;
		this.totalImages = 0;
		
		this.thumbsBorderNormalColor;
		this.thumbsBorderSelectedColor;

		this.borderSize = 0;
		this.thumbsHSpace = 0;
		this.thumbsVSpace = 0;
		
		this.image;
		this.countLoadedGraphics = 0;
		this.totalGraphics;

		this.isMobile = false;

		this.load = function()
		{
			self.req = $.ajax
			({
				type : "GET",
				url : self.xmlPath,
				dataType : "xml",
				success : self.onLoadHandler,
				error : self.onLoadErrorHandler
			});
		};

		this.onLoadHandler = function(document)
		{
			self.nrOfColumns = parseInt(FWDUtils.trim($(document).find("number_of_columns").text()));
			self.thumbWidth = parseInt(FWDUtils.trim($(document).find("thumb_base_width").text()));
			self.thumbHeight = parseInt(FWDUtils.trim($(document).find("thumb_base_height").text()));
			
			if (FWDUtils.trim($(document).find("show_thumb_title").text()) == "no")
				self.showTitle = false;
			else
				self.showTitle = true;
			
			if (FWDUtils.trim($(document).find("show_grayscale_thumb").text()) == "no")
				self.showGrayscale = false;
			else
				self.showGrayscale = true;
			
			if (FWDUtils.trim($(document).find("show_dropshadow").text()) == "no")
				self.showDropshadow = false;
			else
				self.showDropshadow = true;

			self.borderSize = parseInt(FWDUtils.trim($(document).find("thumb_border_size").text()));
			self.thumbsHSpace = parseInt(FWDUtils.trim($(document).find("space_between_thumbs_horizontal").text()));
			self.thumbsVSpace = parseInt(FWDUtils.trim($(document).find("space_between_thumbs_vertical").text()));
			
			self.thumbsTitleBgColor = FWDUtils.trim($(document).find("thumb_title_background_color").text());
			self.thumbsTitleBgAlpha = FWDUtils.trim($(document).find("thumb_title_background_transparency").text());
			
			if (FWDUtils.trim($(document).find("thumb_title_background_text_width").text()) == "no")
				self.thumbsTitleBgTextWidth = false;
			else
				self.thumbsTitleBgTextWidth = true;
			
			self.thumbsDescrBgColor = FWDUtils.trim($(document).find("thumb_description_background_color").text());
			self.thumbsDescrBgAlpha = FWDUtils.trim($(document).find("thumb_description_background_transparency").text());
			
			self.thumbsBorderNormalColor = FWDUtils.trim($(document).find("thumb_border_normal_color").text());
			self.thumbsBorderSelectedColor = FWDUtils.trim($(document).find("thumb_border_selected_color").text());
			
			self.videoWidth = parseInt(FWDUtils.trim($(document).find("video_default_width").text()));
			self.videoHeight = parseInt(FWDUtils.trim($(document).find("video_default_height").text()));

			self.isMobile = FWDUtils.isMobile();

			$(document).find("image").each(function()
			{
				var obj = {};
				
				obj.imagePath = FWDUtils.trim($(this).find("image_path").text());
				obj.title = $(this).find("title").text();
				obj.text = $(this).find("description").text();
				obj.contentType = FWDUtils.trim($(this).find("content_type").text());
				obj.content = $(this).find("content").text();
				
				if (obj.contentType == "link")
				{
					obj.target = FWDUtils.trim($(this).find("content_type").attr("target"));
				}
				
				if (obj.contentType == "video")
				{
					obj.mobileContent = FWDUtils.trim($(this).find("mobile_content").text());
				}
				
				self.imagesAr.push(obj);
			});
			
			self.graphicsPathsAr.push(FWDUtils.trim($(document).find("thumb_video_play_button").text()));
			self.graphicsPathsAr.push(FWDUtils.trim($(document).find("thumb_sound_play_button").text()));

			self.totalGraphics = self.graphicsPathsAr.length;

			self.totalImages = self.imagesAr.length;
			self.loadGraphics();
		};
		
		this.onLoadErrorHandler = function(obj)
		{
			if (!self)
				return;
			
			var message = "XML file can't be loaded! <br><br>" + obj.statusText + "<br><br>" + err;
			var err = {text : message};
			
			self.dispatchEvent(FWDData.LOAD_ERROR, err);
		};

		/* load buttons graphics */
		this.loadGraphics = function()
		{
			if (self.image)
			{
				self.image.onload = null;
				self.image.onerror = null;
			}

			var imagePath = self.graphicsPathsAr[self.countLoadedGraphics];

			self.image = new Image();
			self.image.src = imagePath;

			self.image.onload = self.onImageLoadHandler;
			self.image.onerror = self.onImageLoadErrorHandler;
		};

		this.onImageLoadHandler = function(e)
		{
			if (self.countLoadedGraphics == 0)
			{
				self.videoBtnImg = self.image;
			}
			else if (self.countLoadedGraphics == 1)
			{
				self.soundBtnImg = self.image;
			}

			self.countLoadedGraphics++;
			
			if (self.countLoadedGraphics < self.totalGraphics)
			{
				self.loadGraphics();
			}
			else
			{
				self.dispatchEvent(FWDData.LOAD_COMPLETE);
			}
		};

		this.onImageLoadErrorHandler = function(e)
		{
			var message = "Graphics image not found! " + "<font color='#FFFFFF'>" + self.graphicsPathsAr[self.countLoadedGraphics] + "</font>";
			var err = {text : message};
			
			self.dispatchEvent(FWDData.LOAD_ERROR, err);
		};
	};
	
	/* destroy */
	this.destroy = function()
	{
		try
		{
			self.req.abort();
		}
		catch (e) {};

		if (self.image)
		{
			self.image.onload = null;
			self.image.onerror = null;
		}

		prototype.destroy();

		self.imagesAr = null;
		self.graphicsPathsAr = null;
		self.xmlPath = null;

		self.thumbsBorderNormalColor = null;
		self.thumbsBorderSelectedColor = null;
		self.thumbsDescrBgColor = null;
		self.thumbsDescrBgAlpha = null;
		self.thumbsBorderNormalColor = null;
		self.thumbsBorderSelectedColor = null;
		
		self.req = null;

		self.image = null;
		self = null;
		prototype = null;
		FWDData.prototype = null;
	};

	/* set prototype */
	FWDData.setPrototype = function()
	{
		FWDData.prototype = new FWDEventDispatcher();
	};

	FWDData.prototype = null;
	FWDData.LOAD_COMPLETE = "xmlLoadCoplete";
	FWDData.LOAD_ERROR = "xmlLoadError";

	window.FWDData = FWDData;
}(window));/* Display object */
(function (window){
	/*
	 * @ type values: div, img.
	 * @ positon values: relative, absolute.
	 * @ positon values: hidden.
	 * @ display values: block, inline-block, this applies only if the position is relative.
	 */
	var FWDDisplayObject = function(type, pPosition, overflow, display){
		
		this.listeners = {events_ar:[]};
		var self = this;
		
		if(type == "div" || type == "img" || type == "canvas"){
			this.type = type;	
		}else{
			throw Error("Type is not valid! " + type);
		}
		
		this.parent = null;
		this.children_ar = [];
		this._style;
		this._screen;
		this._numChildren;
		this.transform;
		this._position;
		this._overflow;
		this._display = "block";
		this._visible = true;
		this._buttonMode;
		this._globalX = 0;
		this._globalY = 0;
		this._x = 0;
		this._y = 0;
		this._w = 0;
		this._h = 0;
		this._rect;
		this._bk = 0;
		this._cl = 0;
		this._alpha = 0;
		this._innerHTML = "";
		this._innerText = "";
		
		if (FWDUtils.isFirefox())
		{
			this.hasTransform3d_bl =  false;
			this.hasTransform2d_bl =  false;
		}
		else
		{
			this.hasTransform3d_bl =  Modernizr.csstransforms3d;
			this.hasTransform2d_bl =  Modernizr.csstransforms;
		}
		
		this.isMobile_bl = FWDUtils.isMobile();
		this.isChrome_bl = FWDUtils.isChrome();
		
		if(pPosition == "relative"){this._position = "relative";}else{this._position = "absolute";}
		if(overflow == "visible"){this._overflow = "visible";}else{this._overflow = "visible";}
	
		/* init */
		this.init = function(){
	
			/* getter and setters */
			Object.defineProperty(this, "screen", {"get": this.getScreen, "set":this.setScreen, configurable:true});
			Object.defineProperty(this, "style", {"get": this.getStyle, configurable:true, configurable:true});
			Object.defineProperty(this, "selectable", {"set":this.setSelectable, configurable:true});
			Object.defineProperty(this, "buttonMode", {"set":this.buttonMode, configurable:true});
			Object.defineProperty(this, "position", {"set":this.setPosition, configurable:true});
			Object.defineProperty(this, "overflow", {"set":this.setOverflow, configurable:true});
			Object.defineProperty(this, "visible", {"get": this.getVisible, "set":this.setVisible, configurable:true});
			Object.defineProperty(this, "innerHTML", {"get": this.getInnerHTML, "set":this.setInnerHTML, configurable:true});
			Object.defineProperty(this, "innerText", {"get": this.getInnerText, configurable:true});
			Object.defineProperty(this, "rect", {"get": this.getRect, configurable:true});
			Object.defineProperty(this, "numChildren", {"get": this.getNumChildren, configurable:true});
			Object.defineProperty(this, "globalX", {"get": this.getGlobalX, configurable:true});
			Object.defineProperty(this, "globalY" , {"get": this.getGlobalY, configurable:true});
			Object.defineProperty(this, "alpha", {"get": this.getAlpha, "set": this.setAlpha, configurable:true});
			Object.defineProperty(this, "x", {"get": this.getX, "set": this.setX, configurable:true});
			Object.defineProperty(this, "y", {"get": this.getY,"set": this.setY, configurable:true});
			Object.defineProperty(this, "w", {"get": this.getWidth,"set": this.setWidth, configurable:true});
			Object.defineProperty(this, "h", {"get": this.getHeight,"set": this.setHeight, configurable:true});
			Object.defineProperty(this, "bk", {"get": this.getBackgroundColor,"set": this.setBackgroundColor, configurable:true});
			Object.defineProperty(this, "cl", {"get": this.getTextColor,"set": this.setTextColor, configurable:true});
			
			this.setupScreen();
		};	
		
		/* setup screen */
		this.setupScreen = function(){
			this.screen = document.createElement(this.type);
		};
		
		/* destroy */
		this.destroy = function(){
			
			try{this.screen.parentNode.removeChild(this.screen);}catch(e){};
			
			delete this.screen;
			delete this.style;
			this._screen.onselectstart = null;
			this._screen.ondragstart = null;
			this._screen.onmouseover = null;
			this._screen.onmouseout = null;
			this._screen.onmouseup = null;
			this._screen.onmousedown = null;
			this._screen.onmousemove = null;
			this._screen.onclick = null;
			this.children_ar = null;
			this._innerHTML = null;
			this._innerText = null;
			this._overflow = null;
			this._rect = null;
			this._screen = null;
			this._bk = null;
			this._cl = null;
			this.type = null;
			this.listeners.events_ar = null;
			this.listeners = null;	
			
			self = null;
		};
		
		this.disposeImage = function(){
			this.screen.src = null;
		};
		
		this.setResizableSizeAfterParent = function(){
			this.screen.style.width = "100%";
			this.screen.style.height = "100%";
		};
		
		/* check if it supports transforms. */
		this.getTransformProperty = function() {
		    var properties = ['transform', 'msTransform', 'WebkitTransform', 'MozTransform', 'OTransform'];
		    var p;
		    while (p = properties.shift()) {
		       if (typeof this.screen.style[p] !== 'undefined') {
		            return p;
		       }
		    }
		    return false;
		};
		
		/* getter and setter functions */
		this.setScreen = function(val){
			self._screen = val;
			this.transform = this.getTransformProperty();
			
			this.screen.style.display = this._display;
			this.screen.style.position = this._position;
			this.screen.style.overflow = this._overflow;
		
			this.alpha = 1;
			this.screen.style.left = "0px";
			this.screen.style.top = "0px";
			this.screen.style.margin = "0px";
			this.screen.style.padding = "0px";
			this.screen.style.maxWidth = "none";
			this.screen.style.maxHeight = "none";
			this.screen.style.border = "none";
			this.screen.style.backgroundColor = "transparent";
			this.screen.style.backfaceVisibility = "hidden";
			this.screen.style.webkitBackfaceVisibility = "hidden";
			this.screen.style.MozBackfaceVisibility = "hidden";	
			this.screen.style.MozImageRendering = "optimizeSpeed";	
			this.screen.onselectstart = function(){return false;};
			
			if(type == "img"){
				this.w = this.screen.width;
				this.h = this.screen.height;
				this.screen.onmousedown = function(e){return false;};
			}
			
			this.screen.onselectstart = function(){return false;};
			this.screen.ondragstart = function(e){return false;};
		};
		
		this.setSelectable = function(val){
			if(!val){
				try{this.screen.style.userSelect = "none";}catch(e){};
				try{this.screen.style.MozUserSelect = "none";}catch(e){};
				try{this.screen.style.webkitUserSelect = "none";}catch(e){};
				try{this.screen.style.khtmlUserSelect = "none";}catch(e){};
				try{this.screen.style.oUserSelect = "none";}catch(e){};
				try{this.screen.style.msUserSelect = "none";}catch(e){};
				try{this.screen.msUserSelect = "none";}catch(e){};
				this.screen.onselectstart = function(){return false;};
				this.screen.style.webkitTouchCallout='none';
			}
		};
		
		this.setVisible = function(val){
			this._visible = val;
			if(this._visible == true){
				this.screen.style.visibility = "visible";
			}else{
				this.screen.style.visibility = "hidden";
			}
			
		};
		
		this.getVisible = function(){
			return this._visible;
		};
		
		this.getScreen = function(){
			return self._screen;
		};
		
		this.getStyle = function(){
			return this.screen.style;
		};
		
		this.buttonMode = function(val){
			this._buttonMode = val;
			if(this._buttonMode ==  true){
				this.screen.style.cursor = "pointer";
			}else{
				this.screen.style.cursor = "default";
			}
		};
		
		this.setOverflow = function(val){
			self._overflow = val;
			self.screen.style.overflow = self._overflow;
		};
		
		this.setPosition = function(val){
			self._position = val;
			self.screen.style.position = self._position;
		};
		
		this.setInnerHTML = function(val){
			self._innerHTML = val;
			self.screen.innerHTML = self._innerHTML;
		};
		
		this.getInnerHTML = function(){
			return self.screen.innerHTML;
		};
		
		this.getInnerText = function(){
			return self.screen.innerText;
		};
		
		this.getNumChildren = function(){
			return self.children_ar.length;
		};
		
		this.getRect = function(){
			return self.screen.getBoundingClientRect();
		};
		
		this.setAlpha = function(val){
			self._alpha = val;
			self.screen.style.opacity = self._alpha;
		};
		
		this.getAlpha = function(){
			return  self._alpha;
		};
		
		this.getGlobalX = function(){
			return this.rect.left;
		};
		
		this.getGlobalY = function(){
			return this.rect.top;
		};
		
		this.setX = function(val){
			self._x = val;
			if(self.hasTransform3d_bl){
				self.screen.style[self.transform] = 'translate3d(' + self._x + 'px,' + self._y + 'px,0)';
			}else if(self.hasTransform2d_bl){
				self.screen.style[self.transform] = 'translate(' + self._x + 'px,' + self._y + 'px)';
			}else{
				self.screen.style.left = self._x + "px";
			}
		};
		
		this.getX = function(){
			return  self._x;
		};
		
		this.setY = function(val){
			self._y = val;
			if(self.hasTransform3d_bl){
				self.screen.style[self.transform] = 'translate3d(' + self._x + 'px,' + self._y + 'px,0)';	
			}else if(self.hasTransform2d_bl){
				self.screen.style[self.transform] = 'translate(' + self._x + 'px,' + self._y + 'px)';
			}else{
				self.screen.style.top = self._y + "px";
			}
		};
		
		this.getY = function(){
			return  self._y;
		};
		
		this.setWidth = function(val){
			self._w = val;
			if(self.type == "img"){
				self.screen.width = self._w;
			}else{
				self.screen.style.width = self._w + "px";
			}
		};
		
		this.getWidth = function(){
			if(self.type == "div"){
				if(self.screen.offsetWidth != 0) return  self.screen.offsetWidth;
				return self._w;
			}else if(self.type == "img"){
				if(self.screen.offsetWidth != 0) return  self.screen.offsetWidth;
				if(self.screen.width != 0) return  self.screen.width;
				return self._w;
			}else if(self.type == "canvas"){
				if(self.screen.offsetWidth != 0) return  self.screen.offsetWidth;
				return self._w;
			}
		};
		
		this.setHeight = function(val){
			self._h = val;
			if(self.type == "img"){
				self.screen.height = self._h;
			}else{
				self.screen.style.height = self._h + "px";
			}
		};
		
		this.getHeight = function(){
			if(self.type == "div"){
				if(self.screen.offsetHeight != 0) return  self.screen.offsetHeight;
				return self._h;
			}else if(self.type == "img"){
				if(self.screen.offsetHeight != 0) return  self.screen.offsetHeight;
				if(self.screen.height != 0) return  self.screen.height;
				return self._h;
			}else if(self.type == "canvas"){
				if(self.screen.offsetHeight != 0) return  self.screen.offsetHeight;
				return self._h;
			}
		};
		
		this.setBackgroundColor = function(val){
			self._bk = val;
			self.screen.style.backgroundColor = val;
		};
		
		this.getBackgroundColor = function(){
			return self.screen.style.backgroundColor;
		};
		
		this.setTextColor = function(val){
			self._cl = val;
			self.screen.style.color = self._cl;
		};
		
		this.getTextColor = function(){
			return self.screen.style.color;
		};
		
		/* add remove children_ar */
		this.addChild = function(e){
			if(this.contains(e)){	
				this.children_ar.splice(this.children_ar.indexOf(e), 1);
				this.children_ar.push(e);
				this.screen.appendChild(e.screen);
			}else{
				this.children_ar.push(e);
				this.screen.appendChild(e.screen);
			}
		};
		
		this.removeChild = function(e){
			if(this.contains(e)){
				this.children_ar.splice(this.children_ar.indexOf(e), 1);
				this.screen.removeChild(e.screen);
			}else{
				throw Error("##removeChild## Child does not exist, it can't be removed!");
			};
		};
		
		this.contains = function(e){
			if(this.children_ar.indexOf(e) == -1){
				return false;
			}else{
				return true;
			}
		};
		
		this.addChildAtZero = function(e){		
			if(this.numChildren == 0){
				this.children_ar.push(e);
				this.screen.appendChild(e.screen);
			}else{
				this.screen.insertBefore(e.screen, this.children_ar[0].screen);
				if(this.contains(e)){this.children_ar.splice(this.children_ar.indexOf(e), 1);}	
				this.children_ar.unshift(e);
			}
		};
		
		this.getChildAt = function(index){
			if(index < 0  || index > this.numChildren -1) throw Error("##getChildAt## Index out of bounds!");
			if(this.numChildren == 0) throw Errror("##getChildAt## Child dose not exist!");
			return this.children_ar[index];
		};
		
		this.removeChildAtZero = function(){
			this.screen.removeChild(this.children_ar[0].screen);
			this.children_ar.shift();
		};
		
		this.addChildAtTop = function(parent, e){
			parent.screen.insertBefore(e.screen, this.children_ar[this.children_ar.length - 1].screen);
		};
		
		/* event dispatcher stuff */
		this.addListener = function (type, listener){
	    	
	    	if(type == undefined) throw Error("type is required.");
	    	if(typeof type === "object") throw Error("type must be of type String.");
	    	if(typeof listener != "function") throw Error("listener must be of type Function.");
	    	
	        var event = {};
	        event.type = type;
	        event.listener = listener;
	        event.target = this;
	        this.listeners.events_ar.push(event);
	    };
	    
	    this.dispatchEvent = function(type, props){
	    	if(type == undefined) throw Error("type is required.");
	    	if(typeof type === "object") throw Error("type must be of type String.");
	    	
	        for (var i=0, len=this.listeners.events_ar.length; i < len; i++){
	        	if(this.listeners.events_ar[i].target === this && this.listeners.events_ar[i].type === type){
	        		
	    	        if(props){
	    	        	for(var prop in props){
	    	        		this.listeners.events_ar[i][prop] = props[prop];
	    	        	}
	    	        }
	        		this.listeners.events_ar[i].listener.call(this, this.listeners.events_ar[i]);
	        		break;
	        	}
	        }
	    };
	    
	   this.removeListener = function(type, listener){
	    	
	    	if(type == undefined) throw Error("type is required.");
	    	if(typeof type === "object") throw Error("type must be of type String.");
	    	if(typeof listener != "function") throw Error("listener must be of type Function." + type);
	    	
	        for (var i=0, len=this.listeners.events_ar.length; i < len; i++){
	        	if(this.listeners.events_ar[i].target === this 
	        			&& this.listeners.events_ar[i].type === type
	        			&& this.listeners.events_ar[i].listener ===  listener
	        	){
	        		this.listeners.events_ar.splice(i,1);
	        		break;
	        	}
	        }  
	    };
		
	    /* init */
		this.init();
	};
	
	window.FWDDisplayObject = FWDDisplayObject;
}(window));(function (){
	
	var FWDEventDispatcher = function (){
		
	    this.listeners = {events_ar:[]};
	    
	    /* destroy */
	    this.destroy = function(){
	    	this.listeners = null;
	    };
	    
	    this.addListener = function (type, listener){
	    	
	    	if(type == undefined) throw Error("type is required.");
	    	if(typeof type === "object") throw Error("type must be of type String.");
	    	if(typeof listener != "function") throw Error("listener must be of type Function.");
	    	
	        var event = {};
	        event.type = type;
	        event.listener = listener;
	        event.target = this;
	        this.listeners.events_ar.push(event);
	    };
	    
	    this.dispatchEvent = function(type, props){
			
	    	if(type == undefined) throw Error("type is required.");
	    	if(typeof type === "object") throw Error("type must be of type String.");
	    	
	        for (var i=0, len=this.listeners.events_ar.length; i < len; i++){
	        	if(this.listeners.events_ar[i].target === this && this.listeners.events_ar[i].type === type){
	        		
	    	        if(props){
	    	        	for(var prop in props){
	    	        		this.listeners.events_ar[i][prop] = props[prop];
	    	        	}
	    	        }
	        		this.listeners.events_ar[i].listener.call(this, this.listeners.events_ar[i]);
	        		break;
	        	}
	        }
	    };
	    
	   this.removeListener = function(type, listener){
	    	
	    	if(type == undefined) throw Error("type is required.");
	    	if(typeof type === "object") throw Error("type must be of type String.");
	    	if(typeof listener != "function") throw Error("listener must be of type Function." + type);
	    	
	        for (var i=0, len=this.listeners.events_ar.length; i < len; i++){
	        	if(this.listeners.events_ar[i].target === this && this.listeners.events_ar[i].type === type){
	        		this.listeners.events_ar.splice(i,1);
	        		break;
	        	}
	        }  
	    };
	    
	};	
	
	window.FWDEventDispatcher = FWDEventDispatcher;
}(window));/* Info screen */
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
}(window));(function (window) {

        // This library re-implements setTimeout, setInterval, clearTimeout, clearInterval for iOS6.
        // iOS6 suffers from a bug that kills timers that are created while a page is scrolling.
        // This library fixes that problem by recreating timers after scrolling finishes (with interval correction).
		// This code is free to use by anyone (MIT, blabla).
		// Author: rkorving@wizcorp.jp
		
		var platform = navigator.platform;
		var isIpadOrIphone = false;
		if(platform == 'iPad' ||  platform == 'iPhone') isIpadOrIphone = true;
		if(!isIpadOrIphone) return;
		
		var userAgent = navigator.userAgent;
		var isIosVersion6 = false;
		if(userAgent.indexOf("6") != -1) isIosVersion6 = true;
		if(!isIosVersion6) return;
		
	
        var timeouts = {};
        var intervals = {};
        var orgSetTimeout = window.setTimeout;
        var orgSetInterval = window.setInterval;
        var orgClearTimeout = window.clearTimeout;
        var orgClearInterval = window.clearInterval;


        function createTimer(set, map, args) {
                var id, cb = args[0], repeat = (set === orgSetInterval);

                function callback() {
                        if (cb) {
                                cb.apply(window, arguments);

                                if (!repeat) {
                                        delete map[id];
                                        cb = null;
                                }
                        }
                }

                args[0] = callback;

                id = set.apply(window, args);

                map[id] = { args: args, created: Date.now(), cb: cb, id: id };

                return id;
        }


        function resetTimer(set, clear, map, virtualId, correctInterval) {
                var timer = map[virtualId];

                if (!timer) {
                        return;
                }

                var repeat = (set === orgSetInterval);

                // cleanup

                clear(timer.id);

                // reduce the interval (arg 1 in the args array)

                if (!repeat) {
                        var interval = timer.args[1];

                        var reduction = Date.now() - timer.created;
                        if (reduction < 0) {
                                reduction = 0;
                        }

                        interval -= reduction;
                        if (interval < 0) {
                                interval = 0;
                        }

                        timer.args[1] = interval;
                }

                // recreate

                function callback() {
                        if (timer.cb) {
                                timer.cb.apply(window, arguments);
                                if (!repeat) {
                                        delete map[virtualId];
                                        timer.cb = null;
                                }
                        }
                }

                timer.args[0] = callback;
                timer.created = Date.now();
                timer.id = set.apply(window, timer.args);
        }


        window.setTimeout = function () {
                return createTimer(orgSetTimeout, timeouts, arguments);
        };


        window.setInterval = function () {
                return createTimer(orgSetInterval, intervals, arguments);
        };

        window.clearTimeout = function (id) {
                var timer = timeouts[id];

                if (timer) {
                        delete timeouts[id];
                        orgClearTimeout(timer.id);
                }
        };

        window.clearInterval = function (id) {
                var timer = intervals[id];

                if (timer) {
                        delete intervals[id];
                        orgClearInterval(timer.id);
                }
        };

        window.addEventListener('scroll', function () {
                // recreate the timers using adjusted intervals
                // we cannot know how long the scroll-freeze lasted, so we cannot take that into account
                var virtualId;
             
                for (virtualId in timeouts) {
                        resetTimer(orgSetTimeout, orgClearTimeout, timeouts, virtualId);
                }

                for (virtualId in intervals) {
                        resetTimer(orgSetInterval, orgClearInterval, intervals, virtualId);
                }
        });

}(window));(function (window){
	
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
	
}(window));/* thumbs */
(function(window)
{
	var FWDThumb = function(id, data)
	{
		var self = this;
		var prototype = FWDThumb.prototype;

		this.id = id;
		this.borderSize = data.borderSize;
		this.borderNormalColor = data.thumbsBorderNormalColor;
		this.borderSelectedColor = data.thumbsBorderSelectedColor;

		this.mainDO = null;
		this.backgroundDO = null;
		this.imageHolderDO = null;
		this.imageDO = null;
		this.grayImageDO = null;
		this.image = null;
		this.overDO = null;
		this.textDO = null;
		
		this.titleDO = null;
		this.titleBgDO = null;
		this.titleHolderDO = null;
		
		this.descriptionDO = null;
		this.descriptionBgDO = null;
		this.descriptionHolderDO = null;
		
		this.playBtnDO = null;
		this.playBtnDOContext = null;
		
		this.thumbHeight = 0;
		
		this.finalX = 0;
		this.finalY = 0;
		this.finalW = 0;
		this.finalH = 0;

		this.hasImage = false;
		this.isMobile = data.isMobile;
		this.isOnScreen = true;
		this.used = false;
		this.isMedia = false;

		/* init */
		this.init = function()
		{
			self.setupScreen();
		};

		/* setup screen */
		this.setupScreen = function()
		{
			self.mainDO = new FWDDisplayObject("div", "absolute", "hidden");
			self.backgroundDO = new FWDDisplayObject("div", "absolute");
			self.imageDO = new FWDDisplayObject("img", "absolute");
			self.mainDO.addChild(self.backgroundDO);
			self.addChild(self.mainDO);

			self.overDO = new FWDDisplayObject("div", "absolute");
			self.addChild(self.overDO);
			self.overDO.bk = "#000000";
			self.overDO.alpha = 0;
			
			self.overflow = "hidden";
		};

		/* add image */
		this.addImage = function(image)
		{
			self.imageHolderDO = new FWDDisplayObject("div", "absolute");
			self.mainDO.addChild(self.imageHolderDO);
			
			self.imageDO.screen = image;
			self.imageHolderDO.addChild(self.imageDO);
			
			self.imageHolderDO.overflow = "hidden";

			self.backgroundDO.bk = self.borderNormalColor;
			self.backgroundDO.w = self.finalW;
			self.backgroundDO.h = self.finalH;

			self.imageHolderDO.x = self.borderSize;
			self.imageHolderDO.y = self.borderSize;
			
			self.imageHolderDO.w = self.imageDO.w;
			self.imageHolderDO.h = self.imageDO.h;
			
			self.overDO.w = self.mainDO.w = self.finalW;
			self.overDO.h = self.mainDO.h = self.finalH;
			
			self.hasImage = true;
			
			if (data.showGrayscale)
				self.addGrayscaleImage();
			
			if ((data.imagesAr[self.id].contentType != "image") && (data.imagesAr[self.id].contentType != "link"))
			{
				self.isMedia = true;
				
				if (data.imagesAr[self.id].contentType == "audio")
				{
				
					self.addSoundPlayBtn();
				}
				else
				{
					self.addVideoPlayBtn();
				}
			}
			
			self.addImageText();
			
			self.w = self.finalW;
			
			if (!self.isMobile)
			{
				self.h = 0;
				
				if (FWDUtils.isFirefox())
				{
					TweenMax.to(self, .8, {h : self.finalH, ease : Expo.easeInOut});
				}
				else
				{
					self.alpha = 0;
			
					TweenMax.to(self, .8, {h : self.finalH, alpha:1, ease : Expo.easeInOut});
				}
			}
			else
			{
				self.h = self.finalH;
				self.alpha = 0;
			
				TweenMax.to(self, .8, {alpha:1, ease : Expo.easeInOut});
			}
			
			if (data.showDropshadow)
			{
				self.screen.style.boxShadow = "1px 1px 2px #555555";
				self.screen.style.MozBoxShadow = "1px 1px 2px #555555";
				self.screen.style.WebkitBoxShadow = "1px 1px 2px #555555";
			}
		};
		
		this.addGrayscaleImage = function()
		{
			var canvas = document.createElement("canvas");
			var ctx = canvas.getContext("2d");
			
			canvas.width = self.imageDO.screen.width;
			canvas.height = self.imageDO.screen.height; 
			
			ctx.drawImage(self.imageDO.screen, 0, 0); 
			
			var imgPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
			
			for (var y = 0; y < imgPixels.height; y++)
			{
				for (var x = 0; x < imgPixels.width; x++)
				{
					var i = (y * 4) * imgPixels.width + x * 4;
					var avg = (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) / 3;
					
					imgPixels.data[i] = avg; 
					imgPixels.data[i + 1] = avg; 
					imgPixels.data[i + 2] = avg;
				}
			}
			
			ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
			
			self.grayImageDO = new FWDDisplayObject("canvas");
			self.grayImageDO.screen = canvas;
			self.imageHolderDO.addChild(self.grayImageDO);
		};
		
		this.addVideoPlayBtn = function()
		{
			self.playBtnDO = new FWDDisplayObject("canvas");
			self.playBtnDOContext = self.playBtnDO.screen.getContext("2d");
			self.playBtnDO.screen.width = data.videoBtnImg.width;
			self.playBtnDO.screen.height = data.videoBtnImg.height;
			self.playBtnDOContext.drawImage(data.videoBtnImg, 0, 0);
			self.mainDO.addChild(self.playBtnDO);
			
			self.playBtnDO.x = (self.finalW - self.playBtnDO.w) / 2;
			self.playBtnDO.y = (self.finalH - self.playBtnDO.h) / 2;
			
			self.playBtnDO.alpha = 0;
		};
		
		this.addSoundPlayBtn = function()
		{
			self.playBtnDO = new FWDDisplayObject("canvas");
			self.playBtnDOContext = self.playBtnDO.screen.getContext("2d");
			self.playBtnDO.screen.width = data.soundBtnImg.width;
			self.playBtnDO.screen.height = data.soundBtnImg.height;
			self.playBtnDOContext.drawImage(data.soundBtnImg, 0, 0);
			self.mainDO.addChild(self.playBtnDO);
			
			self.playBtnDO.x = (self.finalW - self.playBtnDO.w) / 2;
			self.playBtnDO.y = (self.finalH - self.playBtnDO.h) / 2;
			
			self.playBtnDO.alpha = 0;
		};
		
		this.addImageText = function()
		{
			self.textDO = new FWDDisplayObject("div");
			self.imageHolderDO.addChild(self.textDO);
			
			self.titleHolderDO = new FWDDisplayObject("div");
			self.textDO.addChild(self.titleHolderDO);
			
			self.titleBgDO = new FWDDisplayObject("div");
			self.titleHolderDO.addChild(self.titleBgDO);
			
			self.titleBgDO.bk = data.thumbsTitleBgColor;
			self.titleBgDO.alpha = data.thumbsTitleBgAlpha;
			
			self.titleHolderDO.w = self.imageHolderDO.w;
			
			self.titleDO = new FWDDisplayObject("div");
			self.titleHolderDO.addChild(self.titleDO);
			
			self.titleDO.innerHTML = data.imagesAr[self.id].title;
			
			self.titleDO.style.fontSmoothing = "antialiased";
			self.titleDO.style.webkitFontSmoothing = "antialiased";
			self.titleDO.style.textRendering = "optimizeLegibility";
			
			self.descriptionHolderDO = new FWDDisplayObject("div");
			self.textDO.addChild(self.descriptionHolderDO);
			
			self.descriptionBgDO = new FWDDisplayObject("div");
			self.descriptionHolderDO.addChild(self.descriptionBgDO);
			
			self.descriptionBgDO.bk = data.thumbsDescrBgColor;
			self.descriptionBgDO.alpha = data.thumbsDescrBgAlpha;
			
			self.descriptionDO = new FWDDisplayObject("div");
			self.descriptionHolderDO.addChild(self.descriptionDO);
			
			self.descriptionHolderDO.w = self.imageHolderDO.w;
			
			self.descriptionDO.innerHTML = data.imagesAr[self.id].text;
			
			self.descriptionDO.style.fontSmoothing = "antialiased";
			self.descriptionDO.style.webkitFontSmoothing = "antialiased";
			self.descriptionDO.style.textRendering = "optimizeLegibility";
			
			self.addChild(self.overDO);
			
			self.textTimeoutId = setTimeout(self.showText, 10);
		};
		
		this.showText = function()
		{
			if (data.thumbsTitleBgTextWidth)
			{
				self.titleBgDO.w = self.imageHolderDO.w;
			}
			else
			{
				self.titleBgDO.w = self.titleDO.w;
			}
			
			self.titleHolderDO.h = self.titleDO.h;
			self.titleBgDO.h = self.titleDO.h;
			
			self.descriptionHolderDO.w = self.imageHolderDO.w;
			self.descriptionHolderDO.h = self.descriptionDO.h;
			self.descriptionBgDO.w = self.imageHolderDO.w;
			self.descriptionBgDO.h = self.descriptionDO.h;
			
			self.descriptionHolderDO.y = parseInt(self.titleHolderDO.h);
			
			self.textDO.h = self.titleHolderDO.h + self.descriptionHolderDO.h;
			
			if (data.showTitle)
			{
				self.overY = parseInt(self.imageHolderDO.h - self.textDO.h);
				self.outY = parseInt(self.imageHolderDO.h - self.titleHolderDO.h);
			}
			else
			{
				self.overY = parseInt(self.imageHolderDO.h - self.textDO.h);
				self.outY = parseInt(self.imageHolderDO.h);
			}
			
			self.textDO.y = self.outY;
		};

		/* set normal / selected display states */
		this.setNormalState = function()
		{
			TweenMax.to(self.backgroundDO.screen, .8, {css : {backgroundColor : self.borderNormalColor}, ease : Expo.easeOut});
			TweenMax.to(self.textDO, .8, {y:self.outY, ease : Expo.easeOut});
			
			if (data.showGrayscale)
				TweenMax.to(self.grayImageDO, .8, {alpha:1, ease : Expo.easeOut});
			
			if (self.isMedia)
				TweenMax.to(self.playBtnDO, .8, {alpha:0, ease : Expo.easeOut});
		};

		this.setSelectedState = function()
		{
			TweenMax.to(self.backgroundDO.screen, .8, {css : {backgroundColor : self.borderSelectedColor}, ease : Expo.easeOut});
			TweenMax.to(self.textDO, .8, {y:self.overY, ease : Expo.easeOut});
			
			if (data.showGrayscale)
				TweenMax.to(self.grayImageDO, .8, {alpha:0, ease : Expo.easeOut});
			
			if (self.isMedia)
				TweenMax.to(self.playBtnDO, .8, {alpha:1, ease : Expo.easeOut});
		};
		
		/* destroy */
		this.destroy = function()
		{
			clearTimeout(self.textTimeoutId);
			
			TweenMax.killTweensOf(self);
			TweenMax.killTweensOf(self.backgroundDO.screen);
			
			if (self.textDO)
			{
				TweenMax.killTweensOf(self.textDO);
				self.textDO.destroy();
			}
			
			if (self.grayImageDO)
			{
				TweenMax.killTweensOf(self.grayImageDO);
				self.grayImageDO.destroy();
			}
			
			if (self.playBtnDO)
			{
				TweenMax.killTweensOf(self.playBtnDO);
				self.playBtnDO.destroy();
			}
			
			prototype.destroy();

			self.imageDO.disposeImage();
			
			self.mainDO.destroy();
			self.backgroundDO.destroy();
			
			if (self.imageDO)
				self.imageDO.destroy();
			
			if (self.titleDO)
				self.titleDO.destroy();
			
			if (self.titleHolderDO)
				self.titleHolderDO.destroy();
			
			if (self.descriptionDO)
				self.descriptionDO.destroy();
			
			if (self.overDO)
				self.overDO.destroy();

			self.overDO = null;
			self.imageDO = null;
			self.backgroundDO = null;
			self.mainDO = null;
			self.borderNormalColor = null;
			self.borderSelectedColor = null;
			self.image = null;
			self.imageHolderDO = null;
			self.imageDO = null;
			self.grayImageDO = null;
			self.overDO = null;
			self.textDO = null;
			self.titleDO = null;
			self.titleBgDO = null;
			self.titleHolderDO = null;
			self.descriptionDO = null;
			self.descriptionBgDO = null;
			self.descriptionHolderDO = null;
			self.playBtnDO = null;
			self.playBtnDOContext = null;
			
			prototype = null;
			self = null;
			FWDThumb.prototype = null;
		};

		this.init();
	};

	/* set prototype */
	FWDThumb.setPrototype = function()
	{
		FWDThumb.prototype = new FWDDisplayObject("div", "absolute");
	};

	FWDThumb.prototype = null;
	window.FWDThumb = FWDThumb;
}(window));/* thumbs manager */
(function(window)
{
	var FWDThumbsManager = function(data)
	{
		var self = this;
		var prototype = FWDThumbsManager.prototype;

		this.data = data;
		this.isMobile = data.isMobile;

		this.thumbsHolderDO;

		this.totalThumbs = data.totalImages;
		this.thumbsAr = [];
		this.columnHeightsAr = [];
		this.totalColumns = data.nrOfColumns;
		this.curId = 0;
		this.thumbWidth = data.thumbWidth;
		this.thumbHeight = data.thumbHeight;

		this.thumbsHSpace = data.thumbsHSpace;
		this.thumbsVSpace = data.thumbsVSpace;
		this.countLoadedThumbs = 0;
		
		this.borderSize = data.borderSize;
		
		this.isTouchScrolling = false;

		this.startToLoadThumbsId;
		this.loadWithDelayId;

		/* add to display list */
		this.addToDisplayList = function(parent)
		{
			self.parent = parent;
			parent.mainDO.addChild(self);
			
			self.setResizableSizeAfterParent();
			
			self.overflow = "hidden";
			
			self.thumbsHolderDO = new FWDDisplayObject("div");
			self.addChild(self.thumbsHolderDO);
			
			self.thumbsHolderDO.x = self.thumbsHSpace;

			self.setupThumbs();
			self.setPrettyPhoto();
			self.testTouchMove();

			self.startToLoadThumbsId = setTimeout(self.loadThumbImage, 10);
		};
		
		this.setPrettyPhoto = function()
		{
			$("a[rel^='prettyPhoto']").prettyPhoto(
			{
				animation_speed: "normal", /* fast/slow/normal */
				autoplay_slideshow: false, /* true/false */
				opacity: 0.80, /* Value between 0 and 1 */
				show_title: true, /* true/false */
				allow_resize: true, /* Resize the photos bigger than viewport. true/false */
				default_width: self.data.videoWidth,
				default_height: self.data.videoHeight,
				theme: 'pp_default', /* light_rounded / dark_rounded / light_square / dark_square / facebook */
				horizontal_padding: 17, /* The padding on each side of the picture */
				wmode: 'opaque', /* Set the flash wmode attribute */
				autoplay: false, /* Automatically start videos: True/False */
				modal: true, /* If set to true, only the close button will close the window */
				deeplinking: false, /* Allow prettyPhoto to update the url to enable deeplinking. */
				changepicturecallback: function(){}, /* Called everytime an item is shown/changed */
				callback: function(){}, /* Called when prettyPhoto is closed */
				image_markup: '<img id="fullResImage" src="{path}" />',
				flash_markup: '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="{width}" height="{height}"><param name="wmode" value="{wmode}" /><param name="allowfullscreen" value="true" /><param name="allowscriptaccess" value="always" /><param name="movie" value="{path}" /><embed src="{path}" type="application/x-shockwave-flash" allowfullscreen="true" allowscriptaccess="always" width="{width}" height="{height}" wmode="{wmode}"></embed></object>',
				quicktime_markup: '<object classid="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" codebase="http://www.apple.com/qtactivex/qtplugin.cab" height="{height}" width="{width}"><param name="src" value="{path}"><param name="autoplay" value="{autoplay}"><param name="type" value="video/quicktime"><embed src="{path}" height="{height}" width="{width}" autoplay="{autoplay}" type="video/quicktime" pluginspage="http://www.apple.com/quicktime/download/"></embed></object>',
				iframe_markup: '<iframe src ="{path}" width="{width}" height="{height}" frameborder="no"></iframe>',
				inline_markup: '<div class="pp_inline">{content}</div>',
				custom_markup: '',
				social_tools: false /* html or false to disable */
			});
		};

		/* setup thumbs */
		this.setupThumbs = function()
		{
			var thumb;
			
			for (var i=0; i<self.totalThumbs; i++)
			{
				FWDThumb.setPrototype();
				
				thumb = new FWDThumb(i, self.data);
				self.thumbsAr.push(thumb);
				
				thumb.x = 0;
				thumb.y = 0;

				if (!self.isMobile)
					thumb.overDO.buttonMode = true;
				
				self.thumbsHolderDO.addChild(thumb);
				
				if (!self.isMobile)
				{
					thumb.overDO.screen.onmouseover = (function()
					{
						var id = i;
						
						return function()
						{
							self.thumbOnMouseOverHandler(id);
						};
					})();
					
					thumb.overDO.screen.onmouseout = (function()
					{
						var id = i;
						
						return function()
						{
							self.thumbOnMouseOutHandler(id);
						};
					})();
				}

				if (self.isMobile)
				{
					thumb.screen.addEventListener("touchend", (function()
					{
						var pthumb = thumb;
						
						return function()
						{
							self.thumbOnMouseDown(pthumb);
						};
					})());
				}
				else
				{
					thumb.overDO.screen.onclick = (function()
					{
						var pthumb = thumb;
						
						return function()
						{
							self.thumbOnMouseDown(pthumb);
						};
					})();
				}
			}
		};

		this.thumbOnMouseOverHandler = function(id)
		{
			self.thumbsAr[id].setSelectedState();
		};

		this.thumbOnMouseOutHandler = function(id)
		{
			self.thumbsAr[id].setNormalState();
		};

		this.thumbOnMouseDown = function(thumb)
		{
			if (!self.isTouchScrolling)
			{
				self.curId = thumb.id;
				
				switch (self.data.imagesAr[self.curId].contentType)
				{
					case "image":
						$.prettyPhoto.open(self.data.imagesAr[self.curId].content, data.imagesAr[self.curId].title, "", 0, "image");
						break;
					case "youtube":
						$.prettyPhoto.open(self.data.imagesAr[self.curId].content, data.imagesAr[self.curId].title, "", 0, "youtube");
						break;
					case "vimeo":
						$.prettyPhoto.open(self.data.imagesAr[self.curId].content, data.imagesAr[self.curId].title, "", 0, "vimeo");
						break;
					case "video":
						var videoUrl;
						
						if ($.browser.msie || $.browser.webkit)
						{
							if (self.isMobile)
								videoUrl = self.data.imagesAr[self.curId].mobileContent + ".mp4";
							else
								videoUrl = self.data.imagesAr[self.curId].content + ".mp4";
						}
						else
						{
							if (self.isMobile)
								videoUrl = self.data.imagesAr[self.curId].mobileContent + ".ogg";
							else
								videoUrl = self.data.imagesAr[self.curId].content + ".ogg";
						}
						
						$.prettyPhoto.open(videoUrl, data.imagesAr[self.curId].title, "", 0, "video");
						
						break;
					case "audio":
						var audioUrl;
						
						if ($.browser.msie || $.browser.webkit)
						{
							audioUrl = self.data.imagesAr[self.curId].content + ".mp3";
						}
						else
						{
							audioUrl = self.data.imagesAr[self.curId].content + ".ogg";
						}
						
						$.prettyPhoto.open(audioUrl, data.imagesAr[self.curId].title, "", 0, "audio");
						
						break;
					case "link":
						window.open(self.data.imagesAr[self.curId].content, self.data.imagesAr[self.curId].target);
						break;
				}
			}
		};

		this.loadThumbImage = function()
		{
			var imagePath = self.data.imagesAr[self.countLoadedThumbs].imagePath;

			self.image = new Image();
			self.image.src = imagePath;

			self.image.onerror = self.onImageLoadErrorHandler;
			self.image.onload = self.onImageLoadHandler;
		};

		this.onImageLoadErrorHandler = function(e){};

		this.onImageLoadHandler = function(e)
		{
			var thumb = self.thumbsAr[self.countLoadedThumbs];

			thumb.finalW = self.image.width + (self.borderSize * 2);
			thumb.finalH = self.image.height + (self.borderSize * 2);

			thumb.addImage(self.image);

			self.countLoadedThumbs++;
			
			self.positionThumbs();
			
			if (self.countLoadedThumbs < self.totalThumbs)
			{
				self.loadWithDelayId = setTimeout(self.loadThumbImage, 100);
			}
			else
			{
				self.isLoading = false;
			}
		};

		/* position thumbs */
		this.positionThumbs = function()
		{	
			var i, j, k;
			var minH;
			var minHVal;
			var found;
			var fPlace;
			
			self.columnHeightsAr = [];
			
			for (i=0; i<self.totalColumns; i++)
			{
				self.columnHeightsAr[i] = 0;
			}

			for (i=0; i<self.countLoadedThumbs; i++)
			{
				thumb = self.thumbsAr[i];
				
				if  (thumb.finalW == self.thumbWidth)
				{
					minHVal = 1000;
					
					for (j=0; j<self.totalColumns; j++)
					{
						if (self.columnHeightsAr[j] < minHVal)
						{
							minHVal = self.columnHeightsAr[j];
						}
					}
					
					for (j=0; j<self.totalColumns; j++)
					{
						if (self.columnHeightsAr[j] == minHVal)
						{
							minH = j;
							break;
						}
					}
					
					thumb.finalX = minH * (self.thumbWidth + self.thumbsHSpace + self.borderSize * 2);
					thumb.finalY = self.columnHeightsAr[minH] * (self.thumbHeight + self.thumbsVSpace + self.borderSize * 2) + self.thumbsVSpace;
						
					self.columnHeightsAr[minH] += Math.floor(thumb.finalH / self.thumbHeight);
										
					thumb.used = true;
					
					thumb.x = thumb.finalX;
					thumb.y = thumb.finalY;
				}
				else
				{
					minHVal = 1000;
					
					found = false;
					
					var wSize = Math.floor(thumb.finalW / self.thumbWidth);
					
					for (j=0; j<self.totalColumns - (wSize-1); j++)
					{
						fPlace = true;
						
						for (k=0; k<wSize; k++)
						{
							if (self.columnHeightsAr[j] != self.columnHeightsAr[j+k])
								fPlace = false;
						}
						
						if (fPlace && (self.columnHeightsAr[j] < minHVal))
						{
							minHVal = self.columnHeightsAr[j];
							found = true;
						}
					}
					
					if (found)
					{
						for (j=0; j<self.totalColumns - (wSize-1); j++)
						{
							fPlace = true;
							
							for (k=0; k<wSize; k++)
							{
								if (self.columnHeightsAr[j] != self.columnHeightsAr[j+k])
									fPlace = false;
							}
							
							if (fPlace && (self.columnHeightsAr[j] == minHVal))
							{
								minH = j;
								break;
							}
						}
						
						thumb.finalX = minH * (self.thumbWidth + self.thumbsHSpace + self.borderSize * 2);
						thumb.finalY = self.columnHeightsAr[minH] * (self.thumbHeight + self.thumbsVSpace + self.borderSize * 2) + self.thumbsVSpace;
							
						var addedH = Math.floor(thumb.finalH / self.thumbHeight);
							
						for (k=0; k<wSize; k++)
						{
							self.columnHeightsAr[minH + k] += addedH;
						}
						
						thumb.used = true;
						
						thumb.x = thumb.finalX;
						thumb.y = thumb.finalY;
					}
				}
			}
			
			var maxH = 0;
			
			for (i=0; i<self.totalColumns; i++)
			{
				if (self.columnHeightsAr[i] > maxH)
				{
					maxH = self.columnHeightsAr[i];
				}
			}
			
			self.thumbsHolderDO.h = maxH * (self.thumbHeight + self.thumbsVSpace + self.borderSize * 2) + self.thumbsVSpace;
			TweenMax.to(self.parent.mainDO, .4, {h : self.thumbsHolderDO.h, ease : Expo.easeInOut});
			
		};
		
		this.tweenOnUpdate = function(){
			self.parent.mainContainer.style.height = self.thumbsHolderDO.h + "px";
		}
		
		this.testTouchMove = function()
		{
			if (self.isMobile)
				self.screen.addEventListener("touchstart", self.onTouchPress);
		};
		
		this.onTouchPress = function(e)
		{	
			window.addEventListener("touchmove", self.onTouchMove);
			window.addEventListener("touchend", self.onTouchEnd);
		};
		
		this.onTouchMove = function()
		{
			self.isTouchScrolling = true;
		};
		
		this.onTouchEnd = function(e)
		{
			self.isTouchScrolling = false;
			
			window.removeEventListener("touchmove", self.onTouchMove);
			window.removeEventListener("touchend", self.onTouchEnd);
		};
		
		/* clear timeouts and remove main events */
		this.clearTimeoutsAndRemoveAllMainEvents = function()
		{
			clearTimeout(self.loadWithDelayId);
			clearTimeout(self.startToLoadThumbsId);

			if (self.isMobile)
			{
				self.screen.removeEventListener("touchstart", self.onTouchPress);
				window.removeEventListener("touchmove", self.onTouchMove);
				window.removeEventListener("touchend", self.onTouchEnd);
			}
		};
		
		/* destroy */
		this.destroy = function()
		{
			if (self.image)
			{
				self.image.onload = null;
				self.image.onerror = null;
			}
			
			self.image = null;
			
			self.clearTimeoutsAndRemoveAllMainEvents();

			prototype.destroy();
			
			/* destroy thumbs */
			for (var i=0; i<self.totalThumbs; i++)
			{
				self.thumbsAr[i].overDO.screen.onmouseover = null;
				self.thumbsAr[i].overDO.screen.onmouseout = null;
				self.thumbsAr[i].overDO.screen.onclick = null;
				
				self.thumbsAr[i].destroy();
				self.thumbsAr[i] = null;
			};

			TweenMax.killTweensOf(self.parent);
			TweenMax.killTweensOf(self.thumbsHolderDO);
		
			self.thumbsHolderDO.destroy();
			self.thumbsHolderDO = null;

			self.thumbsAr = null;
			self.columnHeightsAr = null;

			self = null;
			prototype = null;
			FWDThumbsManager.prototype = null;
		};
	};

	/* set prototype */
	FWDThumbsManager.setPrototype = function()
	{
		FWDThumbsManager.prototype = new FWDDisplayObject("div", "absolute");
	};

	window.FWDThumbsManager = FWDThumbsManager;

}(window));//FWDUtils
(function (window){
	
	var FWDUtils = function(){};
	
	FWDUtils.randomizeArray = function(aArray) {
		var randomizedArray = [];
		var copyArray = aArray.concat();
			
		var length = copyArray.length;
		for(var i=0; i< length; i++) {
				var index = Math.floor(Math.random() * copyArray.length);
				randomizedArray.push(copyArray[index]);
				copyArray.splice(index,1);
			}
		return randomizedArray;
	};
	
	FWDUtils.resizeDoWithLimit = function(
		displayObject,
		containerWidth,
		containerHeight,
		doWidth,
		doHeight,
		removeWidthOffset,
		removeHeightOffset,
		offsetX,
		offsetY,
		animate,
		pDuration,
		pDelay,
		pEase
	) {
		if (removeWidthOffset)
			containerWidth -= removeWidthOffset;
		if (removeHeightOffset)
			containerWidth -= removeHeightOffset;
		
		var scaleX = containerWidth/doWidth;
		var scaleY = containerHeight/doHeight;
		var totalScale = 0;
		
		
		if(scaleX <= scaleY){
			totalScale = scaleX;
		}else if(scaleX >= scaleY){
			totalScale = scaleY;
		}
		
		var finalWidth = Math.round((doWidth * totalScale));
		var finalHeight = Math.round((doHeight * totalScale));
		var x = Math.round((containerWidth -  (doWidth * totalScale))/2  + offsetX);
		var y = Math.round((containerHeight -  (doHeight * totalScale))/2 + offsetY);
		
		if(animate){
			TweenMax.to(displayObject, pDuration, {x:x, y:y, w:finalWidth, h:finalHeight, delay:pDelay, ease:pEase});
		}else{
			displayObject.x = x;
			displayObject.y = y;
			displayObject.w = finalWidth;
			displayObject.h = finalHeight;
		}
	};
	
	FWDUtils.resizeDoWithoutLimitOnlySize = function(
			displayObject,
			containerWidth,
			containerHeight,
			doWidth,
			doHeight,
			removeWidthOffset,
			removeHeightOffset,
			offsetX,
			offsetY,
			animate,
			pDuration,
			pDelay,
			pEase
		) {
			if (removeWidthOffset)
				containerWidth -= removeWidthOffset;
			if (removeHeightOffset)
				containerWidth -= removeHeightOffset;
			
			var scaleX = containerWidth/doWidth;
			var scaleY = containerHeight/doHeight;
			var totalScale = 0;
			
			if(scaleX >= scaleY){
				totalScale = scaleX;
			}else if(scaleX <= scaleY){
				totalScale = scaleY;
			}

			var finalWidth = Math.round((doWidth * totalScale));
			var finalHeight = Math.round((doHeight * totalScale));
			
			if(animate){
				TweenMax.to(displayObject, pDuration, {w:finalWidth, h:finalHeight, delay:pDelay, ease:pEase});
			}else{
				displayObject.w = finalWidth;
				displayObject.h = finalHeight;
			}
		};
		
		FWDUtils.resizeDoWithoutLimit = function(
				displayObject,
				containerWidth,
				containerHeight,
				doWidth,
				doHeight,
				animate,
				pDuration,
				pDelay,
				pEase
			) {
			
				var containerWidth = containerWidth ;
				var containerHeight = containerHeight;
				
				var scaleX = containerWidth/doWidth;
				var scaleY = containerHeight/doHeight;
				var totalScale = 0;
				
				
				if(scaleX >= scaleY){
					totalScale = scaleX;
				}else if(scaleX <= scaleY){
					totalScale = scaleY;
				}
				
				var finalWidth = Math.round((doWidth * totalScale));
				var finalHeight = Math.round((doHeight * totalScale));
				var x = Math.round((containerWidth -  (doWidth * totalScale))/2 );
				var y = Math.round((containerHeight -  (doHeight * totalScale))/2);
				
				if(animate){
					TweenMax.to(displayObject, pDuration, {x:x, y:y, w:finalWidth, h:finalHeight, delay:pDelay, ease:pEase});
				}else{
					displayObject.x = x;
					displayObject.y = y;
					displayObject.w = finalWidth;
					displayObject.h = finalHeight;
				}
			};
	
	FWDUtils.resizeCssElementWithoutLimit = function(
			element,
			containerWidth,
			containerHeight,
			elementWidth,
			elementHeight,
			duration,
			delay,
			animate,
			ease,
			offsetX,
			offsetY,
			removeWidthOffset,
			removeHeightOffset
			
		) {
			
			var containerWidth = containerWidth - removeWidthOffset;
			var containerHeight = containerHeight - removeHeightOffset;
			
			var scaleX = containerWidth/elementWidth;
			var scaleY = containerHeight/elementHeight;
			var totalScale = 0;
			
			if(scaleX >= scaleY){
				totalScale = scaleX;
			}else if(scaleX <= scaleY){
				totalScale = scaleY;
			}
		
			var left = Math.round((containerWidth -  (elementWidth * totalScale))/2  + removeWidthOffset/2 + offsetX);
			var top = Math.round((containerHeight -  (elementHeight * totalScale))/2 + removeHeightOffset/2 + offsetY);
			var finalWidth = Math.round((elementWidth * totalScale));
			var finalHeight = Math.round((elementHeight * totalScale));
			
			if(animate){
				Tween.get(element,{override:true}).wait(delay).to(
						{left:left, 
						top:top,
						width:finalWidth,
						height:finalHeight,}, 
						duration, ease);
			}else{
				element.style.width = finalWidth + "px";
				element.style.height = finalHeight + "px";
				element.style.left = left + "px"; 
				element.style.top = top + "px";
			}
		};
	
	FWDUtils.parent = function (e, n){
		if(n === undefined) n = 1;
		while(n-- && e) e = e.parentNode;
		if(!e || e.nodeType !== 1) return null;
		return e;
	};
	
	FWDUtils.sibling = function(e, n){
		while (e && n !== 0){
			if(n > 0){
				if(e.nextElementSibling){
					 e = e.nextElementSibling;	 
				}else{
					for(var e = e.nextSibling; e && e.nodeType !== 1; e = e.nextSibling);
				}
				n--;
			}else{
				if(e.previousElementSibling){
					 e = e.previousElementSibling;	 
				}else{
					for(var e = e.previousSibling; e && e.nodeType !== 1; e = e.previousSibling);
				}
				n++;
			}
		}
		
		return e;
	};
	
	FWDUtils.child = function (e, n){
		if(e.children){
			if(n < 0) n += e.children.length;
			if(n < 0) return null;
			return e.children[n];
		}
		
		if(n>0){
			if(e.firstElementChild){
				e = e.firstElementChild;
			}else{
				for(var e = e.firstChild; e && e.nodeType !== 1; e = e.nextSibling);
			}
			return sibling(e,n);
		}else{
			if(e.lastElementChild){
				e = e.lastElementChild;
			}else{
				for(var e = e.lastChild; e && e.nodeType !== 1; e = e.previousSibling);
			}
			return sibling(e,n+1);
		}
	};
	
	FWDUtils.children = function(e, allNodesTypes){
		var kids = [];
		for(var c = e.firstChild; c != null; c = c.nextSibling){
			if(allNodesTypes){
				kids.push(c);
			}else if(c.nodeType === 1){
				kids.push(c);
			}
		}
		return kids;
	};
	
	FWDUtils.textContent = function(e, v){
		var content = e.textContent;
		if(v === undefined){
			if(content !== undefined){
				return content;
			}else{
				return e.innerText;
			}
		}else{
			if(content !== undefined){
				e.textContent = v;
			}else{
				e.innerText = value;
			}
		}
	};
	
	FWDUtils.insertNodeAt = function(parent, child, n){
		var children = FWDUtils.children(parent);
		if(n < 0 || n > children.length){
			throw new Error("invalid index!");
		}else {
			parent.insertBefore(child, children[n]);
		};
	};
	
	FWDUtils.hasCanvas = function(){
		return Boolean(document.createElement("canvas"));
	};
	
	FWDUtils.trim = function(str){
		return str.replace(/\s/gi, "");
	};
	
	FWDUtils.hitTest = function(target, x, y){
		var hit = false;
		if(!target) throw Error("Hit test target is null!");
		var rect = target.getBoundingClientRect();
		if(x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom){
			hit = true;
		}
		return hit;
	};
	
	FWDUtils.isMobile = function (){
		var agents = ['android', 'webos', 'iphone', 'ipad', 'blackberry'];
	    for(i in agents) {
	    	 if(navigator.userAgent.toLowerCase().indexOf(agents[i].toLowerCase()) != -1) {
	            return true;
	        }
	    }
	   
	    return false;
	};
		
	FWDUtils.isChrome = function(){
		return navigator.userAgent.toLowerCase().indexOf('chrome') != -1;
	};
	
	FWDUtils.isSafari = function(){
		return navigator.userAgent.toLowerCase().indexOf('safari') != -1 && navigator.userAgent.toLowerCase().indexOf('chrome') == -1;
	};

	FWDUtils.isFirefox = function(){
		return navigator.userAgent.toLowerCase().indexOf('firefox') != -1;
	};

	FWDUtils.isIE = function(){
		return navigator.userAgent.toLowerCase().indexOf('msie') != -1;;
	};
		
	FWDUtils.isOpera = function(){
		return navigator.userAgent.toLowerCase().indexOf('opera') != -1;
	};
	
	FWDUtils.disableSelection = function(e){
		try{e.style.userSelect = "none";}catch(e){};
		try{e.style.MozUserSelect = "none";}catch(e){};
		try{e.style.webkitUserSelect = "none";}catch(e){};
		try{e.style.khtmlUserSelect = "none";}catch(e){};
		try{e.style.oUserSelect = "none";}catch(e){};
		try{e.style.msUserSelect = "none";}catch(e){};
		try{e.msUserSelect = "none";}catch(e){};
		
		e.onselectstart = function(){return false;};
	}
	
	window.FWDUtils = FWDUtils;
}(window));/* main gallery */
(function(window)
{
	var FWDVerticalRandomImageGallery = function(divId, xmlPath, divWidth, divHeight, bgColor, prelRadius, prelThickness, prelBgColor, prelFillColor)
	{
		var self = this;
		
		this.xmlPath = xmlPath;
		this.info = null;
		this.mainDO = null;
		this.thumbsManager = null;
		this.preloader = null;
		this.customContextMenu = null;

		this.stageWidth = 0;
		this.stageHeight = 0;

		this.resizeHandlerIntervalId;

		/* init gallery */
		this.init = function()
		{
			self.mainContainer = $("#" + divId)[0];

			if (!self.mainContainer)
			{
				alert("Main div is not found, please check the div id! " + divId);
				return;
			}
			
			TweenLite.ticker.useRAF(false);
			
			self.setupScreen();
			self.setupInfo();
			self.setupData();
		};

		/* setup main screen */
		this.setupScreen = function()
		{
			self.mainDO = new FWDDisplayObject("div", "relative");
			self.mainDO.selectable = false;
			self.mainDO.bk = bgColor;

			self.mainDO.style.overflow = "hidden";
			
			self.mainDO.w = divWidth;
			self.mainDO.h = divHeight;
			
			self.stageWidth = self.mainDO.w;
			self.stageHeight = self.mainDO.h;
			
			if (self.preloader)
			{
				self.preloader.setX((self.stageWidth - self.preloader._w)/2);
				self.preloader.setY((self.stageHeight - self.preloader._h)/2);
			}
			
			self.mainContainer.appendChild(self.mainDO.screen);
			
			self.mainDO.style.boxShadow = "1px 2px 2px #999999";
		};

		/* stup info */
		this.setupInfo = function()
		{
			self.info = new FWDInfo();
		};

		/* setup data */
		this.setupData = function()
		{
			FWDData.setPrototype();
			
			self.data = new FWDData(self.xmlPath);
			self.data.addListener(FWDData.LOAD_COMPLETE, self.dataLoadComplete);
			self.data.addListener(FWDData.LOAD_ERROR, self.dataLoadError);
			
			self.data.preloadersRadius = prelRadius;
			self.data.preloadersThickness = prelThickness;
			self.data.preloadersBackgroundColor = prelBgColor;
			self.data.preloadersFillColor = prelFillColor;
			
			self.setupPreloader();
			
			self.data.load();
		};
		
		/* setup preloader */
		this.setupPreloader = function()
		{
			FWDStrockPreloader.setPrototype();
			
			self.preloader = new FWDStrockPreloader(self.data.preloadersRadius, self.data.preloadersThickness, self.data.preloadersBackgroundColor, self.data.preloadersFillColor);
			self.preloader.show(true);
			self.mainDO.addChild(self.preloader);
			
			self.preloader.setX((self.stageWidth - self.preloader._w)/2);
			self.preloader.setY((self.stageHeight - self.preloader._h)/2);
		};

		this.dataLoadError = function(e, text)
		{
			self.mainDO.screen.appendChild(self.info.screen);
			self.info.showText(e.text);
		};

		this.dataLoadComplete = function(e)
		{
			self.preloader.hide(false);
			
			self.mainDO.w = self.data.nrOfColumns * (self.data.thumbWidth + self.data.thumbsHSpace + self.data.borderSize * 2) - self.data.thumbsHSpace + self.data.thumbsHSpace * 2;
			
			self.setupThumbsManager();
			
			if (!self.data.isMobile)
				self.setupContextMenu();
		};

		/* setup thumbs manager. */
		this.setupThumbsManager = function()
		{
			FWDThumbsManager.setPrototype();
			
			self.thumbsManager = new FWDThumbsManager(self.data);
			self.thumbsManager.addToDisplayList(self);
		};
		
		/* setup context menu */
		this.setupContextMenu = function()
		{
			self.customContextMenu = new FWDContextMenu(self.mainDO, true);
		};
		
		/* destroy */
		this.destroy = function()
		{
			if (self.data)
				self.data.destroy();

			if (self.info)
				self.info.destroy();

			if (self.thumbsManager)
				self.thumbsManager.destroy();

			if (self.mainDO)
				self.mainDO.destroy();

			if (self.preloader)
				self.preloader.destroy();
			
			self.xmlPath = null;
			self.data = null;
			self.thumbsManager = null;
			self.mainContainer = null;
			self.mainDO = null;
			self.info = null;
			self.preloader = null;
			self.customContextMenu = null;

			self = null;
		};

		this.init();
	};

	window.FWDVerticalRandomImageGallery = FWDVerticalRandomImageGallery;

}(window));/* Modernizr 2.5.3 (Custom Build) | MIT & BSD
 * Build: http://modernizr.com/download/#-csstransforms-csstransforms3d-canvas-audio-video-teststyles-testprop-testallprops-prefixes-domprefixes
 */
;window.Modernizr=function(a,b,c){function y(a){i.cssText=a}function z(a,b){return y(l.join(a+";")+(b||""))}function A(a,b){return typeof a===b}function B(a,b){return!!~(""+a).indexOf(b)}function C(a,b){for(var d in a)if(i[a[d]]!==c)return b=="pfx"?a[d]:!0;return!1}function D(a,b,d){for(var e in a){var f=b[a[e]];if(f!==c)return d===!1?a[e]:A(f,"function")?f.bind(d||b):f}return!1}function E(a,b,c){var d=a.charAt(0).toUpperCase()+a.substr(1),e=(a+" "+n.join(d+" ")+d).split(" ");return A(b,"string")||A(b,"undefined")?C(e,b):(e=(a+" "+o.join(d+" ")+d).split(" "),D(e,b,c))}var d="2.5.3",e={},f=b.documentElement,g="modernizr",h=b.createElement(g),i=h.style,j,k={}.toString,l=" -webkit- -moz- -o- -ms- ".split(" "),m="Webkit Moz O ms",n=m.split(" "),o=m.toLowerCase().split(" "),p={},q={},r={},s=[],t=s.slice,u,v=function(a,c,d,e){var h,i,j,k=b.createElement("div"),l=b.body,m=l?l:b.createElement("body");if(parseInt(d,10))while(d--)j=b.createElement("div"),j.id=e?e[d]:g+(d+1),k.appendChild(j);return h=["&#173;","<style>",a,"</style>"].join(""),k.id=g,(l?k:m).innerHTML+=h,m.appendChild(k),l||(m.style.background="",f.appendChild(m)),i=c(k,a),l?k.parentNode.removeChild(k):m.parentNode.removeChild(m),!!i},w={}.hasOwnProperty,x;!A(w,"undefined")&&!A(w.call,"undefined")?x=function(a,b){return w.call(a,b)}:x=function(a,b){return b in a&&A(a.constructor.prototype[b],"undefined")},Function.prototype.bind||(Function.prototype.bind=function(b){var c=this;if(typeof c!="function")throw new TypeError;var d=t.call(arguments,1),e=function(){if(this instanceof e){var a=function(){};a.prototype=c.prototype;var f=new a,g=c.apply(f,d.concat(t.call(arguments)));return Object(g)===g?g:f}return c.apply(b,d.concat(t.call(arguments)))};return e});var F=function(a,c){var d=a.join(""),f=c.length;v(d,function(a,c){var d=b.styleSheets[b.styleSheets.length-1],g=d?d.cssRules&&d.cssRules[0]?d.cssRules[0].cssText:d.cssText||"":"",h=a.childNodes,i={};while(f--)i[h[f].id]=h[f];e.csstransforms3d=(i.csstransforms3d&&i.csstransforms3d.offsetLeft)===9&&i.csstransforms3d.offsetHeight===3},f,c)}([,["@media (",l.join("transform-3d),("),g,")","{#csstransforms3d{left:9px;position:absolute;height:3px;}}"].join("")],[,"csstransforms3d"]);p.canvas=function(){var a=b.createElement("canvas");return!!a.getContext&&!!a.getContext("2d")},p.csstransforms=function(){return!!E("transform")},p.csstransforms3d=function(){var a=!!E("perspective");return a&&"webkitPerspective"in f.style&&(a=e.csstransforms3d),a},p.video=function(){var a=b.createElement("video"),c=!1;try{if(c=!!a.canPlayType)c=new Boolean(c),c.ogg=a.canPlayType('video/ogg; codecs="theora"').replace(/^no$/,""),c.h264=a.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/,""),c.webm=a.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/,"")}catch(d){}return c},p.audio=function(){var a=b.createElement("audio"),c=!1;try{if(c=!!a.canPlayType)c=new Boolean(c),c.ogg=a.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,""),c.mp3=a.canPlayType("audio/mpeg;").replace(/^no$/,""),c.wav=a.canPlayType('audio/wav; codecs="1"').replace(/^no$/,""),c.m4a=(a.canPlayType("audio/x-m4a;")||a.canPlayType("audio/aac;")).replace(/^no$/,"")}catch(d){}return c};for(var G in p)x(p,G)&&(u=G.toLowerCase(),e[u]=p[G](),s.push((e[u]?"":"no-")+u));return y(""),h=j=null,e._version=d,e._prefixes=l,e._domPrefixes=o,e._cssomPrefixes=n,e.testProp=function(a){return C([a])},e.testAllProps=E,e.testStyles=v,e}(this,this.document);/*!
 * VERSION: beta 1.28
 * DATE: 2012-05-24
 * JavaScript 
 * UPDATES AND DOCS AT: http://www.greensock.com
 *
 * Copyright (c) 2008-2012, GreenSock. All rights reserved. 
 * This work is subject to the terms in http://www.greensock.com/terms_of_use.html or for 
 * corporate Club GreenSock members, the software agreement that was issued with the corporate 
 * membership.
 * 
 * @author: Jack Doyle, jack@greensock.com
 */
(window._gsQueue||(window._gsQueue=[])).push(function(){_gsDefine("plugins.CSSPlugin",["plugins.TweenPlugin","TweenLite"],function(x){var n=function(){x.call(this,"css");this._overwriteProps.pop()},o=n.prototype=new x("css");o.constructor=n;n.API=2;n.suffixMap={top:"px",right:"px",bottom:"px",left:"px",width:"px",height:"px",fontSize:"px",padding:"px",margin:"px"};var u=/[^\d\-\.]/g,D=/(\d|\-|\+|=|#|\.)*/g,P=/\d+/g,E=/opacity=([^)]*)/,Q=/opacity:([^;]*)/,R=/([A-Z])/g,H=/-([a-z])/gi,I=function(b,a){return a.toUpperCase()}, S=/(Left|Right|Width)/i,T=/(M11|M12|M21|M22)=[\d\-\.e]+/gi,U=/progid\:DXImageTransform\.Microsoft\.Matrix\(.+?\)/i,v=Math.PI/180,J=180/Math.PI,r=document.createElement("div"),y=function(){var b=document.createElement("div"),a;b.innerHTML="<a style='top:1px;opacity:.55;'>a</a>";return!(a=b.getElementsByTagName("a")[0])?!1:/^0.55/.test(a.style.opacity)}(),K=function(b){return!b||""===b?z.black:z[b]?z[b]:"#"===b.charAt(0)?(4===b.length&&(b="#"+b.charAt(1)+b.charAt(1)+b.charAt(2)+b.charAt(2)+b.charAt(3)+ b.charAt(3)),b=parseInt(b.substr(1),16),[b>>16,b>>8&255,b&255]):b.match(P)||z.transparent},L=function(b){return E.test("string"===typeof b?b:(b.currentStyle?b.currentStyle.filter:b.style.filter)||"")?parseFloat(RegExp.$1)/100:1},w=document.defaultView?document.defaultView.getComputedStyle:function(){},s=function(b,a,e,c){return!y&&"opacity"===a?L(b):!c&&b.style[a]?b.style[a]:(e=e||w(b,null))?(b=e.getPropertyValue(a.replace(R,"-$1").toLowerCase()))||e.length?b:e[a]:b.currentStyle?b.currentStyle[a]: null},A=function(b,a){var e={},c;if(a=a||w(b,null))if(c=a.length)for(;-1<--c;)e[a[c].replace(H,I)]=a.getPropertyValue(a[c]);else for(c in a)e[c]=a[c];else if(a=b.currentStyle||b.style)for(c in a)e[c.replace(H,I)]=a[c];y||(e.opacity=L(b));c=F(b,a,!1);e.rotation=c.rotation*J;e.skewX=c.skewX*J;e.scaleX=c.scaleX;e.scaleY=c.scaleY;e.x=c.x;e.y=c.y;null!=e.filters&&delete e.filters;return e},M=function(b,a,e,c){var i={},d,g;for(g in a)if("cssText"!==g&&"length"!==g&&isNaN(g)&&d!==m&&b[g]!=(d=a[g]))if("number"=== typeof d||"string"===typeof d)i[g]=d,c&&c.props.push(g);if(e)for(g in e)"className"!==g&&(i[g]=e[g]);return i},N={scaleX:1,scaleY:1,x:1,y:1,rotation:1,shortRotation:1,skewX:1,skewY:1,scale:1},O,m=function(){for(var b=document.body||document.documentElement,a=w(b,""),e="O -o- Moz -moz- ms -ms- Webkit -webkit-".split(" "),c=9;-1<(c-=2)&&!s(b,e[c]+"transform",a););return 0<c?(O=e[c]+"transform",e[c-1]+"Transform"):null}(),F=function(b,a,e){var c;m?c=s(b,O,a,!0):b.currentStyle&&(c=(c=b.currentStyle.filter.match(T))&& 4===c.length?c[0].substr(4)+","+Number(c[2].substr(4))+","+Number(c[1].substr(4))+","+c[3].substr(4)+",0,0":null);var a=(c||"").replace(/[^\d\-\.e,]/g,"").split(","),i=(c=6<=a.length)?Number(a[0]):1,d=c?Number(a[1]):0,g=c?Number(a[2]):0,f=c?Number(a[3]):1,h=e?b._gsTransform||{skewY:0}:{skewY:0},k=0>h.scaleX;h.x=c?Number(a[4]):0;h.y=c?Number(a[5]):0;h.rotation=Math.atan2(d,i);h.scaleX=Math.sqrt(i*i+d*d);h.scaleY=Math.sqrt(f*f+g*g);h.skewX=Math.atan2(g,f)+h.rotation;if(0>i&&0<=f||0<i&&0>=f)k?(h.scaleX*= -1,h.skewX+=0>=h.rotation?Math.PI:-Math.PI,h.rotation+=0>=h.rotation?Math.PI:-Math.PI):(h.scaleY*=-1,h.skewX+=0>=h.skewX?Math.PI:-Math.PI);1.0E-6>h.rotation&&-1.0E-6<h.rotation&&(h.rotation=0);1.0E-6>h.skewX&&-1.0E-6<h.skewX&&(h.skewX=0);e&&(b._gsTransform=h);return h},V={width:["Left","Right"],height:["Top","Bottom"]},W=["marginLeft","marginRight","marginTop","marginBottom"],t=function(b,a,e,c,i){if("px"===c)return e;if("auto"===c)return 0;var d=S.test(a),g=b,f=0>e;f&&(e=-e);r.style.cssText="border-style:solid; border-width:0; position:absolute; line-height:0;"; "%"===c||"em"===c?(g=b.parentNode||document.body,r.style[d?"width":"height"]=e+c):r.style[d?"borderLeftWidth":"borderTopWidth"]=e+c;g.appendChild(r);d=parseFloat(r[d?"offsetWidth":"offsetHeight"]);g.removeChild(r);0===d&&!i&&(d=t(b,a,e,c,!0));return f?-d:d},G=function(b,a){if(null==b||""===b||"auto"===b)b="0 0";var a=a||{},e=-1!==b.indexOf("left")?"0%":-1!==b.indexOf("right")?"100%":b.split(" ")[0],c=-1!==b.indexOf("top")?"0%":-1!==b.indexOf("bottom")?"100%":b.split(" ")[1];null==c?c="0":"center"=== c&&(c="50%");"center"===e&&(e="50%");a.oxp=-1!==e.indexOf("%");a.oyp=-1!==c.indexOf("%");a.oxr="="===e.charAt(1);a.oyr="="===c.charAt(1);a.ox=parseFloat(e.replace(u,""));a.oy=parseFloat(c.replace(u,""));return a},B=function(b,a){return null==b?a:"string"===typeof b&&1===b.indexOf("=")?Number(b.split("=").join(""))+a:Number(b)},C=function(b,a){var e=-1===b.indexOf("rad")?v:1,c=1===b.indexOf("="),b=Number(b.replace(u,""))*e;return c?b+a:b},z={aqua:[0,255,255],lime:[0,255,0],silver:[192,192,192],black:[0, 0,0],maroon:[128,0,0],teal:[0,128,128],blue:[0,0,255],navy:[0,0,128],white:[255,255,255],fuchsia:[255,0,255],olive:[128,128,0],yellow:[255,255,0],orange:[255,165,0],gray:[128,128,128],purple:[128,0,128],green:[0,128,0],red:[255,0,0],pink:[255,192,203],cyan:[0,255,255],transparent:[255,255,255,0]};o._onInitTween=function(b,a,e){if(!b.nodeType)return!1;this._target=b;this._tween=e;this._classData=this._transform=null;var e=this._style=b.style,c=w(b,""),i,d;"string"===typeof a?(i=e.cssText,d=A(b,c), e.cssText=i+";"+a,d=M(d,A(b)),!y&&Q.test(a)&&(val.opacity=parseFloat(RegExp.$1)),a=d,e.cssText=i):a.className&&(i=b.className,d=A(b,c),b.className="="!==a.className.charAt(1)?a.className:"+"===a.className.charAt(0)?b.className+" "+a.className.substr(2):b.className.split(a.className.substr(2)).join(""),a=M(d,A(b),a,this._classData={b:i,e:b.className,props:[]}),b.className=i);this._parseVars(a,b,c,a.suffixMap||n.suffixMap);return!0};o._parseVars=function(b,a,e,c){var i=this._style,d,g,f,h,k,l,j;for(d in b)if(g= b[d],"transform"===d||d===m)this._parseTransform(a,g,e,c);else if(N[d]||"transformOrigin"===d)this._parseTransform(a,b,e,c);else{if("alpha"===d||"autoAlpha"===d)d="opacity";else if("margin"===d||"padding"===d){g=(g+"").split(" ");h=g.length;f={};f[d+"Top"]=g[0];f[d+"Right"]=1<h?g[1]:g[0];f[d+"Bottom"]=4===h?g[2]:g[0];f[d+"Left"]=4===h?g[3]:2===h?g[1]:g[0];this._parseVars(f,a,e,c);continue}else if("backgroundPosition"===d||"backgroundSize"===d){f=G(g);j=G(h=s(a,d,e));this._firstPT=f={_next:this._firstPT, t:i,p:d,b:h,f:!1,n:"css_"+d,type:3,s:j.ox,c:f.oxr?f.ox:f.ox-j.ox,ys:j.oy,yc:f.oyr?f.oy:f.oy-j.oy,sfx:f.oxp?"%":"px",ysfx:f.oyp?"%":"px",r:!f.oxp&&!1!==b.autoRound};f.e=f.s+f.c+f.sfx+" "+(f.ys+f.yc)+f.ysfx;continue}else if("border"===d){g=(g+"").split(" ");this._parseVars({borderWidth:g[0],borderStyle:g[1]||"none",borderColor:g[2]||"#000000"},a,e,c);continue}else if("autoRound"===d)continue;h=s(a,d,e);h=null!=h?h+"":"";this._firstPT=f={_next:this._firstPT,t:i,p:d,b:h,f:!1,n:"css_"+d,sfx:"",r:!1,type:0}; "opacity"===d&&null!=b.autoAlpha&&(this._firstPT=f._prev={_next:f,t:i,p:"visibility",f:!1,n:"css_visibility",r:!1,type:-1,b:0!==Number(h)?"visible":"hidden",i:"visible",e:0===Number(g)?"hidden":"visible"},this._overwriteProps.push("css_visibility"));if("color"===d||"fill"===d||"stroke"===d||-1!==d.indexOf("Color")||"string"===typeof g&&!g.indexOf("rgb("))k=K(h),h=K(g),f.e=g,f.s=Number(k[0]),f.c=Number(h[0])-f.s,f.gs=Number(k[1]),f.gc=Number(h[1])-f.gs,f.bs=Number(k[2]),f.bc=Number(h[2])-f.bs,3<k.length|| 3<h.length?(f.as=4>k.length?1:Number(k[3]),f.ac=(4>h.length?1:Number(h[3]))-f.as,f.type=f.c||f.gc||f.bc||f.ac?2:-1):f.type=f.c||f.gc||f.bc?1:-1;else{k=h.replace(D,"");if(""===h||"auto"===h)if("width"===d||"height"===d){l=d;k=a;h=e;j=parseFloat("width"===l?k.offsetWidth:k.offsetHeight);l=V[l];var n=l.length;for(h=h||w(k,null);-1<--n;)j-=parseFloat(s(k,"padding"+l[n],h,!0))||0,j-=parseFloat(s(k,"border"+l[n]+"Width",h,!0))||0;k="px"}else j="opacity"!==d?0:1;else j=-1===h.indexOf(" ")?parseFloat(h.replace(u, "")):NaN;"string"===typeof g?(h="="===g.charAt(1),l=g.replace(D,""),g=-1===g.indexOf(" ")?parseFloat(g.replace(u,"")):NaN):(h=!1,l="");""===l&&(l=c[d]||k);f.e=g||0===g?(h?g+j:g)+l:b[d];if(k!==l&&""!==l&&(g||0===g))if(j||0===j)if(j=t(a,d,j,k),"%"===l?(j/=t(a,d,100,"%")/100,100<j&&(j=100)):"em"===l?j/=t(a,d,1,"em"):(g=t(a,d,g,l),l="px"),h&&(g||0===g))f.e=g+j+l;if((j||0===j)&&(g||0===g)&&(f.c=h?g:g-j))if(f.s=j,f.sfx=l,"opacity"===d)y||(f.type=4,f.p="filter",f.b="alpha(opacity="+100*f.s+")",f.e="alpha(opacity="+ 100*(f.s+f.c)+")",f.dup=null!=b.autoAlpha,this._style.zoom=1);else{if(!1!==b.autoRound&&("px"===l||"zIndex"===d))f.r=!0}else f.type=-1,f.i=f.e,f.s=f.c=0}this._overwriteProps.push("css_"+d);f._next&&(f._next._prev=f)}};o._parseTransform=function(b,a,e){if(!this._transform){var e=this._transform=F(b,e,!0),c=this._style,i,d;if("object"===typeof a){b={scaleX:B(null!=a.scaleX?a.scaleX:a.scale,e.scaleX),scaleY:B(null!=a.scaleY?a.scaleY:a.scale,e.scaleY),x:B(a.x,e.x),y:B(a.y,e.y)};null!=a.shortRotation? (b.rotation="number"===typeof a.shortRotation?a.shortRotation*v:C(a.shortRotation,e.rotation),i=(b.rotation-e.rotation)%(2*Math.PI),i!==i%Math.PI&&(i+=Math.PI*(0>i?2:-2)),b.rotation=e.rotation+i):b.rotation=null==a.rotation?e.rotation:"number"===typeof a.rotation?a.rotation*v:C(a.rotation,e.rotation);b.skewX=null==a.skewX?e.skewX:"number"===typeof a.skewX?a.skewX*v:C(a.skewX,e.skewX);b.skewY=null==a.skewY?e.skewY:"number"===typeof a.skewY?a.skewY*v:C(a.skewY,e.skewY);if(i=b.skewY-e.skewY)b.skewX+= i,b.rotation+=i;1.0E-6>b.skewY&&-1.0E-6<b.skewY&&(b.skewY=0);1.0E-6>b.skewX&&-1.0E-6<b.skewX&&(b.skewX=0);1.0E-6>b.rotation&&-1.0E-6<b.rotation&&(b.rotation=0);if(null!=(a=a.transformOrigin))m?(d=m+"Origin",this._firstPT=a={_next:this._firstPT,t:c,p:d,s:0,c:0,n:d,f:!1,r:!1,b:c[d],e:a,i:a,type:-1,sfx:""},a._next&&(a._next._prev=a)):G(a,e)}else if("string"===typeof a&&m)i=c[m],c[m]=a,b=F(b,null,!1),c[m]=i;else return;m?"WebkitTransform"===m&&(c[m+"Style"]="preserve-3d"):c.zoom=1;for(d in N)e[d]!==b[d]&& ("shortRotation"!==d&&"scale"!==d)&&(this._firstPT=a={_next:this._firstPT,t:e,p:d,s:e[d],c:b[d]-e[d],n:d,f:!1,r:!1,b:e[d],e:b[d],type:0,sfx:0},a._next&&(a._next._prev=a),this._overwriteProps.push("css_"+d))}};o.setRatio=function(b){var a=this._firstPT,e=1.0E-6,c,i;if(1===b&&(this._tween._time===this._tween._duration||0===this._tween._time))for(;a;)a.t[a.p]=a.e,4===a.type&&1===a.s+a.c&&this._style.removeAttribute("filter"),a=a._next;else if(b||!(this._tween._time===this._tween._duration||0===this._tween._time))for(;a;)c= a.c*b+a.s,a.r?c=0<c?c+0.5>>0:c-0.5>>0:c<e&&c>-e&&(c=0),a.type?1===a.type?a.t[a.p]="rgb("+(c>>0)+", "+(a.gs+b*a.gc>>0)+", "+(a.bs+b*a.bc>>0)+")":2===a.type?a.t[a.p]="rgba("+(c>>0)+", "+(a.gs+b*a.gc>>0)+", "+(a.bs+b*a.bc>>0)+", "+(a.as+b*a.ac)+")":-1===a.type?a.t[a.p]=a.i:3===a.type?(i=a.ys+b*a.yc,a.r&&(i=0<i?i+0.5>>0:i-0.5>>0),a.t[a.p]=c+a.sfx+" "+i+a.ysfx):(a.dup&&(a.t.filter=a.t.filter||"alpha(opacity=100)"),a.t.filter=-1===a.t.filter.indexOf("opacity=")?a.t.filter+(" alpha(opacity="+(100*c>>0)+ ")"):a.t.filter.replace(E,"opacity="+(100*c>>0))):a.t[a.p]=c+a.sfx,a=a._next;else for(;a;)a.t[a.p]=a.b,4===a.type&&1===a.s&&this._style.removeAttribute("filter"),a=a._next;if(this._transform)if(a=this._transform,m&&!a.rotation)this._style[m]=(a.x||a.y?"translate("+a.x+"px,"+a.y+"px) ":"")+(a.skewX?"skewX("+a.skewX+"rad) ":"")+(1!==a.scaleX||1!==a.scaleY?"scale("+a.scaleX+","+Math.cos(a.skewX)*a.scaleY+")":"")||"translate(0px,0px)";else{var d=m?a.rotation:-a.rotation,g=m?d-a.skewX:d+a.skewX;i=Math.cos(d)* a.scaleX;var d=Math.sin(d)*a.scaleX,f=Math.sin(g)*-a.scaleY,g=Math.cos(g)*a.scaleY,h;d<e&&d>-e&&(d=0);f<e&&f>-e&&(f=0);if(m)this._style[m]="matrix("+i+","+d+","+f+","+g+","+a.x+","+a.y+")";else if(h=this._target.currentStyle){e=d;d=-f;f=-e;e=this._style.filter;this._style.filter="";c=this._target.offsetWidth;var k=this._target.offsetHeight,l="absolute"!==h.position,j="progid:DXImageTransform.Microsoft.Matrix(M11="+i+", M12="+d+", M21="+f+", M22="+g,n=a.x,o=a.y,p,q;null!=a.ox&&(p=(a.oxp?0.01*c*a.ox: a.ox)-c/2,q=(a.oyp?0.01*k*a.oy:a.oy)-k/2,n=p-(p*i+q*d)+a.x,o=q-(p*f+q*g)+a.y);if(l)p=c/2,q=k/2,j+=", Dx="+(p-(p*i+q*d)+n)+", Dy="+(q-(p*f+q*g)+o)+")";else{l=4;p=a.ieOffsetX||0;q=a.ieOffsetY||0;a.ieOffsetX=Math.round((c-((0>i?-i:i)*c+(0>d?-d:d)*k))/2+n);for(a.ieOffsetY=Math.round((k-((0>g?-g:g)*k+(0>f?-f:f)*c))/2+o);-1<--l;)k=W[l],c=h[k],c=-1!==c.indexOf("px")?parseFloat(c):t(this._target,k,parseFloat(c),c.replace(D,""))||0,this._style[k]=Math.round(c-(2>l?p-a.ieOffsetX:q-a.ieOffsetY))+"px";j+=",sizingMethod='auto expand')"}this._style.filter= -1!==e.indexOf("progid:DXImageTransform.Microsoft.Matrix(")?e.replace(U,j):e+" "+j;if(0===b||1===b)1===i&&0===d&&0===f&&1===g&&(!E.test(e)||100===parseFloat(RegExp.$1))&&this._style.removeAttribute("filter")}}if(this._classData)if(a=this._classData,1===b&&(this._tween._time===this._tween._duration||0===this._tween._time)){for(l=a.props.length;-1<--l;)this._style[a.props[l]]="";this._target.className=a.e}else this._target.className!==a.b&&(this._target.className=a.b)};o._kill=function(b){var a=b,e; if(b.autoAlpha||b.alpha){a={};for(e in b)a[e]=b[e];a.opacity=1;a.autoAlpha&&(a.visibility=1)}return x.prototype._kill.call(this,a)};x.activate([n]);return n},!0)});window._gsDefine&&_gsQueue.pop()();/* context menu */
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
	
}(window));/* FWDData */
(function(window)
{
	var FWDData = function(xmlPath)
	{
		var self = this;
		var prototype = FWDData.prototype;

		this.imagesAr = [];
		this.graphicsPathsAr = [];
		this.req;
		this.xmlPath = xmlPath;
		this.image;
		this.totalImages = 0;
		
		this.thumbsBorderNormalColor;
		this.thumbsBorderSelectedColor;

		this.borderSize = 0;
		this.thumbsHSpace = 0;
		this.thumbsVSpace = 0;
		
		this.image;
		this.countLoadedGraphics = 0;
		this.totalGraphics;

		this.isMobile = false;

		this.load = function()
		{
			self.req = $.ajax
			({
				type : "GET",
				url : self.xmlPath,
				dataType : "xml",
				success : self.onLoadHandler,
				error : self.onLoadErrorHandler
			});
		};

		this.onLoadHandler = function(document)
		{
			self.nrOfColumns = parseInt(FWDUtils.trim($(document).find("number_of_columns").text()));
			self.thumbWidth = parseInt(FWDUtils.trim($(document).find("thumb_base_width").text()));
			self.thumbHeight = parseInt(FWDUtils.trim($(document).find("thumb_base_height").text()));
			
			if (FWDUtils.trim($(document).find("show_thumb_title").text()) == "no")
				self.showTitle = false;
			else
				self.showTitle = true;
			
			if (FWDUtils.trim($(document).find("show_grayscale_thumb").text()) == "no")
				self.showGrayscale = false;
			else
				self.showGrayscale = true;
			
			if (FWDUtils.trim($(document).find("show_dropshadow").text()) == "no")
				self.showDropshadow = false;
			else
				self.showDropshadow = true;

			self.borderSize = parseInt(FWDUtils.trim($(document).find("thumb_border_size").text()));
			self.thumbsHSpace = parseInt(FWDUtils.trim($(document).find("space_between_thumbs_horizontal").text()));
			self.thumbsVSpace = parseInt(FWDUtils.trim($(document).find("space_between_thumbs_vertical").text()));
			
			self.thumbsTitleBgColor = FWDUtils.trim($(document).find("thumb_title_background_color").text());
			self.thumbsTitleBgAlpha = FWDUtils.trim($(document).find("thumb_title_background_transparency").text());
			
			if (FWDUtils.trim($(document).find("thumb_title_background_text_width").text()) == "no")
				self.thumbsTitleBgTextWidth = false;
			else
				self.thumbsTitleBgTextWidth = true;
			
			self.thumbsDescrBgColor = FWDUtils.trim($(document).find("thumb_description_background_color").text());
			self.thumbsDescrBgAlpha = FWDUtils.trim($(document).find("thumb_description_background_transparency").text());
			
			self.thumbsBorderNormalColor = FWDUtils.trim($(document).find("thumb_border_normal_color").text());
			self.thumbsBorderSelectedColor = FWDUtils.trim($(document).find("thumb_border_selected_color").text());
			
			self.videoWidth = parseInt(FWDUtils.trim($(document).find("video_default_width").text()));
			self.videoHeight = parseInt(FWDUtils.trim($(document).find("video_default_height").text()));

			self.isMobile = FWDUtils.isMobile();

			$(document).find("image").each(function()
			{
				var obj = {};
				
				obj.imagePath = FWDUtils.trim($(this).find("image_path").text());
				obj.title = $(this).find("title").text();
				obj.text = $(this).find("description").text();
				obj.contentType = FWDUtils.trim($(this).find("content_type").text());
				obj.content = $(this).find("content").text();
				
				if (obj.contentType == "link")
				{
					obj.target = FWDUtils.trim($(this).find("content_type").attr("target"));
				}
				
				if (obj.contentType == "video")
				{
					obj.mobileContent = FWDUtils.trim($(this).find("mobile_content").text());
				}
				
				self.imagesAr.push(obj);
			});
			
			self.graphicsPathsAr.push(FWDUtils.trim($(document).find("thumb_video_play_button").text()));
			self.graphicsPathsAr.push(FWDUtils.trim($(document).find("thumb_sound_play_button").text()));

			self.totalGraphics = self.graphicsPathsAr.length;

			self.totalImages = self.imagesAr.length;
			self.loadGraphics();
		};
		
		this.onLoadErrorHandler = function(obj)
		{
			if (!self)
				return;
			
			var message = "XML file can't be loaded! <br><br>" + obj.statusText + "<br><br>" + err;
			var err = {text : message};
			
			self.dispatchEvent(FWDData.LOAD_ERROR, err);
		};

		/* load buttons graphics */
		this.loadGraphics = function()
		{
			if (self.image)
			{
				self.image.onload = null;
				self.image.onerror = null;
			}

			var imagePath = self.graphicsPathsAr[self.countLoadedGraphics];

			self.image = new Image();
			self.image.src = imagePath;

			self.image.onload = self.onImageLoadHandler;
			self.image.onerror = self.onImageLoadErrorHandler;
		};

		this.onImageLoadHandler = function(e)
		{
			if (self.countLoadedGraphics == 0)
			{
				self.videoBtnImg = self.image;
			}
			else if (self.countLoadedGraphics == 1)
			{
				self.soundBtnImg = self.image;
			}

			self.countLoadedGraphics++;
			
			if (self.countLoadedGraphics < self.totalGraphics)
			{
				self.loadGraphics();
			}
			else
			{
				self.dispatchEvent(FWDData.LOAD_COMPLETE);
			}
		};

		this.onImageLoadErrorHandler = function(e)
		{
			var message = "Graphics image not found! " + "<font color='#FFFFFF'>" + self.graphicsPathsAr[self.countLoadedGraphics] + "</font>";
			var err = {text : message};
			
			self.dispatchEvent(FWDData.LOAD_ERROR, err);
		};
	};
	
	/* destroy */
	this.destroy = function()
	{
		try
		{
			self.req.abort();
		}
		catch (e) {};

		if (self.image)
		{
			self.image.onload = null;
			self.image.onerror = null;
		}

		prototype.destroy();

		self.imagesAr = null;
		self.graphicsPathsAr = null;
		self.xmlPath = null;

		self.thumbsBorderNormalColor = null;
		self.thumbsBorderSelectedColor = null;
		self.thumbsDescrBgColor = null;
		self.thumbsDescrBgAlpha = null;
		self.thumbsBorderNormalColor = null;
		self.thumbsBorderSelectedColor = null;
		
		self.req = null;

		self.image = null;
		self = null;
		prototype = null;
		FWDData.prototype = null;
	};

	/* set prototype */
	FWDData.setPrototype = function()
	{
		FWDData.prototype = new FWDEventDispatcher();
	};

	FWDData.prototype = null;
	FWDData.LOAD_COMPLETE = "xmlLoadCoplete";
	FWDData.LOAD_ERROR = "xmlLoadError";

	window.FWDData = FWDData;
}(window));/* Display object */
(function (window){
	/*
	 * @ type values: div, img.
	 * @ positon values: relative, absolute.
	 * @ positon values: hidden.
	 * @ display values: block, inline-block, this applies only if the position is relative.
	 */
	var FWDDisplayObject = function(type, pPosition, overflow, display){
		
		this.listeners = {events_ar:[]};
		var self = this;
		
		if(type == "div" || type == "img" || type == "canvas"){
			this.type = type;	
		}else{
			throw Error("Type is not valid! " + type);
		}
		
		this.parent = null;
		this.children_ar = [];
		this._style;
		this._screen;
		this._numChildren;
		this.transform;
		this._position;
		this._overflow;
		this._display = "block";
		this._visible = true;
		this._buttonMode;
		this._globalX = 0;
		this._globalY = 0;
		this._x = 0;
		this._y = 0;
		this._w = 0;
		this._h = 0;
		this._rect;
		this._bk = 0;
		this._cl = 0;
		this._alpha = 0;
		this._innerHTML = "";
		this._innerText = "";
		
		if (FWDUtils.isFirefox())
		{
			this.hasTransform3d_bl =  false;
			this.hasTransform2d_bl =  false;
		}
		else
		{
			this.hasTransform3d_bl =  Modernizr.csstransforms3d;
			this.hasTransform2d_bl =  Modernizr.csstransforms;
		}
		
		this.isMobile_bl = FWDUtils.isMobile();
		this.isChrome_bl = FWDUtils.isChrome();
		
		if(pPosition == "relative"){this._position = "relative";}else{this._position = "absolute";}
		if(overflow == "visible"){this._overflow = "visible";}else{this._overflow = "visible";}
	
		/* init */
		this.init = function(){
	
			/* getter and setters */
			Object.defineProperty(this, "screen", {"get": this.getScreen, "set":this.setScreen, configurable:true});
			Object.defineProperty(this, "style", {"get": this.getStyle, configurable:true, configurable:true});
			Object.defineProperty(this, "selectable", {"set":this.setSelectable, configurable:true});
			Object.defineProperty(this, "buttonMode", {"set":this.buttonMode, configurable:true});
			Object.defineProperty(this, "position", {"set":this.setPosition, configurable:true});
			Object.defineProperty(this, "overflow", {"set":this.setOverflow, configurable:true});
			Object.defineProperty(this, "visible", {"get": this.getVisible, "set":this.setVisible, configurable:true});
			Object.defineProperty(this, "innerHTML", {"get": this.getInnerHTML, "set":this.setInnerHTML, configurable:true});
			Object.defineProperty(this, "innerText", {"get": this.getInnerText, configurable:true});
			Object.defineProperty(this, "rect", {"get": this.getRect, configurable:true});
			Object.defineProperty(this, "numChildren", {"get": this.getNumChildren, configurable:true});
			Object.defineProperty(this, "globalX", {"get": this.getGlobalX, configurable:true});
			Object.defineProperty(this, "globalY" , {"get": this.getGlobalY, configurable:true});
			Object.defineProperty(this, "alpha", {"get": this.getAlpha, "set": this.setAlpha, configurable:true});
			Object.defineProperty(this, "x", {"get": this.getX, "set": this.setX, configurable:true});
			Object.defineProperty(this, "y", {"get": this.getY,"set": this.setY, configurable:true});
			Object.defineProperty(this, "w", {"get": this.getWidth,"set": this.setWidth, configurable:true});
			Object.defineProperty(this, "h", {"get": this.getHeight,"set": this.setHeight, configurable:true});
			Object.defineProperty(this, "bk", {"get": this.getBackgroundColor,"set": this.setBackgroundColor, configurable:true});
			Object.defineProperty(this, "cl", {"get": this.getTextColor,"set": this.setTextColor, configurable:true});
			
			this.setupScreen();
		};	
		
		/* setup screen */
		this.setupScreen = function(){
			this.screen = document.createElement(this.type);
		};
		
		/* destroy */
		this.destroy = function(){
			
			try{this.screen.parentNode.removeChild(this.screen);}catch(e){};
			
			delete this.screen;
			delete this.style;
			this._screen.onselectstart = null;
			this._screen.ondragstart = null;
			this._screen.onmouseover = null;
			this._screen.onmouseout = null;
			this._screen.onmouseup = null;
			this._screen.onmousedown = null;
			this._screen.onmousemove = null;
			this._screen.onclick = null;
			this.children_ar = null;
			this._innerHTML = null;
			this._innerText = null;
			this._overflow = null;
			this._rect = null;
			this._screen = null;
			this._bk = null;
			this._cl = null;
			this.type = null;
			this.listeners.events_ar = null;
			this.listeners = null;	
			
			self = null;
		};
		
		this.disposeImage = function(){
			this.screen.src = null;
		};
		
		this.setResizableSizeAfterParent = function(){
			this.screen.style.width = "100%";
			this.screen.style.height = "100%";
		};
		
		/* check if it supports transforms. */
		this.getTransformProperty = function() {
		    var properties = ['transform', 'msTransform', 'WebkitTransform', 'MozTransform', 'OTransform'];
		    var p;
		    while (p = properties.shift()) {
		       if (typeof this.screen.style[p] !== 'undefined') {
		            return p;
		       }
		    }
		    return false;
		};
		
		/* getter and setter functions */
		this.setScreen = function(val){
			self._screen = val;
			this.transform = this.getTransformProperty();
			
			this.screen.style.display = this._display;
			this.screen.style.position = this._position;
			this.screen.style.overflow = this._overflow;
		
			this.alpha = 1;
			this.screen.style.left = "0px";
			this.screen.style.top = "0px";
			this.screen.style.margin = "0px";
			this.screen.style.padding = "0px";
			this.screen.style.maxWidth = "none";
			this.screen.style.maxHeight = "none";
			this.screen.style.border = "none";
			this.screen.style.backgroundColor = "transparent";
			this.screen.style.backfaceVisibility = "hidden";
			this.screen.style.webkitBackfaceVisibility = "hidden";
			this.screen.style.MozBackfaceVisibility = "hidden";	
			this.screen.style.MozImageRendering = "optimizeSpeed";	
			this.screen.onselectstart = function(){return false;};
			
			if(type == "img"){
				this.w = this.screen.width;
				this.h = this.screen.height;
				this.screen.onmousedown = function(e){return false;};
			}
			
			this.screen.onselectstart = function(){return false;};
			this.screen.ondragstart = function(e){return false;};
		};
		
		this.setSelectable = function(val){
			if(!val){
				try{this.screen.style.userSelect = "none";}catch(e){};
				try{this.screen.style.MozUserSelect = "none";}catch(e){};
				try{this.screen.style.webkitUserSelect = "none";}catch(e){};
				try{this.screen.style.khtmlUserSelect = "none";}catch(e){};
				try{this.screen.style.oUserSelect = "none";}catch(e){};
				try{this.screen.style.msUserSelect = "none";}catch(e){};
				try{this.screen.msUserSelect = "none";}catch(e){};
				this.screen.onselectstart = function(){return false;};
				this.screen.style.webkitTouchCallout='none';
			}
		};
		
		this.setVisible = function(val){
			this._visible = val;
			if(this._visible == true){
				this.screen.style.visibility = "visible";
			}else{
				this.screen.style.visibility = "hidden";
			}
			
		};
		
		this.getVisible = function(){
			return this._visible;
		};
		
		this.getScreen = function(){
			return self._screen;
		};
		
		this.getStyle = function(){
			return this.screen.style;
		};
		
		this.buttonMode = function(val){
			this._buttonMode = val;
			if(this._buttonMode ==  true){
				this.screen.style.cursor = "pointer";
			}else{
				this.screen.style.cursor = "default";
			}
		};
		
		this.setOverflow = function(val){
			self._overflow = val;
			self.screen.style.overflow = self._overflow;
		};
		
		this.setPosition = function(val){
			self._position = val;
			self.screen.style.position = self._position;
		};
		
		this.setInnerHTML = function(val){
			self._innerHTML = val;
			self.screen.innerHTML = self._innerHTML;
		};
		
		this.getInnerHTML = function(){
			return self.screen.innerHTML;
		};
		
		this.getInnerText = function(){
			return self.screen.innerText;
		};
		
		this.getNumChildren = function(){
			return self.children_ar.length;
		};
		
		this.getRect = function(){
			return self.screen.getBoundingClientRect();
		};
		
		this.setAlpha = function(val){
			self._alpha = val;
			self.screen.style.opacity = self._alpha;
		};
		
		this.getAlpha = function(){
			return  self._alpha;
		};
		
		this.getGlobalX = function(){
			return this.rect.left;
		};
		
		this.getGlobalY = function(){
			return this.rect.top;
		};
		
		this.setX = function(val){
			self._x = val;
			if(self.hasTransform3d_bl){
				self.screen.style[self.transform] = 'translate3d(' + self._x + 'px,' + self._y + 'px,0)';
			}else if(self.hasTransform2d_bl){
				self.screen.style[self.transform] = 'translate(' + self._x + 'px,' + self._y + 'px)';
			}else{
				self.screen.style.left = self._x + "px";
			}
		};
		
		this.getX = function(){
			return  self._x;
		};
		
		this.setY = function(val){
			self._y = val;
			if(self.hasTransform3d_bl){
				self.screen.style[self.transform] = 'translate3d(' + self._x + 'px,' + self._y + 'px,0)';	
			}else if(self.hasTransform2d_bl){
				self.screen.style[self.transform] = 'translate(' + self._x + 'px,' + self._y + 'px)';
			}else{
				self.screen.style.top = self._y + "px";
			}
		};
		
		this.getY = function(){
			return  self._y;
		};
		
		this.setWidth = function(val){
			self._w = val;
			if(self.type == "img"){
				self.screen.width = self._w;
			}else{
				self.screen.style.width = self._w + "px";
			}
		};
		
		this.getWidth = function(){
			if(self.type == "div"){
				if(self.screen.offsetWidth != 0) return  self.screen.offsetWidth;
				return self._w;
			}else if(self.type == "img"){
				if(self.screen.offsetWidth != 0) return  self.screen.offsetWidth;
				if(self.screen.width != 0) return  self.screen.width;
				return self._w;
			}else if(self.type == "canvas"){
				if(self.screen.offsetWidth != 0) return  self.screen.offsetWidth;
				return self._w;
			}
		};
		
		this.setHeight = function(val){
			self._h = val;
			if(self.type == "img"){
				self.screen.height = self._h;
			}else{
				self.screen.style.height = self._h + "px";
			}
		};
		
		this.getHeight = function(){
			if(self.type == "div"){
				if(self.screen.offsetHeight != 0) return  self.screen.offsetHeight;
				return self._h;
			}else if(self.type == "img"){
				if(self.screen.offsetHeight != 0) return  self.screen.offsetHeight;
				if(self.screen.height != 0) return  self.screen.height;
				return self._h;
			}else if(self.type == "canvas"){
				if(self.screen.offsetHeight != 0) return  self.screen.offsetHeight;
				return self._h;
			}
		};
		
		this.setBackgroundColor = function(val){
			self._bk = val;
			self.screen.style.backgroundColor = val;
		};
		
		this.getBackgroundColor = function(){
			return self.screen.style.backgroundColor;
		};
		
		this.setTextColor = function(val){
			self._cl = val;
			self.screen.style.color = self._cl;
		};
		
		this.getTextColor = function(){
			return self.screen.style.color;
		};
		
		/* add remove children_ar */
		this.addChild = function(e){
			if(this.contains(e)){	
				this.children_ar.splice(this.children_ar.indexOf(e), 1);
				this.children_ar.push(e);
				this.screen.appendChild(e.screen);
			}else{
				this.children_ar.push(e);
				this.screen.appendChild(e.screen);
			}
		};
		
		this.removeChild = function(e){
			if(this.contains(e)){
				this.children_ar.splice(this.children_ar.indexOf(e), 1);
				this.screen.removeChild(e.screen);
			}else{
				throw Error("##removeChild## Child does not exist, it can't be removed!");
			};
		};
		
		this.contains = function(e){
			if(this.children_ar.indexOf(e) == -1){
				return false;
			}else{
				return true;
			}
		};
		
		this.addChildAtZero = function(e){		
			if(this.numChildren == 0){
				this.children_ar.push(e);
				this.screen.appendChild(e.screen);
			}else{
				this.screen.insertBefore(e.screen, this.children_ar[0].screen);
				if(this.contains(e)){this.children_ar.splice(this.children_ar.indexOf(e), 1);}	
				this.children_ar.unshift(e);
			}
		};
		
		this.getChildAt = function(index){
			if(index < 0  || index > this.numChildren -1) throw Error("##getChildAt## Index out of bounds!");
			if(this.numChildren == 0) throw Errror("##getChildAt## Child dose not exist!");
			return this.children_ar[index];
		};
		
		this.removeChildAtZero = function(){
			this.screen.removeChild(this.children_ar[0].screen);
			this.children_ar.shift();
		};
		
		this.addChildAtTop = function(parent, e){
			parent.screen.insertBefore(e.screen, this.children_ar[this.children_ar.length - 1].screen);
		};
		
		/* event dispatcher stuff */
		this.addListener = function (type, listener){
	    	
	    	if(type == undefined) throw Error("type is required.");
	    	if(typeof type === "object") throw Error("type must be of type String.");
	    	if(typeof listener != "function") throw Error("listener must be of type Function.");
	    	
	        var event = {};
	        event.type = type;
	        event.listener = listener;
	        event.target = this;
	        this.listeners.events_ar.push(event);
	    };
	    
	    this.dispatchEvent = function(type, props){
	    	if(type == undefined) throw Error("type is required.");
	    	if(typeof type === "object") throw Error("type must be of type String.");
	    	
	        for (var i=0, len=this.listeners.events_ar.length; i < len; i++){
	        	if(this.listeners.events_ar[i].target === this && this.listeners.events_ar[i].type === type){
	        		
	    	        if(props){
	    	        	for(var prop in props){
	    	        		this.listeners.events_ar[i][prop] = props[prop];
	    	        	}
	    	        }
	        		this.listeners.events_ar[i].listener.call(this, this.listeners.events_ar[i]);
	        		break;
	        	}
	        }
	    };
	    
	   this.removeListener = function(type, listener){
	    	
	    	if(type == undefined) throw Error("type is required.");
	    	if(typeof type === "object") throw Error("type must be of type String.");
	    	if(typeof listener != "function") throw Error("listener must be of type Function." + type);
	    	
	        for (var i=0, len=this.listeners.events_ar.length; i < len; i++){
	        	if(this.listeners.events_ar[i].target === this 
	        			&& this.listeners.events_ar[i].type === type
	        			&& this.listeners.events_ar[i].listener ===  listener
	        	){
	        		this.listeners.events_ar.splice(i,1);
	        		break;
	        	}
	        }  
	    };
		
	    /* init */
		this.init();
	};
	
	window.FWDDisplayObject = FWDDisplayObject;
}(window));(function (){
	
	var FWDEventDispatcher = function (){
		
	    this.listeners = {events_ar:[]};
	    
	    /* destroy */
	    this.destroy = function(){
	    	this.listeners = null;
	    };
	    
	    this.addListener = function (type, listener){
	    	
	    	if(type == undefined) throw Error("type is required.");
	    	if(typeof type === "object") throw Error("type must be of type String.");
	    	if(typeof listener != "function") throw Error("listener must be of type Function.");
	    	
	        var event = {};
	        event.type = type;
	        event.listener = listener;
	        event.target = this;
	        this.listeners.events_ar.push(event);
	    };
	    
	    this.dispatchEvent = function(type, props){
			
	    	if(type == undefined) throw Error("type is required.");
	    	if(typeof type === "object") throw Error("type must be of type String.");
	    	
	        for (var i=0, len=this.listeners.events_ar.length; i < len; i++){
	        	if(this.listeners.events_ar[i].target === this && this.listeners.events_ar[i].type === type){
	        		
	    	        if(props){
	    	        	for(var prop in props){
	    	        		this.listeners.events_ar[i][prop] = props[prop];
	    	        	}
	    	        }
	        		this.listeners.events_ar[i].listener.call(this, this.listeners.events_ar[i]);
	        		break;
	        	}
	        }
	    };
	    
	   this.removeListener = function(type, listener){
	    	
	    	if(type == undefined) throw Error("type is required.");
	    	if(typeof type === "object") throw Error("type must be of type String.");
	    	if(typeof listener != "function") throw Error("listener must be of type Function." + type);
	    	
	        for (var i=0, len=this.listeners.events_ar.length; i < len; i++){
	        	if(this.listeners.events_ar[i].target === this && this.listeners.events_ar[i].type === type){
	        		this.listeners.events_ar.splice(i,1);
	        		break;
	        	}
	        }  
	    };
	    
	};	
	
	window.FWDEventDispatcher = FWDEventDispatcher;
}(window));/* Info screen */
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
}(window));(function (window) {

        // This library re-implements setTimeout, setInterval, clearTimeout, clearInterval for iOS6.
        // iOS6 suffers from a bug that kills timers that are created while a page is scrolling.
        // This library fixes that problem by recreating timers after scrolling finishes (with interval correction).
		// This code is free to use by anyone (MIT, blabla).
		// Author: rkorving@wizcorp.jp
		
		var platform = navigator.platform;
		var isIpadOrIphone = false;
		if(platform == 'iPad' ||  platform == 'iPhone') isIpadOrIphone = true;
		if(!isIpadOrIphone) return;
		
		var userAgent = navigator.userAgent;
		var isIosVersion6 = false;
		if(userAgent.indexOf("6") != -1) isIosVersion6 = true;
		if(!isIosVersion6) return;
		
	
        var timeouts = {};
        var intervals = {};
        var orgSetTimeout = window.setTimeout;
        var orgSetInterval = window.setInterval;
        var orgClearTimeout = window.clearTimeout;
        var orgClearInterval = window.clearInterval;


        function createTimer(set, map, args) {
                var id, cb = args[0], repeat = (set === orgSetInterval);

                function callback() {
                        if (cb) {
                                cb.apply(window, arguments);

                                if (!repeat) {
                                        delete map[id];
                                        cb = null;
                                }
                        }
                }

                args[0] = callback;

                id = set.apply(window, args);

                map[id] = { args: args, created: Date.now(), cb: cb, id: id };

                return id;
        }


        function resetTimer(set, clear, map, virtualId, correctInterval) {
                var timer = map[virtualId];

                if (!timer) {
                        return;
                }

                var repeat = (set === orgSetInterval);

                // cleanup

                clear(timer.id);

                // reduce the interval (arg 1 in the args array)

                if (!repeat) {
                        var interval = timer.args[1];

                        var reduction = Date.now() - timer.created;
                        if (reduction < 0) {
                                reduction = 0;
                        }

                        interval -= reduction;
                        if (interval < 0) {
                                interval = 0;
                        }

                        timer.args[1] = interval;
                }

                // recreate

                function callback() {
                        if (timer.cb) {
                                timer.cb.apply(window, arguments);
                                if (!repeat) {
                                        delete map[virtualId];
                                        timer.cb = null;
                                }
                        }
                }

                timer.args[0] = callback;
                timer.created = Date.now();
                timer.id = set.apply(window, timer.args);
        }


        window.setTimeout = function () {
                return createTimer(orgSetTimeout, timeouts, arguments);
        };


        window.setInterval = function () {
                return createTimer(orgSetInterval, intervals, arguments);
        };

        window.clearTimeout = function (id) {
                var timer = timeouts[id];

                if (timer) {
                        delete timeouts[id];
                        orgClearTimeout(timer.id);
                }
        };

        window.clearInterval = function (id) {
                var timer = intervals[id];

                if (timer) {
                        delete intervals[id];
                        orgClearInterval(timer.id);
                }
        };

        window.addEventListener('scroll', function () {
                // recreate the timers using adjusted intervals
                // we cannot know how long the scroll-freeze lasted, so we cannot take that into account
                var virtualId;
             
                for (virtualId in timeouts) {
                        resetTimer(orgSetTimeout, orgClearTimeout, timeouts, virtualId);
                }

                for (virtualId in intervals) {
                        resetTimer(orgSetInterval, orgClearInterval, intervals, virtualId);
                }
        });

}(window));/* Modernizr 2.5.3 (Custom Build) | MIT & BSD
 * Build: http://modernizr.com/download/#-csstransforms-csstransforms3d-canvas-audio-video-teststyles-testprop-testallprops-prefixes-domprefixes
 */
;window.Modernizr=function(a,b,c){function y(a){i.cssText=a}function z(a,b){return y(l.join(a+";")+(b||""))}function A(a,b){return typeof a===b}function B(a,b){return!!~(""+a).indexOf(b)}function C(a,b){for(var d in a)if(i[a[d]]!==c)return b=="pfx"?a[d]:!0;return!1}function D(a,b,d){for(var e in a){var f=b[a[e]];if(f!==c)return d===!1?a[e]:A(f,"function")?f.bind(d||b):f}return!1}function E(a,b,c){var d=a.charAt(0).toUpperCase()+a.substr(1),e=(a+" "+n.join(d+" ")+d).split(" ");return A(b,"string")||A(b,"undefined")?C(e,b):(e=(a+" "+o.join(d+" ")+d).split(" "),D(e,b,c))}var d="2.5.3",e={},f=b.documentElement,g="modernizr",h=b.createElement(g),i=h.style,j,k={}.toString,l=" -webkit- -moz- -o- -ms- ".split(" "),m="Webkit Moz O ms",n=m.split(" "),o=m.toLowerCase().split(" "),p={},q={},r={},s=[],t=s.slice,u,v=function(a,c,d,e){var h,i,j,k=b.createElement("div"),l=b.body,m=l?l:b.createElement("body");if(parseInt(d,10))while(d--)j=b.createElement("div"),j.id=e?e[d]:g+(d+1),k.appendChild(j);return h=["&#173;","<style>",a,"</style>"].join(""),k.id=g,(l?k:m).innerHTML+=h,m.appendChild(k),l||(m.style.background="",f.appendChild(m)),i=c(k,a),l?k.parentNode.removeChild(k):m.parentNode.removeChild(m),!!i},w={}.hasOwnProperty,x;!A(w,"undefined")&&!A(w.call,"undefined")?x=function(a,b){return w.call(a,b)}:x=function(a,b){return b in a&&A(a.constructor.prototype[b],"undefined")},Function.prototype.bind||(Function.prototype.bind=function(b){var c=this;if(typeof c!="function")throw new TypeError;var d=t.call(arguments,1),e=function(){if(this instanceof e){var a=function(){};a.prototype=c.prototype;var f=new a,g=c.apply(f,d.concat(t.call(arguments)));return Object(g)===g?g:f}return c.apply(b,d.concat(t.call(arguments)))};return e});var F=function(a,c){var d=a.join(""),f=c.length;v(d,function(a,c){var d=b.styleSheets[b.styleSheets.length-1],g=d?d.cssRules&&d.cssRules[0]?d.cssRules[0].cssText:d.cssText||"":"",h=a.childNodes,i={};while(f--)i[h[f].id]=h[f];e.csstransforms3d=(i.csstransforms3d&&i.csstransforms3d.offsetLeft)===9&&i.csstransforms3d.offsetHeight===3},f,c)}([,["@media (",l.join("transform-3d),("),g,")","{#csstransforms3d{left:9px;position:absolute;height:3px;}}"].join("")],[,"csstransforms3d"]);p.canvas=function(){var a=b.createElement("canvas");return!!a.getContext&&!!a.getContext("2d")},p.csstransforms=function(){return!!E("transform")},p.csstransforms3d=function(){var a=!!E("perspective");return a&&"webkitPerspective"in f.style&&(a=e.csstransforms3d),a},p.video=function(){var a=b.createElement("video"),c=!1;try{if(c=!!a.canPlayType)c=new Boolean(c),c.ogg=a.canPlayType('video/ogg; codecs="theora"').replace(/^no$/,""),c.h264=a.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/,""),c.webm=a.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/,"")}catch(d){}return c},p.audio=function(){var a=b.createElement("audio"),c=!1;try{if(c=!!a.canPlayType)c=new Boolean(c),c.ogg=a.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,""),c.mp3=a.canPlayType("audio/mpeg;").replace(/^no$/,""),c.wav=a.canPlayType('audio/wav; codecs="1"').replace(/^no$/,""),c.m4a=(a.canPlayType("audio/x-m4a;")||a.canPlayType("audio/aac;")).replace(/^no$/,"")}catch(d){}return c};for(var G in p)x(p,G)&&(u=G.toLowerCase(),e[u]=p[G](),s.push((e[u]?"":"no-")+u));return y(""),h=j=null,e._version=d,e._prefixes=l,e._domPrefixes=o,e._cssomPrefixes=n,e.testProp=function(a){return C([a])},e.testAllProps=E,e.testStyles=v,e}(this,this.document);(function (window){
	
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
	
}(window));/* thumbs */
(function(window)
{
	var FWDThumb = function(id, data)
	{
		var self = this;
		var prototype = FWDThumb.prototype;

		this.id = id;
		this.borderSize = data.borderSize;
		this.borderNormalColor = data.thumbsBorderNormalColor;
		this.borderSelectedColor = data.thumbsBorderSelectedColor;

		this.mainDO = null;
		this.backgroundDO = null;
		this.imageHolderDO = null;
		this.imageDO = null;
		this.grayImageDO = null;
		this.image = null;
		this.overDO = null;
		this.textDO = null;
		
		this.titleDO = null;
		this.titleBgDO = null;
		this.titleHolderDO = null;
		
		this.descriptionDO = null;
		this.descriptionBgDO = null;
		this.descriptionHolderDO = null;
		
		this.playBtnDO = null;
		this.playBtnDOContext = null;
		
		this.thumbHeight = 0;
		
		this.finalX = 0;
		this.finalY = 0;
		this.finalW = 0;
		this.finalH = 0;

		this.hasImage = false;
		this.isMobile = data.isMobile;
		this.isOnScreen = true;
		this.used = false;
		this.isMedia = false;

		/* init */
		this.init = function()
		{
			self.setupScreen();
		};

		/* setup screen */
		this.setupScreen = function()
		{
			self.mainDO = new FWDDisplayObject("div", "absolute", "hidden");
			self.backgroundDO = new FWDDisplayObject("div", "absolute");
			self.imageDO = new FWDDisplayObject("img", "absolute");
			self.mainDO.addChild(self.backgroundDO);
			self.addChild(self.mainDO);

			self.overDO = new FWDDisplayObject("div", "absolute");
			self.addChild(self.overDO);
			self.overDO.bk = "#000000";
			self.overDO.alpha = 0;
			
			self.overflow = "hidden";
		};

		/* add image */
		this.addImage = function(image)
		{
			self.imageHolderDO = new FWDDisplayObject("div", "absolute");
			self.mainDO.addChild(self.imageHolderDO);
			
			self.imageDO.screen = image;
			self.imageHolderDO.addChild(self.imageDO);
			
			self.imageHolderDO.overflow = "hidden";

			self.backgroundDO.bk = self.borderNormalColor;
			self.backgroundDO.w = self.finalW;
			self.backgroundDO.h = self.finalH;

			self.imageHolderDO.x = self.borderSize;
			self.imageHolderDO.y = self.borderSize;
			
			self.imageHolderDO.w = self.imageDO.w;
			self.imageHolderDO.h = self.imageDO.h;
			
			self.overDO.w = self.mainDO.w = self.finalW;
			self.overDO.h = self.mainDO.h = self.finalH;
			
			self.hasImage = true;
			
			if (data.showGrayscale)
				self.addGrayscaleImage();
			
			if ((data.imagesAr[self.id].contentType != "image") && (data.imagesAr[self.id].contentType != "link"))
			{
				self.isMedia = true;
				
				if (data.imagesAr[self.id].contentType == "audio")
				{
				
					self.addSoundPlayBtn();
				}
				else
				{
					self.addVideoPlayBtn();
				}
			}
			
			self.addImageText();
			
			self.w = self.finalW;
			
			if (!self.isMobile)
			{
				self.h = 0;
				
				if (FWDUtils.isFirefox())
				{
					TweenMax.to(self, .8, {h : self.finalH, ease : Expo.easeInOut});
				}
				else
				{
					self.alpha = 0;
			
					TweenMax.to(self, .8, {h : self.finalH, alpha:1, ease : Expo.easeInOut});
				}
			}
			else
			{
				self.h = self.finalH;
				self.alpha = 0;
			
				TweenMax.to(self, .8, {alpha:1, ease : Expo.easeInOut});
			}
			
			if (data.showDropshadow)
			{
				self.screen.style.boxShadow = "1px 1px 2px #555555";
				self.screen.style.MozBoxShadow = "1px 1px 2px #555555";
				self.screen.style.WebkitBoxShadow = "1px 1px 2px #555555";
			}
		};
		
		this.addGrayscaleImage = function()
		{
			var canvas = document.createElement("canvas");
			var ctx = canvas.getContext("2d");
			
			canvas.width = self.imageDO.screen.width;
			canvas.height = self.imageDO.screen.height; 
			
			ctx.drawImage(self.imageDO.screen, 0, 0); 
			
			var imgPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
			
			for (var y = 0; y < imgPixels.height; y++)
			{
				for (var x = 0; x < imgPixels.width; x++)
				{
					var i = (y * 4) * imgPixels.width + x * 4;
					var avg = (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) / 3;
					
					imgPixels.data[i] = avg; 
					imgPixels.data[i + 1] = avg; 
					imgPixels.data[i + 2] = avg;
				}
			}
			
			ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
			
			self.grayImageDO = new FWDDisplayObject("canvas");
			self.grayImageDO.screen = canvas;
			self.imageHolderDO.addChild(self.grayImageDO);
		};
		
		this.addVideoPlayBtn = function()
		{
			self.playBtnDO = new FWDDisplayObject("canvas");
			self.playBtnDOContext = self.playBtnDO.screen.getContext("2d");
			self.playBtnDO.screen.width = data.videoBtnImg.width;
			self.playBtnDO.screen.height = data.videoBtnImg.height;
			self.playBtnDOContext.drawImage(data.videoBtnImg, 0, 0);
			self.mainDO.addChild(self.playBtnDO);
			
			self.playBtnDO.x = (self.finalW - self.playBtnDO.w) / 2;
			self.playBtnDO.y = (self.finalH - self.playBtnDO.h) / 2;
			
			self.playBtnDO.alpha = 0;
		};
		
		this.addSoundPlayBtn = function()
		{
			self.playBtnDO = new FWDDisplayObject("canvas");
			self.playBtnDOContext = self.playBtnDO.screen.getContext("2d");
			self.playBtnDO.screen.width = data.soundBtnImg.width;
			self.playBtnDO.screen.height = data.soundBtnImg.height;
			self.playBtnDOContext.drawImage(data.soundBtnImg, 0, 0);
			self.mainDO.addChild(self.playBtnDO);
			
			self.playBtnDO.x = (self.finalW - self.playBtnDO.w) / 2;
			self.playBtnDO.y = (self.finalH - self.playBtnDO.h) / 2;
			
			self.playBtnDO.alpha = 0;
		};
		
		this.addImageText = function()
		{
			self.textDO = new FWDDisplayObject("div");
			self.imageHolderDO.addChild(self.textDO);
			
			self.titleHolderDO = new FWDDisplayObject("div");
			self.textDO.addChild(self.titleHolderDO);
			
			self.titleBgDO = new FWDDisplayObject("div");
			self.titleHolderDO.addChild(self.titleBgDO);
			
			self.titleBgDO.bk = data.thumbsTitleBgColor;
			self.titleBgDO.alpha = data.thumbsTitleBgAlpha;
			
			self.titleHolderDO.w = self.imageHolderDO.w;
			
			self.titleDO = new FWDDisplayObject("div");
			self.titleHolderDO.addChild(self.titleDO);
			
			self.titleDO.innerHTML = data.imagesAr[self.id].title;
			
			self.titleDO.style.fontSmoothing = "antialiased";
			self.titleDO.style.webkitFontSmoothing = "antialiased";
			self.titleDO.style.textRendering = "optimizeLegibility";
			
			self.descriptionHolderDO = new FWDDisplayObject("div");
			self.textDO.addChild(self.descriptionHolderDO);
			
			self.descriptionBgDO = new FWDDisplayObject("div");
			self.descriptionHolderDO.addChild(self.descriptionBgDO);
			
			self.descriptionBgDO.bk = data.thumbsDescrBgColor;
			self.descriptionBgDO.alpha = data.thumbsDescrBgAlpha;
			
			self.descriptionDO = new FWDDisplayObject("div");
			self.descriptionHolderDO.addChild(self.descriptionDO);
			
			self.descriptionHolderDO.w = self.imageHolderDO.w;
			
			self.descriptionDO.innerHTML = data.imagesAr[self.id].text;
			
			self.descriptionDO.style.fontSmoothing = "antialiased";
			self.descriptionDO.style.webkitFontSmoothing = "antialiased";
			self.descriptionDO.style.textRendering = "optimizeLegibility";
			
			self.addChild(self.overDO);
			
			self.textTimeoutId = setTimeout(self.showText, 10);
		};
		
		this.showText = function()
		{
			if (data.thumbsTitleBgTextWidth)
			{
				self.titleBgDO.w = self.imageHolderDO.w;
			}
			else
			{
				self.titleBgDO.w = self.titleDO.w;
			}
			
			self.titleHolderDO.h = self.titleDO.h;
			self.titleBgDO.h = self.titleDO.h;
			
			self.descriptionHolderDO.w = self.imageHolderDO.w;
			self.descriptionHolderDO.h = self.descriptionDO.h;
			self.descriptionBgDO.w = self.imageHolderDO.w;
			self.descriptionBgDO.h = self.descriptionDO.h;
			
			self.descriptionHolderDO.y = parseInt(self.titleHolderDO.h);
			
			self.textDO.h = self.titleHolderDO.h + self.descriptionHolderDO.h;
			
			if (data.showTitle)
			{
				self.overY = parseInt(self.imageHolderDO.h - self.textDO.h);
				self.outY = parseInt(self.imageHolderDO.h - self.titleHolderDO.h);
			}
			else
			{
				self.overY = parseInt(self.imageHolderDO.h - self.textDO.h);
				self.outY = parseInt(self.imageHolderDO.h);
			}
			
			self.textDO.y = self.outY;
		};

		/* set normal / selected display states */
		this.setNormalState = function()
		{
			TweenMax.to(self.backgroundDO.screen, .8, {css : {backgroundColor : self.borderNormalColor}, ease : Expo.easeOut});
			TweenMax.to(self.textDO, .8, {y:self.outY, ease : Expo.easeOut});
			
			if (data.showGrayscale)
				TweenMax.to(self.grayImageDO, .8, {alpha:1, ease : Expo.easeOut});
			
			if (self.isMedia)
				TweenMax.to(self.playBtnDO, .8, {alpha:0, ease : Expo.easeOut});
		};

		this.setSelectedState = function()
		{
			TweenMax.to(self.backgroundDO.screen, .8, {css : {backgroundColor : self.borderSelectedColor}, ease : Expo.easeOut});
			TweenMax.to(self.textDO, .8, {y:self.overY, ease : Expo.easeOut});
			
			if (data.showGrayscale)
				TweenMax.to(self.grayImageDO, .8, {alpha:0, ease : Expo.easeOut});
			
			if (self.isMedia)
				TweenMax.to(self.playBtnDO, .8, {alpha:1, ease : Expo.easeOut});
		};
		
		/* destroy */
		this.destroy = function()
		{
			clearTimeout(self.textTimeoutId);
			
			TweenMax.killTweensOf(self);
			TweenMax.killTweensOf(self.backgroundDO.screen);
			
			if (self.textDO)
			{
				TweenMax.killTweensOf(self.textDO);
				self.textDO.destroy();
			}
			
			if (self.grayImageDO)
			{
				TweenMax.killTweensOf(self.grayImageDO);
				self.grayImageDO.destroy();
			}
			
			if (self.playBtnDO)
			{
				TweenMax.killTweensOf(self.playBtnDO);
				self.playBtnDO.destroy();
			}
			
			prototype.destroy();

			self.imageDO.disposeImage();
			
			self.mainDO.destroy();
			self.backgroundDO.destroy();
			
			if (self.imageDO)
				self.imageDO.destroy();
			
			if (self.titleDO)
				self.titleDO.destroy();
			
			if (self.titleHolderDO)
				self.titleHolderDO.destroy();
			
			if (self.descriptionDO)
				self.descriptionDO.destroy();
			
			if (self.overDO)
				self.overDO.destroy();

			self.overDO = null;
			self.imageDO = null;
			self.backgroundDO = null;
			self.mainDO = null;
			self.borderNormalColor = null;
			self.borderSelectedColor = null;
			self.image = null;
			self.imageHolderDO = null;
			self.imageDO = null;
			self.grayImageDO = null;
			self.overDO = null;
			self.textDO = null;
			self.titleDO = null;
			self.titleBgDO = null;
			self.titleHolderDO = null;
			self.descriptionDO = null;
			self.descriptionBgDO = null;
			self.descriptionHolderDO = null;
			self.playBtnDO = null;
			self.playBtnDOContext = null;
			
			prototype = null;
			self = null;
			FWDThumb.prototype = null;
		};

		this.init();
	};

	/* set prototype */
	FWDThumb.setPrototype = function()
	{
		FWDThumb.prototype = new FWDDisplayObject("div", "absolute");
	};

	FWDThumb.prototype = null;
	window.FWDThumb = FWDThumb;
}(window));/* thumbs manager */
(function(window)
{
	var FWDThumbsManager = function(data)
	{
		var self = this;
		var prototype = FWDThumbsManager.prototype;

		this.data = data;
		this.isMobile = data.isMobile;

		this.thumbsHolderDO;

		this.totalThumbs = data.totalImages;
		this.thumbsAr = [];
		this.columnHeightsAr = [];
		this.totalColumns = data.nrOfColumns;
		this.curId = 0;
		this.thumbWidth = data.thumbWidth;
		this.thumbHeight = data.thumbHeight;

		this.thumbsHSpace = data.thumbsHSpace;
		this.thumbsVSpace = data.thumbsVSpace;
		this.countLoadedThumbs = 0;
		
		this.borderSize = data.borderSize;
		
		this.isTouchScrolling = false;

		this.startToLoadThumbsId;
		this.loadWithDelayId;

		/* add to display list */
		this.addToDisplayList = function(parent)
		{
			self.parent = parent;
			parent.mainDO.addChild(self);
			
			self.setResizableSizeAfterParent();
			
			self.overflow = "hidden";
			
			self.thumbsHolderDO = new FWDDisplayObject("div");
			self.addChild(self.thumbsHolderDO);
			
			self.thumbsHolderDO.x = self.thumbsHSpace;

			self.setupThumbs();
			self.setPrettyPhoto();
			self.testTouchMove();

			self.startToLoadThumbsId = setTimeout(self.loadThumbImage, 10);
		};
		
		this.setPrettyPhoto = function()
		{
			$("a[rel^='prettyPhoto']").prettyPhoto(
			{
				animation_speed: "normal", /* fast/slow/normal */
				autoplay_slideshow: false, /* true/false */
				opacity: 0.80, /* Value between 0 and 1 */
				show_title: true, /* true/false */
				allow_resize: true, /* Resize the photos bigger than viewport. true/false */
				default_width: self.data.videoWidth,
				default_height: self.data.videoHeight,
				theme: 'pp_default', /* light_rounded / dark_rounded / light_square / dark_square / facebook */
				horizontal_padding: 17, /* The padding on each side of the picture */
				wmode: 'opaque', /* Set the flash wmode attribute */
				autoplay: false, /* Automatically start videos: True/False */
				modal: true, /* If set to true, only the close button will close the window */
				deeplinking: false, /* Allow prettyPhoto to update the url to enable deeplinking. */
				changepicturecallback: function(){}, /* Called everytime an item is shown/changed */
				callback: function(){}, /* Called when prettyPhoto is closed */
				image_markup: '<img id="fullResImage" src="{path}" />',
				flash_markup: '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="{width}" height="{height}"><param name="wmode" value="{wmode}" /><param name="allowfullscreen" value="true" /><param name="allowscriptaccess" value="always" /><param name="movie" value="{path}" /><embed src="{path}" type="application/x-shockwave-flash" allowfullscreen="true" allowscriptaccess="always" width="{width}" height="{height}" wmode="{wmode}"></embed></object>',
				quicktime_markup: '<object classid="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" codebase="http://www.apple.com/qtactivex/qtplugin.cab" height="{height}" width="{width}"><param name="src" value="{path}"><param name="autoplay" value="{autoplay}"><param name="type" value="video/quicktime"><embed src="{path}" height="{height}" width="{width}" autoplay="{autoplay}" type="video/quicktime" pluginspage="http://www.apple.com/quicktime/download/"></embed></object>',
				iframe_markup: '<iframe src ="{path}" width="{width}" height="{height}" frameborder="no"></iframe>',
				inline_markup: '<div class="pp_inline">{content}</div>',
				custom_markup: '',
				social_tools: false /* html or false to disable */
			});
		};

		/* setup thumbs */
		this.setupThumbs = function()
		{
			var thumb;
			
			for (var i=0; i<self.totalThumbs; i++)
			{
				FWDThumb.setPrototype();
				
				thumb = new FWDThumb(i, self.data);
				self.thumbsAr.push(thumb);
				
				thumb.x = 0;
				thumb.y = 0;

				if (!self.isMobile)
					thumb.overDO.buttonMode = true;
				
				self.thumbsHolderDO.addChild(thumb);
				
				if (!self.isMobile)
				{
					thumb.overDO.screen.onmouseover = (function()
					{
						var id = i;
						
						return function()
						{
							self.thumbOnMouseOverHandler(id);
						};
					})();
					
					thumb.overDO.screen.onmouseout = (function()
					{
						var id = i;
						
						return function()
						{
							self.thumbOnMouseOutHandler(id);
						};
					})();
				}

				if (self.isMobile)
				{
					thumb.screen.addEventListener("touchend", (function()
					{
						var pthumb = thumb;
						
						return function()
						{
							self.thumbOnMouseDown(pthumb);
						};
					})());
				}
				else
				{
					thumb.overDO.screen.onclick = (function()
					{
						var pthumb = thumb;
						
						return function()
						{
							self.thumbOnMouseDown(pthumb);
						};
					})();
				}
			}
		};

		this.thumbOnMouseOverHandler = function(id)
		{
			self.thumbsAr[id].setSelectedState();
		};

		this.thumbOnMouseOutHandler = function(id)
		{
			self.thumbsAr[id].setNormalState();
		};

		this.thumbOnMouseDown = function(thumb)
		{
			if (!self.isTouchScrolling)
			{
				self.curId = thumb.id;
				
				switch (self.data.imagesAr[self.curId].contentType)
				{
					case "image":
						$.prettyPhoto.open(self.data.imagesAr[self.curId].content, data.imagesAr[self.curId].title, "", 0, "image");
						break;
					case "youtube":
						$.prettyPhoto.open(self.data.imagesAr[self.curId].content, data.imagesAr[self.curId].title, "", 0, "youtube");
						break;
					case "vimeo":
						$.prettyPhoto.open(self.data.imagesAr[self.curId].content, data.imagesAr[self.curId].title, "", 0, "vimeo");
						break;
					case "video":
						var videoUrl;
						
						if ($.browser.msie || $.browser.webkit)
						{
							if (self.isMobile)
								videoUrl = self.data.imagesAr[self.curId].mobileContent + ".mp4";
							else
								videoUrl = self.data.imagesAr[self.curId].content + ".mp4";
						}
						else
						{
							if (self.isMobile)
								videoUrl = self.data.imagesAr[self.curId].mobileContent + ".ogg";
							else
								videoUrl = self.data.imagesAr[self.curId].content + ".ogg";
						}
						
						$.prettyPhoto.open(videoUrl, data.imagesAr[self.curId].title, "", 0, "video");
						
						break;
					case "audio":
						var audioUrl;
						
						if ($.browser.msie || $.browser.webkit)
						{
							audioUrl = self.data.imagesAr[self.curId].content + ".mp3";
						}
						else
						{
							audioUrl = self.data.imagesAr[self.curId].content + ".ogg";
						}
						
						$.prettyPhoto.open(audioUrl, data.imagesAr[self.curId].title, "", 0, "audio");
						
						break;
					case "link":
						window.open(self.data.imagesAr[self.curId].content, self.data.imagesAr[self.curId].target);
						break;
				}
			}
		};

		this.loadThumbImage = function()
		{
			var imagePath = self.data.imagesAr[self.countLoadedThumbs].imagePath;

			self.image = new Image();
			self.image.src = imagePath;

			self.image.onerror = self.onImageLoadErrorHandler;
			self.image.onload = self.onImageLoadHandler;
		};

		this.onImageLoadErrorHandler = function(e){};

		this.onImageLoadHandler = function(e)
		{
			var thumb = self.thumbsAr[self.countLoadedThumbs];

			thumb.finalW = self.image.width + (self.borderSize * 2);
			thumb.finalH = self.image.height + (self.borderSize * 2);

			thumb.addImage(self.image);

			self.countLoadedThumbs++;
			
			self.positionThumbs();
			
			if (self.countLoadedThumbs < self.totalThumbs)
			{
				self.loadWithDelayId = setTimeout(self.loadThumbImage, 100);
			}
			else
			{
				self.isLoading = false;
			}
		};

		/* position thumbs */
		this.positionThumbs = function()
		{	
			var i, j, k;
			var minH;
			var minHVal;
			var found;
			var fPlace;
			
			self.columnHeightsAr = [];
			
			for (i=0; i<self.totalColumns; i++)
			{
				self.columnHeightsAr[i] = 0;
			}

			for (i=0; i<self.countLoadedThumbs; i++)
			{
				thumb = self.thumbsAr[i];
				
				if  (thumb.finalW == self.thumbWidth)
				{
					minHVal = 1000;
					
					for (j=0; j<self.totalColumns; j++)
					{
						if (self.columnHeightsAr[j] < minHVal)
						{
							minHVal = self.columnHeightsAr[j];
						}
					}
					
					for (j=0; j<self.totalColumns; j++)
					{
						if (self.columnHeightsAr[j] == minHVal)
						{
							minH = j;
							break;
						}
					}
					
					thumb.finalX = minH * (self.thumbWidth + self.thumbsHSpace + self.borderSize * 2);
					thumb.finalY = self.columnHeightsAr[minH] * (self.thumbHeight + self.thumbsVSpace + self.borderSize * 2) + self.thumbsVSpace;
						
					self.columnHeightsAr[minH] += Math.floor(thumb.finalH / self.thumbHeight);
										
					thumb.used = true;
					
					thumb.x = thumb.finalX;
					thumb.y = thumb.finalY;
				}
				else
				{
					minHVal = 1000;
					
					found = false;
					
					var wSize = Math.floor(thumb.finalW / self.thumbWidth);
					
					for (j=0; j<self.totalColumns - (wSize-1); j++)
					{
						fPlace = true;
						
						for (k=0; k<wSize; k++)
						{
							if (self.columnHeightsAr[j] != self.columnHeightsAr[j+k])
								fPlace = false;
						}
						
						if (fPlace && (self.columnHeightsAr[j] < minHVal))
						{
							minHVal = self.columnHeightsAr[j];
							found = true;
						}
					}
					
					if (found)
					{
						for (j=0; j<self.totalColumns - (wSize-1); j++)
						{
							fPlace = true;
							
							for (k=0; k<wSize; k++)
							{
								if (self.columnHeightsAr[j] != self.columnHeightsAr[j+k])
									fPlace = false;
							}
							
							if (fPlace && (self.columnHeightsAr[j] == minHVal))
							{
								minH = j;
								break;
							}
						}
						
						thumb.finalX = minH * (self.thumbWidth + self.thumbsHSpace + self.borderSize * 2);
						thumb.finalY = self.columnHeightsAr[minH] * (self.thumbHeight + self.thumbsVSpace + self.borderSize * 2) + self.thumbsVSpace;
							
						var addedH = Math.floor(thumb.finalH / self.thumbHeight);
							
						for (k=0; k<wSize; k++)
						{
							self.columnHeightsAr[minH + k] += addedH;
						}
						
						thumb.used = true;
						
						thumb.x = thumb.finalX;
						thumb.y = thumb.finalY;
					}
				}
			}
			
			var maxH = 0;
			
			for (i=0; i<self.totalColumns; i++)
			{
				if (self.columnHeightsAr[i] > maxH)
				{
					maxH = self.columnHeightsAr[i];
				}
			}
			
			self.thumbsHolderDO.h = maxH * (self.thumbHeight + self.thumbsVSpace + self.borderSize * 2) + self.thumbsVSpace;
			self.parent.mainDO.h = self.thumbsHolderDO.h;
			self.parent.mainContainer.style.height = +self.thumbsHolderDO.h +  "px";
			
		};
		
		this.testTouchMove = function()
		{
			if (self.isMobile)
				self.screen.addEventListener("touchstart", self.onTouchPress);
		};
		
		this.onTouchPress = function(e)
		{	
			window.addEventListener("touchmove", self.onTouchMove);
			window.addEventListener("touchend", self.onTouchEnd);
		};
		
		this.onTouchMove = function()
		{
			self.isTouchScrolling = true;
		};
		
		this.onTouchEnd = function(e)
		{
			self.isTouchScrolling = false;
			
			window.removeEventListener("touchmove", self.onTouchMove);
			window.removeEventListener("touchend", self.onTouchEnd);
		};
		
		/* clear timeouts and remove main events */
		this.clearTimeoutsAndRemoveAllMainEvents = function()
		{
			clearTimeout(self.loadWithDelayId);
			clearTimeout(self.startToLoadThumbsId);

			if (self.isMobile)
			{
				self.screen.removeEventListener("touchstart", self.onTouchPress);
				window.removeEventListener("touchmove", self.onTouchMove);
				window.removeEventListener("touchend", self.onTouchEnd);
			}
		};
		
		/* destroy */
		this.destroy = function()
		{
			if (self.image)
			{
				self.image.onload = null;
				self.image.onerror = null;
			}
			
			self.image = null;
			
			self.clearTimeoutsAndRemoveAllMainEvents();

			prototype.destroy();
			
			/* destroy thumbs */
			for (var i=0; i<self.totalThumbs; i++)
			{
				self.thumbsAr[i].overDO.screen.onmouseover = null;
				self.thumbsAr[i].overDO.screen.onmouseout = null;
				self.thumbsAr[i].overDO.screen.onclick = null;
				
				self.thumbsAr[i].destroy();
				self.thumbsAr[i] = null;
			};

			TweenMax.killTweensOf(self.parent);
			TweenMax.killTweensOf(self.thumbsHolderDO);
		
			self.thumbsHolderDO.destroy();
			self.thumbsHolderDO = null;

			self.thumbsAr = null;
			self.columnHeightsAr = null;

			self = null;
			prototype = null;
			FWDThumbsManager.prototype = null;
		};
	};

	/* set prototype */
	FWDThumbsManager.setPrototype = function()
	{
		FWDThumbsManager.prototype = new FWDDisplayObject("div", "absolute");
	};

	window.FWDThumbsManager = FWDThumbsManager;

}(window));//FWDUtils
(function (window){
	
	var FWDUtils = function(){};
	
	FWDUtils.randomizeArray = function(aArray) {
		var randomizedArray = [];
		var copyArray = aArray.concat();
			
		var length = copyArray.length;
		for(var i=0; i< length; i++) {
				var index = Math.floor(Math.random() * copyArray.length);
				randomizedArray.push(copyArray[index]);
				copyArray.splice(index,1);
			}
		return randomizedArray;
	};
	
	FWDUtils.resizeDoWithLimit = function(
		displayObject,
		containerWidth,
		containerHeight,
		doWidth,
		doHeight,
		removeWidthOffset,
		removeHeightOffset,
		offsetX,
		offsetY,
		animate,
		pDuration,
		pDelay,
		pEase
	) {
		if (removeWidthOffset)
			containerWidth -= removeWidthOffset;
		if (removeHeightOffset)
			containerWidth -= removeHeightOffset;
		
		var scaleX = containerWidth/doWidth;
		var scaleY = containerHeight/doHeight;
		var totalScale = 0;
		
		
		if(scaleX <= scaleY){
			totalScale = scaleX;
		}else if(scaleX >= scaleY){
			totalScale = scaleY;
		}
		
		var finalWidth = Math.round((doWidth * totalScale));
		var finalHeight = Math.round((doHeight * totalScale));
		var x = Math.round((containerWidth -  (doWidth * totalScale))/2  + offsetX);
		var y = Math.round((containerHeight -  (doHeight * totalScale))/2 + offsetY);
		
		if(animate){
			TweenMax.to(displayObject, pDuration, {x:x, y:y, w:finalWidth, h:finalHeight, delay:pDelay, ease:pEase});
		}else{
			displayObject.x = x;
			displayObject.y = y;
			displayObject.w = finalWidth;
			displayObject.h = finalHeight;
		}
	};
	
	FWDUtils.resizeDoWithoutLimitOnlySize = function(
			displayObject,
			containerWidth,
			containerHeight,
			doWidth,
			doHeight,
			removeWidthOffset,
			removeHeightOffset,
			offsetX,
			offsetY,
			animate,
			pDuration,
			pDelay,
			pEase
		) {
			if (removeWidthOffset)
				containerWidth -= removeWidthOffset;
			if (removeHeightOffset)
				containerWidth -= removeHeightOffset;
			
			var scaleX = containerWidth/doWidth;
			var scaleY = containerHeight/doHeight;
			var totalScale = 0;
			
			if(scaleX >= scaleY){
				totalScale = scaleX;
			}else if(scaleX <= scaleY){
				totalScale = scaleY;
			}

			var finalWidth = Math.round((doWidth * totalScale));
			var finalHeight = Math.round((doHeight * totalScale));
			
			if(animate){
				TweenMax.to(displayObject, pDuration, {w:finalWidth, h:finalHeight, delay:pDelay, ease:pEase});
			}else{
				displayObject.w = finalWidth;
				displayObject.h = finalHeight;
			}
		};
		
		FWDUtils.resizeDoWithoutLimit = function(
				displayObject,
				containerWidth,
				containerHeight,
				doWidth,
				doHeight,
				animate,
				pDuration,
				pDelay,
				pEase
			) {
			
				var containerWidth = containerWidth ;
				var containerHeight = containerHeight;
				
				var scaleX = containerWidth/doWidth;
				var scaleY = containerHeight/doHeight;
				var totalScale = 0;
				
				
				if(scaleX >= scaleY){
					totalScale = scaleX;
				}else if(scaleX <= scaleY){
					totalScale = scaleY;
				}
				
				var finalWidth = Math.round((doWidth * totalScale));
				var finalHeight = Math.round((doHeight * totalScale));
				var x = Math.round((containerWidth -  (doWidth * totalScale))/2 );
				var y = Math.round((containerHeight -  (doHeight * totalScale))/2);
				
				if(animate){
					TweenMax.to(displayObject, pDuration, {x:x, y:y, w:finalWidth, h:finalHeight, delay:pDelay, ease:pEase});
				}else{
					displayObject.x = x;
					displayObject.y = y;
					displayObject.w = finalWidth;
					displayObject.h = finalHeight;
				}
			};
	
	FWDUtils.resizeCssElementWithoutLimit = function(
			element,
			containerWidth,
			containerHeight,
			elementWidth,
			elementHeight,
			duration,
			delay,
			animate,
			ease,
			offsetX,
			offsetY,
			removeWidthOffset,
			removeHeightOffset
			
		) {
			
			var containerWidth = containerWidth - removeWidthOffset;
			var containerHeight = containerHeight - removeHeightOffset;
			
			var scaleX = containerWidth/elementWidth;
			var scaleY = containerHeight/elementHeight;
			var totalScale = 0;
			
			if(scaleX >= scaleY){
				totalScale = scaleX;
			}else if(scaleX <= scaleY){
				totalScale = scaleY;
			}
		
			var left = Math.round((containerWidth -  (elementWidth * totalScale))/2  + removeWidthOffset/2 + offsetX);
			var top = Math.round((containerHeight -  (elementHeight * totalScale))/2 + removeHeightOffset/2 + offsetY);
			var finalWidth = Math.round((elementWidth * totalScale));
			var finalHeight = Math.round((elementHeight * totalScale));
			
			if(animate){
				Tween.get(element,{override:true}).wait(delay).to(
						{left:left, 
						top:top,
						width:finalWidth,
						height:finalHeight,}, 
						duration, ease);
			}else{
				element.style.width = finalWidth + "px";
				element.style.height = finalHeight + "px";
				element.style.left = left + "px"; 
				element.style.top = top + "px";
			}
		};
	
	FWDUtils.parent = function (e, n){
		if(n === undefined) n = 1;
		while(n-- && e) e = e.parentNode;
		if(!e || e.nodeType !== 1) return null;
		return e;
	};
	
	FWDUtils.sibling = function(e, n){
		while (e && n !== 0){
			if(n > 0){
				if(e.nextElementSibling){
					 e = e.nextElementSibling;	 
				}else{
					for(var e = e.nextSibling; e && e.nodeType !== 1; e = e.nextSibling);
				}
				n--;
			}else{
				if(e.previousElementSibling){
					 e = e.previousElementSibling;	 
				}else{
					for(var e = e.previousSibling; e && e.nodeType !== 1; e = e.previousSibling);
				}
				n++;
			}
		}
		
		return e;
	};
	
	FWDUtils.child = function (e, n){
		if(e.children){
			if(n < 0) n += e.children.length;
			if(n < 0) return null;
			return e.children[n];
		}
		
		if(n>0){
			if(e.firstElementChild){
				e = e.firstElementChild;
			}else{
				for(var e = e.firstChild; e && e.nodeType !== 1; e = e.nextSibling);
			}
			return sibling(e,n);
		}else{
			if(e.lastElementChild){
				e = e.lastElementChild;
			}else{
				for(var e = e.lastChild; e && e.nodeType !== 1; e = e.previousSibling);
			}
			return sibling(e,n+1);
		}
	};
	
	FWDUtils.children = function(e, allNodesTypes){
		var kids = [];
		for(var c = e.firstChild; c != null; c = c.nextSibling){
			if(allNodesTypes){
				kids.push(c);
			}else if(c.nodeType === 1){
				kids.push(c);
			}
		}
		return kids;
	};
	
	FWDUtils.textContent = function(e, v){
		var content = e.textContent;
		if(v === undefined){
			if(content !== undefined){
				return content;
			}else{
				return e.innerText;
			}
		}else{
			if(content !== undefined){
				e.textContent = v;
			}else{
				e.innerText = value;
			}
		}
	};
	
	FWDUtils.insertNodeAt = function(parent, child, n){
		var children = FWDUtils.children(parent);
		if(n < 0 || n > children.length){
			throw new Error("invalid index!");
		}else {
			parent.insertBefore(child, children[n]);
		};
	};
	
	FWDUtils.hasCanvas = function(){
		return Boolean(document.createElement("canvas"));
	};
	
	FWDUtils.trim = function(str){
		return str.replace(/\s/gi, "");
	};
	
	FWDUtils.hitTest = function(target, x, y){
		var hit = false;
		if(!target) throw Error("Hit test target is null!");
		var rect = target.getBoundingClientRect();
		if(x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom){
			hit = true;
		}
		return hit;
	};
	
	FWDUtils.isMobile = function (){
		var agents = ['android', 'webos', 'iphone', 'ipad', 'blackberry'];
	    for(i in agents) {
	    	 if(navigator.userAgent.toLowerCase().indexOf(agents[i].toLowerCase()) != -1) {
	            return true;
	        }
	    }
	   
	    return false;
	};
		
	FWDUtils.isChrome = function(){
		return navigator.userAgent.toLowerCase().indexOf('chrome') != -1;
	};
	
	FWDUtils.isSafari = function(){
		return navigator.userAgent.toLowerCase().indexOf('safari') != -1 && navigator.userAgent.toLowerCase().indexOf('chrome') == -1;
	};

	FWDUtils.isFirefox = function(){
		return navigator.userAgent.toLowerCase().indexOf('firefox') != -1;
	};

	FWDUtils.isIE = function(){
		return navigator.userAgent.toLowerCase().indexOf('msie') != -1;;
	};
		
	FWDUtils.isOpera = function(){
		return navigator.userAgent.toLowerCase().indexOf('opera') != -1;
	};
	
	FWDUtils.disableSelection = function(e){
		try{e.style.userSelect = "none";}catch(e){};
		try{e.style.MozUserSelect = "none";}catch(e){};
		try{e.style.webkitUserSelect = "none";}catch(e){};
		try{e.style.khtmlUserSelect = "none";}catch(e){};
		try{e.style.oUserSelect = "none";}catch(e){};
		try{e.style.msUserSelect = "none";}catch(e){};
		try{e.msUserSelect = "none";}catch(e){};
		
		e.onselectstart = function(){return false;};
	}
	
	window.FWDUtils = FWDUtils;
}(window));/* main gallery */
(function(window)
{
	var FWDVerticalRandomImageGallery = function(divId, xmlPath, divWidth, divHeight, bgColor, prelRadius, prelThickness, prelBgColor, prelFillColor)
	{
		var self = this;
		
		this.xmlPath = xmlPath;
		this.info = null;
		this.mainDO = null;
		this.thumbsManager = null;
		this.preloader = null;
		this.customContextMenu = null;

		this.stageWidth = 0;
		this.stageHeight = 0;

		this.resizeHandlerIntervalId;

		/* init gallery */
		this.init = function()
		{
			self.mainContainer = $("#" + divId)[0];

			if (!self.mainContainer)
			{
				alert("Main div is not found, please check the div id! " + divId);
				return;
			}
			
			TweenLite.ticker.useRAF(false);
			
			self.setupScreen();
			self.setupInfo();
			self.setupData();
		};

		/* setup main screen */
		this.setupScreen = function()
		{
			self.mainDO = new FWDDisplayObject("div", "relative");
			self.mainDO.selectable = false;
			self.mainDO.bk = bgColor;

			self.mainDO.style.overflow = "hidden";
			
			self.mainDO.w = divWidth;
			self.mainDO.h = divHeight;
			
			self.stageWidth = self.mainDO.w;
			self.stageHeight = self.mainDO.h;
			
			if (self.preloader)
			{
				self.preloader.setX((self.stageWidth - self.preloader._w)/2);
				self.preloader.setY((self.stageHeight - self.preloader._h)/2);
			}
			
			self.mainContainer.appendChild(self.mainDO.screen);
			
			self.mainDO.style.boxShadow = "1px 2px 2px #999999";
		};

		/* stup info */
		this.setupInfo = function()
		{
			self.info = new FWDInfo();
		};

		/* setup data */
		this.setupData = function()
		{
			FWDData.setPrototype();
			
			self.data = new FWDData(self.xmlPath);
			self.data.addListener(FWDData.LOAD_COMPLETE, self.dataLoadComplete);
			self.data.addListener(FWDData.LOAD_ERROR, self.dataLoadError);
			
			self.data.preloadersRadius = prelRadius;
			self.data.preloadersThickness = prelThickness;
			self.data.preloadersBackgroundColor = prelBgColor;
			self.data.preloadersFillColor = prelFillColor;
			
			self.setupPreloader();
			
			self.data.load();
		};
		
		/* setup preloader */
		this.setupPreloader = function()
		{
			FWDStrockPreloader.setPrototype();
			
			self.preloader = new FWDStrockPreloader(self.data.preloadersRadius, self.data.preloadersThickness, self.data.preloadersBackgroundColor, self.data.preloadersFillColor);
			self.preloader.show(true);
			self.mainDO.addChild(self.preloader);
			
			self.preloader.setX((self.stageWidth - self.preloader._w)/2);
			self.preloader.setY((self.stageHeight - self.preloader._h)/2);
		};

		this.dataLoadError = function(e, text)
		{
			self.mainDO.screen.appendChild(self.info.screen);
			self.info.showText(e.text);
		};

		this.dataLoadComplete = function(e)
		{
			self.preloader.hide(false);
			
			self.mainDO.w = self.data.nrOfColumns * (self.data.thumbWidth + self.data.thumbsHSpace + self.data.borderSize * 2) - self.data.thumbsHSpace + self.data.thumbsHSpace * 2;
			
			self.setupThumbsManager();
			
			if (!self.data.isMobile)
				self.setupContextMenu();
		};

		/* setup thumbs manager. */
		this.setupThumbsManager = function()
		{
			FWDThumbsManager.setPrototype();
			
			self.thumbsManager = new FWDThumbsManager(self.data);
			self.thumbsManager.addToDisplayList(self);
		};
		
		/* setup context menu */
		this.setupContextMenu = function()
		{
			self.customContextMenu = new FWDContextMenu(self.mainDO, true);
		};
		
		/* destroy */
		this.destroy = function()
		{
			if (self.data)
				self.data.destroy();

			if (self.info)
				self.info.destroy();

			if (self.thumbsManager)
				self.thumbsManager.destroy();

			if (self.mainDO)
				self.mainDO.destroy();

			if (self.preloader)
				self.preloader.destroy();
			
			self.xmlPath = null;
			self.data = null;
			self.thumbsManager = null;
			self.mainContainer = null;
			self.mainDO = null;
			self.info = null;
			self.preloader = null;
			self.customContextMenu = null;

			self = null;
		};

		this.init();
	};

	window.FWDVerticalRandomImageGallery = FWDVerticalRandomImageGallery;

}(window));
/*!
 * VERSION: beta 1.28
 * DATE: 2012-05-24
 * JavaScript 
 * UPDATES AND DOCS AT: http://www.greensock.com
 *
 * Copyright (c) 2008-2012, GreenSock. All rights reserved. 
 * This work is subject to the terms in http://www.greensock.com/terms_of_use.html or for 
 * corporate Club GreenSock members, the software agreement that was issued with the corporate 
 * membership.
 * 
 * @author: Jack Doyle, jack@greensock.com
 */
(window._gsQueue||(window._gsQueue=[])).push(function(){_gsDefine("plugins.CSSPlugin",["plugins.TweenPlugin","TweenLite"],function(x){var n=function(){x.call(this,"css");this._overwriteProps.pop()},o=n.prototype=new x("css");o.constructor=n;n.API=2;n.suffixMap={top:"px",right:"px",bottom:"px",left:"px",width:"px",height:"px",fontSize:"px",padding:"px",margin:"px"};var u=/[^\d\-\.]/g,D=/(\d|\-|\+|=|#|\.)*/g,P=/\d+/g,E=/opacity=([^)]*)/,Q=/opacity:([^;]*)/,R=/([A-Z])/g,H=/-([a-z])/gi,I=function(b,a){return a.toUpperCase()}, S=/(Left|Right|Width)/i,T=/(M11|M12|M21|M22)=[\d\-\.e]+/gi,U=/progid\:DXImageTransform\.Microsoft\.Matrix\(.+?\)/i,v=Math.PI/180,J=180/Math.PI,r=document.createElement("div"),y=function(){var b=document.createElement("div"),a;b.innerHTML="<a style='top:1px;opacity:.55;'>a</a>";return!(a=b.getElementsByTagName("a")[0])?!1:/^0.55/.test(a.style.opacity)}(),K=function(b){return!b||""===b?z.black:z[b]?z[b]:"#"===b.charAt(0)?(4===b.length&&(b="#"+b.charAt(1)+b.charAt(1)+b.charAt(2)+b.charAt(2)+b.charAt(3)+ b.charAt(3)),b=parseInt(b.substr(1),16),[b>>16,b>>8&255,b&255]):b.match(P)||z.transparent},L=function(b){return E.test("string"===typeof b?b:(b.currentStyle?b.currentStyle.filter:b.style.filter)||"")?parseFloat(RegExp.$1)/100:1},w=document.defaultView?document.defaultView.getComputedStyle:function(){},s=function(b,a,e,c){return!y&&"opacity"===a?L(b):!c&&b.style[a]?b.style[a]:(e=e||w(b,null))?(b=e.getPropertyValue(a.replace(R,"-$1").toLowerCase()))||e.length?b:e[a]:b.currentStyle?b.currentStyle[a]: null},A=function(b,a){var e={},c;if(a=a||w(b,null))if(c=a.length)for(;-1<--c;)e[a[c].replace(H,I)]=a.getPropertyValue(a[c]);else for(c in a)e[c]=a[c];else if(a=b.currentStyle||b.style)for(c in a)e[c.replace(H,I)]=a[c];y||(e.opacity=L(b));c=F(b,a,!1);e.rotation=c.rotation*J;e.skewX=c.skewX*J;e.scaleX=c.scaleX;e.scaleY=c.scaleY;e.x=c.x;e.y=c.y;null!=e.filters&&delete e.filters;return e},M=function(b,a,e,c){var i={},d,g;for(g in a)if("cssText"!==g&&"length"!==g&&isNaN(g)&&d!==m&&b[g]!=(d=a[g]))if("number"=== typeof d||"string"===typeof d)i[g]=d,c&&c.props.push(g);if(e)for(g in e)"className"!==g&&(i[g]=e[g]);return i},N={scaleX:1,scaleY:1,x:1,y:1,rotation:1,shortRotation:1,skewX:1,skewY:1,scale:1},O,m=function(){for(var b=document.body||document.documentElement,a=w(b,""),e="O -o- Moz -moz- ms -ms- Webkit -webkit-".split(" "),c=9;-1<(c-=2)&&!s(b,e[c]+"transform",a););return 0<c?(O=e[c]+"transform",e[c-1]+"Transform"):null}(),F=function(b,a,e){var c;m?c=s(b,O,a,!0):b.currentStyle&&(c=(c=b.currentStyle.filter.match(T))&& 4===c.length?c[0].substr(4)+","+Number(c[2].substr(4))+","+Number(c[1].substr(4))+","+c[3].substr(4)+",0,0":null);var a=(c||"").replace(/[^\d\-\.e,]/g,"").split(","),i=(c=6<=a.length)?Number(a[0]):1,d=c?Number(a[1]):0,g=c?Number(a[2]):0,f=c?Number(a[3]):1,h=e?b._gsTransform||{skewY:0}:{skewY:0},k=0>h.scaleX;h.x=c?Number(a[4]):0;h.y=c?Number(a[5]):0;h.rotation=Math.atan2(d,i);h.scaleX=Math.sqrt(i*i+d*d);h.scaleY=Math.sqrt(f*f+g*g);h.skewX=Math.atan2(g,f)+h.rotation;if(0>i&&0<=f||0<i&&0>=f)k?(h.scaleX*= -1,h.skewX+=0>=h.rotation?Math.PI:-Math.PI,h.rotation+=0>=h.rotation?Math.PI:-Math.PI):(h.scaleY*=-1,h.skewX+=0>=h.skewX?Math.PI:-Math.PI);1.0E-6>h.rotation&&-1.0E-6<h.rotation&&(h.rotation=0);1.0E-6>h.skewX&&-1.0E-6<h.skewX&&(h.skewX=0);e&&(b._gsTransform=h);return h},V={width:["Left","Right"],height:["Top","Bottom"]},W=["marginLeft","marginRight","marginTop","marginBottom"],t=function(b,a,e,c,i){if("px"===c)return e;if("auto"===c)return 0;var d=S.test(a),g=b,f=0>e;f&&(e=-e);r.style.cssText="border-style:solid; border-width:0; position:absolute; line-height:0;"; "%"===c||"em"===c?(g=b.parentNode||document.body,r.style[d?"width":"height"]=e+c):r.style[d?"borderLeftWidth":"borderTopWidth"]=e+c;g.appendChild(r);d=parseFloat(r[d?"offsetWidth":"offsetHeight"]);g.removeChild(r);0===d&&!i&&(d=t(b,a,e,c,!0));return f?-d:d},G=function(b,a){if(null==b||""===b||"auto"===b)b="0 0";var a=a||{},e=-1!==b.indexOf("left")?"0%":-1!==b.indexOf("right")?"100%":b.split(" ")[0],c=-1!==b.indexOf("top")?"0%":-1!==b.indexOf("bottom")?"100%":b.split(" ")[1];null==c?c="0":"center"=== c&&(c="50%");"center"===e&&(e="50%");a.oxp=-1!==e.indexOf("%");a.oyp=-1!==c.indexOf("%");a.oxr="="===e.charAt(1);a.oyr="="===c.charAt(1);a.ox=parseFloat(e.replace(u,""));a.oy=parseFloat(c.replace(u,""));return a},B=function(b,a){return null==b?a:"string"===typeof b&&1===b.indexOf("=")?Number(b.split("=").join(""))+a:Number(b)},C=function(b,a){var e=-1===b.indexOf("rad")?v:1,c=1===b.indexOf("="),b=Number(b.replace(u,""))*e;return c?b+a:b},z={aqua:[0,255,255],lime:[0,255,0],silver:[192,192,192],black:[0, 0,0],maroon:[128,0,0],teal:[0,128,128],blue:[0,0,255],navy:[0,0,128],white:[255,255,255],fuchsia:[255,0,255],olive:[128,128,0],yellow:[255,255,0],orange:[255,165,0],gray:[128,128,128],purple:[128,0,128],green:[0,128,0],red:[255,0,0],pink:[255,192,203],cyan:[0,255,255],transparent:[255,255,255,0]};o._onInitTween=function(b,a,e){if(!b.nodeType)return!1;this._target=b;this._tween=e;this._classData=this._transform=null;var e=this._style=b.style,c=w(b,""),i,d;"string"===typeof a?(i=e.cssText,d=A(b,c), e.cssText=i+";"+a,d=M(d,A(b)),!y&&Q.test(a)&&(val.opacity=parseFloat(RegExp.$1)),a=d,e.cssText=i):a.className&&(i=b.className,d=A(b,c),b.className="="!==a.className.charAt(1)?a.className:"+"===a.className.charAt(0)?b.className+" "+a.className.substr(2):b.className.split(a.className.substr(2)).join(""),a=M(d,A(b),a,this._classData={b:i,e:b.className,props:[]}),b.className=i);this._parseVars(a,b,c,a.suffixMap||n.suffixMap);return!0};o._parseVars=function(b,a,e,c){var i=this._style,d,g,f,h,k,l,j;for(d in b)if(g= b[d],"transform"===d||d===m)this._parseTransform(a,g,e,c);else if(N[d]||"transformOrigin"===d)this._parseTransform(a,b,e,c);else{if("alpha"===d||"autoAlpha"===d)d="opacity";else if("margin"===d||"padding"===d){g=(g+"").split(" ");h=g.length;f={};f[d+"Top"]=g[0];f[d+"Right"]=1<h?g[1]:g[0];f[d+"Bottom"]=4===h?g[2]:g[0];f[d+"Left"]=4===h?g[3]:2===h?g[1]:g[0];this._parseVars(f,a,e,c);continue}else if("backgroundPosition"===d||"backgroundSize"===d){f=G(g);j=G(h=s(a,d,e));this._firstPT=f={_next:this._firstPT, t:i,p:d,b:h,f:!1,n:"css_"+d,type:3,s:j.ox,c:f.oxr?f.ox:f.ox-j.ox,ys:j.oy,yc:f.oyr?f.oy:f.oy-j.oy,sfx:f.oxp?"%":"px",ysfx:f.oyp?"%":"px",r:!f.oxp&&!1!==b.autoRound};f.e=f.s+f.c+f.sfx+" "+(f.ys+f.yc)+f.ysfx;continue}else if("border"===d){g=(g+"").split(" ");this._parseVars({borderWidth:g[0],borderStyle:g[1]||"none",borderColor:g[2]||"#000000"},a,e,c);continue}else if("autoRound"===d)continue;h=s(a,d,e);h=null!=h?h+"":"";this._firstPT=f={_next:this._firstPT,t:i,p:d,b:h,f:!1,n:"css_"+d,sfx:"",r:!1,type:0}; "opacity"===d&&null!=b.autoAlpha&&(this._firstPT=f._prev={_next:f,t:i,p:"visibility",f:!1,n:"css_visibility",r:!1,type:-1,b:0!==Number(h)?"visible":"hidden",i:"visible",e:0===Number(g)?"hidden":"visible"},this._overwriteProps.push("css_visibility"));if("color"===d||"fill"===d||"stroke"===d||-1!==d.indexOf("Color")||"string"===typeof g&&!g.indexOf("rgb("))k=K(h),h=K(g),f.e=g,f.s=Number(k[0]),f.c=Number(h[0])-f.s,f.gs=Number(k[1]),f.gc=Number(h[1])-f.gs,f.bs=Number(k[2]),f.bc=Number(h[2])-f.bs,3<k.length|| 3<h.length?(f.as=4>k.length?1:Number(k[3]),f.ac=(4>h.length?1:Number(h[3]))-f.as,f.type=f.c||f.gc||f.bc||f.ac?2:-1):f.type=f.c||f.gc||f.bc?1:-1;else{k=h.replace(D,"");if(""===h||"auto"===h)if("width"===d||"height"===d){l=d;k=a;h=e;j=parseFloat("width"===l?k.offsetWidth:k.offsetHeight);l=V[l];var n=l.length;for(h=h||w(k,null);-1<--n;)j-=parseFloat(s(k,"padding"+l[n],h,!0))||0,j-=parseFloat(s(k,"border"+l[n]+"Width",h,!0))||0;k="px"}else j="opacity"!==d?0:1;else j=-1===h.indexOf(" ")?parseFloat(h.replace(u, "")):NaN;"string"===typeof g?(h="="===g.charAt(1),l=g.replace(D,""),g=-1===g.indexOf(" ")?parseFloat(g.replace(u,"")):NaN):(h=!1,l="");""===l&&(l=c[d]||k);f.e=g||0===g?(h?g+j:g)+l:b[d];if(k!==l&&""!==l&&(g||0===g))if(j||0===j)if(j=t(a,d,j,k),"%"===l?(j/=t(a,d,100,"%")/100,100<j&&(j=100)):"em"===l?j/=t(a,d,1,"em"):(g=t(a,d,g,l),l="px"),h&&(g||0===g))f.e=g+j+l;if((j||0===j)&&(g||0===g)&&(f.c=h?g:g-j))if(f.s=j,f.sfx=l,"opacity"===d)y||(f.type=4,f.p="filter",f.b="alpha(opacity="+100*f.s+")",f.e="alpha(opacity="+ 100*(f.s+f.c)+")",f.dup=null!=b.autoAlpha,this._style.zoom=1);else{if(!1!==b.autoRound&&("px"===l||"zIndex"===d))f.r=!0}else f.type=-1,f.i=f.e,f.s=f.c=0}this._overwriteProps.push("css_"+d);f._next&&(f._next._prev=f)}};o._parseTransform=function(b,a,e){if(!this._transform){var e=this._transform=F(b,e,!0),c=this._style,i,d;if("object"===typeof a){b={scaleX:B(null!=a.scaleX?a.scaleX:a.scale,e.scaleX),scaleY:B(null!=a.scaleY?a.scaleY:a.scale,e.scaleY),x:B(a.x,e.x),y:B(a.y,e.y)};null!=a.shortRotation? (b.rotation="number"===typeof a.shortRotation?a.shortRotation*v:C(a.shortRotation,e.rotation),i=(b.rotation-e.rotation)%(2*Math.PI),i!==i%Math.PI&&(i+=Math.PI*(0>i?2:-2)),b.rotation=e.rotation+i):b.rotation=null==a.rotation?e.rotation:"number"===typeof a.rotation?a.rotation*v:C(a.rotation,e.rotation);b.skewX=null==a.skewX?e.skewX:"number"===typeof a.skewX?a.skewX*v:C(a.skewX,e.skewX);b.skewY=null==a.skewY?e.skewY:"number"===typeof a.skewY?a.skewY*v:C(a.skewY,e.skewY);if(i=b.skewY-e.skewY)b.skewX+= i,b.rotation+=i;1.0E-6>b.skewY&&-1.0E-6<b.skewY&&(b.skewY=0);1.0E-6>b.skewX&&-1.0E-6<b.skewX&&(b.skewX=0);1.0E-6>b.rotation&&-1.0E-6<b.rotation&&(b.rotation=0);if(null!=(a=a.transformOrigin))m?(d=m+"Origin",this._firstPT=a={_next:this._firstPT,t:c,p:d,s:0,c:0,n:d,f:!1,r:!1,b:c[d],e:a,i:a,type:-1,sfx:""},a._next&&(a._next._prev=a)):G(a,e)}else if("string"===typeof a&&m)i=c[m],c[m]=a,b=F(b,null,!1),c[m]=i;else return;m?"WebkitTransform"===m&&(c[m+"Style"]="preserve-3d"):c.zoom=1;for(d in N)e[d]!==b[d]&& ("shortRotation"!==d&&"scale"!==d)&&(this._firstPT=a={_next:this._firstPT,t:e,p:d,s:e[d],c:b[d]-e[d],n:d,f:!1,r:!1,b:e[d],e:b[d],type:0,sfx:0},a._next&&(a._next._prev=a),this._overwriteProps.push("css_"+d))}};o.setRatio=function(b){var a=this._firstPT,e=1.0E-6,c,i;if(1===b&&(this._tween._time===this._tween._duration||0===this._tween._time))for(;a;)a.t[a.p]=a.e,4===a.type&&1===a.s+a.c&&this._style.removeAttribute("filter"),a=a._next;else if(b||!(this._tween._time===this._tween._duration||0===this._tween._time))for(;a;)c= a.c*b+a.s,a.r?c=0<c?c+0.5>>0:c-0.5>>0:c<e&&c>-e&&(c=0),a.type?1===a.type?a.t[a.p]="rgb("+(c>>0)+", "+(a.gs+b*a.gc>>0)+", "+(a.bs+b*a.bc>>0)+")":2===a.type?a.t[a.p]="rgba("+(c>>0)+", "+(a.gs+b*a.gc>>0)+", "+(a.bs+b*a.bc>>0)+", "+(a.as+b*a.ac)+")":-1===a.type?a.t[a.p]=a.i:3===a.type?(i=a.ys+b*a.yc,a.r&&(i=0<i?i+0.5>>0:i-0.5>>0),a.t[a.p]=c+a.sfx+" "+i+a.ysfx):(a.dup&&(a.t.filter=a.t.filter||"alpha(opacity=100)"),a.t.filter=-1===a.t.filter.indexOf("opacity=")?a.t.filter+(" alpha(opacity="+(100*c>>0)+ ")"):a.t.filter.replace(E,"opacity="+(100*c>>0))):a.t[a.p]=c+a.sfx,a=a._next;else for(;a;)a.t[a.p]=a.b,4===a.type&&1===a.s&&this._style.removeAttribute("filter"),a=a._next;if(this._transform)if(a=this._transform,m&&!a.rotation)this._style[m]=(a.x||a.y?"translate("+a.x+"px,"+a.y+"px) ":"")+(a.skewX?"skewX("+a.skewX+"rad) ":"")+(1!==a.scaleX||1!==a.scaleY?"scale("+a.scaleX+","+Math.cos(a.skewX)*a.scaleY+")":"")||"translate(0px,0px)";else{var d=m?a.rotation:-a.rotation,g=m?d-a.skewX:d+a.skewX;i=Math.cos(d)* a.scaleX;var d=Math.sin(d)*a.scaleX,f=Math.sin(g)*-a.scaleY,g=Math.cos(g)*a.scaleY,h;d<e&&d>-e&&(d=0);f<e&&f>-e&&(f=0);if(m)this._style[m]="matrix("+i+","+d+","+f+","+g+","+a.x+","+a.y+")";else if(h=this._target.currentStyle){e=d;d=-f;f=-e;e=this._style.filter;this._style.filter="";c=this._target.offsetWidth;var k=this._target.offsetHeight,l="absolute"!==h.position,j="progid:DXImageTransform.Microsoft.Matrix(M11="+i+", M12="+d+", M21="+f+", M22="+g,n=a.x,o=a.y,p,q;null!=a.ox&&(p=(a.oxp?0.01*c*a.ox: a.ox)-c/2,q=(a.oyp?0.01*k*a.oy:a.oy)-k/2,n=p-(p*i+q*d)+a.x,o=q-(p*f+q*g)+a.y);if(l)p=c/2,q=k/2,j+=", Dx="+(p-(p*i+q*d)+n)+", Dy="+(q-(p*f+q*g)+o)+")";else{l=4;p=a.ieOffsetX||0;q=a.ieOffsetY||0;a.ieOffsetX=Math.round((c-((0>i?-i:i)*c+(0>d?-d:d)*k))/2+n);for(a.ieOffsetY=Math.round((k-((0>g?-g:g)*k+(0>f?-f:f)*c))/2+o);-1<--l;)k=W[l],c=h[k],c=-1!==c.indexOf("px")?parseFloat(c):t(this._target,k,parseFloat(c),c.replace(D,""))||0,this._style[k]=Math.round(c-(2>l?p-a.ieOffsetX:q-a.ieOffsetY))+"px";j+=",sizingMethod='auto expand')"}this._style.filter= -1!==e.indexOf("progid:DXImageTransform.Microsoft.Matrix(")?e.replace(U,j):e+" "+j;if(0===b||1===b)1===i&&0===d&&0===f&&1===g&&(!E.test(e)||100===parseFloat(RegExp.$1))&&this._style.removeAttribute("filter")}}if(this._classData)if(a=this._classData,1===b&&(this._tween._time===this._tween._duration||0===this._tween._time)){for(l=a.props.length;-1<--l;)this._style[a.props[l]]="";this._target.className=a.e}else this._target.className!==a.b&&(this._target.className=a.b)};o._kill=function(b){var a=b,e; if(b.autoAlpha||b.alpha){a={};for(e in b)a[e]=b[e];a.opacity=1;a.autoAlpha&&(a.visibility=1)}return x.prototype._kill.call(this,a)};x.activate([n]);return n},!0)});window._gsDefine&&_gsQueue.pop()();
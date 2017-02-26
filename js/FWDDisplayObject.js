/* Display object */
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
}(window));
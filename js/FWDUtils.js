//FWDUtils
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
}(window));
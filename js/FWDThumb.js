/* thumbs */
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
}(window));
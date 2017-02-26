/* main gallery */
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
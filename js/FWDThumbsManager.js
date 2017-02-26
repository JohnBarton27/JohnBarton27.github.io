/* thumbs manager */
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

}(window));
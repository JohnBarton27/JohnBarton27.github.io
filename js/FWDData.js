/* FWDData */
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
}(window));
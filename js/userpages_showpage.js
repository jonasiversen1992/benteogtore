var isMobile =
  navigator.userAgent.match(/Android/i) ||
  navigator.userAgent.match(/iPod/i) ||
  navigator.userAgent.match(/iPad/i) ||
  navigator.userAgent.match(/iPhone/i)
    ? true
    : false;

function InitPage() {
  //Init page and scrolls down if needed
  self.focus();
}

function getTop(id) {
  var ypos;
  ypos = document.getElementById("bigstart").offsetTop;
  return ypos;
}

function BannerPosition() {
  var tableOffset = $("#centerTable").offset().left;
  $("#bannerPos")
    .css("left", tableOffset + 770)
    .show();

  return;
}

function InitSpeechBubble(currBubbleImg, currBubbleDiv, offsetLeft, offsetTop) {
  if (offsetLeft == "") offsetLeft = "0";
  if (offsetTop == "") offsetTop = "0";

  var parentContainerOffsetLeft = 0;
  var parentContainerOffsetTop = 0;

  var isPhotoalbumPage = $(currBubbleDiv)
    .parents()
    .is(".photoalbum_slideshow_box");
  if (isPhotoalbumPage) {
    var parentContainer = $(currBubbleDiv).parents(".photoalbum_slideshow_box");
    parentContainerOffsetLeft = parentContainer.offset().left;
    parentContainerOffsetTop = parentContainer.offset().top;
  }

  var bubbleLeftPos =
    $(currBubbleImg).offset().left +
    parseInt(offsetLeft) -
    parentContainerOffsetLeft;
  var bubbleTopPos =
    $(currBubbleImg).offset().top +
    parseInt(offsetTop) -
    parentContainerOffsetTop;

  if (isPhotoalbumPage) {
    $(currBubbleDiv)
      .css({
        left: bubbleLeftPos,
        top: bubbleTopPos,
        zIndex: 999,
      })
      .show();
  } else {
    $(currBubbleDiv)
      .css({
        left: bubbleLeftPos,
        top: bubbleTopPos,
        zIndex: 999,
      })
      .appendTo("#wrapper")
      .show();
  }
}

function InitSpeechBubbles() {
  $("div[name='cmpballoon']").each(function () {
    $(this).children("img").css("margin", 0);
    var linkedImage = $("#" + $(this).attr("linkedimg"));
    if (linkedImage.length) {
      var offsetLeft = $(this).attr("offsetleft");
      var offsetTop = $(this).attr("offsettop");
      InitSpeechBubble(linkedImage[0], this, offsetLeft, offsetTop);
    }
  });
}

function RearrangeObjects() {
  BannerPosition();
  InitSpeechBubbles();
}

function InitOnLoad() {
  InitPage();
  RearrangeObjects();
}

$(window).resize(function () {
  RearrangeObjects();
});

//$(document).ready(function() {
//	InitOnLoad();
//});

var BigPicture = (function () {
  var isIE = null,
    $cmpPictureSubtitles = null;

  var init = function () {
    $cmpPictureSubtitles = $("span.cmpPictureSubtitle");
    isIE = SimpleSite.Util.BrowserDetect.msie;

    $(".cmppicture[data-bigimage]")
      .addClass("magnify_cursor")
      .click(bigImageClickHandler)
      .mouseover(bigImageMouseoverHandler)
      .mouseout(bigImageMouseoutHandler);
  };

  var bigImageClickHandler = function () {
    var $cmpPictire = $(this);
    (imageId = $cmpPictire.attr("id")),
      (imageSrc = $cmpPictire.attr("src")),
      (bigImageSrc = $cmpPictire.attr("data-bigimage")),
      ($cmpPictureData = $cmpPictureSubtitles.filter(
        "[data-imageid=" + imageId + "]"
      )),
      (imageSubtitle = $cmpPictureData.text()),
      (siteVer = $cmpPictureData.attr("data-sitever"));

    $.fancybox({
      href: bigImageSrc,
      title: imageSubtitle,
      overlayColor: "#000",
      overlayOpacity: 0.4,
      titlePosition: "inside",
      transitionIn: "fade",
      transitionOut: "fade",
      speedIn: 100,
      speedOut: 100,
      margin: 68,
      helpers: {
        overlay: {
          locked: false,
        },
      },
      titleFormat: function (title) {
        return "<div>" + title + "</div>" + addImageWatermarkLogo(siteVer);
      },
      onCleanup: function () {
        $("#magnify_watermark_wrapper").remove();
      },
    });
  };

  var bigImageMouseoverHandler = function () {
    var $cmpPictire = $(this);

    if (!isIE) {
      $cmpPictire.addClass("magnify_cursor_hover");
    } else {
      var picWidth = isIE ? $cmpPictire.width() + 1 : $cmpPictire.width(),
        picHeight = isIE ? $cmpPictire.height() + 1 : $cmpPictire.height(),
        picTop = isIE ? $cmpPictire.offset().top - 2 : $cmpPictire.offset().top,
        picLeft = isIE
          ? $cmpPictire.offset().left - 2
          : $cmpPictire.offset().left;

      if (
        typeof picWidth == "number" &&
        picWidth > 0 &&
        typeof picHeight == "number" &&
        picHeight > 0
      ) {
        $("<div>")
          .attr("id", "cmppictureshadow")
          .css({
            position: "absolute",
            top: picTop,
            left: picLeft,
            width: picWidth,
            height: picHeight,
            zIndex: 0,
          })
          .addClass("magnify_cursor_hover_ie")
          .appendTo("body");
      }
    }
  };

  var bigImageMouseoutHandler = function () {
    if (!isIE) {
      $(this).removeClass("magnify_cursor_hover");
    } else {
      $("#cmppictureshadow").remove();
    }
  };

  var addImageWatermarkLogo = function (siteVer) {
    return (
      '<div id="magnify_watermark_wrapper" class="magnify_watermark_wrapper"><div class="magnify_watermark magnify_watermark_' +
      siteVer +
      '_logo"></div></div>'
    );
  };

  return {
    Init: init,
  };
})();

$(BigPicture.Init);

$(window).load(function () {
  if (SimpleSite.Util.BrowserDetect.msie) {
    $("#centerTableContentTable").css(
      "height",
      $("#centerTableContentCell").height()
    );
  }

  var topContainer = $(".user_top");
  if ($.trim($(".user_title", topContainer).html()).length === 0) {
    $(".user_top_bg", topContainer).hide();
  }
});

$(function () {
  var fonts = document.getElementsByTagName("font");
  for (var i = 0; i < fonts.length; i++) {
    if (fonts[i].parentNode.nodeName.toLowerCase() == "a") {
      fonts[i].parentNode.style.color = fonts[i].color;
    }
  }
});

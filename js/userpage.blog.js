var BlogPost = (function () {
  var $userContent,
    $overviewList,
    htmLikedPostText = "",
    _rowHoverBgColor = "#000";

  var init = function () {
    $overviewList = $(".overviewList");
    htmLikedPostText = $(".htmLikedPostText").text();

    $userContent = $(".user_content");
    if ($userContent.length && $userContent.hasClass("user_content_darkbg")) {
      _rowHoverBgColor = "#fff";
    }

    checkLikeButtonStatus();
    wrapLinksInQuotePost();

    $(".fbShareIconLink").bind("click", openFacebookSharePopup);
    $(".likeIconLink").bind("click", likePostItem);
    $(".latest_like_link a").bind("click", likePostItemFromLatestComments);

    addIdsPostRows();
    attachEvents();
    addEllipsis();
  };

  var attachEvents = function () {
    $overviewList.delegate("li.overviewRow", "mouseenter", function () {
      var $row = $(this),
        rowOffset = $row.offset();

      $("<div>")
        .addClass("hover_" + $row.attr("id"))
        .css({
          position: "absolute",
          top: rowOffset.top,
          left: rowOffset.left - 4,
          width: 573,
          height: 24,
          backgroundColor: _rowHoverBgColor,
          opacity: $userContent.hasClass("user_content_darkbg") ? 0.1 : 0.05,
        })
        .appendTo("body");
    });

    $overviewList.delegate("li.overviewRow", "mouseleave", function () {
      var $row = $(this);

      $(".hover_" + $row.attr("id")).remove();
    });
  };

  /**
   * Wrapping link text with anchor tag in the quote posts
   */
  var wrapLinksInQuotePost = function () {
    $.each($(".quotePost"), function () {
      var $quoteText = $(this).find(".quoteText"),
        quoteText = $quoteText.html(),
        re = /(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w_\.-]*)*\/?/g;

      $quoteText.html(
        quoteText.replace(re, function (url) {
          var hrefUrl = url.indexOf("http") == -1 ? "http://" + url : url;
          return '<a href="' + hrefUrl + '" target="_blank">' + url + "</a>";
        })
      );
    });
  };

  /**
   * Open facebook share popup window
   */
  var openFacebookSharePopup = function () {
    var $blogPost = $(this).closest(".blogPost"),
      $titleText = $blogPost.find(".titleText"),
      t = encodeURIComponent($titleText.text()),
      u = location.href;

    if ($titleText.is("a")) {
      u = encodeURIComponent($titleText.attr("href"));
    }

    window.open(
      "http://www.facebook.com/sharer.php?u=" + u + "&t=" + t,
      "sharer",
      "toolbar=0, status=0, width=626, height=436"
    );
  };

  /**
   * Liking post item from latest comments box
   */
  var likePostItemFromLatestComments = function () {
    $(".likeIconLink").trigger("click");

    return false;
  };

  /**
   * Liking post item
   */
  var likePostItem = function () {
    var $likeLink = $(this),
      $blogPost = $(this).closest(".blogPost"),
      $titleText = $blogPost.find(".titleText"),
      regExpPageId = new RegExp(/\/(\d+)\/(\d+)\/posting\/.+/),
      regExpResult = null,
      postUrl = location.href,
      pageId,
      pageItemId;

    if ($likeLink.attr("liked") == "1") {
      return false;
    }

    if ($titleText.is("a")) {
      postUrl = $titleText.attr("href");
    }

    regExpResult = regExpPageId.exec(postUrl);
    pageId = regExpResult[1];
    pageItemId = regExpResult[2];

    var requestData = {
      PageId: pageId,
      PageItemId: pageItemId,
      Action: "PageLike",
    };

    $.ajax({
      url: "/userPages/pages/PageCommentsCallback.aspx",
      type: "post",
      dataType: "json",
      data: requestData,
      success: function (responseData) {
        if (responseData.status == "Succeeded") {
          var $likesCountLabel = $(".likesCountLabel", $blogPost),
            likesCount = parseInt($likesCountLabel.text(), 10) + 1;

          $likesCountLabel.html(likesCount);
          $likeLink.attr("liked", "1").attr("title", htmLikedPostText);

          setLikeCookie(pageId, pageItemId);
          checkLikeVisibility($blogPost, pageId, pageItemId);
        } else {
          console.log(responseData.status);
        }
      },
      error: function () {},
    });

    return false;
  };

  /**
   * Checking like link visibility for showing or hiding it
   */
  var checkLikeVisibility = function ($blogPost, pageId, pageItemId) {
    if (getLikeCookie(pageId, pageItemId) != null) {
      $(".latest_like_link").hide();
      $(".latest_liked_text").show();
    } else {
      $(".latest_liked_text").hide();
      $(".latest_like_link").show();
    }
  };

  /**
   * Checking all like links for their status
   */
  var checkLikeButtonStatus = function () {
    $.each($(".likeIconLink"), function () {
      var $likeLink = $(this),
        $blogPost = $(this).closest(".blogPost"),
        $titleText = $blogPost.find(".titleText"),
        regExpPageId = new RegExp(/\/(\d+)\/(\d+)\/posting\/.+/),
        regExpResult = null,
        postUrl = location.href,
        pageId,
        pageItemId;

      if ($titleText.is("a")) {
        postUrl = $titleText.attr("href");
      }

      regExpResult = regExpPageId.exec(postUrl);

      if (regExpResult) {
        pageId = regExpResult[1];
        pageItemId = regExpResult[2];

        if (getLikeCookie(pageId, pageItemId) != null) {
          $likeLink.attr("liked", "1").attr("title", htmLikedPostText);
        }
      }
    });
  };

  /**
   * Getting like cookie
   */
  var getLikeCookie = function (pageId, pageItemId) {
    if (!!$.cookies) {
      var cookieName = pageId + pageItemId;

      return $.cookies.get(cookieName);
    }

    return null;
  };

  /**
   * Setting like cookie with expiration date 2 weeks
   */
  var setLikeCookie = function (pageId, pageItemId) {
    if (!!$.cookies) {
      var cookieName = pageId + pageItemId;

      $.cookies.set(cookieName, true, { hoursToLive: 336 });
    }
  };

  var addIdsPostRows = function () {
    $("li.overviewRow", $overviewList).each(function (i, tr) {
      $(tr).attr("id", "row_" + i);
    });
  };

  /* Add ellipsis to recipients lists' items */
  var addEllipsis = function () {
    var styles = document.documentElement.style;
    if (!("textOverflow" in styles || "OTextOverflow" in styles)) {
      $("a.previousPostTitle").each(function (i, postTitle) {
        var $postTitle = $(postTitle);
        var contentWidth = $postTitle.width();
        var containerWidth = $postTitle.parent().width();

        var contentHtml = $postTitle.html();

        if (contentWidth > containerWidth) {
          contentHtml += "&hellip;";
        }

        while (contentWidth > containerWidth) {
          contentHtml =
            contentHtml.substring(0, contentHtml.length - 9) + "&hellip;";
          $postTitle.html(contentHtml);
          contentWidth = $postTitle.width();
        }
      });
    }
  };

  return {
    Init: init,
  };
})();

$(BlogPost.Init);

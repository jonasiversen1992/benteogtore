var COMMENT = (function () {
  var MAX_COMMENT_CHARS_COUNT = 160;

  var requestDataSpam = {};

  var _commetnsBoxShape = "";

  var _commentTextareaDefaultValue = "";
  var _commentYourNameDefaultValue = "";
  var _commentYourEmailDefaultValue = "";
  var _commentNoCommentErrorMessage = "";
  var _commentNoNameErrorMessage = "";
  var _commentNoEmailErrorMessage = "";

  var _spamMessageWarning = "";
  var _captchaSubmitButtonText = "";
  var _wrongValidationCode = "";

  var emotionsList = [];
  var emotionsAliases = [];

  var _charsLeftInfoSpan = null;
  var _commentTextarea = null;

  /**
   * Initing comments on userpages
   */
  var init = function () {
    _charsLeftInfoSpan = $(".chars_left_infobox span");
    _commentTextarea = $(".comment_textarea");

    if ($(".comment_box_container").length) {
      _commentTextareaDefaultValue = $(".comment_textarea_hidden").val();
      _commentYourNameDefaultValue = $(".your_name_input_hidden").val();
      _commentYourEmailDefaultValue = $(".your_email_input_hidden").val();
      _commentNoCommentErrorMessage = $(".nocomment_error_input_hidden").val();
      _commentNoNameErrorMessage = $(".noname_error_input_hidden").val();
      _commentNoEmailErrorMessage = $(".noemail_error_input_hidden").val();

      _commetnsBoxShape =
        $(".comments_shape").val() == "Round" ? "" : $(".comments_shape").val();

      openCommentForm();

      bindEmotionsEvents();
      bindReplyButtonsEvents();
      bindWriteCommentEvents();
      bindViewAllCommentsEvent();

      initTextareaAutoResize();
      createEmotionsList();

      checkLikeVisibility();
      bindLikeLinkEvent();
    }

    $(".share_link a").bind("click", function () {
      openFacebookSharePopup();
      return false;
    });
    $("#tooltip_close").live("click", function () {
      $("#_tooltip").remove();
    });
    $(window).resize(function () {
      $("#_tooltip").remove();
    });

    initLatestCommentsBox();
  };

  /**
   * Checking like link visibility for showing or hiding it
   */
  var checkLikeVisibility = function () {
    if (getLikeCookie() != null) {
      $(".like_link, .latest_like_link").hide();
      $(".liked_text, .latest_liked_text").show();
    } else {
      $(".liked_text, .latest_liked_text").hide();
      $(".like_link, .latest_like_link").show();
    }
  };

  /**
   * Getting like cookie
   */
  var getLikeCookie = function (pageItemId) {
    if (!!$.cookies) {
      pageItemId = pageItemId || $(".page_item_id").val();

      var cookieName = $(".page_id").val() + pageItemId;

      return $.cookies.get(cookieName);
    }

    return null;
  };

  /**
   * Setting like cookie with expiration date 2 weeks
   */
  var setLikeCookie = function (pageItemId) {
    if (!!$.cookies) {
      pageItemId = pageItemId || $(".page_item_id").val();

      var cookieName = $(".page_id").val() + pageItemId;

      $.cookies.set(cookieName, true, { hoursToLive: 336 });
    }
  };

  /**
   * Creating emotions list
   */
  var createEmotionsList = function () {
    var tempArray = {};

    $(".emotions_list img").each(function (i, img) {
      var alias = encodeHTMLTags($(img).attr("title"));
      emotionsAliases.push(alias);
      tempArray[alias] = $(img).attr("src");
    });

    emotionsAliases.sort(function (a, b) {
      return a.length <= b.length;
    });

    $.each(emotionsAliases, function (i, alias) {
      emotionsList.push({
        alias: alias,
        url: tempArray[alias],
      });
    });
  };

  /**
   * Replacing emotion's alias with its image
   */
  var replaceEmotions = function (message) {
    for (var i = 0; i < emotionsAliases.length; i++) {
      var alias = emotionsAliases[i];
      if (message.indexOf(alias) >= 0) {
        message = message.replace(
          alias,
          '<img src="' + getEmotionURLByAlias(alias) + '">'
        );
        i = 0;
      }
    }

    return message;
  };

  /**
   * Getting emotion URL by its alias
   */
  var getEmotionURLByAlias = function (alias) {
    var url = "";
    $.each(emotionsList, function (i, emote) {
      if (emote.alias == alias) {
        url = emote.url;
        return false;
      }
    });

    return url;
  };

  /**
   * Attach click event to view all comments link
   */
  var bindViewAllCommentsEvent = function () {
    $(".view_all_comments span").click(function () {
      viewComments(true);
    });
  };

  /**
   * Getting all comments list, when clicked view all comments link
   */
  var viewComments = function (allComments) {
    allComments = allComments || false;

    var pageId = $(".page_id").val();
    var pageItemId = $(".page_item_id").val();

    var requestData = {
      PageId: pageId,
      PageItemId: pageItemId,
      Action: allComments ? "GetAllComments" : "GetLatestComments",
    };

    var postUrl = $(".post_url").val();

    $.ajax({
      url: postUrl,
      type: "post",
      dataType: "json",
      data: requestData,
      success: function (responseData) {
        if (responseData.status == "Succeeded") {
          $(".comments_list").empty();

          var comments = responseData.CommentsList;
          for (var i = 0; i < comments.length; i++) {
            var comment = comments[i];
            addComment(comment);

            if (comment.RepliesList.length) {
              var replies = comment.RepliesList;
              for (var j = 0; j < replies.length; j++) {
                var reply = replies[j];
                addComment(reply, comment.CommentId);
              }
            }
          }

          if (allComments) {
            $(".view_all_comments").hide();
          } else {
            checkLikeVisibility();

            $(".like_count").html(responseData.LikeCount);

            if (responseData.HasMore) {
              $(".view_all_comments").show();
            } else {
              $(".view_all_comments").hide();
            }

            openCommentForm();

            // if ($.browser.msie && parseInt($.browser.version) == 6)	pngfix();
            if (
              SimpleSite.Util.BrowserDetect.msie &&
              parseInt(SimpleSite.Util.BrowserDetect.version) == 6
            )
              pngfix();
          }

          adjustCommentsBox();
        }
      },
      error: function () {
        console.log($(".callbackfailure").val());
      },
    });
  };

  /*
   * Adding new comment
   */
  var addComment = function (comment, parentId, newComment) {
    parentId = parentId || 0;
    newComment = newComment || false;

    var commentDate =
      comment.CommentDate || false
        ? comment.CommentDate
        : getFormatedCommentDate();
    var commentBody = newComment
      ? replaceEmotions(encodeHTMLTags(comment.CommentText))
      : comment.CommentText;

    var clonedComment = $(".comment_item_original .comment")
      .clone(true)
      .attr("id", comment.CommentId)
      .children("h4")
      .find(".comment_author")
      .html(comment.CommentAuthor)
      .end()
      .find(".comment_date")
      .html(commentDate)
      .end()
      .end()
      .children("p")
      .html(commentBody)
      .end();

    if (parentId) {
      clonedComment.children(".top_border, .comment_replies_list").remove();
      clonedComment.find(".reply_comment").remove();
      if (newComment) {
        clonedComment.prependTo(
          ".comment[id=" + parentId + "] .comment_replies_list"
        );

        createPromoteTooltip(
          comment.CommentId,
          comment.resultText,
          comment.tipText
        );
      } else
        clonedComment.appendTo(
          ".comment[id=" + parentId + "] .comment_replies_list"
        );
    } else {
      clonedComment.children(".comment_reply_icon").remove();
      if (newComment) {
        clonedComment.prependTo(".comments_list");

        createPromoteTooltip(
          comment.CommentId,
          comment.resultText,
          comment.tipText
        );
      } else clonedComment.appendTo(".comments_list");
    }

    if ($.browser.msie && parseInt($.browser.version) == 6) pngfix();

    var $cCount = $("span.comments-count"),
      $cText = $("span.comments-text");
    if ($cCount[0] && $cText[0]) {
      var cCount = parseInt($cCount.data("commentscount"), 10);
      $cText.text(function (i, text) {
        switch (cCount) {
          case 0:
            text = $(".blogMain").data("commentswordsingle");
            break;
          default:
            text = $(".blogMain").data("commentswordplural");
            break;
        }
        return text;
      });
      $cCount.text(cCount + 1).data("commentscount", cCount + 1);
    }
  };

  /**
   * Creating promotion tooltip after adding comment and showing next to just added comment line
   */
  var createPromoteTooltip = function (commentId, resultText, tipText) {
    if (
      (!resultText || resultText.length == 0) &&
      (!tipText || tipText.length == 0)
    )
      return false;

    $("#_tooltip").remove();

    var commentOffset = $("#" + commentId).offset();

    resultText = !resultText
      ? ""
      : '<p class="resultText">' + resultText + "</p>";
    tipText = !tipText ? "" : '<p class="tipText">' + tipText + "</p>";

    $("<div>")
      .attr("id", "_tooltip")
      .addClass("promo_tooltip")
      .css({
        top: commentOffset.top,
        left: commentOffset.left + 450,
      })
      .append(
        $("<div>")
          .addClass("tooltip_content")
          .html(resultText + tipText)
      )
      .append($("<div>").addClass("tooltip_bottom"))
      .append($("<div>").attr("id", "tooltip_close").addClass("tooltip_close"))
      .appendTo("body");

    adjustCommentsBox();
  };

  /**
   * Replacing HTML tags to theirs HTML entities
   */
  var encodeHTMLTags = function (comment) {
    comment = comment.replace(/</g, "&lt;");
    comment = comment.replace(/>/g, "&gt;");
    comment = comment.replace("\n", "<br/>");
    return comment;
  };

  /**
   * Creating cloned invisible textarea which will handle real comment textarea's height
   */
  var initTextareaAutoResize = function () {
    var minHeight = parseInt(_commentTextarea.css("height"));
    var maxHeight = 144;

    var clonedCommentTextarea = $("<textarea>")
      .attr("id", "comment_textarea_clone")
      .css({
        position: "absolute",
        top: -10000,
        left: -10000,
        width: _commentTextarea.css("width"),
        height: minHeight,
        margin: 0,
        border: 0,
        fontSize: _commentTextarea.css("fontSize"),
        fontFamily: _commentTextarea.css("fontFamily"),
        overflow: "hidden",
      })
      .appendTo("body");

    var fitToContent = function () {
      clonedCommentTextarea.val(_commentTextarea.val());

      clonedCommentTextarea[0].scrollTop = 10000;
      var scrollHeight = clonedCommentTextarea[0].scrollHeight;
      var adjustedHeight = scrollHeight > minHeight ? scrollHeight : minHeight;

      if (adjustedHeight <= maxHeight) {
        _commentTextarea.css({
          overflow: "hidden",
        });

        _commentTextarea.height(adjustedHeight + 18);
        adjustCommentsBox();
      } else {
        _commentTextarea.css({
          overflow: "auto",
        });
      }
    };

    _commentTextarea
      .keyup(function () {
        calculateCommentCharsCount();
        fitToContent();
      })
      .keydown(function () {
        calculateCommentCharsCount();
        fitToContent();
      });

    fitToContent();
  };

  /**
   * Initing like link
   */
  var bindLikeLinkEvent = function () {
    $(".like_link a").click(function () {
      var pageId = $(".page_id").val();
      var pageItemId = $(".page_item_id").val();

      var requestData = {
        PageId: pageId,
        PageItemId: pageItemId,
        Action: "PageLike",
      };

      var postUrl = $(".post_url").val();

      $.ajax({
        url: postUrl,
        type: "post",
        dataType: "json",
        data: requestData,
        success: function (responseData) {
          if (responseData.status == "Succeeded") {
            $(".like_count").html(responseData.LikeCount);

            setLikeCookie();
            checkLikeVisibility();
          } else {
            console.log(responseData.status);
          }
        },
        error: function () {
          console.log($(".callbackfailure").val());
        },
      });

      return false;
    });
  };

  /**
   * Open facebook share popup window
   */
  var openFacebookSharePopup = function () {
    var pageItemId = $(".page_item_id").val();

    var u = "";
    if (pageItemId > 0)
      u = encodeURIComponent(
        location.href.split(location.search)[0] + "?i=" + pageItemId
      );
    else u = encodeURIComponent(location.href);

    var t = encodeURIComponent(document.title);
    window.open(
      "http://www.facebook.com/sharer.php?u=" + u + "&t=" + t,
      "sharer",
      "toolbar=0, status=0, width=626, height=436"
    );
  };

  /**
   * Fix comment box's background dimensions in case of comment box content change
   */
  var isCornersApplied = false;
  var adjustCommentsBox = function () {
    var commentsBgBox = $(".comments_box_bg");

    if (!commentsBgBox.length) return false;

    $(".comments_box_bg").css({
      opacity: 0.3,
      height: $(".comments_box").outerHeight(),
    });
    if (!isCornersApplied) {
      commentsBgBox.corner(_commetnsBoxShape);
      isCornersApplied = true;
    }
  };

  /**
   * Hide emotions list popup
   */
  var hideEmotionsPopup = function () {
    $(".emotions_list").css("visibility", "hidden");
  };

  /**
   * Open emotions list popup
   */
  var openEmotionsPopup = function () {
    $(".emotions_list").css("visibility", "visible");
    _commentTextarea.trigger("blur");
  };

  /**
   * Bind emotions events
   */
  var bindEmotionsEvents = function () {
    $(".emotions_button").bind("click", function () {
      openEmotionsPopup();
    });

    $(".emotions_list_close").bind("click", function () {
      hideEmotionsPopup();
    });

    $(document).bind("click", function (e) {
      var target = $(e.target);
      if (
        !target.is(".emotions_list") &&
        !target.is(".emotions_button") &&
        !target.is(".comment_textarea")
      ) {
        hideEmotionsPopup();
      }
    });

    $(".emotions_list img").bind("click", function () {
      hideEmotionsPopup();
      insertSmiley(" " + $(this).attr("title") + " ");
      _commentTextarea.trigger("keyup");
    });
  };

  /**
   * Insert smiley alias to comment's textarea
   */
  var insertSmiley = function (smiley) {
    _commentTextarea.focus();

    var commentTextarea = _commentTextarea[0];

    if (document.selection) {
      var sel, curPos;

      sel = document.selection.createRange();
      sel.moveStart("character", -commentTextarea.value.length);
      curPos = sel.text.length;

      if (commentTextarea.value.length && curPos != 0) {
        var range = commentTextarea.createTextRange();
        range.move("character", commentTextarea.value.length);
        range.select();
      }

      sel = document.selection.createRange();
      curPos = sel.text.length;
      sel.text = smiley;

      if (smiley.length == 0) {
        sel.moveStart("character", smiley.length);
        sel.moveEnd("character", smiley.length);
      } else {
        sel.moveStart("character", -smiley.length + curPos);
      }
    } else if (
      commentTextarea.selectionStart ||
      commentTextarea.selectionStart == 0
    ) {
      var startPos = commentTextarea.selectionStart;
      var endPos = commentTextarea.selectionEnd;
      commentTextarea.value =
        commentTextarea.value.substring(0, startPos) +
        smiley +
        commentTextarea.value.substring(endPos, commentTextarea.value.length);
      commentTextarea.selectionStart = startPos + smiley.length;
      commentTextarea.selectionEnd = startPos + smiley.length;
      commentTextarea.focus();
    } else {
      commentTextarea.value += smiley;
    }
  };

  /**
   * Bind comment reply buttons events
   */
  var bindReplyButtonsEvents = function () {
    $(".reply_button").bind("click", openCommentReplyForm);
  };

  /**
   * Open comment form
   */
  var openCommentForm = function () {
    removeCaptcha();
    resetCommentsForm();

    $(".reply_comment").show();
    $(".write_comment_link").hide();

    $(".comments_form").insertAfter($(".write_comment_link").parent());
    $(".comments_form").show();

    adjustCommentsBox();
  };

  /*
   * Close comment form
   */
  var closeCommentForm = function () {
    $(".reply_comment").show();
    $(".write_comment_link").show();

    $(".comments_form").hide();
    $(".comments_form").insertAfter($(".write_comment_link").parent());

    adjustCommentsBox();
  };

  /**
   * Open comment form for reply
   */
  var openCommentReplyForm = function () {
    removeCaptcha();

    var replyButtonContainer = $(this)
      .parents(".comment")
      .children(".comment_replies_list");
    $(".comments_form").insertBefore(replyButtonContainer);

    $(".write_comment_link").show();
    $(".comments_form").show();
    $(".reply_comment").show();
    $(this).parent().hide();

    resetCommentsForm();
    adjustCommentsBox();

    _commentTextarea.focus();

    return false;
  };

  /**
   * Bind comment form's elements events
   */
  var bindWriteCommentEvents = function () {
    $(".write_comment_link").bind("click", function () {
      openCommentForm();
      return false;
    });

    _commentTextarea
      .bind("focus", function () {
        removeErrorTooltip(this);

        $(this).removeClass("error").addClass("active");
        if ($(this).val() == _commentTextareaDefaultValue) {
          $(this).val("");
        }
      })
      .bind("blur", function () {
        if (!$.trim($(this).val()).length) {
          $(this).val(_commentTextareaDefaultValue).removeClass("active");
          resetCommentCharsCount();
        }
      });

    $(".your_name_input")
      .bind("focus", function () {
        removeErrorTooltip(this);

        $(this).removeClass("error").addClass("active");
        if ($(this).val() == _commentYourNameDefaultValue) {
          $(this).val("");
        }
      })
      .bind("blur", function () {
        if (!$.trim($(this).val()).length) {
          $(this).val(_commentYourNameDefaultValue).removeClass("active");
        }
      });

    $(".your_email_input")
      .bind("focus", function () {
        removeErrorTooltip(this);

        $(this).removeClass("error").addClass("active");
        if ($(this).val() == _commentYourEmailDefaultValue) {
          $(this).val("");
        }
      })
      .bind("blur", function () {
        if (!$.trim($(this).val()).length) {
          $(this).val(_commentYourEmailDefaultValue).removeClass("active");
        }
      })
      .bind("keydown", function (e) {
        removeErrorTooltip(this);

        if (e.keyCode == 13) $(".done_button").trigger("click");
      });

    $(".done_button").bind("click", function () {
      var commentId = $(this).parents(".comment").attr("id")
        ? $(this).parents(".comment").attr("id")
        : 0;
      sendComment(commentId);
      if ($(".comment_share_checkbox").is(":checked")) openFacebookSharePopup();
      return false;
    });
  };

  /**
   * Calculate comment message characters count
   */
  var calculateCommentCharsCount = function () {
    var textareaVal = _commentTextarea.val();
    var charsLength = textareaVal.length;

    var charsCountLeft =
      MAX_COMMENT_CHARS_COUNT - charsLength >= 0
        ? MAX_COMMENT_CHARS_COUNT - charsLength
        : 0;
    _charsLeftInfoSpan.text(charsCountLeft);

    if (charsLength > MAX_COMMENT_CHARS_COUNT) {
      var stripedComment = textareaVal.substr(0, MAX_COMMENT_CHARS_COUNT);
      _commentTextarea.val(stripedComment);
    }
  };

  /**
   * Reset comment message characters count
   */
  var resetCommentCharsCount = function () {
    $(".chars_left_infobox span").text(MAX_COMMENT_CHARS_COUNT);
  };

  /**
   * Reset (empty) comment form elements
   */
  var resetCommentsForm = function () {
    _commentTextarea
      .removeClass("error")
      .removeClass("active")
      .val(_commentTextareaDefaultValue);
    $(".your_name_input")
      .removeClass("error")
      .removeClass("active")
      .val(_commentYourNameDefaultValue);
    $(".your_email_input")
      .removeClass("error")
      .removeClass("active")
      .val(_commentYourEmailDefaultValue);

    $(".comments_form .checkbox").attr("checked", false);
    $(".notify_replies_checkbox").attr("checked", true);

    $(".error_tooltip").remove();
  };

  /**
   * Show error tooltip for comment form's elements, in case of validation error
   */
  var showErrorTooltip = function (errObj, errMessage) {
    var className = $(errObj).attr("class").split(" ")[0];
    if ($("#" + className + "_tooltip").length) return;

    var offset = $(errObj).offset();
    $("<div>")
      .attr("id", className + "_tooltip")
      .addClass("error_tooltip")
      .css({
        top: offset.top - 45,
        left: offset.left,
      })
      .html(errMessage)
      .append($("<div>"))
      .appendTo("body");
  };

  /**
   * Remove error tooltip from comment form's elements
   */
  var removeErrorTooltip = function (errObj) {
    var className = $(errObj).removeClass("error").attr("class");
    className = className.split(" ")[0];
    $("#" + className + "_tooltip").remove();
  };

  /**
   * Validate comment form
   */
  var validateCommentFormFields = function () {
    var isValidForPost = true;

    _commentTextarea.each(function () {
      if (
        !$.trim($(this).val()).length ||
        $(this).val() == _commentTextareaDefaultValue
      ) {
        showErrorTooltip(this, _commentNoCommentErrorMessage);

        $(this).addClass("error");
        isValidForPost = false;
      }
    });
    $(".your_name_input").each(function () {
      if (
        !$.trim($(this).val()).length ||
        $(this).val() == _commentYourNameDefaultValue
      ) {
        showErrorTooltip(this, _commentNoNameErrorMessage);

        $(this).addClass("error");
        isValidForPost = false;
      }
    });
    $(".your_email_input").each(function () {
      var emailRegExp =
        /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})$/;
      // BUG-333: trim emails.
      var trimmedEmail = $.trim($(this).val());
      if (
        !$.trim($(this).val()).length ||
        !emailRegExp.test(trimmedEmail) ||
        $(this).val() == _commentYourEmailDefaultValue
      ) {
        showErrorTooltip(this, _commentNoEmailErrorMessage);

        $(this).addClass("error");
        isValidForPost = false;
      }
    });

    return isValidForPost;
  };

  /**
   * Get formated date for new posted comment
   */
  var getFormatedCommentDate = function () {
    var dateObj = new Date();

    var day =
      dateObj.getDate() < 10 ? "0" + dateObj.getDate() : dateObj.getDate();
    var month =
      dateObj.getMonth() + 1 < 10
        ? "0" + (dateObj.getMonth() + 1)
        : dateObj.getMonth() + 1;
    var year = dateObj.getFullYear();
    var hours = dateObj.getHours();
    var minutes =
      dateObj.getMinutes() < 10
        ? "0" + dateObj.getMinutes()
        : dateObj.getMinutes();
    var seconds =
      dateObj.getSeconds() < 10
        ? "0" + dateObj.getSeconds()
        : dateObj.getSeconds();

    var dayPeriod = hours >= 12 ? "PM" : "AM";

    return (
      month +
      "/" +
      day +
      "/" +
      year +
      " " +
      hours +
      ":" +
      minutes +
      ":" +
      seconds +
      " " +
      dayPeriod
    );
  };

  /**
   * Send new comment
   */
  var sendComment = function (parentId, reCaptchaData) {
    if (!validateCommentFormFields()) return false;
    showWaitingIndicator("done_button");

    reCaptchaData = reCaptchaData || null;

    if (!reCaptchaData) {
      var pageId = $(".page_id").val();
      var pageItemId = $(".page_item_id").val();
      var authorName = $(".your_name_input").val();
      // BUG-333: trim emails.
      var authorEmail = $.trim($(".your_email_input").val());
      var commentText = _commentTextarea.val();
      var notifyReplies = $(".notify_replies_checkbox").attr("checked") ? 1 : 0;

      var requestData = {
        PageId: pageId,
        PageItemId: pageItemId,
        CommentText: commentText,
        AuthorName: authorName,
        AuthorEmail: authorEmail,
        ParentId: parentId,
        NotifyReplies: notifyReplies,
        Action: "PostComment",
      };
    } else {
      requestData = requestDataSpam;
      requestData.CaptchaResponse = reCaptchaData.CaptchaResponse;
    }

    var postUrl = $(".post_url").val();

    $.ajax({
      url: postUrl,
      type: "post",
      dataType: "json",
      data: requestData,
      success: function (responseData) {
        hideWaitingIndicator("done_button");

        if (responseData.status == "Succeeded") {
          removeCaptcha();

          if (responseData.commentId) {
            requestData.CommentId = responseData.commentId;
          }
          requestData.resultText = responseData.resultText;
          requestData.tipText = responseData.tipText || "";
          requestData.CommentAuthor = requestData.AuthorName;
          requestData.CommentDate = responseData.commentDate;

          closeCommentForm();

          addComment(requestData, requestData.ParentId, true);
        } else if (responseData.status == "Spam") {
          closeCommentForm();
          requestDataSpam = requestData;
          createCaptcha();
        } else if (
          responseData.status == "IpBlocked" ||
          responseData.status == "Flood"
        ) {
          console.log(responseData.errorMessage);
        } else {
          console.log(responseData.status);
        }
      },
      error: function () {
        console.log($(".callbackfailure").val());
      },
    });
  };

  var showWaitingIndicator = function (className) {
    var elm = $("." + className);
    var indicatorClass = elm.attr("class") + "_waiting";
    elm.hide();
    $("." + indicatorClass).show();
  };
  var hideWaitingIndicator = function (className) {
    var elm = $("." + className);
    var indicatorClass = elm.attr("class") + "_waiting";
    $("." + indicatorClass).hide();
    elm.show();
  };

  /*
   * Create reCaptcha
   */
  var createCaptcha = function () {
    if (!$("#recaptcha_container").length) {
      var reCaptchaDiv = $("<div>")
        .attr("id", "recaptcha_container")
        .addClass("recaptcha_container")
        .insertBefore(".comments_form");
      $("<div>")
        .attr("id", "recaptcha_div")
        .addClass("recaptcha_div")
        .appendTo(reCaptchaDiv);

      if (typeof grecaptcha != "undefined") {
        grecaptcha.render("recaptcha_div", {
          sitekey: "6LdIg0IUAAAAAI8aWmRzM5Dc_Vj99ReHHQ6a0ZnS",
          callback: function (resp) {
            sendComment(null, {
              CaptchaResponse: resp,
            });
          },
        });
      }

      $("<div>").addClass("clear_float").appendTo(reCaptchaDiv);

      adjustCommentsBox();
    }
  };

  /*
   * Remove reCaptcha
   */
  var removeCaptcha = function () {
    if ($("#recaptcha_container").length) {
      $("#recaptcha_container").remove();
    }
  };

  /*
   * Initing latest comments box
   */
  var initLatestCommentsBox = function () {
    if (!$(".latest_comments_container").length) return false;

    var scrollSpeed = 300;

    var latestCommentsBox = $(".latest_style_rounded .latest_comments");
    if (latestCommentsBox.length) {
      latestCommentsBox.corner();
    }

    $(".latest_write_comment_link a").click(function () {
      openCommentForm();

      var top = $(".comments_form").offset().top - 40;
      $("html,body").animate(
        {
          scrollTop: top,
        },
        scrollSpeed,
        function () {
          _commentTextarea.focus();
        }
      );

      return false;
    });

    $(".latest_like_link a").click(function () {
      $(".like_link a").trigger("click");

      return false;
    });

    addEllipsisToMessages();
  };

  /**
   * Add ellipsis to latest comments
   */
  var addEllipsisToMessages = function () {
    var viewAllText = $(".read_more_text").val();
    var linesCount = 3;
    var lineHeight = parseInt($(".comment_body").css("lineHeight"));
    var maxHeight = lineHeight * linesCount;
    var ieHeightBug = $.browser.msie ? 2 : 0;

    $(".comment_body p").each(function () {
      var orgStr = $(this)
        .html()
        .replace(/<br>|<br\/>/gi, " ");

      var re = new RegExp(/<img[^>]+>/gi);
      var smileysArray = re.exec(orgStr);
      if (smileysArray) {
        orgStr = orgStr.substr(0, smileysArray.index + smileysArray[0].length);

        var smileyImage = smileysArray[0];
        orgStr = orgStr.replace(smileyImage, "#I#");

        $(this).html(orgStr);
      }

      var shortStr = orgStr;

      while ($(this).height() - ieHeightBug > maxHeight) {
        shortStr = shortStr.substr(0, shortStr.length - 1);
        $(this).html(shortStr + "... " + viewAllText);
      }

      if (smileysArray) {
        shortStr = shortStr.replace("#I#", smileyImage);
      }

      if (shortStr < orgStr) {
        $(this).html(shortStr + "... ");
      } else {
        $(this).html(shortStr + " ");
      }

      $(this).siblings("a").html(viewAllText).appendTo(this).show();

      $(this).parent().css({
        height: "auto",
        overflow: "visible",
      });
    });
  };

  return {
    Init: init,
    ViewComments: viewComments,
    OpenFacebookShare: openFacebookSharePopup,
    GetItemLiked: getLikeCookie,
    SetItemLiked: setLikeCookie,
  };
})();

$(function () {
  COMMENT.Init();
});

var GUESTBOOK = (function () {
  var htmEntryDefault = "",
    htmNameDefault = "",
    htmEmailDefault = "",
    htmUrlDefault = "";

  var windowDefaultOnLoadFunc = null;

  var rndSmlBalloonUrl,
    rndMedBalloonUrl,
    rndLrgBalloonUrl,
    thgSmlBalloonUrl,
    thgMedBalloonUrl,
    thgLrgBalloonUrl;

  // Initializing guestbook
  var init = function () {
    // If there are one and more images in the guestbook entries, we store body onload event into local variable, empty onload event
    // and after long texts are fixed fire that event
    if ($(".imgPoster").length) {
      windowDefaultOnLoadFunc = window.onload;
      window.onload = function () {};
    }
    // Fixing long texts in the guestbook entries
    $(window).load(function () {
      $(".imgPoster").each(function () {
        var $guestbookEntryImage = $(this),
          contentWidth = 430,
          imageWidth = $guestbookEntryImage.width() + 15;

        $guestbookEntryImage
          .parent()
          .find(".tmpMainSkinSubTitle")
          .css({
            width: contentWidth - imageWidth - 5,
            float: "left",
          })
          .children()
          .width(contentWidth - imageWidth - 5);
      });

      if (windowDefaultOnLoadFunc != null) {
        windowDefaultOnLoadFunc();
      }
    });

    htmEntryDefault = $("input.formGuestbookMessageDefault").val();
    htmNameDefault = $("input.formGuestbookUserDefault").val();
    htmEmailDefault = $("input.formGuestbookEmailDefault").val();
    htmUrlDefault = $("input.formGuestbookWebAddressDefault").val();

    $("div.guestbookFormInputs")
      .find("textarea, input")
      .each(function () {
        var $this = $(this);
        var defaultValueClassName =
          $this.attr("class").split(" ")[0] + "Default";

        $this.data(
          "placeholdertext",
          $("input." + defaultValueClassName).val()
        );
      })
      .focus(function () {
        var $this = $(this).addClass("textFieldActive");
        var placeholderText = $this.data("placeholdertext");

        if ($this.val() == placeholderText) {
          $this.val("");
        }

        hideErrorTooltip();
      })
      .blur(function () {
        var $this = $(this);
        var placeholderText = $this.data("placeholdertext");

        if (!$.trim($this.val()).length) {
          $this
            .val($this.data("placeholdertext"))
            .removeClass("textFieldActive");
        }
      });

    $("a.addNewEntryBottom").bind("click", function (e) {
      showGuestbookEntryForm();
      e.preventDefault();
    });
    $("a.addNewEntryButton").bind("click", function (e) {
      if (!validateFormFields()) {
        e.preventDefault();
      } else {
        clearFormBeforeSubmit();
      }
    });
    $("a.guestbookEntryAddImageButton").bind("click", function (e) {
      if (!validateFormFields()) {
        e.preventDefault();
      } else {
        addImageButtonClicked = true;
        clearFormBeforeSubmit();
      }
    });
    $("a.addBubbleButton, a.editBubbleButton").bind("click", function (e) {
      var entryImageUrl = $(".guestbookEntryImage").attr("src");
      $("#guestbookBubbleImage").attr("src", entryImageUrl);

      var $bubblePreview = $("#balloonPreview");
      if ($bubblePreview.length && $bubblePreview.data("saved")) {
        $bubblePreview.hide();
      } else if ($bubblePreview.length) {
        $bubblePreview.remove();
      }

      showBubbleEditor();
      initBubbleEditor();
      e.preventDefault();
    });
    $("a.saveBubbleButton").bind("click", function (e) {
      hideBubbleEditor();

      if ($.trim($(".inputBobbel").val()).length) {
        $("#balloonPreview").remove();

        var xref1 = parseInt($(".xref1").val()),
          yref1 = parseInt($(".yref1").val()),
          imageOffsetLeft = $(".guestbookEntryImage").offset().left,
          imageOffsetTop = $(".guestbookEntryImage").offset().top;

        $("#balloon")
          .clone()
          .attr("id", "balloonPreview")
          .data("saved", true)
          .css({
            top: imageOffsetTop + yref1,
            left: imageOffsetLeft + xref1,
            zIndex: 101,
            cursor: "auto",
          })
          .appendTo("body");

        $(".addBubbleButton").hide();
        $(".editBubbleButton").show();
      }

      e.preventDefault();
    });
    $("a.cancelBubbleButton").bind("click", function (e) {
      var $bubblePreview = $("#balloonPreview");
      if ($bubblePreview.length) {
        $bubblePreview.show();
      }

      hideBubbleEditor();
      e.preventDefault();
    });

    if (!$("img.guestbookEntryImage").length) {
      $("div.guestbookEntryAddImage").show();
    } else {
      var addImageButtonClicked = false;
      var $guestbookEntryChangeImage = $("div.guestbookEntryChangeImage"),
        $guestbookEntryImage = $("img.guestbookEntryImage");

      $("div.guestbookEntryImageHolder").hover(
        function () {
          if (!addImageButtonClicked) {
            $guestbookEntryImage.css("opacity", 0.4);
            $guestbookEntryChangeImage.show();
          }
        },
        function () {
          if (!addImageButtonClicked) {
            $guestbookEntryImage.css("opacity", 1);
            $guestbookEntryChangeImage.hide();
          }
        }
      );

      showGuestbookEntryForm();

      $(".addBubbleButtonHolder").show();
    }

    showViralPopup();

    autoValidateFormFields();

    fillGuestbookFormDefaults();
  };

  // Initializing speech bubble editor
  var initBubbleEditor = function () {
    rndSmlBalloonUrl = $(".rndSmlBalloonUrl").text();
    rndMedBalloonUrl = $(".rndMedBalloonUrl").text();
    rndLrgBalloonUrl = $(".rndLrgBalloonUrl").text();
    thgSmlBalloonUrl = $(".thgSmlBalloonUrl").text();
    thgMedBalloonUrl = $(".thgMedBalloonUrl").text();
    thgLrgBalloonUrl = $(".thgLrgBalloonUrl").text();

    $(".imgBalloonType, .chkBalloonType").bind("click", function () {
      if ($(this).is(".imgBalloonType")) {
        $(this).parent().find(":radio").attr("checked", true);
      }
      SetBalloon(1);
    });

    var $inputBobbel = $(".inputBobbel");
    $inputBobbel.bind("keyup", UpdateText);
    if ($.trim($inputBobbel.val()).length) {
      UpdateText();
    }

    var $guestbookBubbleImage = $("#guestbookBubbleImage");
    var $balloon = $("#balloon");

    var $balloonContainer = $("#balloonContainer");
    if (!$balloonContainer.length) {
      $balloonContainer = $("<div></div>")
        .css({
          position: "absolute",
          zIndex: 999,
        })
        .attr("id", "balloonContainer")
        .appendTo("body"); //.appendTo("#guestbookBubbleImageHolder");

      UpdateBalloonContainer();

      var initialBalloonX = 0,
        initialBalloonY = 0;

      $("#balloon")
        .appendTo($balloonContainer)
        .css({
          left: initialBalloonX,
          top: initialBalloonY,
        })
        .draggable({
          containment: "parent",
          stop: UpdateBalloonPosition,
        });

      UpdateBalloonPosition();
      toogleB1();

      SetBalloon(1);
    }
  };

  // Updating speech bubble container position and dimensions
  var UpdateBalloonContainer = function () {
    var $guestbookBubbleImageHolder = $("#guestbookBubbleImageHolder"),
      $guestbookBubbleImage = $("#guestbookBubbleImage"),
      $balloon = $("#balloon");

    var width = $guestbookBubbleImage.width() + $balloon.width() - 25,
      height = $guestbookBubbleImage.height() + $balloon.height() - 10,
      top =
        $guestbookBubbleImage.offset().top -
        height +
        $guestbookBubbleImage.height(),
      left = $guestbookBubbleImage.offset().left;

    $("#balloonContainer").css({
      top: top,
      left: left,
      width: width,
      height: height,
    });

    UpdateBalloonPosition();
  };

  // Toggle speech bubble visibility
  var toogleB1 = function () {
    var $balloon = $("#balloon");

    if ($balloon.css("visibility") == "hidden") {
      $balloon.css("visibility", "visible");
    } else {
      $balloon.css("visibility", "hidden");
    }
  };

  // Updating speech bubble position
  var UpdateBalloonPosition = function () {
    var $guestbookBubbleImage = $("#guestbookBubbleImage"),
      $balloonContainer = $("#balloonContainer"),
      $balloon = $("#balloon");

    var xref1 = $balloon.offset().left - $guestbookBubbleImage.offset().left;
    var yref1 =
      parseInt($balloon.css("top")) -
      $guestbookBubbleImage.offset().top +
      $balloonContainer.offset().top;

    $(".xref1").val(xref1);
    $(".yref1").val(yref1);
  };

  // Updating text in the speech bubble
  var UpdateText = function () {
    var $balloonTextPlace = $("#balloon").find("#balloontextplace");
    $balloonTextPlace.html($(".inputBobbel").val());

    if ($(".inputBobbel").val().length > 40) {
      if ($(".inputBobbel").val().length > 75) {
        $(".b1size").val("lrg");
        SetBalloon(1);
      } else {
        $(".b1size").val("med");
        SetBalloon(1);
      }
    } else {
      $(".b1size").val("sml");
      SetBalloon(1);
    }
  };

  // Getting speech bubble size and type, and updating seech bubble
  var SetBalloon = function (tmpballoon) {
    var tmpsize = $(".b" + tmpballoon + "size").val(),
      tmptype = getRadioValue("b1type");

    if (tmptype == "rnd") {
      $(".inputBobbel").attr("maxlength", 130);
      if (tmpsize == "sml") {
        UpdateBalloon(
          tmpballoon,
          tmptype,
          rndSmlBalloonUrl,
          153,
          125,
          16,
          28,
          25,
          25
        );
      }
      if (tmpsize == "med") {
        UpdateBalloon(
          tmpballoon,
          tmptype,
          rndMedBalloonUrl,
          190,
          156,
          25,
          45,
          25,
          25
        );
      }
      if (tmpsize == "lrg") {
        UpdateBalloon(
          tmpballoon,
          tmptype,
          rndLrgBalloonUrl,
          227,
          185,
          28,
          57,
          25,
          25
        );
      }
    }
    if (tmptype == "thg") {
      $(".inputBobbel").attr("maxlength", 130);
      if (tmpsize == "sml") {
        UpdateBalloon(
          tmpballoon,
          tmptype,
          thgSmlBalloonUrl,
          156,
          129,
          16,
          38,
          25,
          25
        );
      }
      if (tmpsize == "med") {
        UpdateBalloon(
          tmpballoon,
          tmptype,
          thgMedBalloonUrl,
          194,
          159,
          25,
          50,
          25,
          30
        );
      }
      if (tmpsize == "lrg") {
        UpdateBalloon(
          tmpballoon,
          tmptype,
          thgLrgBalloonUrl,
          231,
          190,
          28,
          63,
          25,
          35
        );
      }
    }
  };

  // Getting speech bubble type value from radio button
  var getRadioValue = function (radioName) {
    return $(":radio[name=" + radioName + "]:checked").val();
  };

  // Setting speech bubble type, position and dimensions
  var UpdateBalloon = function (
    tmpballoon,
    tmptype,
    imagepath,
    imagewidth,
    imageheight,
    topmargin,
    bottommargin,
    leftmargin,
    rightmargin
  ) {
    var $balloon = $("#balloon"),
      $balloonTable = $balloon.find("#balloontable"),
      $tableRows = $balloonTable.find("tr"),
      $frontCell = $balloonTable.find("#frontcell"),
      $backCell = $balloonTable.find("#backcell");

    $balloon.width(imagewidth).height(imageheight);
    $balloonTable.width(imagewidth).height(imageheight);
    $(".imgBalloonDefault")
      .width(imagewidth)
      .height(imageheight)
      .attr("src", imagepath);

    $($tableRows[0]).height(topmargin);
    $($tableRows[2]).height(bottommargin);

    $frontCell.width(leftmargin);
    $backCell.width(rightmargin);

    $(".b1width").val(imagewidth);
    $(".b1height").val(imageheight);
    $(".b1left").val(leftmargin);
    $(".b1right").val(rightmargin);
    $(".b1top").val(topmargin);
    $(".b1bottom").val(bottommargin);

    $(".b1type").val(tmptype);

    UpdateBalloonContainer();
  };

  // Show speech bubble editor wrapper
  var showBubbleEditor = function () {
    $(".guestbookForm").hide();

    $(".guestbookBubbleEditor").show();
    $("#balloonContainer").show();
  };

  // Hide speech bubble editor wrapper
  var hideBubbleEditor = function () {
    $(".guestbookBubbleEditor").hide();
    $("#balloonContainer").hide();

    $(".guestbookForm").show();
  };

  // Clearing guestbook form fields
  var clearFormBeforeSubmit = function () {
    var $emailField = $("input.formGuestbookEmail"),
      $webField = $("input.formGuestbookWebAddress");

    if ($.trim($emailField.val()) == $emailField.data("placeholdertext")) {
      $("input.formGuestbookEmail").val("");
    }
    if ($.trim($webField.val()) == $webField.data("placeholdertext")) {
      $("input.formGuestbookWebAddress").val("");
    }
  };

  // Setting guestbook form fields to their default values
  var fillGuestbookFormDefaults = function () {
    var $formGuestbookMessage = $("textarea.formGuestbookMessage");
    var $formGuestbookUser = $("input.formGuestbookUser");
    var $formGuestbookEmail = $("input.formGuestbookEmail");
    var $formGuestbookWebAddress = $("input.formGuestbookWebAddress");

    if (
      !$.trim($formGuestbookMessage.val()).length ||
      $formGuestbookMessage.val() ==
        $formGuestbookMessage.data("placeholdertext")
    ) {
      $formGuestbookMessage.val(htmEntryDefault);
    } else {
      $formGuestbookMessage.addClass("textFieldActive");
    }

    if (
      !$.trim($formGuestbookUser.val()).length ||
      $formGuestbookUser.val() == $formGuestbookUser.data("placeholdertext")
    ) {
      $formGuestbookUser.val(htmNameDefault);
    } else {
      $formGuestbookUser.addClass("textFieldActive");
    }

    if (
      !$.trim($formGuestbookEmail.val()).length ||
      $formGuestbookEmail.val() == $formGuestbookEmail.data("placeholdertext")
    ) {
      $formGuestbookEmail.val(htmEmailDefault);
    } else {
      $formGuestbookEmail.addClass("textFieldActive");
    }

    if (
      !$.trim($formGuestbookWebAddress.val()).length ||
      $formGuestbookWebAddress.val() ==
        $formGuestbookWebAddress.data("placeholdertext")
    ) {
      $formGuestbookWebAddress.val(htmUrlDefault);
    } else {
      $formGuestbookWebAddress.addClass("textFieldActive");
    }
  };

  // Show guestbook form
  var showGuestbookEntryForm = function () {
    adjustFormBackground();
    hideShowFormButtons();
    hideViralPopup();
    hideGuestbookEntriesBalloons();

    $("div.guestbookFormWrapper").show();
    $("html,body").animate({ scrollTop: 0 }, 400);
    /*
		if (typeof RearrangeObjects === "function") {
			RearrangeObjects();
		}
		*/
  };

  // Hiding guestbook entries balloons if guestbook for is visible
  var hideGuestbookEntriesBalloons = function () {
    $("div[name=cmpballoon]")
      .filter(function () {
        var $cmpBalloon = $(this),
          linkedImgId = $cmpBalloon.attr("linkedimg").toLowerCase();

        return linkedImgId.indexOf("guestbook") > -1;
      })
      .hide();
  };

  // Hide show guestbook form buttons
  var hideShowFormButtons = function () {
    $("a.addNewEntryBottom").hide();
  };

  // Adjust guestbook form background and border colors to look like as the guestbook entry
  var adjustFormBackground = function () {
    var borderColor = "#aaaaaa";
    if (
      $("td.tmpMain").length &&
      !$("td.tmpMain").hasClass("user_content") &&
      $("td.tmpMain").css("background-color") != "transparent"
    ) {
      borderColor = $("td.tmpMain").css("background-color");
    } else {
      $(".guestbookcomment:first")
        .find("td")
        .each(function () {
          if (
            typeof $(this).attr("bgcolor") != "undefined" &&
            $(this).attr("bgcolor") != ""
          ) {
            borderColor = $(this).attr("bgcolor");
          }
        });
    }
    $(".guestbookForm, .guestbookReCaptcha, .guestbookBubbleEditor").css(
      "border-color",
      borderColor
    );
  };

  // Automatically validate guestbook form fields
  var autoValidateFormFields = function () {
    var htmErrorFieldName = $("input.htmErrorFieldName").val();

    if (!$.trim(htmErrorFieldName).length) return false;

    showGuestbookEntryForm();

    switch (htmErrorFieldName) {
      case "formGuestbookMessage":
        $("textarea.formGuestbookMessage").focus();
        validateEntryMessage();
        break;
      case "formGuestbookUser":
        $("input.formGuestbookUser").focus();
        validateUsername();
        break;
      case "formGuestbookEmail":
        $("input.formGuestbookEmail").focus();
        validateEmailAddress();
        break;
    }
  };

  // Validate guestbook entry message field
  var validateEntryMessage = function () {
    var $formGuestbookMessage = $("textarea.formGuestbookMessage");
    var entryErrorMessage = $("input.htmEntryMessage").val();

    if (
      !$.trim($formGuestbookMessage.val()).length ||
      $.trim($formGuestbookMessage.val()) ==
        $formGuestbookMessage.data("placeholdertext")
    ) {
      displayErrorTooltip($formGuestbookMessage, entryErrorMessage);
      return false;
    }

    return true;
  };

  // Validate guestbook form name field
  var validateUsername = function () {
    var $formGuestbookUser = $("input.formGuestbookUser");
    var userErrorMessage = $("input.htmNameMessage").val();

    if (
      !$.trim($formGuestbookUser.val()).length ||
      $.trim($formGuestbookUser.val()) ==
        $formGuestbookUser.data("placeholdertext")
    ) {
      displayErrorTooltip($formGuestbookUser, userErrorMessage);
      return false;
    }

    return true;
  };

  // Validate guestbook form email field
  var validateEmailAddress = function () {
    var $formGuestbookEmail = $("input.formGuestbookEmail");
    var trimmedEmail = $.trim($formGuestbookEmail.val());
    var emailErrorMessage = $("input.htmEmailMessage").val();

    var emailRegExp =
      /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})$/;
    if (
      !emailRegExp.test(trimmedEmail) &&
      $.trim($formGuestbookEmail.val()).length &&
      trimmedEmail != $formGuestbookEmail.data("placeholdertext")
    ) {
      displayErrorTooltip($formGuestbookEmail, emailErrorMessage);
      return false;
    }

    return true;
  };

  // Validate guestbook form all fields
  var validateFormFields = function () {
    if (
      !validateEntryMessage() ||
      !validateUsername() ||
      !validateEmailAddress()
    ) {
      return false;
    }

    hideErrorTooltip();
    return true;
  };

  // Display validate error tooltip
  var displayErrorTooltip = function (inputfield, message) {
    var $inputField = $(inputfield);
    var inputFieldOffset = $inputField.offset();
    var inputFieldWidth = $inputField.width();
    message = message.replace(/&lt;/g, "<").replace(/&gt;/g, ">");

    $("#_tooltip").remove();

    $("<div>")
      .attr("id", "_tooltip")
      .addClass("guestbookErrorTooltip")
      .css({
        top: inputFieldOffset.top - 4,
        left: inputFieldOffset.left + inputFieldWidth + 5,
      })
      .append($("<div>").addClass("tooltipContent").html(message))
      .append($("<div>").addClass("tooltipBottom"))
      .appendTo("body");
  };

  // Hide validate error tooltip
  var hideErrorTooltip = function () {
    $("#_tooltip").remove();
  };

  // Create reCaptcha
  var createCaptcha = function () {
    if (
      typeof grecaptcha != "undefined" &&
      $("#recaptcha_container").length > 0
    ) {
      grecaptcha.render("recaptcha_container", {
        sitekey: $("input.inpCaptchaSiteKey").val(),
        callback: function (resp) {
          showGuestbookEntryForm();
          $("input.inpCaptchaResponse").val(resp);
          $("a.btnRecaptchaSubmit").css("display", "block").click();
        },
      });
    }
  };

  var showViralPopup = function () {
    var dataSignature = document.location.hash.split("#")[1],
      $guestbookEntry = $(
        ".tmpMainSkinSubTitle span[data-signature=" + dataSignature + "]"
      ).closest(".guestbookcomment");

    if (!dataSignature) return false;

    var viralPopupContentHtml = $(".lblViralPopupContent").html();

    $("#promo_tooltip").remove();

    $("<div>")
      .attr("id", "promo_tooltip")
      .addClass("promo_tooltip")
      .hide()
      .append(
        $("<div>")
          .addClass("tooltip_content")
          .html("<p>" + viralPopupContentHtml + "</p>")
      )
      .append($("<div>").addClass("tooltip_bottom"))
      .append($("<div>").attr("id", "tooltip_close").addClass("tooltip_close"))
      .appendTo("body");

    $("#tooltip_close").live("click", function () {
      $("#promo_tooltip").remove();
    });
    $(window).resize(function () {
      positionViralPopup($guestbookEntry);
    });

    positionViralPopup($guestbookEntry);
  };

  var hideViralPopup = function () {
    $("#promo_tooltip").remove();
  };

  var positionViralPopup = function ($guestbookEntry) {
    var guestbookEntryOffset = $guestbookEntry.offset(),
      guestbookEntryWidth = $guestbookEntry.outerWidth();

    $("#promo_tooltip")
      .css({
        top: guestbookEntryOffset.top + 10,
        left: guestbookEntryOffset.left + guestbookEntryWidth - 10,
      })
      .show();
  };

  return {
    Init: init,
    createCaptcha: createCaptcha,
  };
})();

$(function () {
  GUESTBOOK.Init();
});

var onloadCallback = function () {
  GUESTBOOK.createCaptcha();
};

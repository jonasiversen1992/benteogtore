$(function () {
  $.ajaxSetup({
    error: function (jqXHR, exception, errorThrown) {
      //log123('General: There is a problem connecting to the server. Check your internet connection. : ' + exception + ' : ' + errorThrown, 'General');
      // console.log('General: There is a problem connecting to the server. Check your internet connection.');
    },
  });
});

// make sure we have full browser
// if (top.location != location) { top.location.href = document.location.href }

function sendMailTo(account, domain) {
  window.location.href = "mail" + "to:" + account + "@" + domain;
}

function setMailToStatus(account, domain) {
  window.status = "mail" + "to:" + account + "@" + domain;
}

function getQueryStringValueFromUrl(url, key) {
  var re = new RegExp("[\\?&]" + key + "=([^&#]*)");

  return re.exec(url)[1];
}

function log123(text, origin) {
  $.ajax({
    url: "/pages/123logger.aspx",
    cache: false,
    type: "POST",
    data: {
      text: text,
      origin: origin,
      url: window.location.href,
    },
  });
}

function logClientError(error, context) {
  if (console) {
    console.error(error.message, context);
  }

  var stack = "couldn't send stack due to missing encodeURI function";
  if (encodeURI) {
    stack = encodeURI(error.stack);
  }

  $.ajax({
    url: "/pages/clienterrorlogger.aspx",
    cache: false,
    type: "POST",
    data: {
      errorMessage: error.message,
      fileName: error.fileName,
      lineNumber: error.lineNumber,
      stack: stack,
      context: context,
      url: window.location.href,
    },
  });
}

function logClick(e, origin) {
  if (e) {
    var target = $(e.target),
      msg = "";
    if (target.length > 0) {
      msg += "TargetTag: " + target[0].nodeName + ", ";
      if (target[0].id) {
        msg += "TargetID: " + target[0].id + ", ";
      }
      if (target[0].className) {
        msg += "TargetClass: " + target[0].className + ", ";
      }
    }
    msg += "clickPoint(" + e.pageX + ", " + e.pageY + "), ";
    msg += "whichKey: " + e.which + ", ";
    log123(msg, "logClick" + origin);
  }
}

function getRemainingPicturesCount() {
  var res = { remainingPictures: 0, url: "" };
  $.ajax({
    url: "/builder/pages/getRemainingPicturesCount.aspx",
    cache: false,
    async: false,
    success: function (data) {
      if (data.statusCode == 0) {
        res.remainingPictures = parseInt(data.remainingPictures, 10);
        res.url = data.url;
      }
    },
  });
  return res;
}

var URLCHOOSER = (function () {
  return {
    init: function init() {
      $(".user_url").bind("blur", function (e) {
        $(".user_url").val($.trim($(".user_url").val()));
      });
    },
  };
})();

$(document).ready(function () {
  function getBackgroundPositionX(obj) {
    if ($(obj).hasClass("threestate-right")) return "right";
    return "left";
  }

  function setSelected(obj) {
    $(obj).css("background-position", getBackgroundPositionX(obj) + " top");
  }

  function setHover(obj) {
    $(obj).css("background-position", getBackgroundPositionX(obj) + " center");
  }

  function setNormal(obj) {
    $(obj).css("background-position", getBackgroundPositionX(obj) + " bottom");
  }

  setNormal(".threestate");
  setSelected(".threestate-selected");

  $(".threestate").mousedown(function () {
    setSelected(this);
  });
  $(".threestate").mouseover(function () {
    setHover(this);
  });
  $(".threestate").mouseout(function () {
    setNormal(this);
  });

  $(".threestate").each(function () {
    setNormal(this);
  });

  $(".threestate-selected").each(function () {
    setSelected(this);
  });

  // Vertical Align
  function setVerticalAlign(obj) {
    var objHeight = $(obj).height();
    var parentHeight = $(obj).parent().height();
    var marginTop = (parentHeight - objHeight) / 2;
    var newHeight = objHeight + 0;
    $(obj).css("margin-top", marginTop);
    $(obj).css("height", objHeight);
  }

  $(".tmpMainTitle").each(function () {
    if (!$(this).children().length) $(this).css("display", "block");
    $(this)
      .children()
      .each(function () {
        if ($(this).is(".tmpOver")) $(this).css("display", "block");
        else $(this).parent(".tmpMainTitle").css("display", "block");
      });
    setVerticalAlign(this);
  });

  $(".vAlignTrue").css("display", "block");
  $(".vAlignTrue").each(function () {
    setVerticalAlign(this);
  });

  URLCHOOSER.init();

  if ($("#pageCenterHolder").length) {
    $("body").addClass("pageCenterWrapper");
  }

  $(".status_box_close").click(function () {
    var $statusBox = $(this).closest(".status_box");
    $statusBox.slideUp(function () {
      $statusBox.remove();
    });
  });
});

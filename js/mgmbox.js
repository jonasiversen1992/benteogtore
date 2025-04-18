var MGMBOX = (function () {
  var init = function () {
    if ($(".latest_style_rounded").length) {
      adjustMgmCorners();
    }
  };

  var adjustMgmCorners = function () {
    //if ($.browser.msie){
    if (SimpleSite.Util.BrowserDetect.msie) {
      var mgmBoxBordersColor = $(".mgmbox").css("border-color"),
        mgmBoxTopSpace = $(".mgmbox").parent().css("margin-top");

      $(".mgmbox")
        .corner("cc:" + mgmBoxBordersColor)
        .parent()
        .css({
          width: 159,
          backgroundColor: mgmBoxBordersColor,
          padding: 1,
          marginTop: mgmBoxTopSpace,
        })
        .corner();

      $(".mgmbox")
        .parent()
        .children(".jquery-corner")
        .css({ zIndex: 1000, fontSize: 0 });
    } else {
      $(".mgmbox").corner();
    }
  };

  return {
    Init: init,
  };
})();

$(function () {
  MGMBOX.Init();
});

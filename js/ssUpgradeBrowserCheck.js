(function ($) {
  "use strict";
  $.simplesite = $.simplesite || {};

  $.widget("ui.ssUpgradeBrowserCheck", {
    options: {
      auto: true,
      heading_text:
        "This video requires either a flash player or a modern browser to be played.",
      browsers_text: "Upgrade to a modern browser",
      flash_text: "Or upgrade your flash player",
    },

    css: {
      baseClasses: "ui-ss-upgrade-check",
      upgradeBoxClass: "ui-ss-upgrade-msg",
      browserBoxClass: "ui-ss-upgrade-browser-box",
      browserCaption: "ui-ss-upgrade-browser-caption",
    },

    events: {},

    widget: function () {
      return this.element;
    },

    _getUpgradeBox: function () {
      var o = this.options,
        css = this.css;
      return $(
        '\
<div class="' +
          css.upgradeBoxClass +
          '"> \
    <h3>' +
          o.heading_text +
          "</h3> \
    <p>" +
          o.browsers_text +
          '</p>\
    <div class="' +
          css.browserBoxClass +
          '">\
        <a href="http://www.mozilla.org/en-US/firefox/new/" target="_blank">\
            <img src="images/browser_firefox.gif" /></a>\
        <div class="' +
          css.browserCaption +
          '">Firefox 3+</div></div> \
    <div class="' +
          css.browserBoxClass +
          '">\
        <a href="https://www.google.com/chrome/" target="_blank">\
            <img src="images/browser_chrome.gif" /></a>\
        <div class="' +
          css.browserCaption +
          '">Chrome 3+</div></div>\
    <div class="' +
          css.browserBoxClass +
          '">\
        <a href="http://www.apple.com/safari/download/" target="_blank">\
            <img src="images/browser_safari.gif" /></a>\
        <div class="' +
          css.browserCaption +
          '">Safari 3+</div></div>\
    <div class="' +
          css.browserBoxClass +
          '">\
        <a href="http://www.opera.com/download/" target="_blank">\
            <img src="images/browser_opera.gif" /></a>\
        <div class="' +
          css.browserCaption +
          '">Opera 9.5+</div></div>\
    <div class="' +
          css.browserBoxClass +
          '">\
        <a href="http://windows.microsoft.com/en-US/internet-explorer/products/ie/home" target="_blank">\
            <img src="images/browser_ie.gif" /></a>\
        <div class="' +
          css.browserCaption +
          '">Internet Explorer 9+</div></div>\
        <div style="clear:both;"></div>\
        <p>' +
          o.flash_text +
          ': <a href="http://get.adobe.com/flashplayer/" target="_blank">http://get.adobe.com/flashplayer/</a></p>\
</div>'
      );
    },

    isCanvasSupported: function () {
      var canvas = document.createElement("canvas");
      return !!(canvas.getContext && canvas.getContext("2d"));
    },

    isHtml5VideoSupported: function () {
      var video = document.createElement("video");
      return !!video.canPlayType;
    },

    isFlashSupported: function () {
      return (
        typeof swfobject !== "undefined" &&
        swfobject.hasFlashPlayerVersion("10.0.0")
      );
    },

    _checkVideoCompatibility: function () {
      if (!this.isFlashSupported()) {
        if (!this.isHtml5VideoSupported()) {
          this.displayUpgradeBox();
        }
      }
    },

    _isVimeo: function () {
      var str = this._getVideoUrl() || "";
      return str.indexOf("vimeo") > -1;
    },

    _getVideoUrl: function () {
      return this.element.attr("src");
    },

    displayUpgradeBox: function () {
      var $upgradeBox = this._getUpgradeBox();
      $upgradeBox.insertAfter(this.element.hide());
    },

    _create: function () {
      var o = this.options;
      this.element.addClass(this.css.baseClasses);
      if (o.auto) {
        this._checkVideoCompatibility();
      }
      return this;
    },

    destroy: function () {
      return this;
    },

    _id: function (suffix) {
      return this.element[0].id + suffix;
    },

    _setOption: function (key, value) {
      $.Widget.prototype._setOption.apply(this, arguments);
    },
  });
})(jQuery);

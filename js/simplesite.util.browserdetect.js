var SimpleSite = SimpleSite || {};
SimpleSite.Util = SimpleSite.Util || {};

SimpleSite.Util.BrowserDetect = {
  init: function () {
    this.browser = this.searchString(this.dataBrowser) || "Other";
    this.version =
      this.searchVersion(navigator.userAgent) ||
      this.searchVersion(navigator.appVersion) ||
      "Unknown";
    this.webkit = this.searchWebkit(navigator.userAgent);
    this.msie = this.isIE();
    this.supported = this.isSupported();
    this.opera = this.isOpera();
    this.mozilla = this.isMozilla();
    this.safari = this.isSafari();
  },
  searchString: function (data) {
    for (var i = 0; i < data.length; i++) {
      var dataString = data[i].string;
      this.versionSearchString = data[i].subString;

      if (dataString.indexOf(data[i].subString) !== -1) {
        return data[i].identity;
      }
    }
  },
  searchVersion: function (dataString) {
    var index = dataString.indexOf(this.versionSearchString);
    if (index === -1) {
      return;
    }

    var rv = dataString.indexOf("rv:");
    if (this.versionSearchString === "Trident" && rv !== -1) {
      return parseFloat(dataString.substring(rv + 3));
    } else {
      return parseFloat(
        dataString.substring(index + this.versionSearchString.length + 1)
      );
    }
  },
  searchWebkit: function (dataString) {
    if (dataString) {
      return dataString.toLowerCase().indexOf("webkit") !== -1;
    }
    return false;
  },
  isIE: function () {
    return this.browser == "Explorer";
  },
  isOpera: function () {
    return this.browser == "Opera";
  },
  isMozilla: function () {
    return this.browser == "Firefox";
  },
  isSafari: function () {
    return this.browser == "Safari";
  },
  isSupported: function () {
    if (this.browser != "Other") {
      if (this.msie) {
        if (this.version > 8) {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    } else {
      return false;
    }
  },

  dataBrowser: [
    { string: navigator.userAgent, subString: "Chrome", identity: "Chrome" },
    { string: navigator.userAgent, subString: "MSIE", identity: "Explorer" },
    { string: navigator.userAgent, subString: "Trident", identity: "Explorer" },
    { string: navigator.userAgent, subString: "Firefox", identity: "Firefox" },
    { string: navigator.userAgent, subString: "Safari", identity: "Safari" },
    { string: navigator.userAgent, subString: "Opera", identity: "Opera" },
  ],
};

SimpleSite.Util.BrowserDetect.init();

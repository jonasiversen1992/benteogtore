var SimpleSite = SimpleSite || {};
SimpleSite.Util = SimpleSite.Util || {};

SimpleSite.Util.Email = {
  init: function () {
    this.valid = this.isValid;
  },

  isValid: function (emailStr) {
    var emailRegex = /^[A-Z0-9\._%+\-]+@[A-Z0-9\.\-]+\.[A-Z]{2,4}$/i;

    return emailStr.match(emailRegex);
  },
};

SimpleSite.Util.Email.init();

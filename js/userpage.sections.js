$(function () {
  var scrollToElement = function (element_id) {
    var $el = $("#" + element_id);
    if ($el[0]) {
      $("html, body").animate(
        {
          scrollTop: $el.offset().top - 15,
        },
        function () {
          if (isMobile) {
            window.location.hash = "#" + element_id;
          }
        }
      );
    }
  };

  $(".captionHeadline").each(function () {
    if ($(this).text().length === 0) {
      $(this).remove();
    }
  });
  $(".nivoSlider")
    .live("mouseenter", function () {
      var self = $(this),
        caption = self.find(".nivo-caption");
      caption.stop().animate({ height: caption.data("maxHeight") }, 200);
    })
    .live("mouseleave", function () {
      var self = $(this),
        caption = self.find(".nivo-caption");
      caption.stop().animate({ height: caption.data("minHeight") }, 200);
    });
  $(document).ready(function () {
    scrollToElement("scrollToHere");
  });
});

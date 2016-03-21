angular.module('clubinho.controllers')

.controller('ScheduleController', function($scope) {
  // Activate slider
  $('.schedule .bxslider').bxSlider({
    auto: true,
    responsive: true,
    adaptiveHeight:true,
    pager: false,
    nextText: ' > ',
    prevText: ' < '  
  });

  var $elements = $('.schedule .rank li'),
    open = false;

  $elements.click(function(e) {
    if ($(e.target).is('.aberto')) {
      $elements.removeClass('aberto cordiv'); 

      $(this)
        .css('border-top-right-radius', '25px')
        .css('border-top-left-radius', '25px');

      open = false;
    } if(!open && !$(this).is('.aberto')) {
      $(this).addClass('aberto cordiv');

      $(this)
        .css('border-top-right-radius', '25px')
        .css('border-top-left-radius', '25px');

      open = true;      
    } else {
      $elements.removeClass('aberto cordiv'); 

      $(this)
        .css('border-top-right-radius', 0)
        .css('border-top-left-radius', 0);

      open = false;
    }

    e.preventDefault();
  });
});

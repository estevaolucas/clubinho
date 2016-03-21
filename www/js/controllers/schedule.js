angular.module('clubinho.controllers')

.controller('ScheduleController', function($scope, Children) {
  
  Children.getList().then(function(children) {
    $scope.children = children.data;
  });

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


  $scope.toggleChild = function(child, $event) {
    var $element = $($event.target);

    if ($element.is('.isopen')) {
      $elements.removeClass('isopen cordiv'); 

      $element
        .css('border-top-right-radius', '25px')
        .css('border-top-left-radius', '25px');

      open = false;
    } if(!open && !$(this).is('.isopen')) {
      $element.addClass('isopen cordiv');

      $element
        .css('border-top-right-radius', '25px')
        .css('border-top-left-radius', '25px');

      open = true;      
    } else {
      $elements.removeClass('isopen cordiv'); 

      $element
        .css('border-top-right-radius', '0')
        .css('border-top-left-radius', '0');

      open = false;
    }

    $event.preventDefault();
  };
});

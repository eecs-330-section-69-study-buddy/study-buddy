var app = angular.module('availability', []);

app.controller('availabilityController', function($scope, $document, $element) {
  
  // DATA //
  var db = JSON.parse(sb);

  $scope.week = [
    'Sun',
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat'
  ];
  $scope.times = [
    ' 1:00am',
    ' 2:00am',
    ' 3:00am',
    ' 4:00am',
    ' 5:00am',
    ' 6:00am',
    ' 7:00am',
    ' 8:00am',
    ' 9:00am',
    '10:00am',
    '11:00am',
    '12:00pm',
    ' 1:00pm',
    ' 2:00pm',
    ' 3:00pm',
    ' 4:00pm',
    ' 5:00pm',
    ' 6:00pm',
    ' 7:00pm',
    ' 8:00pm',
    ' 9:00pm',
    '10:00pm',
    '11:00pm'
  ];


  // INIT //
  $scope.schedule = new Array(7);
  
  if (db.users[db.cur_user]["avail"]==null){
    for (var i = 0; i < 7; i++) {
      $scope.schedule[i] = new Array(24);
    }
  }
  else {
    $scope.schedule = db.users[db.cur_user]["avail"];
    console.log($scope.schedule);
  }

  // DRAG TO SELECT //
  var startCell = null;
  var dragging = false;
  
  function mouseUp(el) {
    startCell = null;
    dragging = false;
  }
  
    function getCoords(cell) {
    var column = cell[0].cellIndex;
    var row = cell.parent()[0].rowIndex;
    return {
      day: column,
      hour: row
    };
  }
  
  function mouseDown(el) {
    dragging = true;

    var cell = getCoords(el);
    if ($scope.schedule[cell.day][cell.hour] === 1) {
      $scope.schedule[cell.day][cell.hour] = null;
    } else {
      $scope.schedule[cell.day][cell.hour] = 1;
    }
    startCell = cell;
  }

  function mouseEnter(el) {
    if (!dragging) return;
    
    var cell = getCoords(el);
    if ($scope.schedule[startCell.day][startCell.hour] === 1) {
      $scope.schedule[cell.day][cell.hour] = 1;
    } else {
      $scope.schedule[cell.day][cell.hour] = null;
    }
  }
  
  function wrap(fn) {
    return function() {
      var el = angular.element(this);
      $scope.$apply(function() {
        fn(el);
      });
    }
  }



  $element.delegate('.c', 'mousedown', wrap(mouseDown));
  $element.delegate('.c', 'mouseenter', wrap(mouseEnter));
  $document.delegate('body', 'mouseup', wrap(mouseUp));

});
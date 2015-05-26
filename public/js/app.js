var app = angular.module('app', []);
 
app.controller('TodoCtrl', function($scope, $http) {
  $http.get('todos.json')
       .then(function(res){
          $scope.todos = res.data;   
          console.log(res);
          console.log(res.data);             
        });
});

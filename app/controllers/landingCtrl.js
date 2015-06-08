var landingCtrl = angular.module("landingCtrl", ["dashBoardServicesModule"]);

landingCtrl.controller("loginCtrl", ["$scope", "$rootScope", "$http", "$state", "dashboardFactory", function ($scope, $rootScope, $http, $state, dashboardFactory) {
        $scope.userLogin = function (f) {
            var us = f.username.$viewValue;
            var pwd = f.pwd.$viewValue;
            dashboardFactory.loginUser(us, pwd);
        };
    }]);

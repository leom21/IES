var landingCtrl = angular.module("landingCtrl", ["dashBoardServicesModule"]);

landingCtrl.controller("loginCtrl", ["$scope", "$rootScope", "$http", "$state", "dashboardFactory", function ($scope, $rootScope, $http, $state, dashboardFactory) {
        $scope.userLogin = function (f) {
            var us = f.username.$viewValue;
            var pwd = f.pwd.$viewValue;
            dashboardFactory.loginUser(us, pwd);
        };
        localStorage.removeItem("userDefs");
        localStorage.removeItem("searchHistory");
        localStorage.removeItem("uP");
        localStorage.removeItem("watchlist");
        localStorage.removeItem("optionsWatch");
        localStorage.removeItem("cH");
        localStorage.removeItem("tracker");
        $rootScope.idleTime = 0;
        clearInterval($rootScope.idleInterval);
        delete $rootScope.idleInterval;
        delete $rootScope.ls;
    }]);

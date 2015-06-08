var adminApp = angular.module("adminApp", ["ui.router","adminCtrls"]);

adminApp.run(function($rootScope, $state){

});

adminApp.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.when("/control", "/control/users");

    $stateProvider
            .state("/", {
                url: "/",
                templateUrl: "app/views/landing.html"
            })
            .state("control", {
                url: "/control",
                templateUrl: "app/views/control.html",
                data: {secured: true}
            })
            .state("control.users", {
                url: "/users",
                templateUrl: "app/views/users.html"
            })
            .state("control.stats", {
                url: "/stats",
                templateUrl: "app/views/stats.html"
            });
//            .state("control.stats", {
//                url: "/index/stock/:s",
//                templateUrl: "app/views/dashboard/ddata.html"
//            });

    $urlRouterProvider.otherwise("/");
});
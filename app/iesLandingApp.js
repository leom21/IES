var iesLandingApp = angular.module("iesLanding", ["ui.router", "landingCtrl", "dashboardCtrl", "optionDirective", "chartModule"]);

iesLandingApp.run(["$http", "$rootScope", "$state", function ($http, $rootScope, $state) {
        $http.get("universe.json").success(function (d) {
            $rootScope.universe = d;
        });
    }]);

iesLandingApp.config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.when("/dashboard", "/dashboard/index");

        $stateProvider
                .state("/", {
                    url: "/",
                    templateUrl: "app/views/landing.html",
                    data: {secured: false}
                })
                .state("dashboard", {
                    url: "/dashboard",
                    templateUrl: "app/views/dashboard.html",
                    data: {secured: true}
                })
                .state("dashboard.index", {
                    url: "/index",
                    templateUrl: "app/views/dashboard/dindex.html",
                    controller: ["$scope", "$rootScope", "$state", function ($scope, $rootScope, $state) {
                            console.log($rootScope.watchlist);
                            if ($rootScope.userPositions.positions.length == 0) {
                                if ($rootScope.watchlist == null || $rootScope.watchlist.length == 0 || $rootScope.watchlist == undefined || $rootScope.watchlist == "null") {
                                    $state.go("dashboard.query");
                                } else {
                                    $state.go("dashboard.watchlist");
                                }
                            } else {
                                $state.go("dashboard.positions");
                            }
                        }]
                })
                .state("dashboard.query", {
                    url: "/query",
                    templateUrl: "app/views/dashboard/dquery.html"
                })
                .state("dashboard.positions", {
                    url: "/mypositions",
                    templateUrl: "app/views/dashboard/dstocks.html"
                })
                .state("dashboard.watchlist", {
                    url: "/watchlist",
                    templateUrl: "app/views/dashboard/dwatchlist.html"
                })
                .state("dashboard.data", {
                    url: "/stock/:s/:q",
                    templateUrl: "app/views/dashboard/ddata.html"
                })
                .state("dashboard.noRes", {
                    url: "/index/error",
                    templateUrl: "app/views/dashboard/error.html"
                });

        $urlRouterProvider.otherwise("/");
    }]);
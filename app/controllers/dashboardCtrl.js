var dashboardCtrl = angular.module("dashboardCtrl", ["dashBoardServicesModule"]);
dashboardCtrl.filter('customerPagination', ["$rootScope", function ($rootScope) {
        return function (stocks, begin, end) {
            return stocks.slice(begin, end);
        };
    }]);
dashboardCtrl.filter("searchSym", [, function () {
        return (function (row, q) {
            if (q) {
                q = q.toLowerCase();
                var arr = [];
                angular.forEach(row, function (r) {
                    if (r.symbol.toLowerCase().indexOf(q) !== -1) {
                        arr.push(r);
                    }
                });
                return arr;
            }
        });
    }]);
dashboardCtrl.filter("searchHistory", ["$rootScope", function ($rootScope) {
        return (function (row, q) {
            if (q) {
                q = q.toLowerCase();
                var arr = [];
                angular.forEach(row, function (r) {
                    if (r.symbol.toLowerCase().indexOf(q) !== -1) {
                        arr.push(r);
                    }
                });
                $rootScope.SH = arr;
                (arr.length == 0) ? $(".searchHistory").hide() : $(".searchHistory").show();
                return $rootScope.SH;
            } else {
                $(".searchHistory").hide();
            }
        });
    }]);
dashboardCtrl.controller("stockCtrl", ["$scope", "$rootScope", "dashboardFactory", "$state", function ($scope, $rootScope, dashboardFactory, $state) {
        $scope.pos = $rootScope.userPositions.positions;
        var a = [];
        $scope.curr = function (n) {
        };
        if ($scope.pos.length == 0) {
            $scope.hasPositions = false;
            $(".loadingView").fadeOut(1);
            $scope.msg = "You haven't taken any poitions yet. Please search a symbol from the above search bar in order\n\
to take a postion.";
        } else {
//            $(".loadingView").fadeOut(1);
            angular.forEach($scope.pos, function (p) {
                a.push(p.stock);
            });
            $scope.currPrc = {};
            dashboardFactory.getStock(a).then(function (d) {
//                console.log(d);
                angular.forEach(d, function (r) {
                    angular.forEach(r.Options, function (o) {
                        $scope.currPrc[o.Name] = {curr: (o.Ask + o.Bid) / 2};
                    });
                });
            });
            $scope.hasPositions = true;
            $scope.pnl = function (c, e) {
                var p = (((c - e) / e) * 100).toFixed(2);
                if (p == -0.00) {
                    return 0.00 + "%";
                } else {
                    return (((c - e) / e) * 100).toFixed(2) + "%";
                }
            };
            $scope.editENDate = function (d) {
                if (d) {
//                    d = d.substring(0, d.length - 2);
//                    d = d.substring(6, d.length);
//                    return d;
                }
            };
            $scope.editDate = function (d) {
                if (d) {
                    d = d.substring(0, d.length - 2);
                    d = d.substring(6, d.length);
                    return d;
                }
            };

            $scope.deletePosition = function (o, s) {
                var n = o[0].name;
                var c = confirm("You are about to remove the possition of " + n + ".");
                if (c == true) {
                    dashboardFactory.deletePosition(s).then(function (d) {
                        if (d == "OK") {
//                            $rootScope.gotPosition = false;
                            $state.go($state.current, {}, {reload: true});
                        }
                    });
                }
            };
        }
    }]);

dashboardCtrl.controller("watchlistCtrl", ["$scope", "$rootScope", "$http", "dashboardFactory", function ($scope, $rootScope, $http, dashboardFactory) {
        $rootScope.$watch("watchlist", function (o, n) {
            if (o !== n || o !== undefined) {
                $scope.wl = $rootScope.watchlist;
                if ($scope.wl == null || $scope.wl == "null" || $scope.wl == undefined || $scope.wl == 0 || $scope.wl == "0") {
                    $scope.wl = false;
                    $(".loadingView").fadeOut(1);
                    $scope.msg = "The list is empty. You can add stocks to your watch list by clicking the ''Add to my watch list'' icon in the stock's page.";
                } else {
                    $(".loadingView").fadeOut(1);
                    $scope.wlist = $rootScope.watchlist.split(",");
                    $scope.wl = true;
                    $scope.pnl = function (c, e) {
                        return (((c - e) / e) * 100).toFixed(2) + "%";
                    };

                    $scope.arr = [];
                    var tmp = [];
                    for (var i = 1; i < $scope.wlist.length; i++) {
                        if ($scope.wlist[i] !== "") {
                            tmp.push($scope.wlist[i]);
                        }
                    }

                    dashboardFactory.getStock(tmp).then(function (d) {
                        if (d.length == 0) {
                            $scope.wl = false;
                            $scope.msg = "It seems that we cannot find the symbols you are watching. Please try again shortly or contact support.";
                        } else {
                            angular.forEach(d, function (s) {
                                $scope.arr.push(s);
                            });
                        }
                    });


                    $scope.removeWL = function (s) {
                        var wArray = $rootScope.watchlist.split(",");
                        var i = wArray.indexOf(s);
                        wArray.splice(i, 1);
                        var str = wArray.toString();
                        dashboardFactory.removeWL(str).then(function (d) {
                            if (d == "OK") {
                                $scope.onList = false;
                            }
                        });
                    };
                }
            }
        });
    }]);

dashboardCtrl.controller("dashboardCtrl", ["$scope", "$rootScope", "$http", "$state", "$timeout", "dashboardFactory", function ($scope, $rootScope, $http, $state, $timeout, dashboardFactory) {
        $scope.logout = function () {
            dashboardFactory.logout();
        };
        $scope.closeMe = false;
        $scope.focus = false;
        $scope.clickPos = function (e) {
            var c = e.target.className;
            if (c !== "showHistoryList") {
                $scope.closeMe = true;
//                console.log($scope.closeMe);
            }
        };
        $scope.stocks = [];
        $scope.showList = function (e) {
            if (e.keyCode !== 13) {
                $(".searchHistory").show();
            } else {
                $(".searchHistory").hide();
            }
        };
        $scope.dropDownList = function () {
            $(".searchHistoryList").toggle();
            $scope.searchQ = '';
        };
        $rootScope.$on('$stateChangeStart',
                function (event, toState, toParams, fromState, fromParams) {

                });
        $rootScope.$on('$stateChangeSuccess',
                function (event, toState, toParams, fromState, fromParams) {
                    $(".searchHistoryList").hide();
                    $(".searchQ").val("");
                    $scope.searchQ = '';
                });
        function searchEffect(cond) {
            if (cond == "show") {
                $(".bar").fadeIn(200);
            }
            if (cond == "hide") {
                $(".loading").fadeOut(150);
                $(".searchHistory").hide();
                $(".bar").fadeOut(400);
                $(".progress").css({"width": "0%"});
            }
        }

        $scope.clickedStock = function (s) {
//            $(".srcQ").val(s);
            $scope.searchQ = s;
            var el = document.querySelector(".hQty");
            el.focus();
            el.value = 100;
        };
        $scope.searchStockForm = function (s) {
            $state.go("dashboard.index");
            if (s == null) {
                var s = $(".searchQ").val();
            }
            
            searchEffect("show");
            dashboardFactory.searchStock(s).then(function (d) {
                $timeout(function () {
                    searchEffect("hide");
                    $scope.stocks = d;
                    $scope.pagesCount = [];
                    var pageCount = Math.ceil($scope.stocks.length / $scope.itemsPerPage);
                    for (var i = 1; i < pageCount + 1; i++) {
                        $scope.pagesCount.push({"number": i});
                    }
                    $scope.$apply();
                }, 500);
            });
        };
        $scope.seeStock = function (s) {
            $(".searchQ").val(s);
            searchEffect("show");
            $scope.searchStockForm(s);
        };
        $scope.moveToStock = function (s, sq) {
            var hQty = $(".hQty").val();
            var alphaExp = /^[a-zA-Z]+$/;
            var numExp = /^[0-9]+$/;

            if (!s) {
                $(".symE").text("Please fill in a stock symbol.");
                return false;
            }

            if (!s.match(alphaExp)) {
                $(".symE").text("Only letters are allowd.");
                $(".searchQ").val("");
                return false;
            }

            if (!hQty) {
                if (sq) {
                    $(".hQty").val("sq");
                    $scope.held = sq;
                    hQty = sq;
                    $(".symE").text("");
                    $(".qtyE").text("");
                    $state.go("dashboard.data", {s: s, q: sq});
                    dashboardFactory.clickHistory(s);
//                    $scope.held = hQty;
                } else {

                    if (!hQty.match(numExp)) {
                        $(".qtyE").text("Please fill in a number.");
                        return false;
                    }
                    $(".qtyE").text("Please fill in held quanitiy.");
                    return false;
                }
            }

            else {
                console.log(hQty % 1);
                if (hQty % 1 !== 0) {
                    $(".qtyE").text("Please fill in a whole number.");
                    return false;
                } else {
                    $(".symE").text("");
                    $(".qtyE").text("");
                    $state.go("dashboard.data", {s: s, q: hQty});
                    dashboardFactory.clickHistory(s);
                    $scope.held = hQty;
                }
            }
        };
        $scope.showing = function () {
            if ($scope.stocks.length < $scope.currentPage * $scope.itemsPerPage) {
                return $scope.stocks.length;
            } else {
                if ($scope.stocks.length == 0) {
                    return $scope.stocks.length;
                } else {
                    return $scope.currentPage * $scope.itemsPerPage;
                }
            }
        };
        $scope.outOfPages = function () {
            if ($scope.stocks.length == 0) {
                return Math.ceil($scope.stocks.length / $scope.itemsPerPage);
            } else {
                return Math.ceil($scope.stocks.length / $scope.itemsPerPage);
            }
        };
        $scope.Math = window.Math;
        $scope.startLimit = 0; //Init value
        $scope.endLimit = 20; //Init value
        $scope.currentPage = 1;
        $scope.itemsPerPage = 20;
        $scope.totalItems = $scope.stocks.length;
        $scope.pages = Math.ceil($scope.totalItems / $scope.itemsPerPage);
        $scope.nextPage = function () {
            $scope.currentPage = $scope.currentPage + 1;
            $scope.startLimit = $scope.startLimit + $scope.itemsPerPage;
            $scope.endLimit = $scope.endLimit + $scope.itemsPerPage;
        };
        $scope.prevPage = function () {
            $scope.currentPage = $scope.currentPage - 1;
            $scope.startLimit = $scope.startLimit - $scope.itemsPerPage;
            $scope.endLimit = $scope.endLimit - $scope.itemsPerPage;
        };
        //Page buttons
        $scope.moveToPage = function (number) {
            $scope.currentPage = number + 1;
            $scope.startLimit = $scope.itemsPerPage * number;
            $scope.endLimit = $scope.itemsPerPage + ($scope.itemsPerPage * number);
        };
    }]);
dashboardCtrl.controller("stockdataCtrl", ["$scope", "$rootScope", "$http", "$state", "$timeout", "dashboardFactory", function ($scope, $rootScope, $http, $state, $timeout, dashboardFactory) {
//        $rootScope.$on('$stateChangeSuccess',
//                function (event, toState, toParams, fromState, fromParams) {
        $scope.symbol = $state.params.s.toUpperCase();

//                });
        var q = $state.params.q;
        if (q.length == 0) {
            $rootScope.held = 100;
        } else {
            $rootScope.held = Math.floor(parseInt($state.params.q));
        }

        $scope.editDate = function (d) {
            if (d) {
                d = d.substring(0, d.length - 2);
                d = d.substring(6, d.length);
                return d;
            }
        };
        var t = false;
//        $scope.toggleData = function () {
//            if (t === false) {
//                $scope.historyData = $scope.toggledData;
//                t = true;
//            } else {
//                $scope.historyData = $scope.yearlyData;
//                t = false;
//            }
//        };
        $scope.cut = function (n) {
            return Math.floor(n * 100) / 100;
        };
        $scope.selectedRow = null;
        $timeout(function () {
            $scope.gotPosition = false;
            dashboardFactory.getStock($scope.symbol).then(function (d) {
//                $state.go($state.current, {}, {reload: true});
                if (d.length == 0) {
                    $scope.noR = true;
                }

                $rootScope.stockData = d[0];
                if ($rootScope.watchlist.indexOf($scope.symbol) !== -1 && $scope.symbol == $rootScope.stockData.Symbol) {
                    $scope.onList = true;
                } else {
                    $scope.onList = false;
                }

                var tW = $(".dataContainer").width() + $(".dataContainer").position().left;
                var tP = $(".takePosition").width();
                var sW = $(".score").width();
                var sL = $(".dataContainer").position().left + 10;
                $(".takePosition").css("left", tW - tP - 7 + "px");
                $(".score").css("left", tW - sW - 7 - sL + "px");

                $rootScope.$watch("stockData", function (oldValue, newValue) {
                    if (oldValue !== undefined) {
                        $rootScope.stockLast = $rootScope.stockData.Last;
                        $rootScope.moData = {last: $rootScope.stockData.Last, tgtPrc: $rootScope.stockData.TgtPrc};
                        if ($rootScope.userPositions.positions.length > 0) {
                            var a = 0;
                            angular.forEach($rootScope.userPositions.positions, function (o) {
                                if (o.stock == $rootScope.stockData.Symbol) {
                                    $scope.gotPosition = true;
                                    a = 1;
                                    var n = o.position[0].name;
                                    angular.forEach($scope.stockData.Options, function (sd) {
                                        if (sd.Name == n) {
                                            $rootScope.stData = $rootScope.stockData;
                                            $rootScope.position = sd;
                                            $rootScope.LossPercentage = sd.LossPercentage;
                                            var date = new Date();
                                            var day = date.getDate();        // yields day
                                            var month = date.getMonth();    // yields month
                                            var year = date.getFullYear();  // yields year
                                            var hour = date.getHours();     // yields hours 
                                            var minute = date.getMinutes(); // yields minutes
                                            var second = date.getSeconds();
                                            var time = day + 1 + "/" + month + "/" + year + " " + hour + ':' + minute + ':' + second;

                                            dashboardFactory.getStockHistory("QQQ", time, n).then(function (d) {
                                                $rootScope.historyData = d;
//                                                $rootScope.position = $scope.stockData.Options[0];
                                            });
                                        }
                                    });
//                                    break;
                                }
                                else {
////                                    if ($scope.gotPosition == undefined) {
////                                        $scope.gotPosition = false;
////                                    }
//                                        $scope.gotPosition = false;
                                    $rootScope.position = $scope.stockData.Options[0];
                                    $rootScope.LossPercentage = $rootScope.position.LossPercentage;
                                }
                            });
                        } else {
                            $rootScope.position = $scope.stockData.Options[0];
//                            if ($rootScope.position == undefined) {
//                                $rootScope.$watch("stockData", function (oldValue) {
//                                    if (oldValue !== undefined) {
//                                        $rootScope.position = $scope.stockData.Options[0];
//                                    }
//                                });
//                            }
                        }
                    }
                });
            });
        }, 600);

        $scope.removeWL = function (s) {
            var wArray = $rootScope.watchlist.split(",");
            var i = wArray.indexOf(s);
            wArray.splice(i, 1);
            var str = wArray.toString();
            dashboardFactory.removeWL(str).then(function (d) {
                if (d == "OK") {
                    $scope.onList = false;
                }
            });
        };

        $scope.showStockPrice = function () {
            $scope.showStockP = true;
            angular.forEach($rootScope.historyData, function (data) {
                data.LastStockPrice;
            });
        };


        $scope.addToWL = function (s) {
            dashboardFactory.addToWL(s, $rootScope.userId).then(function (d) {
                $scope.onList = true;
            });
        };
        $scope.reDrawGraph = function (i, p) {
            $rootScope.showPosition = true;
            $scope.selectedRow = i;
            $rootScope.position = p;
        };
    }]);

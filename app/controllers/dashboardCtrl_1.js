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
            $(".loadingView").delay(400).fadeOut(150);
            $scope.msg = "You haven't taken any poitions yet. Please search a symbol from the above search bar in order\n\
                to take a postion.";
        } else {
//            $(".loadingView").delay(400).fadeOut(150);
            angular.forEach($scope.pos, function (p) {
                a.push(p.leg);
            });
            $scope.currPrc = {};
            dashboardFactory.getPositionData(a).then(function (d) {
//                $(".loadingView").fadeOut(400);
                angular.forEach(d, function (r) {
//                    angular.forEach(r.Options, function (o) {
                    $scope.currPrc[r.Name] = {curr: (r.Ask + r.Bid) / 2};
                });
//                });
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
                    $(".loadingView").fadeOut(400);
                    $scope.msg = "The list is empty. You can add stocks to your watch list by clicking the ''Add to my watch list'' icon in the stock's page.";
                } else {
//                    $(".loadingView").fadeOut(1);
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

dashboardCtrl.controller("dashboardCtrl", ["$scope", "$rootScope", "$http", "$state", "$timeout", "dashboardFactory", "toolTip", function ($scope, $rootScope, $http, $state, $timeout, dashboardFactory, toolTip) {
        $scope.logout = function () {
            dashboardFactory.logout();
        };

        /*
         * Tooltips: define an ng-mousemove attribute to an element in the HTML file. Pass params
         * @type - string, the name of the object you would like to provide info for (e.g. marketCap)
         * @e - object, angular's $event.
         * 
         * Than pass the type param to the toolTip factory (toolTip.showContent(type)).
         * Make sure that the object in that factory has a property of the type and a content.
         */

        $scope.toolTip = function (type, e) {
            var x = e.pageX;
            var y = $(e.target).offset().top;
            var content = toolTip.showContent(type);
            $(".toolTip").html(content);
            var w = $(".toolTip").width();
            var h = $(".toolTip").height();
            $(".toolTip").css({"left": x + "px", "margin-left": (-w / 2) - 5 + "px", "top": y + "px", "margin-top": -h * 2 + 5 + "px"});
            $(".toolTip").show();
        };

        $scope.toolTipOut = function () {
            $(".toolTip").hide();
        };

        $scope.closeMe = false;
        $scope.focus = false;

        $scope.clickPos = function (e) {
            var c = e.target.className;
            if (c !== "showHistoryList") {
                $scope.closeMe = true;
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
            $scope.srcQ = s;
            $(".srcQ").val(s);
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
            s = $(".srcQ").val();
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
                } else {
                    $(".symE").text("");
                    $(".qtyE").text("");
                    $state.go("dashboard.data", {s: s, q: 100});
                    dashboardFactory.clickHistory(s);
                    $scope.held = 100;
                }
            }
            else {
                if (!hQty.match(numExp)) {
                    $(".qtyE").text("Please fill in a number.");
                    return false;
                }
                if (hQty < 100) {
                    $(".qtyE").text("The minimum quantity is 100.");
                    return false;
                }
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
    }]);

dashboardCtrl.controller("stockdataCtrl", ["$scope", "$rootScope", "$http", "$state", "$timeout", "dashboardFactory", function ($scope, $rootScope, $http, $state, $timeout, dashboardFactory) {
        $scope.symbol = $state.params.s.toUpperCase();
        delete $rootScope.stockData;
//        $state.go($state.current, {}, {reload: true});
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

        $scope.cut = function (n) {
            return Math.floor(n * 100) / 100;
        };
        $scope.selectedRow = null;
        $timeout(function () {
            $scope.gotPosition = false;
            dashboardFactory.getStock($scope.symbol).then(function (d) {
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

//                $rootScope.$watch("stockData", function (oldValue, newValue) {
//                    if (oldValue !== undefined) {
                $rootScope.stockLast = $rootScope.stockData.Last;
                $rootScope.moData = {last: $rootScope.stockData.Last, tgtPrc: $rootScope.stockData.TgtPrc};
                if ($rootScope.userPositions.positions.length > 0) {
                    var a = 0;
                    angular.forEach($rootScope.userPositions.positions, function (o) {
                        if (o.stock == $rootScope.stockData.Symbol) {
                            $scope.gotPosition = true;
                            $rootScope.stData = $rootScope.stockData;
                            a = 1;
                            var n = o.position[0].name;
                            var legs = [];
                            var date = new Date(o.entry);
                            var day = date.getDate();
                            var month = date.getMonth();
                            var year = date.getFullYear();
                            var hour = date.getHours();
                            var minute = date.getMinutes();
                            var second = date.getSeconds();
                            var time = month + 1 + "/" + day + "/" + year + " " + hour + ':' + minute + ':' + second;

                            angular.forEach($scope.stockData.Options, function (sd) {
                                legs.push(sd.Name);
                            });
                            var found = $.inArray(n, legs);
                            if (found > -1) {

                            } else {

                            }

                            angular.forEach($scope.stockData.Options, function (sd) {
                                if (sd.Name == n) {
                                    $rootScope.stData = $rootScope.stockData;
                                    $rootScope.position = sd;
                                    console.log(sd);
                                    $rootScope.LossPercentage = sd.LossPercentage;
//                                    var date = new Date(o.entry);
//                                    var day = date.getDate();
//                                    var month = date.getMonth();
//                                    var year = date.getFullYear();
//                                    var hour = date.getHours();
//                                    var minute = date.getMinutes();
//                                    var second = date.getSeconds();
//                                    var time = month + 1 + "/" + day + "/" + year + " " + hour + ':' + minute + ':' + second;
                                    dashboardFactory.getStockHistory($scope.symbol, time, n).then(function (d) {
                                        $scope.historyData = d;
                                        $rootScope.HisLength = d.length;

                                        if ($scope.historyData.length < 2) {
                                            $(".noHismsg").show();
                                        }

                                        $rootScope.PositionPrices = {
                                            Ask: sd.Ask,
                                            Bid: sd.Bid,
                                            Last: sd.Last
                                        };
                                    });

                                    dashboardFactory.getPositionData([n]).then(function (d) {
                                        $rootScope.PositionPrices = d[0];
                                    });
                                } else {
                                    console.log("!");
                                    $rootScope.stData = $rootScope.stockData;
                                    var date = new Date(o.entry);
                                    var day = date.getDate();
                                    var month = date.getMonth();
                                    var year = date.getFullYear();
                                    var hour = date.getHours();
                                    var minute = date.getMinutes();
                                    var second = date.getSeconds();
                                    var time = month + 1 + "/" + day + "/" + year + " " + hour + ':' + minute + ':' + second;
                                    dashboardFactory.getStockHistory($scope.symbol, time, n).then(function (d) {
                                        $scope.historyData = d;
                                        $rootScope.HisLength = d.length;

                                        if ($scope.historyData.length < 2) {
                                            $(".noHismsg").show();
                                        }
                                    });
                                    dashboardFactory.getPositionData([n]).then(function (d) {
//                                        $rootScope.PositionPrices = d[0];
                                    });
                                }
                            });
                        }
                        else {
                            $scope.historyData = [];
                            $rootScope.position = $scope.stockData.Options[0];
                            $rootScope.LossPercentage = $rootScope.position.LossPercentage;
                        }
                    });
                } else {
                    $rootScope.position = $scope.stockData.Options[0];
                }
//                    }
//                });
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
            angular.forEach($scope.historyData, function (data) {
                data.LastStockPrice;
            });
        };

        $scope.legPrice = function (ask, bid) {
            var LegPrice = (ask + bid) / 2;
            return "$" + (Math.ceil(LegPrice * 100) / 100).toFixed(2);
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
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
                var split = $rootScope.sH.split(",");
                var s = q.toUpperCase();
                angular.forEach(row, function (r) {
                    if (arr.length < 15) {
                        var found = $.inArray(s, split);
                        if (r.symbol.toLowerCase().indexOf(q) !== -1) {
//                            if (found == -1) {
                            arr.push(r);
//                            }
                        }
                    }
                });
                $rootScope.SH = arr;
                if (arr.length === 1) {
                    var found = $.inArray(arr[0].symbol, split);
                    if (found === -1) {
                        $rootScope.SH = arr;
                    } else {
                        $rootScope.SH = [];
                    }
                }
//                (arr.length == 0) ? $(".universeLine").hide() : $(".universeLine").show();
                return $rootScope.SH;
            } else {
                $(".universeLine").hide();
            }
        });
    }]);

dashboardCtrl.controller("stockCtrl", ["$scope", "$rootScope", "dashboardFactory", "utils", "$state", "$interval", function ($scope, $rootScope, dashboardFactory, utils, $state, $interval) {
        $scope.pos = $rootScope.userPositions.positions;
        var a = [];

        if ($scope.pos.length == 0) {
            $scope.hasPositions = false;
            $(".loadingView").delay(400).fadeOut(150);
            $scope.msg = "You haven't taken any poitions yet. Please search a symbol from the above search bar in order\n\
                to take a postion.";
        } else {
            var remove = 0;
            angular.forEach($scope.pos, function (p) {
                var today = new Date().getTime();
                var exp = Number(utils.editDate(p.expiry));

                var d = new Date(exp);
                var eYear = d.getFullYear();
                var eMonth = d.getMonth();
                var eDay = d.getDate();

                var entry = new Date(eYear, eMonth, eDay);
                var today = new Date();
                today = new Date(today.getFullYear(), today.getMonth(), today.getDate());

                var millisecondsPerDay = 1000 * 60 * 60 * 24;
                var millisBetween = entry.getTime() - today.getTime();
                var days = millisBetween / millisecondsPerDay;
                days = Math.floor(days);

                if (days !== 0 && days > 0) {
                    a.push({OptionSymbol: p.leg, OptionAvgPrice: parseFloat(p.optionPrice)});
                } else {
                    remove++;
                    var n = p.leg;
                    p["removeDate"] = new Date().getTime();
                    dashboardFactory.deletePosition(p.stock, [p]);
                }
            });

            $scope.currPrc = {};
            $scope.remove = {};
            $scope.expired = {};

            dashboardFactory.getPositionData(a).then(function (d) {
                angular.forEach(d, function (r) {
                    $scope.currPrc[r.optionData.Name] = {
                        curr: (r.optionData.Ask + r.Bid) / 2,
                        optionLast: r.optionData.Ask,
                        stockLast: r.stockData.Last
                    };
                    $scope.remove[r.stockData.Symbol] = {
                        isRecommendRemove: r.isRecommendRemove
                    };
                    $scope.expired[r.stockData.Symbol] = false;
                });

                var intervalPromise = $interval(function () {
                    $(".removeRecB").toggleClass("removeRec");
                }, 1500);

                $scope.$on('$destroy', function () {
                    $interval.cancel(intervalPromise);
                });


                if (Object.keys($scope.currPrc).length == $scope.pos.length - remove) {
                    $scope.totPnl = function (sAvgPrice, oAvgPrice, sLast, oLast) {
                        var productPrice = sAvgPrice - oAvgPrice;
                        var currProductPrice = sLast - oLast;
                        var tot = parseFloat(((currProductPrice / productPrice) - 1) * 100);
                        $scope.totPnlE = parseFloat(((currProductPrice / productPrice) - 1) * 100);
                        return (Math.floor(100 * parseFloat((tot).toFixed(2))) / 100) + "%";
                    };

                    $scope.enhancedTotal = function (totPnl, stockChange, leg) {
                        var eTot = parseFloat((parseFloat($scope.totPnlE) - parseFloat(stockChange)));
                        return (Math.floor(100 * parseFloat((eTot).toFixed(2))) / 100) + "%";
                    };

                    $scope.optionPnl = function (c, e) {
                        var p = ((c / e) - 1) * 100;
                        var v = (Math.floor(100 * parseFloat((p).toFixed(2))) / 100);
                        if (v == -0.00 || v == 0 || v == -0 || v == -0.00) {
                            return "0.00%";
                        } else {
                            return (Math.floor(100 * parseFloat((p).toFixed(2))) / 100) * -1 + "%";
                        }
                    };

                    $scope.pnlOptionChange = function (c, e) {
                        var p = parseFloat(((c / e) - 1) * 100);
                        var v = (Math.floor(100 * parseFloat((p).toFixed(2))) / 100);
                        if (v == -0.00 || v == 0 || v == -0 || v == -0.00) {
                            $scope.optPnl = "0.00%";
                            return "0.00%";
                        } else {
                            $scope.optPnl = ((Math.floor(100 * p) / 100) * -1) + "%";
                            return (Math.floor(100 * parseFloat((p).toFixed(2))) / 100) + "%";
                        }
                    };

                    $(".loadingView").delay(400).fadeOut(150);
                }
            });

            $scope.hasPositions = true;

            $scope.period = function (d) {
                return utils.period(d);
            };

            $scope.pnl = function (c, e) {
                if (utils.pnl(c, e) == "0%") {
                    return "0.00%";
                } else {
                    return utils.pnl(c, e);
                }
            };

            $scope.editDate = function (d) {
                if (d) {
                    return utils.editDate(d);
                }
            };

            $scope.deletePosition = function (o, s) {
                var n = o.leg;
                o["removeDate"] = new Date().getTime();
                var c = confirm("You are about to remove the possition of " + n + ".");
                if (c == true) {
                    dashboardFactory.deletePosition(s, [o]).then(function (d) {
                        if (d == "OK") {
                            if ($rootScope.userPositions.positions.length == 0) {
                                $scope.hasPositions = false;
                                $scope.msg = "You haven't taken any poitions yet. Please search a symbol from the above search bar in order\n\
                to take a postion.";
                            }
                        }
                    });
                }
            };
        }
    }]);

dashboardCtrl.controller("watchlistCtrl", ["$scope", "$rootScope", "$http", "utils", "dashboardFactory", function ($scope, $rootScope, $http, utils, dashboardFactory) {
        $rootScope.$watch("watchlist", function (o, n) {
            if (o !== n || o !== undefined) {
                $scope.wl = $rootScope.watchlist;
                if ($scope.wl == null || $scope.wl == "null" || $scope.wl == undefined || $scope.wl == 0 || $scope.wl == "0") {
                    $scope.wl = false;
                    $(".loadingView").delay(400).fadeOut(150);
                    $scope.msg = "The list is empty. You can add stocks to your watch list by clicking the ''Add to my watch list'' icon in the stock's page.";
                } else {
                    $scope.wlist = $rootScope.watchlist.split(",");
                    $scope.wl = true;
                    $scope.pnl = function (c, e) {
//                        return (((c - e) / e) * 100).toFixed(2) + "%";
                        return utils.pnl(c, e);
                    };

                    $scope.arr = [];
                    var tmp = [];
                    for (var i = 1; i < $scope.wlist.length; i++) {
                        if ($scope.wlist[i] !== "") {
                            tmp.push($scope.wlist[i]);
                        }
                    }

                    dashboardFactory.getStock(tmp).then(function (d) {
                        $(".loadingView").delay(400).fadeOut(150);
                        if (d.length == 0) {
                            $scope.wl = false;
                            $scope.msg = "It seems that we cannot find the symbols you are watching. Please try again shortly or contact support.";
                        } else {
                            angular.forEach(d, function (s) {
                                $scope.arr.push(s);
                            });
                        }
                    });

                    $scope.removeWL = function (str, s) {
                        var wArray = $rootScope.watchlist.split(",");
                        var i = wArray.indexOf(s);
                        wArray.splice(i, 1);
                        var str = wArray.toString();
                        dashboardFactory.removeWL(str, s).then(function (d) {
                            if (d == "OK") {
                                $scope.onList = false;
                                if ($scope.wl == null || $scope.wl == "null" || $scope.wl == undefined || $scope.wl == 0 || $scope.wl == "0") {
                                    $scope.wl = false;
                                    $scope.msg = "The list is empty. You can add stocks to your watch list by clicking the ''Add to my watch list'' icon in the stock's page.";
                                }
                            }
                        });
                    };
                }
            }
        });
    }]);

dashboardCtrl.controller("dashboardCtrl", ["$scope", "$rootScope", "$http", "$state", "$timeout", "utils", "dashboardFactory", "toolTip", function ($scope, $rootScope, $http, $state, $timeout, utils, dashboardFactory, toolTip) {

        //IE manipulations
        var ua = window.navigator.userAgent;
        var msie = ua.indexOf("MSIE ");

        if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) { //IE
            $(".srcQ").css({"width": "146px", "padding-right": "0px"});

        } else {
        }

        //Clear search input
        $rootScope.$on('$stateChangeStart',
                function (event, toState, toParams, fromState, fromParams) {
                    $(".srcQ").val("");
                    $scope.searchQ = "";
                });

        $scope.clearNoIE = function () {
            $timeout(function () {
                $(".srcQ").val("");
                $(".srcQ").focus();
                $(".searchHistory").show();
            }, 0);
        };

        function symbolText() {
//            var symbol = $(".selectedItem").text();
//            symbol = symbol.replace(/\s/g, '');
//            symbol = symbol.replace("Symbols:", "");
            $timeout(function () {
                var val = $(".srcQ").val();
                if (val !== "SYMBOL" || val !== "") {
                    $(".srcQ").val(val);
                    $(".srcQ").focus();
                }
            }, 0);
//            var lngt = symbol.length;
//            var range = $(".srcQ").createRange();
//            range.setEnd(lngt, lngt);
//            $scope.searchQ = symbol;
        }

        $scope.existsInHistory = function (s) {
            var split = $rootScope.sH.split(",");
            var found = $.inArray(s, split);
            if (found > -1) {
                return true;
            } else {
                return false;
            }
        };

        $(".listTitle").click(function () {
            $(".srcQ").focus();
        });

        $scope.moveSelect = function (e, symbol) {
            var key = e.keyCode;
            var list = document.getElementsByClassName("searchHistory")[0];
            var elements = document.getElementsByClassName("selectedItem");
            var li = list.getElementsByTagName("LI");
            var firstLi = list.getElementsByTagName("LI")[1];
            var lastLi = list.getElementsByTagName("LI")[li.length - 1];

            if (key == 40) {
                if (elements.length == 0) {
//                    firstLi.className += " selectedItem";
                    $(firstLi).addClass("selectedItem");
                    symbolText();
                } else {
                    var next = $(".selectedItem").next();
//                    if (next.length !== 0 && !next.hasClass("listTitleSym")) {
                    if (next.length !== 0) {
                        if (next.hasClass("listTitleSym")) {
                            next = next.next();
                        }
                        $(".selectedItem").removeClass("selectedItem");
                        next.addClass("selectedItem");
                        symbolText();
                    } else {
                        $(".selectedItem").removeClass("selectedItem");
                        $(firstLi).addClass("selectedItem");
                        symbolText();
                    }
                }
            }

            if (key == 38) {
                if ($(".selectedItem").length == 0) {
                    lastLi.className += " selectedItem";
                    symbolText();
                } else {
                    var prev = $(".selectedItem").prev();
//                    if (prev.length !== 0 && !prev.hasClass("listTitleSym")) {
                    if (prev.length !== 0) {
                        if (prev.attr("class") !== "listTitle") {
                            if (prev.hasClass("listTitleSym")) {
                                prev = prev.prev();
                            }
                            $(".selectedItem").removeClass("selectedItem");
                            prev.addClass("selectedItem");
                            symbolText();
                        } else {
                            $(".selectedItem").removeClass("selectedItem");
                            lastLi.className += " selectedItem";
                            symbolText();
                        }
                    } else {
                        $(".selectedItem").removeClass("selectedItem");
                        lastLi.className += " selectedItem";
                    }
                }
            }
            if (key == 13) {
                if ($(".selectedItem").length > 0) {
                    var symbol = $(".selectedItem").text();
                    symbol = symbol.replace(/\s/g, '');
                    symbol = symbol.replace("Symbols:", "");
                    if (symbol !== "") {
                        $(".srcQ").val(symbol);
                        $scope.searchQ = symbol;
                        $(".searchHistory").hide();
                        setTimeout(function () {
                            document.getElementsByClassName("hQty")[0].focus();
                            $(".selectedItem").removeClass("selectedItem");
                        }, 10);
                    }
                }
            }

            $(".searchHistory").mouseenter(function () {
                if ($(".selectedItem").length > 0) {
                    $(".selectedItem").removeClass("selectedItem")
                }
            });

            if (key !== 13 && key !== 40 && key !== 38 && key !== 39 && key !== 37) {
                $(".selectedItem").removeClass("selectedItem");
            }
        };

//        $scope.bodyClick = function (e) {
        $scope.showIt = function () {
            $(".searchHistory").show();
        }
        $(document).click(function (e) {
            $(".hQty").focus(function () {
                $(".searchHistory").hide();
            });

            $(".inputs").focus(function () {
                $(".searchHistory").hide();
            });

            var target = $(e.target).attr("class");
            if (target !== undefined) {
                target = target.split(" ");
            } else {
                target = "undefined";
            }
            if (target[0] !== "srcQ" && target[0] !== "showHistoryList" && target[0] !== "listTitle" && target[0] !== "searchItem") {
                $(".searchHistory").hide();
//                    $scope.showMe = !$scope.showMe;
            }
            if (target[0] === "srcQ" || target[0] === "showHistoryList" || target[0] === "listTitle" || target[0] === "searchItem") {
                $(".searchHistory").show();
            }
        });
//        };

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

        $scope.dropDownList = function () {
            $(".searchHistoryList").toggle();
            $scope.searchQ = '';
        };

        $scope.clickedStock = function (s) {
            $scope.srcQ = s;
            $(".srcQ").val(s);
            var el = document.querySelector(".hQty");
            el.focus();
//            el.value = 100;
        };

        $scope.moveToStock = function (s, sq) {
            if ($(".selectedItem").length == 0) {
                s = $(".srcQ").val();

                var hQty = $(".hQty").val();
                var alphaExp = /^[a-zA-Z/]+$/;
                var numExp = /^[0-9]+$/;
                var validated = 0;
                console.log(s);
                if (!s || s === "Symbol" || s === "SYMBOL" || s === '' || !alphaExp.test(s)) {
                    if (!alphaExp.test(s) && s) {
                        var msg = "Only letters are allowed.";
                    } else if (!s || s === "Symbol" || s === "SYMBOL" || s === '') {
                        var msg = "Please enter a stock symbol.";
                    }
                    $(".errorContentTopS").remove();
                    $("<span class='errorContentTopS'></span>").appendTo(".symE").text(msg);
                    $(".errorContentTopS").delay(5000).animate({"opacity": "0"}, 1500, function () {
                        $(this).text("");
                        $(this).css("opacity", "1");
                    });
//                    return false;
                } else {
                    var split = s.split("");
                    for (var i = 0; i < split.length; i++) {
                        var idx = isNaN(split[i]);
                        if (idx === false || !alphaExp.test(idx)) {
                            $(".errorContentTopS").remove();
                            $("<span class='errorContentTopS'></span>").appendTo(".symE").text("Only letters are allowed.");
                            $(".errorContentTopS").delay(5000).animate({"opacity": "0"}, 1500, function () {
                                $(this).text("");
                                $(this).css("opacity", "1");
                            });

//                            return false;
                        } else {
                            validated++;
                            console.log("SYMBOL is OK");
                        }
                    }
                }

//                if (s || s !== "Symbol" || s !== "SYMBOL") {

//                }
//
//                if (isNaN(s) === false) {
//                    $(".errorContentTopS").remove();
//                    $("<span class='errorContentTopS'></span>").appendTo(".symE").text("Only letters are allowed.");
//                    $(".errorContentTopS").delay(5000).animate({"opacity": "0"}, 1500, function () {
//                        $(this).text("");
//                        $(this).css("opacity", "1");
//                    });
////                    $scope.held = 100;
//                    return false;
//                }

                if (!hQty || hQty === '') {
                    if (sq) {
                        $(".hQty").val("sq");
                        $scope.held = sq;
                        hQty = sq;
                        $(".symE").text("");
                        $(".qtyE").text("");
                        $state.go("dashboard.data", {s: s, q: sq});
                        dashboardFactory.clickHistory(s);
                        validated++;
                    } else {
//                        $(".symE").text("");
//                        $(".qtyE").text("");
//                        $state.go("dashboard.data", {s: s, q: 100});
//                        dashboardFactory.clickHistory(s);
//                        $scope.held = 100;
                        $(".errorContentTopQ").remove();
                        $("<span class='errorContentTopQ'></span>").appendTo(".qtyE").text("The minimum quantity is 100.");
                        $(".errorContentTopQ").delay(5000).animate({"opacity": "0"}, 1500, function () {
                            $(this).text("");
                            $(this).css("opacity", "1");
                        });
//                        return false;
                    }
                }
                else {
//                    if (!hQty.match(numExp)) {
                    if (isNaN(hQty) === true) {
                        $(".errorContentTopQ").remove();
                        $("<span class='errorContentTopQ'></span>").appendTo(".qtyE").text("Only number are allowed.");
                        $(".errorContentTopQ").delay(5000).animate({"opacity": "0"}, 1500, function () {
                            $(this).text("");
                            $(this).css("opacity", "1");
                        });
//                        return false;
                    } else {
                        if (hQty < 100) {
                            $(".errorContentTopQ").remove();
                            $("<span class='errorContentTopQ'></span>").appendTo(".qtyE").text("The minimum quantity is 100.");
                            $(".errorContentTopQ").delay(5000).animate({"opacity": "0"}, 1500, function () {
                                $(this).text("");
                                $(this).css("opacity", "1");
                            });
//                            return false;
                        } else {
//                            if (hQty % 1 !== 0) {
//                                $(".errorContentTopQ").remove();
//                                $("<span class='errorContentTopQ'></span>").appendTo(".qtyE").text("Please fill in a whole number.");
//                                $(".errorContentTopQ").delay(5000).animate({"opacity": "0"}, 1500, function () {
//                                    $(this).text("");
//                                    $(this).css("opacity", "1");
//                                });
//                                return false;
//                            } else {
                            console.log("QTY is OK");
                            validated++;
                        }
                    }
                }
//                    if (hQty % 1 !== 0) {
//                        $(".errorContentTopQ").remove();
//                        $("<span class='errorContentTopQ'></span>").appendTo(".qtyE").text("Please fill in a whole number.");
//                        $(".errorContentTopQ").delay(5000).animate({"opacity": "0"}, 1500, function () {
//                            $(this).text("");
//                            $(this).css("opacity", "1");
//                        });
//                        return false;
                //                    } else {
                console.log(validated);
                var sp = s.split("");
                if (validated === 1 + sp.length && s !== "") {
                    s = encodeURIComponent(s);
                    $(".symE").text("");
                    $(".qtyE").text("");
                    $(".srcQ").val("");
                    $scope.searchQ = '';
                    $state.go("dashboard.data", {s: s, q: hQty});
                    dashboardFactory.clickHistory(s);
                    $scope.held = hQty;
                }
            }
        };
    }]);

dashboardCtrl.controller("stockdataCtrl", ["$scope", "$rootScope", "$http", "$state", "$timeout", "dashboardFactory", "utils", function ($scope, $rootScope, $http, $state, $timeout, dashboardFactory, utils) {
        $scope.symbol = decodeURIComponent($state.params.s.toUpperCase());
        dashboardFactory.clickHistory($scope.symbol);
        $scope.selectedRow = null;
        $scope.optionSymbol;
        $scope.optionEntry;
        delete $rootScope.stockData;

        var tW = $(".dataContainer").width() + $(".dataContainer").position().left;
        var sW = $(".score").width();
        var sL = $(".dataContainer").position().left + 10;
        $(".score").css("left", tW - sW - 7 - sL + "px");

        if ($rootScope.watchlist.indexOf($scope.symbol) !== -1) {
            $scope.onList = true;
        } else {
            $scope.onList = false;
        }

        var q = $state.params.q;
        if (q.length == 0) {
            $rootScope.held = 100;
        } else {
            $rootScope.held = Math.floor(parseInt($state.params.q));
        }

        $scope.editDate = function (d) {
            if (d) {
                return utils.editDate(d);
            }
        };
        var t = false;

        $scope.cut = function (n) {
            return Math.floor(n * 100) / 100;
        };
        var exp = false;
        var userPositions = [];
        $timeout(function () {
            angular.forEach($rootScope.userPositions.positions, function (p) {
                userPositions.push(p.stock);
                exp = Number(utils.editDate(p.expiry));
                if (p.stock == $scope.symbol) {
                    $scope.wholePosition = p;
                    $scope.optionSymbol = p.leg;
                    $scope.optionEntry = p.entry;
                    $scope.optionAvgPrice = p.optionPrice;
                }
            });

            var found = $.inArray($scope.symbol, userPositions);
            if (found > -1) {
                $scope.gotPosition = true;
//                var date = new Date($scope.optionEntry);
                var time = utils.getDate($scope.optionEntry);
//                var day = date.getDate();
//                var month = date.getMonth();
//                var year = date.getFullYear();
//                var hour = date.getHours();
//                var minute = date.getMinutes();
//                var second = date.getSeconds();
//                var time = month + 1 + "/" + day + "/" + year + " " + hour + ':' + minute + ':' + second;

                var today = new Date().getTime();

                var d = new Date(exp);
                var eYear = d.getFullYear();
                var eMonth = d.getMonth();
                var eDay = d.getDate();

                var entry = new Date(eYear, eMonth, eDay);
                var today = new Date();
                today = new Date(today.getFullYear(), today.getMonth(), today.getDate());

                var millisecondsPerDay = 1000 * 60 * 60 * 24;
                var millisBetween = entry.getTime() - today.getTime();
                var days = millisBetween / millisecondsPerDay;
                days = Math.floor(days);

                if (days === 0 || days < 0) {
                    $scope.wholePosition["removeDate"] = new Date().getTime();
                    dashboardFactory.deletePosition($scope.symbol, [$scope.wholePosition]).then(function (d) {
                        location.reload();
                    });
                }

                dashboardFactory.getPositionData([{OptionSymbol: $scope.optionSymbol, OptionAvgPrice: parseFloat($scope.optionAvgPrice)}]).then(function (d) {
                    $rootScope.stockData = d[0].stockData;
                    $rootScope.stData = $rootScope.stockData;
                    $rootScope.position = d[0].optionData;
                    $rootScope.PositionPrices = d[0].optionData;
                    $rootScope.removeIt = d[0].isRecommendRemove;

                    dashboardFactory.getStockHistory($scope.symbol, time, $scope.optionSymbol, $scope.optionAvgPrice).then(function (d) {
                        $scope.historyData = d["DatePrices"];
                        $rootScope.HisLength = d["DatePrices"].length;

                        if ($scope.historyData.length < 2) {
                            $(".loadingView").fadeOut(250);
                            $(".noHismsg").show();
                        } else {
//                            $(".loadingView").delay(1000).fadeOut(250);
                        }

                        $rootScope.PositionPrices = {
                            Ask: $rootScope.position.Ask,
                            Bid: $rootScope.position.Bid,
                            Last: $rootScope.stockData.Last
                        };
                    });
                });
            } else {
                $scope.gotPosition = false;
                dashboardFactory.getStock($scope.symbol).then(function (d) {
                    if (d.length == 0) {
                        $scope.noR = true;
                    } else {
                        $rootScope.stockData = d[0];
                        $rootScope.stockLast = $rootScope.stockData.Last;

                        $scope.historyData = [];
                        $rootScope.position = d[0].Options[0];
                        $rootScope.LossPercentage = $rootScope.position.LossPercentage;
                        $rootScope.moData = {last: d[0].Last, tgtPrc: d[0].TgtPrc};
                    }
                });

            }
        }, 600);

        $timeout(function () {
            $rootScope.$on("chartDone", function (event, data) {
                $(".loadingView").fadeOut(250);
            });
        }, 0);


        $scope.removeWL = function (s) {
            var wArray = $rootScope.watchlist.split(",");
            var i = wArray.indexOf(s);
            wArray.splice(i, 1);
            var str = wArray.toString();
            dashboardFactory.removeWL(str, s).then(function (d) {
                console.log(s);
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
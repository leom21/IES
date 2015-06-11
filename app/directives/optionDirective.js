var optionDirective = angular.module("optionDirective", []);

optionDirective.directive("optionsSection", ["$timeout", "$rootScope", "$state", "dashboardFactory", function ($timeout, $rootScope, $state, dashboardFactory) {
        return {
            retrict: "E",
            replace: false,
            templateUrl: "app/views/dashboard/positionData.html",
            scope: {data: '=data', stockData: '=stockData', symbol: '=symbol', position: '=position', index: '=index', stocksOpt: '=stocksOpt', heldQ: '=heldQ'},
            link: function (scope, element, attrs) {

                $rootScope.$watch("held", function (o) {
                    if (o !== undefined) {
                        scope.heldQty = $rootScope.held;
                        scope.takeP.qty = $rootScope.held;
                        scope.takeP.optQty = $rootScope.held / 100;
                    }
                });

                $rootScope.$watch("stockData", function (o) {
                    if (o !== undefined) {
                        scope.stData = $rootScope.stockData;
                    }
                });

                scope.optQ = function () {
                    return Math.floor(scope.takeP.qty / 100);
                };


                scope.$watch("position", function (oldValue, newValue) {
                    if (oldValue !== undefined) {
                        if (scope.data == "" || scope.data == null) {
                            scope.gotPosition = false;
                        }
                        var legP = (scope.position.Ask + scope.position.Bid) / 2;
                        scope.takeP.refPrice = "$" + (Math.ceil(legP * 100) / 100).toFixed(2);


                        scope.premium = function () {
                            var ref = scope.takeP.refPrice.replace("$", "");
                            return "$" + ((ref * scope.takeP.qty / 100) * 100).toFixed(0);
                        };
                    }
                });

                scope.scrollPositon = function () {
                    var st = $(document.querySelector(".stockR")).offset().top;
                    var cT = $(document.querySelector("#bell")).offset().top;
                    var sTt = $(".graph");
                    var dH = $("body").height();

                    $("body").animate({"scrollTop": "120px"}, 300);
//                    $(".takePosition").animate({"bottom": sTt + cT - 70 + "px", "height": "15px"}, 300);
//                    $(".closeTakePosition").animate({"bottom": sTt + cT - 70 + "px", "height": "15px"}, 300);
                    scope.gotPosition = false;
                };

                scope.isChanged = function (takeP) {
                    if (takeP.qty == undefined) {
                        scope.takeP.qty = 100;
                    }
                    else if (takeP.qty % 1 !== 0) {
                        scope.takeP.qty = Math.floor(takeP.qty);
                    }
                    if (takeP.optionName && takeP.optionPrice && takeP.qty && takeP.refPrice) {
//                        $(".takePosition").text(" Add position ").css("padding", "5px 10px 5px 9px");
                        scope.validate = "OK";
                        return scope.fData = takeP;
                    } else {
                        $(".takePosition").text("Take poisiton").css("padding", "5px 10px 5px 5px");
                        scope.validate = "NO";
                    }
                };
                var c = 0;
                scope.takePosition = function (index, validate, takeP, e) {
                    c++;
                    if (c == 1) {
//                    if (validate == "OK") {
                        function pos(symbol, position, index, takeP) {
                            var tmp = ((position.Ask + position.Bid) / 2).toFixed(2);
                            var optionPriceT = Math.floor(tmp * 100) / 100;

                            //For presentation only
                            var date = new Date();
                            var day = date.getDate();        // yields day
                            var month = date.getMonth();    // yields month
                            var year = date.getFullYear();  // yields year
                            var time = month + 1 + "/" + day + "/" + year;

                            var d = new Date(time);
                            var n = d.setDate(d.getDate() - 9);
                            //End presentation

                            this.stock = symbol;
                            this.last = position.Last;
                            this.stockLast = $rootScope.stockLast;
                            this.break = ((position.Bid + position.Ask) / 2 + position.Strike).toFixed(2);
                            this.oScore = position.Score;
//                            this.entry = new Date().getTime();
                            this.entry = n; // For presentation only.
                            this.leg = position.Name;
                            this.optionName = position.Type + position.Strike;
//                        this.optionPrice = parseFloat(takeP.refPrice.replace("$", "")).toFixed(2);
                            this.optionPrice = position.Last;
                            this.qty = takeP.qty;
                            this.optQty = scope.optQty;
                            this.sQty = takeP.qty;
                            this.refPrice = takeP.refPrice.replace("$", "");
                            this.days = position.Days,
                                    this.expiry = position.Expiry,
                                    this.position =
                                    [{
                                            sQty: takeP.qty,
                                            name: position.Name,
                                            entryPrice: (position.Ask + position.Bid) / 2,
                                            date: new Date().getTime(),
                                            expiry: position.Expiry,
                                            score: position.Score,
                                            strike: position.Type + position.Strike
                                        }]

                        }

                        var y = new Date().getFullYear();
                        var m = new Date().getMonth();
                        var d = new Date().getDate();

                        var takePos = new pos(scope.symbol, scope.position, scope.index, scope.takeP);
                        dashboardFactory.takePosition(takePos).then(function (d) {
                            if (d == "OK") {
                                $rootScope.gotPosition = true;
//                                $timeout(function () {
//                                    $state.go($state.current, {}, {reload: true});
                                location.reload();
                                console.log("Position taken.");
//                                }, 1000);
                            }
                        });
                    }
                };

                scope.editDate = function (d) {
                    if (d) {
                        d = d.substring(0, d.length - 2);
                        d = d.substring(6, d.length);
                        return d;
                    }
                };

                if (scope.data.positions.length === 0) {
//                    $rootScope.gotPosition = false;
                    scope.gotPositionD = false;
                } else {
                    scope.arr = [];
                    scope.ids = [];
                    angular.forEach(scope.data.positions, function (s) {
                        scope.ids.push(s.stock);
                    });

                    angular.forEach(scope.data.positions, function (s) {
                        if (s.stock == scope.symbol && scope.ids.indexOf(s.stock) !== -1) {
                            scope.arr.push(s);
//                            $rootScope.gotPosition = true;
                            scope.gotPositionD = true;
                            $rootScope.$watch("stockData", function (oldValue) {
                                if ($rootScope.stockData !== undefined) {
                                    var d = $rootScope.stockData.Options;
                                    angular.forEach(d, function (r) {
                                        if (r.Name == s.position[0].name) {
                                            var tmp = ((r.Ask + r.Bid) / 2).toFixed(2);
                                            scope.currPrc = Math.floor(tmp * 100) / 100;
                                        }
                                    });

                                    scope.CstockLast = $rootScope.stockLast;
                                    scope.totalPnl = function (s, o) {
                                        return parseFloat(s) + parseFloat(o) + "%";
                                    };

                                    scope.expiry = function (d) {
                                        d = d.substring(0, d.length - 2);
                                        d = d.substring(6, d.length);
                                        var today = new Date().getTime();
                                        var timeDiff = d - today;
                                        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                                        return diffDays;
                                    };
                                    scope.period = function (d) {
                                        var today = new Date().getTime();
                                        var timeDiff = Math.abs(d - today);
                                        var diffDays = Math.floor(timeDiff / (1000 * 3600 * 24));
                                        return diffDays;
                                    };

                                    scope.pnl = function (c, e) {
                                        return (((c - e) / e) * 100).toFixed(2) + "%";
                                    };
                                }
                            });
                            scope.exp = scope.arr[0].position[0].expiry;
                        } else if (s.stock == scope.symbol && scope.ids.indexOf(s.stock) == -1) {
//                            $rootScope.gotPosition = false;
                        }
                    });
                }

                scope.$watch("index", function (oldValue) {
                    if (oldValue !== undefined && oldValue !== null) {
                        var i = parseInt(scope.index);
                        if (jQuery.inArray(i, scope.ids) > -1) {
                            $(".takePosition").animate({"opacity": "1"}, 200);
                            $(".closeTakePosition").animate({"opacity": "1"}, 200);
                        } else {
                            $(".takePosition").animate({"opacity": "1"}, 200);
                            $(".closeTakePosition").animate({"opacity": "1"}, 200);
                        }
                    }
                    if (oldValue !== null) {
                        var posW = {
                            stock: scope.symbol,
                            pos: [{views: 1, name: scope.position.Name}]
                        };
                        dashboardFactory.optWatchH(posW);
                    }
                });

                var closeTP = angular.element(element[0].querySelector('.closeTakePosition'));
                $(closeTP).click(function () {
//                    $(".takePositionT").hide();
                    $rootScope.gotPosition = false;
                    $(".takePosition").animate({"opacity": "0"}, 200);
                    $(".closeTakePosition").animate({"opacity": "0"}, 200);
                });

                scope.deletePosition = function (o, s) {
                    var n = o[0].position[0].name;
                    var c = confirm("You are about to remove the possition of " + n + ".");
                    if (c == true) {
                        dashboardFactory.deletePosition(s).then(function (d) {
                            if (d == "OK") {
                                $rootScope.gotPosition = false;
                                console.log($rootScope.userPositions);
                                $state.go($state.current, {}, {reload: true});
                            }
                        });
                    }
                };
            }
        };
    }]);

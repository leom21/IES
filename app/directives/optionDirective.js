var optionDirective = angular.module("optionDirective", []);

optionDirective.directive("optionsSection", ["$timeout", "$rootScope", "$state", "dashboardFactory", "utils", "$interval", function ($timeout, $rootScope, $state, dashboardFactory, utils, $interval) {
        return {
            retrict: "E",
            replace: false,
            templateUrl: "app/views/dashboard/positionData.html",
            scope: {data: '=data', hisData: '=hisData', stockData: '=stockData', symbol: '=symbol', position: '=position', index: '=index', stocksOpt: '=stocksOpt', heldQ: '=heldQ'},
            link: function (scope, element, attrs) {
                $rootScope.$watch("HisLength", function (o) {
                    if (o !== undefined) {
                        scope.histLength = $rootScope.HisLength;
                        scope.removeIt = $rootScope.removeIt;
                    }
                });

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
                    if (scope.takeP.qty === undefined || isNaN(scope.takeP.qty) === true) {
                        return 0;
                    } else {
                        return Math.floor(scope.takeP.qty / 100);
                    }
                };

                scope.$watch("position", function (oldValue, newValue) {
                    if (oldValue !== undefined) {
                        if (scope.data == "" || scope.data == null) {
                            scope.gotPosition = false;
                        }
                        var legP = (scope.position.Ask + scope.position.Bid) / 2;
                        scope.takeP.refPrice = "$" + (scope.position.SmartPrice);

                        scope.premium = function () {
                            var ref = scope.takeP.refPrice.replace("$", "");
                            if (scope.takeP.qty === undefined || scope.takeP.qty < 100 || isNaN(scope.takeP.qty) === true) {
                                return "$0";
                            } else {
                                return "$" + ((ref * scope.optQty * 100)).toFixed(0);
                            }
                        };
                    }
                });

                scope.scrollPositon = function () {
                    var st = $(document.querySelector(".stockR")).offset().top;
                    var cT = $(document.querySelector("#bell")).offset().top;
                    var sTt = $(".graph");
                    var dH = $("body").height();

                    $("body").animate({"scrollTop": "120px"}, 300);
                    scope.gotPosition = false;
                };

                $(".takePosition").click(function () {
                    if ($(".optQty").focus()) {
                        if ($(this).val() === 0) {
                            alert("~");
                        }
                    }
                });

                $(".optQty").blur(function () {
                    if (scope.takeP.qty === undefined || scope.takeP.qty === null || scope.takeP.qty === "" || isNaN(scope.takeP.qty) === true) {
//                        if (isNaN(scope.takeP.qty) === true) {
//                            var val = 100;
//                        } else {
                        var val = $(this).val();
//                        }
                        $timeout(function () {
                            if (val === "" || Number(val) === 0) {
//                                scope.takeP.qty = 100;
                                scope.$apply();
                            }
                            else {
                                if (isNaN(scope.takeP.qty) === true) {
                                    scope.takeP.qty = val;
                                } else {
                                    scope.takeP.qty = Number(val);
                                    scope.$apply();
                                }
                            }
                        }, 300);
                    }
                });

                function customIsNan(o) {
                    return o !== o;
                }

                $(".optQty").bind("mouseup", function (e) {
                    var $input = $(this),
                            oldValue = $input.val();

                    if (oldValue == "") {
                        return;
                    }

                    setTimeout(function () {
                        var newValue = $input.val();

                        if (newValue == "") {
                            scope.takeP.qty = '';
                            scope.$apply();
                            $input.trigger("cleared");
                        }
                    }, 1);
                });

                scope.isChanged = function (takeP) {
                    if (takeP.qty === undefined || takeP.qty === null || takeP.qty === "" || isNaN(takeP.qty) === true) {
                        console.log("!");
                    }
                    if (takeP.optionName && takeP.optionPrice && takeP.qty && takeP.refPrice) {
//                        $(".takePosition").text(" Add position ").css("padding", "5px 10px 5px 9px");
                        scope.validate = "OK";
                        return scope.fData = takeP;
                    } else {
//                        $(".takePosition").text("Take poisiton");
                        scope.validate = "NO";
                    }
                };

                var c = 0;

                scope.takePosition = function (index, validate, takeP, e) {
                    var optQty = scope.takeP.qty;
                    if (scope.takeP.qty === '') {
                        $(".errorContent").remove();
                        $("<span class='errorContent'></span>").appendTo(".PqtyE").text("The minimum quantity is 100.");
                        $(".errorContent").delay(5000).animate({"opacity": "0"}, 1500, function () {
                            $(this).text("");
                            $(this).css("opacity", "1");
                        });
                        return false;
                    }
                    else if (optQty < 100) {
                        $(".errorContent").remove();
                        $("<span class='errorContent'></span>").appendTo(".PqtyE").text("The minimum quantity is 100.");
                        $(".errorContent").delay(5000).animate({"opacity": "0"}, 1500, function () {
                            $(this).text("");
                            $(this).css("opacity", "1");
                        });
                    }
                    else if (isNaN(scope.takeP.qty) === true) {
                        $(".errorContent").remove();
                        $("<span class='errorContent'></span>").appendTo(".PqtyE").text("Only numbers are allowed.");
                        $(".errorContent").delay(5000).animate({"opacity": "0"}, 1500, function () {
                            $(this).text("");
                            $(this).css("opacity", "1");
                        });
                    } else {
                        if (optQty % 1 !== 0) {
                            scope.takeP.qty = Math.floor(optQty);
                        }
                        c++;

                        if (c == 1) {
                            $(".PqtyE").text("");
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
                                this.break = (parseFloat(position.SmartPrice) + parseFloat(position.Strike));
                                this.oScore = position.Score;
                                this.entry = new Date().getTime();
//                            this.entry = n; // For presentation only.
                                this.leg = position.Name;
                                this.optionName = position.Type + position.Strike;
                                this.optionPrice = position.SmartPrice;
                                this.qty = takeP.qty;
                                this.optQty = scope.optQty;
                                this.sQty = takeP.qty;
                                this.refPrice = takeP.refPrice.replace("$", "");
                                this.days = position.Days,
                                        this.expiry = position.Expiry,
//                                        this.expiry = "/Date(1437383473000)/",
                                        this.position =
                                        [{
                                                sQty: takeP.qty,
                                                name: position.Name,
                                                entryPrice: (position.Ask + position.Bid) / 2,
                                                date: new Date().getTime(),
                                                expiry: position.Expiry,
                                                score: position.Score,
                                                strike: position.Type + position.Strike
                                            }];
                            }

                            var y = new Date().getFullYear();
                            var m = new Date().getMonth();
                            var d = new Date().getDate();

                            var takePos = new pos(scope.symbol, scope.position, scope.index, scope.takeP);
                            dashboardFactory.takePosition(takePos).then(function (d) {
                                if (d == "OK") {
                                    $rootScope.gotPosition = true;
                                    location.reload();
                                }
                            });
                        }
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
                            scope.gotPositionD = true;
                            $rootScope.$watch("PositionPrices", function (oldValue) {
                                if ($rootScope.PositionPrices !== undefined) {
                                    var tmp = (($rootScope.PositionPrices.Ask + $rootScope.PositionPrices.Bid) / 2).toFixed(2);
                                    scope.currPrc = Math.floor(tmp * 100) / 100;

                                    scope.CstockLast = $rootScope.stockLast;
                                    scope.totalPnl = function (s, o) {
                                        return (parseFloat(s) + parseFloat(o)).toFixed(2) + "%";
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
                                        var d = new Date(d);
                                        var eYear = d.getFullYear();
                                        var eMonth = d.getMonth();
                                        var eDay = d.getDate();

                                        var entry = new Date(eYear, eMonth, eDay);
                                        var today = new Date();
                                        today = new Date(today.getFullYear(), today.getMonth(), today.getDate());

                                        var millisecondsPerDay = 1000 * 60 * 60 * 24;
                                        var millisBetween = today.getTime() - entry.getTime();
                                        var days = millisBetween / millisecondsPerDay;
                                        return Math.floor(days);
                                    };

                                    scope.totPnl = function (sAvgPrice, oAvgPrice, sLast, oLast) {
                                        var productPrice = sAvgPrice - oAvgPrice;
                                        var currProductPrice = sLast - oLast;
                                        var tot = parseFloat(((currProductPrice / productPrice) - 1) * 100);
                                        scope.totPnlE = (Math.floor(100 * parseFloat((tot).toFixed(2))) / 100);
                                        return (Math.floor(100 * parseFloat((tot).toFixed(2))) / 100) + "%";
                                    };

                                    scope.pnl = function (c, e) {
                                        var p = parseFloat(((c / e) - 1) * 100);
                                        var v = (Math.floor(100 * parseFloat(p).toFixed(2)) / 100);
                                        if (v == -0.00 || v == 0 || v == -0 || v == -0.00) {
                                            scope.pnlE = 0.00;
                                            return "0.00%";
                                        } else {
                                            scope.pnlE = Math.floor(100 * parseFloat((p).toFixed(2))) / 100;
                                            return (Math.floor(100 * parseFloat((p).toFixed(2))) / 100) + "%";
                                        }
                                    };

                                    scope.enhancedTotal = function (totPnl, stockPnl) {
                                        var eTot = parseFloat((parseFloat(scope.totPnlE) - parseFloat(scope.pnlE)));
                                        return (Math.floor(100 * parseFloat((eTot).toFixed(2))) / 100) + "%";
                                    };


                                    scope.optionPnl = function (c, e) {
                                        var p = ((c / e) - 1) * 100;
                                        var v = (Math.floor(100 * parseFloat((p).toFixed(2))) / 100);
                                        if (v == -0.00 || v == 0 || v == -0 || v == -0.00) {
                                            return "0.00%";
                                        } else {
                                            return (Math.floor(100 * parseFloat((p).toFixed(2))) / 100) + "%";
                                        }
                                    }

                                    scope.pnlOptionChange = function (c, e) {
                                        var p = (((c / e) - 1) * 100);
                                        var p1 = (p.toString().match(/^\d+(?:\.\d{0,2})?/));
                                        var v = (Math.floor(100 * parseFloat((p).toFixed(2))) / 100);
                                        if (v == -0.00 || v == 0 || v == -0 || v == -0.00) {
                                            scope.optPnl = "0.00%";
                                            return "0.00%";
                                        } else {
                                            scope.optPnl = (Math.floor(100 * parseFloat((p).toFixed(2))) / 100) * -1 + "%";
                                            return (Math.floor(100 * parseFloat((p).toFixed(2))) / 100) + "%";
                                        }
                                    };

                                }
                            });
                            scope.exp = scope.arr[0].position[0].expiry;
                        } else if (s.stock == scope.symbol && scope.ids.indexOf(s.stock) == -1) {
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
                });

                var closeTP = angular.element(element[0].querySelector('.closeTakePosition'));
                $(closeTP).click(function () {
                    $rootScope.gotPosition = false;
                    $(".takePosition").animate({"opacity": "0"}, 200);
                    $(".closeTakePosition").animate({"opacity": "0"}, 200);
                });

                var intervalPromise = $interval(function () {
                    $(".removeRecB").toggleClass("removeRec");
                }, 1500);

                scope.$on('$destroy', function () {
                    $interval.cancel(intervalPromise);
                });

                scope.deletePosition = function (o, s) {
                    var n = o[0].leg;
                    o[0]["removeDate"] = new Date().getTime();
                    var c = confirm("You are about to remove the possition of " + n + ".");
                    if (c == true) {
                        dashboardFactory.deletePosition(s, o).then(function (d) {
                            if (d == "OK") {
                                $rootScope.gotPosition = false;
                                location.reload();
                            }
                        });
                    }
                };
            }
        };
    }]);

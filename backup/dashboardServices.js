var dashboardServices = angular.module("dashBoardServicesModule", []);

dashboardServices.run(["dashboardFactory", "$state", "$stateParams", "$http", "$q", "$rootScope", "$timeout", function (dashboardFactory, $state, $stateParams, $http, $q, $rootScope, $timeout) {
        $rootScope.toolTipOn = true; //Activate or de-activate tooltips

        if (sessionStorage.logged == undefined) { //Prevent user from entering a secured page directly.
            dashboardFactory.logout();
        }

        $rootScope.$on('$stateChangeSuccess',
                function (event, toState, toParams, fromState, fromParams) {
                    var h = $(document).height();
                    var state = toState.name.split(".")[1];
                    if (state == "data") {
//                    $timeout(function () {
                        var h = $(window).height();
                        $(".footer").css("top", h + "px");
                        console.log($(document).height() + ":" + $(".footer").css("top"))
//                            console.log($("#wrapper").height());
//                    }, 100);
                    } else {
//                        $(".footer").css("top", h + "px");
                        $(".footer").css("top", "initial");
                    }
                });
        $rootScope.idleTime = 0;
        $rootScope.$on('$stateChangeSuccess',
                function (event, toState, toParams, fromState, fromParams) {
                    if (toState.data.secured) {
                        if (toState.data.secured == true) {
                            if (localStorage["userDefs"] == null || localStorage["userDefs"] == 0 || !localStorage["userDefs"] || localStorage["userDefs"] == undefined) {
                                if ($state.current.name !== "/") {
                                    $state.transitionTo("/");
                                }
                            } else {
                                clearInterval($rootScope.idleInterval);
                                $rootScope.idleInterval = setInterval(timerIncrement, 60000);
                                function timerIncrement() {
                                    $rootScope.idleTime = $rootScope.idleTime + 1;
                                }
                                if ($rootScope.idleTime > 20) {
                                    if ($state.current.name !== "/") {
                                        alert("It seems that you were inactive for the past 30 minutes or more.\n For security reasons, please login again.")
                                        dashboardFactory.logout();
                                    }
                                } else {
                                    $rootScope.idleTime = 0;
                                }
                            }
                        }
                    }
                    var s = toState.name.split(".");
                    if (s[0] === "dashboard") {
                        if (!localStorage["userDefs"]) { //Varify that user was logged and data from DB was loaded to localStorage.
                            $state.go("/");
                        } else {
                            //bind localStorage data to $rootScope object.
                            var ls = JSON.parse(localStorage["userDefs"]);
                            $rootScope.ls = ls;
                            $rootScope.username = ls.username;
                            $rootScope.userId = ls.id;
                            $rootScope.userPositions = JSON.parse(localStorage["uP"]);
                            $rootScope.watchlist = localStorage["watchlist"];
                            $rootScope.sH = localStorage["searchHistory"];
                            $rootScope.optionsWatch = JSON.parse(localStorage["optionsWatch"]);
                            $rootScope.clickHistory = JSON.parse(localStorage["cH"]);
                            if ($rootScope.sH == undefined || $rootScope.sH == null || $rootScope.sH == "null") {
                                $rootScope.searchHistory = null;
                            } else {
                                var x = $rootScope.sH.split(",");
                                var hArr = [];
                                angular.forEach(x, function (i) {
                                    if (i.length > 0) {
                                        hArr.push({q: i});
                                    }
                                });
                                $rootScope.searchHistory = hArr;
                            }
                        }

                    }
                }
        );
    }]);
dashboardServices.factory("dashboardFactory", ["$log", "$http", "$q", "$state", "$rootScope", "$timeout", function ($log, $http, $q, $state, $rootScope, $timeout) {
        return{
            loginUser: function (username, password) {
                var data = {username: username, password: password};
                $http.post("app/php/dashboardApi.php", {act: "userLogin", data: data})
                        .success(function (d) {
                            sessionStorage.logged = "userLogged";
                            if (d == "NO_USER") {
                                $("#warning").text("Sorry, there is no such user.");
                                $(".usr").val("");
                                $(".pwd").val("");
                            }
                            else if (d == "WRONG_PWD") {
                                $("#warning").text("Sorry, the password is incorrect.");
                                $(".pwd").val("");
                            }
                            else if (d == "BLOCKED") {
                                $("#warning").text("You were blocked out of the system.");
                            } else {

                                //Set user data when logs in.
                                $("#warning").text("");
                                localStorage.setItem("userDefs", JSON.stringify(d));
                                localStorage.setItem("tracker", d.clickHistory);
                                var ls = JSON.parse(localStorage["userDefs"]);
                                $rootScope.ls = ls;
                                $rootScope.username = ls.username;
                                $rootScope.userId = ls.id;
                                localStorage["watchlist"] = ls.watchlist;
                                $rootScope.watchlist = ls.watchlist;
                                localStorage["cH"] = ls.clickHistory;
                                $rootScope.clickHistory = JSON.parse(localStorage["cH"]);
                                localStorage["searchHistory"] = ls.searchHistory;
                                $rootScope.searchHistory = ls.searchHistory;
                                localStorage["uP"] = ls.positions;
                                $rootScope.userPositions = JSON.parse(localStorage["uP"]);
                                localStorage["optionsWatch"] = ls.optionsWatch;
                                $rootScope.optionsWatch = JSON.parse(localStorage["optionsWatch"]);
                                $timeout(function () {
                                    $state.go("dashboard");
                                }, 300);
                            }
                        });
            },
            logout: function () {
                $rootScope.idleTime = 0;
                $state.transitionTo("/");
                localStorage.removeItem("userDefs");
                localStorage.removeItem("searchHistory");
                localStorage.removeItem("uP");
                localStorage.removeItem("watchlist");
                localStorage.removeItem("optionsWatch");
                localStorage.removeItem("cH");
                localStorage.removeItem("tracker");
                delete $rootScope.ls;
            },
            searchHistory: function (id) {
                var def = $q.defer();
                var data = {
                    id: id
                };
                $http.post("app/php/dashboardApi.php", {act: "getHistory", data: data})
                        .success(function (d) {
                            return def.resolve(d);
                        });
                return def.promise;
            },
            getStocks: function (symbol) {
                var data = {
                    symbol: symbol
                };
                $http.post("app/php/dashboardApi.php", {act: "getStocks", data: data})
                        .success(function (d) {
                        });
            },
            allStocks: function () {
                var def = $q.defer();
                $http.get("universe.json").success(function (s) {
                    return def.resolve(s);
                });
                return def.promise;
            },
            searchStock: function (s, id) {
                var def = $q.defer();
                s = s.toLowerCase();
                if ($rootScope.ls.searchHistory !== null && $rootScope.ls.searchHistory !== "") {
                    var h = $rootScope.ls.searchHistory.toLowerCase();
                }
                $.ajax({
                    type: 'GET',
                    dataType: 'json',
                    url: "universe.json",
                    cache: false,
                    xhr: function () {
                        if ($state.current.name == "dashboard.index") {
                            $(".bar").show();
                        }
                        var xhr = new window.XMLHttpRequest();
                        xhr.addEventListener("progress", function (evt) {
                            if (evt.lengthComputable) {
                                var percentComplete = evt.loaded / evt.total;
                                $(".progress").animate({"width": "" + Math.round(percentComplete * 100) + "%"}, 30);
                                $(".value").html(Math.round(percentComplete * 100) + "%");
                            } else {
                                $(".loading").fadeIn(150);
                                $(".searchHistory").hide();
                            }
                        }, false);
                        return xhr;
                    },
                    beforeSend: function () {
                    },
                    complete: function () {
                    },
                    success: function (d) {
                        var stkArray = [];
                        angular.forEach(d, function (stk) {
                            if (stk.symbol.toLowerCase() == s) {
                                stkArray.push(stk);
                            } else if (stk.symbol.toLowerCase().toString() == s.toString()) {
                                stkArray.push(stk);
                            }
                            return def.resolve(stkArray);
                        });
                    }
                });
                return def.promise;
            },
            getStock: function (data) {
                var _this = this;
                var def = $q.defer();
//                var os = s;
//                if (Array.isArray(s) == false) {
//                    s = [s];
//                }
                var stocks = [];
                angular.forEach(data, function (d) {
                    stocks.push(d);
                    console.log(d);
                });
                console.log(data);

//                var data = data;
//                var data = [{Symbol: "IBM", TakenOptionSymbol: "IBM US 08/21/15 C180 US Equity"},
//                    {Symbol: "ITG", TakenOptionSymbol: "ITG US 10/16/15 C35 US Equity"},
//                    {Symbol: "QQQ", TakenOptionSymbol: "QQQ US 09/18/15 C114 US Equity"},
//                    {Symbol: "XLF", TakenOptionSymbol: "XLF US 08/21/15 C26 US Equity"},
//                    {Symbol: "AAPL", TakenOptionSymbol: "AAPL US 12/18/15 C155 US Equity"},
//                    {Symbol: "GOOGL", TakenOptionSymbol: "GOOGL US 07/17/15 C590 US Equity"}
//                ];
//                $http.post("../WebService/PortfolioWS.asmx/GetIESData", {symbols: s, TakenOptionSymbol: leg})
                console.log(data);
                $http.post("../WebService/PortfolioWS.asmx/GetIESData", {symbols: data})
                        .success(function (IESdata) {
                            if (IESdata["d"].length > 0) {
//                                _this.insertSearch(os);
                            }
                            $rootScope.IESdata = IESdata["d"];
                            $(".loadingView").delay(400).fadeOut(150);
                            return def.resolve(IESdata["d"]);
                        })
                        .error(function (data, status, headers, config) {
                            $rootScope.IESdata = [];
                            $(".loadingView").delay(400).fadeOut(150);
                            $state.transitionTo("dashboard.noRes");
                            return def.resolve([]);
                        });
                return def.promise;
            },
            /*
             * s = string, Symbol
             * d = datetime, start date
             */
            getStockHistory: function (s, d, n) {
                var def = $q.defer();
                $http.post("../WebService/PortfolioWS.asmx/GetIESHistoryData", {symbol: s, startDate: d, optionSymbol: n})
                        .success(function (hisData) {
                            $(".loadingView").delay(400).fadeOut(150);
                            return def.resolve(hisData["d"]);
                        })
                        .error(function (data, status, headers, config) {
                            $rootScope.IESdata = [];
                            $(".loadingView").delay(400).fadeOut(150);
                            $state.transitionTo("dashboard.noRes");
                            return def.resolve([]);
                        });
                return def.promise;
            },
            insertSearch: function (s) {
                if (s) {
                    if (typeof s !== "object") {
                        s = [s];
                    }

                    s = s[0].toUpperCase();
                    function send(id, sh) {
                        var data = {id: id, q: sh};
                        $http.post("app/php/dashboardApi.php", {act: "newHistory", data: data})
                                .success(function (d) {
                                    if (d.length > 0) {
                                        var x = d.split(",");
                                        var hArr = [];
                                        angular.forEach(x, function (i) {
                                            if (i.length > 0) {
                                                hArr.push({q: i});
                                            }
                                        });
                                        $rootScope.searchHistory = hArr;
                                        localStorage.setItem("searchHistory", d);
                                        $rootScope.sH = d;
                                    }
                                });
                    }
                    if ($rootScope.sH == null || $rootScope.sH == "null") {
                        var sh = s;
                        send($rootScope.userId, sh);
                    } else {
                        var sHa = $rootScope.sH.split(",");
                        if (sHa.indexOf(s) == -1) {
                            if (sHa.length == 5 || sHa.length > 4) {
                                sHa.splice(4, 1);
                                sHa.unshift(s);
                                sHa = sHa.toString();
                                send($rootScope.userId, sHa);
                            } else {
                                $rootScope.sH += "," + s;
                                var sh = $rootScope.sH;
                                send($rootScope.userId, sh);
                            }
                        } else {
                            var inx = sHa.indexOf(s);
                            var item = sHa.splice(inx, 1);
                            sHa.unshift(s);
                            sHa = sHa.toString();
                            send($rootScope.userId, sHa);
                        }
                    }
                }
            },
            clickHistory: function (s) {
                s = s.toUpperCase();
                if ($rootScope.clickHistory !== null) {
                    var ch = $rootScope.clickHistory;
                    if (ch[s]) {
                        ch[s]++;
                    } else {
                        ch[s] = 1;
                    }
                } else {
                    var ch = {};
                    ch[s] = 1;
                }

                ch = JSON.stringify(ch);
                var data = {id: $rootScope.userId, ch: ch};
                $http.post("app/php/dashboardApi.php", {act: "clickHistory", data: data})
                        .success(function (d) {
                            localStorage.setItem("cH", JSON.stringify(d));
                            $rootScope.clickHistory = JSON.parse(localStorage["cH"]);
                        });
            },
            optWatchH: function (s) {
                function send(id, oW) {
                    oW = JSON.stringify(oW);
                    var data = {id: id, oW: oW};
                    $http.post("app/php/dashboardApi.php", {act: "optWatchH", data: data})
                            .success(function (d) {
                                localStorage.setItem("optionsWatch", JSON.stringify(d));
                                $rootScope.optionsWatch = JSON.parse(localStorage["optionsWatch"]);
                            });
                }

                var oW = $rootScope.optionsWatch;
                if (oW.optionsWatch.length !== 0) {
                    var oArray = [];
                    angular.forEach(oW.optionsWatch, function (o) {
                        angular.forEach(o.pos, function (p) {
                            oArray.push(p.name);
                        });
                    });
                    angular.forEach(oW.optionsWatch, function (o) {
                        if (o.stock == s.stock) {
                            angular.forEach(o.pos, function (p) {
                                //Stock exists in watching list. Position exists as well, add one to views.
                                if (p.name == s.pos[0].name && jQuery.inArray(s.pos[0].name, oArray) !== -1) {
                                    p.views++;
                                    send($rootScope.userId, oW);
                                }
                                else if (p.name !== s.pos[0].name && jQuery.inArray(s.pos[0].name, oArray) == -1) {
                                    //Stock exists, the position is not. Add ne position to list.
                                    oArray.push(s.pos[0].name);
                                    o.pos.push(s.pos[0]);
                                    send($rootScope.userId, oW);
                                }
                            });
                        }
                    });
                } else {
                    //Stock does not exists! Push new stock to watch list with the first position.
                    oW.optionsWatch.push(s);
                    send($rootScope.userId, oW);
                }
            },
            takePosition: function (d) {
                var def = $q.defer();
                var id = $rootScope.userId;
                var uP = $rootScope.userPositions;
                var data = {
                    id: id,
                    pos: uP
                };
                data.pos.positions.push(d);
                $http.post("app/php/dashboardApi.php", {act: "takePosition", data: data})
                        .success(function (d) {
                            localStorage.setItem("uP", JSON.stringify(d));
                            $rootScope.userPositions = JSON.parse(localStorage["uP"]);
                            return def.resolve("OK");
                        });
                return def.promise;
            },
            deletePosition: function (d) {
                var def = $q.defer();
                var id = $rootScope.userId;
                var uP = $rootScope.userPositions;
                var data = {
                    id: id,
                    pos: uP
                };
                angular.forEach(uP.positions, function (p, i) {
                    if (d == p.stock) {
                        uP.positions.splice(i, 1);
                        data.pos = uP;
                    }
                });
                $http.post("app/php/dashboardApi.php", {act: "takePosition", data: data})
                        .success(function (dphp) {
//                            $http.post("../WebService/PortfolioWS.asmx/ClearIESPosition", {symbol: d})
//                                    .success(function (data) {
//                                        console.log(data);
//                                    })
//                                    .error(function (data, status, headers, config) {
//                                        $rootScope.IESdata = [];
//                                        $(".loadingView").delay(400).fadeOut(150);
//                                        $state.transitionTo("dashboard.noRes");
//                                        return def.resolve([]);
//                                    });
                            localStorage.setItem("uP", JSON.stringify(dphp));
                            $rootScope.userPositions = JSON.parse(localStorage["uP"]);
                            return def.resolve("OK");
                        });
                return def.promise;
            },
            addToWL: function (s, id) {
                var def = $q.defer();
                if ($rootScope.watchlist == null || $rootScope.watchlist == "0" || $rootScope.watchlist == "null") {
                    var wl = s;
                } else {
                    var wl = $rootScope.watchlist += "," + s;
                }
                var data = {
                    id: id,
                    wl: wl
                };
                $http.post("app/php/dashboardApi.php", {act: "addToWL", data: data})
                        .success(function (d) {
                            localStorage.setItem("watchlist", d);
                            $rootScope.watchlist = d;
                            return def.resolve("OK");
                        });
                return def.promise;
            },
            removeWL: function (str) {
                var def = $q.defer();
                var data = {id: $rootScope.userId, wl: str};
                $http.post("app/php/dashboardApi.php", {act: "removeWL", data: data})
                        .success(function (d) {
                            localStorage.setItem("watchlist", d);
                            $rootScope.watchlist = str;
                            return def.resolve("OK");
                        });
                return def.promise;
            }
        };
    }]);
dashboardServices.factory("toolTip", ["$rootScope", function ($rootScope) {
        return{
            showContent: function (type) {
                /* At the top of the file you can see the  $rootScope.toolTipOn var.
                 * Use it to enable\disable tooltips.
                 */
                var content = {
                    marketCap: "This is a <b>content</b> string",
                    originalScore: "This is yet another content string."
                };
                if ($rootScope.toolTipOn == true) {
                    return content[type];
                }
            }
        };
    }]);
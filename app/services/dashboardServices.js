var dashboardServices = angular.module("dashBoardServicesModule", []);

dashboardServices.run(["dashboardFactory", "$state", "$stateParams", "$http", "$q", "$rootScope", function (dashboardFactory, $state, $stateParams, $http, $q, $rootScope) {
//    localStorage.removeItem("tracker");
//    localStorage.removeItem("userDefs");
//    localStorage.removeItem("searchHistory");

        $rootScope.$on('$stateChangeSuccess',
                function (event, toState, toParams, fromState, fromParams) {
                    var h = $(document).height();
                    $(".uberContainer").css("top", h * 0.3 + "px");
                    $(".footer").css("top", h - 18 + "px");
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
                        if (!localStorage["userDefs"]) {
                            $state.go("/");
                        } else {
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
                                var getTime = {value: "value", timestamp: new Date().getTime()};
                                localStorage.setItem("session", JSON.stringify(getTime));

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

                delete $rootScope.ls;
//                delete $rootScope.username;
//                delete $rootScope.userId;
//                delete $rootScope.userPositions;
//                delete $rootScope.watchlist;
//                delete $rootScope.sH;
//                delete $rootScope.optionsWatch;
//                delete $rootScope.clickHistory;
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
                if (s.length > 2) {
//                this.insertSearch(s);
//                this.clickHistory(s);
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
            getStock: function (s) {
                var _this = this;
                var def = $q.defer();
                var os = s;
                if (Array.isArray(s) == false) {
                    s = [s];
                }
                $http.post("../WebService/PortfolioWS.asmx/GetIESData", {symbols: s})
                        .success(function (IESdata) {
                            if (IESdata["d"].length > 0) {
                                $rootScope.$on('$stateChangeStart',
                                        function (event, toState, toParams, fromState, fromParams) {
                                            if (toState.url.split("/")[1] == "stock") {
                                                _this.insertSearch(os);
                                            }
                                        });
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
//                                        $rootScope.sH = d;
                                    }
                                });
                    }

                    if ($rootScope.sH == null || $rootScope.sH == "null") {
                        var sh = s;
                        send($rootScope.userId, sh);
                    } else {
                        var sHa = $rootScope.sH.split(",");
                        if (sHa.indexOf(s) == -1) {
                            if (sHa.length == 5) {
                                sHa.splice(4, 1);
                                sHa.unshift(s);
                                sHa = sHa.toString();
                                send($rootScope.userId, sHa);
                            } else {
                                $rootScope.sH += "," + s;
                                var sh = $rootScope.sH;
                                send($rootScope.userId, sh);
                            }
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
//                if (uP.positions.length > 0) {
//                    angular.forEach(uP.positions, function (p) {
//                        if (d.stock == p.stock) {
//                            p.position.push(d.position[0]);
//                        }
//                    });
//                } else {
                data.pos.positions.push(d);
//                }

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
                        .success(function (d) {
                            localStorage.setItem("uP", JSON.stringify(d));
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
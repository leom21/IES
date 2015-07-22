var dashboardServices = angular.module("dashBoardServicesModule", []);

dashboardServices.run(["dashboardFactory", "$state", "$stateParams", "$http", "$q", "$rootScope", "$timeout", function (dashboardFactory, $state, $stateParams, $http, $q, $rootScope, $timeout) {
        $rootScope.toolTipOn = false; //Activate or de-activate tooltips

        if (sessionStorage.logged == undefined) { //Prevent user from entering a secured page directly.
            dashboardFactory.logout();
        }

        $(".rights").mouseenter(function () {
            $(this).stop().animate({"width": "112px"}, 90).animate({"width": "131px"}, 210);
        });
        $(".rights").mouseleave(function () {
            $(this).stop().animate({"width": "41px"}, 300);
        });

        $rootScope.idleTime = 0;
        $rootScope.$on('$stateChangeSuccess',
                function (event, toState, toParams, fromState, fromParams) {
                    if (toState.data.secured) {
                        if (toState.data.secured == true) {
                            if (localStorage["userDefs"] == null || localStorage["userDefs"] == 0 || !localStorage["userDefs"] || localStorage["userDefs"] == undefined) {
                                if (fromState.name !== "") {
                                    $state.transitionTo("/");
                                }
                            } else {
                                clearInterval($rootScope.idleInterval);
                                $rootScope.idleInterval = setInterval(timerIncrement, 60000);
                                function timerIncrement() {
                                    $rootScope.idleTime = $rootScope.idleTime + 1;
                                }
                                if ($rootScope.idleTime > 29) {
                                    if (fromState.url !== "/" || fromState.url !== "^") {
                                        alert("It seems that you were inactive for the past 30 minutes or more.\n For security reasons, please login again.")
                                        dashboardFactory.logout();
                                    } else {
                                        $rootScope.idleTime = 0;
                                        clearInterval($rootScope.idleInterval);
                                    }
                                } else {
                                    $rootScope.idleTime = 0;
                                }
                            }
                        }
                    }

                    var s = toState.name.split(".");

                    //Footer games
                    $("body").css("height", h - 50 + "px");
                    var h = $(window).height();

                    if (s[0] === "/") {
                        $(".footer").hide();
                    } else {
                        $(".footer").show();
                    }

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
                                $timeout(function () {
                                    $state.go("dashboard");
                                }, 300);
                            }
                        });
            },
            logout: function () {
                $rootScope.idleTime = 0;
                clearInterval($rootScope.idleInterval);
                $state.transitionTo("/");
                localStorage.removeItem("userDefs");
                localStorage.removeItem("searchHistory");
                localStorage.removeItem("uP");
                localStorage.removeItem("watchlist");
                localStorage.removeItem("optionsWatch");
                localStorage.removeItem("cH");
                localStorage.removeItem("tracker");
                delete $rootScope.idleInterval;
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
            getStock: function (s, leg) {
                var _this = this;
                var def = $q.defer();
                var os = s;
                if (Array.isArray(s) == false) {
                    s = [s];
                }
                for(var i = 0; i<s.length; i++){
                    s[i] = decodeURIComponent(s[i]);
                }

                $http.post("../WebService/PortfolioWS.asmx/GetIESData", {symbols: s})
                        .success(function (IESdata) {
                            if (IESdata["d"].length > 0) {
                                _this.insertSearch(os);
                            } else {
                                $(".loadingView").fadeOut(250);
                            }
                            $rootScope.IESdata = IESdata["d"];
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
            getStockHistory: function (s, d, n, avg) {
                var def = $q.defer();
                $http.post("../WebService/PortfolioWS.asmx/GetIESHistoryData", {symbol: s, startDate: d, optionSymbol: n, optionAvgPrice: avg})
                        .success(function (hisData) {
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
                        var data = {id: id, q: sh, symbol: s};
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
                var ch = $rootScope.clickHistory;
//                if ($rootScope.clickHistory !== null) {
//                    var ch = $rootScope.clickHistory;
//                    if (ch[s]) {
//                        ch[s]++;
//                    } else {
//                        ch[s] = 1;
//                    }
//                } else {
//                    var ch = {};
//                    ch[s] = 1;
//                }
                var symbols = [];
                angular.forEach(ch["clickHistory"], function (item, key) {
                    symbols.push(item.symbol);
                    if (item.symbol == s) {
                        item.clicksNum++;
                        item.date = new Date().getTime();
                    }
                });

                var found = $.inArray(s, symbols);
                if (found === -1) {
                    var x = {"symbol": s, "clickNum": 1, "date": new Date().getTime()};
                    ch["clickHistory"].push(x);
                }

                ch = JSON.stringify(ch);
                var data = {id: $rootScope.userId, ch: ch};
                $http.post("app/php/dashboardApi.php", {act: "clickHistory", data: data})
                        .success(function (d) {
                            localStorage.setItem("cH", JSON.stringify(d));
                            $rootScope.clickHistory = JSON.parse(localStorage["cH"]);
                        });

            },
            clickHistoryUpdate: function () {
                var ch = $rootScope.clickHistory;
                var obj = new Object;
                obj["clickHistory"] = [];

                var arr = [];
                angular.forEach(ch, function (item, key) {
                    var prop = new Object;
                    var x = {"symbol": key, "clicksNum": item, "date": new Date().getTime()};
                    obj["clickHistory"].push(x);
                });
//                obj["clickHistory"].push(arr);
                ch = JSON.stringify(obj);
//                ch = ch.replace("]", "}");
//
//
//                var data = {id: $rootScope.userId, ch: ch};
//                $http.post("app/php/dashboardApi.php", {act: "clickHistoryUpdate", data: data})
//                        .success(function (d) {
//                            console.log(d);
//                        });
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
            getPositionData: function (symbols) {
                var def = $q.defer();
                var _this = this;
                $http.post("../WebService/PortfolioWS.asmx/GetIESPositionData", {positionsData: symbols})
                        .success(function (data) {
                            if (symbols.length === 1) {
                                var symbol = symbols[0].OptionSymbol.split(" ");
                                symbol = symbol[0];
                                console.log(symbol);
                                _this.insertSearch(symbol);
                            }
                            return def.resolve(data["d"]);
                        })
                        .error(function (data, status, headers, config) {
                            $rootScope.IESdata = [];

                            $state.transitionTo("dashboard.noRes");
                            return def.resolve([]);
                        });
                return def.promise;
            },
            /*
             * 
             * @param {string} d (symbol)
             * @param {object} o (position object)
             */
            deletePosition: function (d, o) {
                var def = $q.defer();
                var id = $rootScope.userId;
                var uP = $rootScope.userPositions;
                var data = {
                    id: id,
                    pos: uP,
                    removed: true,
                    removedPosition: o
                };

                angular.forEach(uP.positions, function (p, i) {
                    if (d == p.stock) {
                        uP.positions.splice(i, 1);
                        data.pos = uP;
                    }
                });

                $http.post("app/php/dashboardApi.php", {act: "takePosition", data: data})
                        .success(function (dphp) {
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
                    date: new Date().getTime(),
                    symbol: s,
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
            removeWL: function (str, s) {
                var def = $q.defer();
                var data = {id: $rootScope.userId, wl: str, date: new Date().getTime(), symbol: s};
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

dashboardServices.factory("utils", ["$log", "$http", "$q", "$state", "$rootScope", "$timeout", function ($log, $http, $q, $state, $rootScope, $timeout) {
        return{
            period: function (d) {
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

//                var today = new Date().getTime();
//                var timeDiff = Math.abs(d - today);
//                var diffDays = Math.floor(timeDiff / (1000 * 3600 * 24));
//                return diffDays;
            },
            pnl: function (c, e) {
                var p = ((c / e) - 1) * 100;
                var v = (Math.floor(100 * parseFloat((p).toFixed(2))) / 100);
                if (v == -0.00 || v == 0 || v == -0 || v == -0.00) {
                    return "0.00%";
                } else {
                    return (Math.floor(100 * parseFloat((p).toFixed(2))) / 100) + "%";
                }
            },
            editDate: function (d) {
                d = d.substring(0, d.length - 2);
                d = d.substring(6, d.length);
                return d;
            },
            totPnl: function (sAvgPrice, oAvgPrice, sLast, oLast) {
                var productPrice = sAvgPrice - oAvgPrice;
                var currProductPrice = sLast - oLast;
                var tot = parseFloat(((currProductPrice / productPrice) - 1) * 100);
                return (Math.floor(100 * parseFloat((tot).toFixed(2))) / 100) + "%";
            },
            pnlOptionChange: function (c, e) {
//                if (e - c > 0) {
//                    return ((Math.abs((c - e) / e) * 100) - 1).toFixed(2) + "%";
//                } else {
//                    if (((Math.abs((c - e) / e) * 100) - 1).toFixed(2) == 0.00) {
//                        return "0.00%";
//                    } else {
                //                        return "-" + ((Math.abs((c - e) / e) * 100) - 1).toFixed(2) + "%";
//                    }
                //                }
//                if (e - c > 0) {
                    var p = ((c / e) - 1) * 100;
                    var v = (Math.floor(100 * parseFloat((p).toFixed(2))) / 100);
                    if (v == -0.00 || v == 0 || v == -0 || v == -0.00) {
                        return "0.00%";
                    } else {
                        return (Math.floor(100 * parseFloat((p).toFixed(2))) / 100) + "%";
                    }
//                }
            }, getDate: function (date) {
                var date = new Date(date);
                var day = date.getDate();
                var month = date.getMonth();
                var year = date.getFullYear();
                var hour = date.getHours();
                var minute = date.getMinutes();
                var second = date.getSeconds();
                var time = month + 1 + "/" + day + "/" + year + " " + hour + ':' + minute + ':' + second;
                return time;
            }
        };
    }]);
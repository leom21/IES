var adminCtrl = angular.module("adminCtrls", ["adminServices"]);

adminCtrl.controller("adminCtrl", function ($rootScope, $scope, $state, adminFactory) {
    $scope.adminLoginF = function (f) {
        adminFactory.login($scope.username, $scope.password)
                .then(function (d) {
                    if (d == "VARIFIED") {
                        $state.go("control");
                    }
                });
    };
});

adminCtrl.controller("ctrlCtrl", function ($rootScope, $scope, $state, adminFactory) {
    adminFactory.getAllUsers().then(function (d) {
        $rootScope.admins = d.admins;
        $rootScope.users = d.users;
    });

    function resetForm() {
        $("input[name='editName']").val("");
        $("input[name='editUsername']").val("");
        $("input[name='editPassword']").val("");
        $("input[name='editEmail']").val("");
    }

    $scope.closeUserEdit = function () {
        $(".editUser").fadeOut(100);
        $(".black").fadeOut(200);
        resetForm();
    };

    $scope.editUserF = function (f) {
        var data = {
            id: $scope.currUser.id,
            name: $("input[name='editName']").val(),
            username: $("input[name='editUsername']").val(),
            password: $("input[name='editPassword']").val(),
            email: $("input[name='editEmail']").val(),
            key: $scope.currUser.$$hashkey,
            admin: $scope.currUser.admin
        };

        adminFactory.editUser(data).then(function (d) {
            $rootScope.admins = d.admins;
            $rootScope.users = d.users;
            resetForm();
            $(".editUser").fadeOut(100);
            $(".black").fadeOut(200);
        });
    };

    $scope.aa = function (admin) {
        $scope.currUser = "";
        if (admin == 1) {
            $rootScope.action = "Add new admin";
        } else {
            $rootScope.action = "Add new user";
        }
        $(".editUser").fadeIn(300);
        $(".black").fadeIn(300);
        $scope.editUserF = function (f) {
            var data = {
                name: $("input[name='editName']").val(),
                username: $("input[name='editUsername']").val(),
                password: $("input[name='editPassword']").val(),
                email: $("input[name='editEmail']").val(),
                admin: admin
            };

            adminFactory.addUser(data).then(function (d) {
                $rootScope.admins = d.admins;
                $rootScope.users = d.users;
                resetForm();
                $(".editUser").fadeOut(100);
                $(".black").fadeOut(200);
            });
        };
    };

    $scope.optionPick = function (e, u) {
        $rootScope.currUser = u;
        $("input[name='editName']").val(u.name);
        $("input[name='editUsername']").val(u.username);
        $("input[name='editPassword']").val(u.password);
        $("input[name='editEmail']").val(u.email);
        switch (e) {
            case "Edit":
                $rootScope.action = "Edit ";
                $(".editUser").fadeIn(300);
                $(".black").fadeIn(300);
                break;
            case "Delete":
                var c = window.confirm("Are you sure you want to delete this user?");
                if (c == true) {
                    adminFactory.deleteUser(u.id).then(function (d) {
                        $rootScope.admins = d.admins;
                        $rootScope.users = d.users;
                        resetForm();
                    });
                }
                break;
            case "Block":
                var c = window.confirm("Are you sure you want to block this user?");
                if (c == true) {
                    adminFactory.blockUser(u.id).then(function (d) {
                        $rootScope.admins = d.admins;
                        $rootScope.users = d.users;
                        resetForm();
                    });
                }
                break;
            case "Unblock":
                var c = window.confirm("Are you sure you want to unblock this user?");
                if (c == true) {
                    adminFactory.unblockUser(u.id).then(function (d) {
                        $rootScope.admins = d.admins;
                        $rootScope.users = d.users;
                        resetForm();
                    });
                }
                break;
            case "Statistics":
                console.log($rootScope.currUser);
                $rootScope.statsUser = u;
                if (u.ips == null) {
                    alert("No data available yet!");
                    $rootScope.currUser = undefined;
                } else {
                    $rootScope.active = "yes";
                    $(".userStats").fadeIn(200);
                    $(".black").fadeIn(200);
                }
                break;
        }
    };
});

adminCtrl.directive("userStats", function ($rootScope, $http) {
    return {
        retrict: "E",
        replace: false,
        templateUrl: "app/views/userStats.html",
        scope: {user: '=user', active: '=active'},
        link: function (scope, element, attrs) {
            var data = [];

            scope.$watch("user", function (oldValue, newValue) {
                if (oldValue !== undefined) {
                    scope.name = scope.user.name;
                    var ips = scope.user.ips;
                    scope.numIps = ips.split(",");
                    scope.ips = scope.user.ips;

                    var d = {
                        key: "Stocks",
                        values: []
                    };

                    var cH = JSON.parse(scope.user.clickHistory);
                    angular.forEach(cH, function (c, k) {
                        if (c > 0) {
                            var tmp = {"label": k, "value": c};
                            d.values.push(tmp);
                        }
                    });
                    data.push(d);

                    nv.addGraph(function () {
                        var chart = nv.models.discreteBarChart()
                                .x(function (d) {
                                    return d.label
                                })
                                .y(function (d) {
                                    return d.value
                                })
                                .staggerLabels(true)
                                .tooltips(false)
                                .showValues(true);

                        chart.height(400);

                        d3.select(element.find("svg")[0])
                                .datum(data)
                                .call(chart);

//                        nv.utils.windowResize(chart.update);

                        return chart;
                    });
                }

            });

            scope.closeStats = function () {
                $rootScope.currUser = undefined;
                data = [];
                $(".userStats").fadeOut(200);
                $(".black").fadeOut(200);
            };
        }
    };
});
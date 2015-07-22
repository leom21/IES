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

adminCtrl.controller("ctrlCtrl", function ($rootScope, $scope, $state, adminFactory, adminParser) {
    adminFactory.getAllUsers().then(function (d) {
        $rootScope.admins = d.admins;
        $rootScope.users = d.users;
    });

    function resetForm() {
        $("input[name='editName']").val("");
        $("input[name='editUsername']").val("");
        $("input[name='editPassword']").val("");
        $("input[name='editEmail']").val("");
        delete $rootScope.currUser;
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

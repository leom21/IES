var adminServices = angular.module("adminServices", []);

adminServices.factory("adminFactory", function ($rootScope, $http, $q, $state) {
    return{
        login: function (un, pwd) {
            var def = $q.defer();
            var data = {un: un, pwd: pwd};

            $http.post("app/php/adminApi.php", {act: "adminLogin", data: data})
                    .success(function (d) {
                        if (d == "NO_USER") {
                            $("#warning").text("Wrong username");
                        }
                        else if (d == "WRONG_PWD") {
                            $("#warning").text("Wrong password");
                        } else {
                            $("#warning").text("");
                            sessionStorage.logged = true;
                            return def.resolve("VARIFIED");
                        }
                    });
            return def.promise;
        },
        getAllUsers: function () {
            var def = $q.defer();
            $http.post("app/php/adminApi.php", {act: "getAllUsers"})
                    .success(function (d) {
                        console.log(d);
                        var admins = [];
                        var users = [];
                        angular.forEach(d, function (row) {
                            if (row.admin == 1) {
                                admins.push(row);
                            } else {
                                users.push(row);
                            }
                        });
                        return def.resolve({admins: admins, users: users});
                    });
            return def.promise;
        },
        addUser: function (data) {
            var def = $q.defer();
            $http.post("app/php/adminApi.php", {act: "addUser", data: data})
                    .success(function (d) {
                        var admins = [];
                        var users = [];
                        angular.forEach(d, function (row) {
                            if (row.admin == 1) {
                                admins.push(row);
                            } else {
                                users.push(row);
                            }
                        });
                        return def.resolve({admins: admins, users: users});
                    });
            return def.promise;
        },
        editUser: function (data) {
            var def = $q.defer();
            $http.post("app/php/adminApi.php", {act: "editUser", data: data})
                    .success(function (d) {
                        var admins = [];
                        var users = [];
                        angular.forEach(d, function (row) {
                            if (row.admin == 1) {
                                admins.push(row);
                            } else {
                                users.push(row);
                            }
                        });
                        return def.resolve({admins: admins, users: users});
                    });
            return def.promise;
        },
        deleteUser: function (data) {
            var data = {id: data};
            var def = $q.defer();
            $http.post("app/php/adminApi.php", {act: "deleteUser", data: data})
                    .success(function (d) {
                        var admins = [];
                        var users = [];
                        angular.forEach(d, function (row) {
                            if (row.admin == 1) {
                                admins.push(row);
                            } else {
                                users.push(row);
                            }
                        });
                        return def.resolve({admins: admins, users: users});
                    });
            return def.promise;
        },
        blockUser: function (data) {
            var data = {id: data};
            var def = $q.defer();
            $http.post("app/php/adminApi.php", {act: "blockUser", data: data})
                    .success(function (d) {
                        var admins = [];
                        var users = [];
                        angular.forEach(d, function (row) {
                            if (row.admin == 1) {
                                admins.push(row);
                            } else {
                                users.push(row);
                            }
                        });
                        return def.resolve({admins: admins, users: users});
                    });
            return def.promise;
        },
        unblockUser: function (data) {
            var data = {id: data};
            var def = $q.defer();
            $http.post("app/php/adminApi.php", {act: "unblockUser", data: data})
                    .success(function (d) {
                        var admins = [];
                        var users = [];
                        angular.forEach(d, function (row) {
                            if (row.admin == 1) {
                                admins.push(row);
                            } else {
                                users.push(row);
                            }
                        });
                        return def.resolve({admins: admins, users: users});
                    });
            return def.promise;
        }
    };
});
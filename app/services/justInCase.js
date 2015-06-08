if (localStorage["tracker"] == undefined) {
} else {
    if ($rootScope.searchHistory !== null && $rootScope.searchHistory !== "") {
        if (localStorage["tracker"] !== undefined && localStorage["tracker"] !== "") {
            $rootScope.clickHistory = JSON.parse(localStorage["tracker"]);
        }
        var x = $rootScope.searchHistory.split(",");
        var hArr = [];

        angular.forEach(x, function (i) {
            hArr.push({q: i});
        });
        $rootScope.searchHistory = hArr;
    } else {
        $rootScope.searchHistory = [];
    }
}
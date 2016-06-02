angular
    .module('app', ['git-card'])
    .controller('ctrl', function($scope, $location) {

        var query = $location.absUrl().split("get?")[1];
        $scope.user = query.split("user=")[1].split("&")[0];
        $scope.repo = query.split("repo=")[1];

    });
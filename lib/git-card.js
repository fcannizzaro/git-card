/* 
   Francesco Cannizzaro (fcannizzaro)
   https://github.com/fcannizzaro/git-card
*/

const card_colors = [
    "#F44336", "#E91E63", "#9C27B0", "#673AB7",
    "#3F51B5", "#2196F3", "#009688", "#00BCD4",
    "#03A9F4", "#4CAF50", "#7CB342", "#EF6C00",
    "#FF5722", "#795548", "#607D8B"
];

angular
    .module('git-card', [])
    .constant('MODULE_VERSION', '0.1.0')
    .directive('gitCard', function($http) {

        const raw = "https://raw.githubusercontent.com/{{user}}/{{repo}}/master/README.md";
        const regex = /<!--([\S\s]*)-->/;
        const property = /([^:]*):\s?(.*)/;

        function isBoolean(str) {
            return str == 'true' ? true : str == 'false' ? false : str;
        }

        return {

            scope: {
                user: '@',
                repo: '@'
            },

            restrict: 'AE',

            template: '<div class="github-card" style="width: {{card.card_width}}px;"><div class="github-cover" style=" background-color: {{card.color}}; background-image: url(\'{{card.cover}}\'); height: {{card.cover_height}}px"><div ng-if="card.cover" class="github-overlay"></div><div class="github-username">{{user}}</div></div><img ng-if="github.avatar" class="github-avatar" src="{{github.avatar}}" style="top: {{card.avatar_top}}px"><div ng-click="follow()" ng-if="github.avatar" class="github-avatar github-follow" title="Follow" style="background-color: {{card.color}}; top: {{card.avatar_top}}px "><span class="mega-octicon octicon-person"></span></div><div class="github-content"><div ng-click="openRepo()" class="github-title">{{card.title}}</div><small>last update {{github.update}}</small><div class="github-description">{{card.description}}</div><div class="github-end"><div class="github-left-buttons"><div ng-if="card.clone" ng-click="clone(false)" class="github-clone" style="background-color:{{card.color}}"> CLONE</div><div ng-if="card.clone" ng-click="clone(true)" class="github-clone github-ssh">SSH</div></div><div ng-if="github" class="github-buttons"><div ng-if="card.counter_watchers" title="Watchers" ng-click="open(\'watchers\')" class="github-button"><span class="octicon octicon-eye"></span><span>{{github.watchers}}</span></div><div ng-if="card.counter_stargazers" title="Stargazers" ng-click="open(\'stargazers\')" class="github-button"><span class="octicon octicon-star"></span><span>{{github.stars}}</span></div><div ng-if="card.counter_forks" title="Forks" ng-click="open(\'network\')" class="github-button"><span class="octicon octicon-repo-forked"></span><span>{{github.forks}}</span></div><div ng-if="card.counter_issues" title="Issues" ng-click="open(\'issues\')" class="github-button"><span class="octicon octicon-issue-opened"></span><span>{{github.issues}}</span></div></div></div></div></div>',

            link: function($scope, element, attrs) {

                var url = raw.replace("{{user}}", $scope.user).replace("{{repo}}", $scope.repo);

                // default card
                $scope.card = {
                    cover_height: 120,
                    card_width: 400,
                    avatar_top: 85,
                    clone: true,
                    counter_stargazers: true,
                    counter_forks: true,
                    counter_issues: true,
                    counter_watchers: true,
                    color: 'none'
                };

                $scope.github;

                $scope.getInfo = function() {

                    var url = "https://api.github.com/repos/" + $scope.user + "/" + $scope.repo;

                    $http
                        .get(url)
                        .then(function successCallback(response) {

                            var data = response.data;

                            if (!data.name)
                                return;

                            $scope.user = data.owner.login;

                            $scope.github = {
                                forks: data.forks_count,
                                clone: data.clone_url,
                                ssh: data.ssh_url,
                                stars: data.stargazers_count,
                                watchers: data.subscribers_count,
                                issues: data.open_issues,
                                avatar: data.owner.avatar_url,
                                repoUrl: data.html_url,
                                update: data.updated_at.split("T")[0]
                            };

                            if (!$scope.card.description)
                                $scope.card.description = data.description;

                            if (!$scope.card.title)
                                $scope.card.title = data.name;

                        });

                }

                $scope.clone = function(bool) {
                    window.prompt("Copy to clipboard: Ctrl+C, Enter", bool ? $scope.github.ssh : $scope.github.clone);
                }

                $scope.follow = function() {
                    window.open('http://github.com/' + $scope.user);
                }

                $scope.open = function(page) {
                    window.open('http://github.com/' + $scope.user + '/' + $scope.repo + '/' + page);
                }

                $scope.openRepo = function() {
                    window.open($scope.github.repoUrl);
                }

                $scope.parse = function(response) {

                    var card = regex.exec(response.data);

                    if (card && (card = card[1])) {

                        var lines = card.split("\n");

                        for (var line in lines) {

                            var match = property.exec(lines[line]);

                            if (match) {

                                var key = match[1].trim();

                                $scope.card[key] = isBoolean(match[2].trim());

                                if (key == 'cover_height') {
                                    $scope.card[key] = parseInt($scope.card[key]);
                                    $scope.card.avatar_top = $scope.card[key] - 35;
                                }

                            }

                        }

                    }

                    $scope.finally();

                }

                $scope.finally = function() {

                    if ($scope.card.cover) {
                        $scope.card.cover_height = 220;
                        $scope.card.avatar_top = 185;
                    }

                    if ($scope.card.color == 'none')
                        $scope.card.color = card_colors[Math.ceil(Math.random() * (card_colors.length - 1))];

                }

                $http.get(url).then($scope.parse, $scope.finally);
                $scope.getInfo();

            }
        };
    });
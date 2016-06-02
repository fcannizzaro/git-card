angular
    .module('app', ['git-card'])
    .run(['$anchorScroll',
        function($anchorScroll) {
            $anchorScroll.yOffset = -80; // always scroll by 50 extra pixels
        }
    ])
    .controller('ctrl', function($scope, $location, $anchorScroll, $http, $compile) {

        $scope.step = 0;

        $scope.card = {
            cover_height: 120,
            card_width: 400,
            avatar_top: 85,
            clone: true,
            counter_stargazers: true,
            counter_forks: true,
            counter_issues: true,
            counter_watchers: true,
            color: card_colors[Math.ceil(Math.random() * (card_colors.length - 1))]
        };

        $scope.github;

        $scope.repos = [];

        $scope.update = function() {

            var card = $compile("<git-card id='card' user='" + $scope.user + "' repo='" + $scope.repo + "'></git-card>")($scope);
            angular
                .element(document.getElementById('card'))
                .replaceWith(card);

            $scope.goto('directive');

        }

        $scope.goto = function(x) {
            var newHash = x;
            if ($location.hash() !== newHash)
                $location.hash(x);
            else
                $anchorScroll();
        };

        $scope.$watch('card.cover_height', function(v) {
            $scope.card.avatar_top = $scope.card.cover_height - 35;
        });

        $scope.setRepo = function(repo) {
            $scope.repo = repo;
            $scope.step = 2;
            $scope.update();
            $scope.getInfo();
        }

        $scope.getRepos = function() {

            var url = "https://api.github.com/users/" + $scope.user + "/repos";

            $http
                .get(url)
                .then(function successCallback(response) {

                    var data = response.data;

                    $scope.step = 1;
                    $scope.repos = [];

                    for (var i = 0; i < data.length; i++)
                        $scope.repos.push(data[i].name);

                    $scope.goto('repos');

                });

        }

        $scope.getInfo = function() {

            $scope.github = undefined;

            var url = "https://api.github.com/repos/" + $scope.user + "/" + $scope.repo;

            $http
                .get(url)
                .then(function successCallback(response) {

                    var data = response.data;

                    if (!data.name)
                        return;

                    $scope.user = data.owner.login;

                    $scope.github = {
                        title: data.name,
                        description: data.description,
                        forks: data.forks_count,
                        clone: data.clone_url,
                        ssh: data.ssh_url,
                        stars: data.stargazers_count,
                        watchers: data.subscribers_count,
                        issues: data.open_issues,
                        avatar: data.owner.avatar_url,
                        update: data.updated_at.split("T")[0]
                    };

                    $scope.card.description = data.description;
                    $scope.card.title = data.name;

                });

        }


    });
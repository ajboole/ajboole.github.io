(function () {
    "use strict";
    angular.module("smhiApp").controller("HomeController", function ($scope)
    {
        $scope.GenerateChart = function ()
        {
            var chart = c3.generate(
            {
                bindto: '#chart1',
                data:
                {
                    columns:
                    [
                      ['data1', 30, 200, 100, 400, 150, 250],
                      ['data2', 50, 20, 10, 40, 15, 25]
                    ]
                }
            });
        }
    });
}());

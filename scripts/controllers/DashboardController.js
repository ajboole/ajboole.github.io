(function ()
{
    "use strict";
    var app = angular.module("Dashboard", ["ngResource", "service", "Constants", "angucomplete-alt"]);

    app.directive('onFinishRender', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                if (scope.$last === true) {
                    $timeout(function () {
                        scope.$emit('ngRepeatFinished');
                    });
                }
            }
        }
    });

    app.controller("DashboardController", function ($rootScope, $scope, $timeout, $interval, WebService, ChartingService, Values)
    {
        var ticker;

        $scope.Initialize = function ()
        {
            if ($rootScope.Initialized == null)
            {
                var files = WebService.GetAvailableFiles();
				alert(sessionStorage.SelectedFile);

                files.get(function (data) {
                    var records = data.DataFiles;

                    if (records != null) {
                        $rootScope.Files = [];

                        for (var i = 0; i < records.length; i++) {
                            $rootScope.Files.push({ name: records[i].FileName });
                        }
                    }
					
					if(sessionStorage.SelectedFile != null)
					{
						 $rootScope.SelectedFile = $rootScope.Files[0].name;
						 sessionStorage.SelectedFile = $rootScope.Files[0].name;
					}
					else
					{
						$rootScope.SelectedFile = sessionStorage.SelectedFile;
					}

                    $scope.Display();
                });

                $rootScope.Initialized = true;
            }
        }

        $scope.Refresh = function()
        {
            var def = Values.DefaultValue;
            $interval.cancel($rootScope.Ticker);

            $rootScope.Data = [];
            $rootScope.UpdateData = def;
            $rootScope.LatestUpdate = def;
            $rootScope.TimeSinceLatestUpdate = def;
            $rootScope.Status = def;
            $rootScope.RecentStatuses = [];
        }

        $scope.Display = function()
        {
            $scope.Refresh();

            var updateResults = WebService.GetLastNumberOfUpdates($rootScope.SelectedFile, Values.UpdatesWanted).then(function (upData) {
                upData.get(function (data) {
                    var records = data.records;

                    if (records.length != null) {
                        var result = [];
                        var limit = records.length > Values.UpdatesWanted ? Values.UpdatesWanted : records.length;

                        for (var i = 0; i < limit; i++) {
                            var record = records[i];
                            result.push(record.TimeStamp.split('.')[0]);
                        }

                        $rootScope.UpdateData = result;

                        var parser = d3.time.format("%Y-%m-%d %H:%M:%S").parse;
                        var recentDate = new Date(parser(result[0]));

                        if (recentDate != null)
                        {
                            $rootScope.LatestUpdate = recentDate;
                            $rootScope.TimeSinceLatestUpdate = $scope.GetTimeSinceLastUpdate(recentDate);
                        }
                    }
                    else
                    {
                        alert("Error " + records.ecode + " - " + records.estring);
                    }
                });
            });

            var recentStatus = WebService.GetMostRecentStatus($rootScope.SelectedFile);

            recentStatus.get(function (data) 
            {
                if (data.records != null)
                {  
                    $rootScope.Status = data.records[0].Data;    
                }
            });

            var recentFourStatuses = WebService.GetNumberEntriesByKey($rootScope.SelectedFile, "model_state", 4);

            recentFourStatuses.get(function (data) {
                if (data.records != null)
                {
                    for(var i = 0; i < data.records.length; i++)
                    {
                        $rootScope.RecentStatuses[i] = data.records[i].Data;
                    }
                }
            });

            var keysResult = WebService.GetKeysInFile($rootScope.SelectedFile);

            keysResult.get(function (data) {
                var records = data.records;

                if (records != null) {
                    var result = [];
                        
                    for(var i = 0; i < records.length; i++) {
                        var record = records[i];
                        result.push(record.key);
                    }

                    $scope.GatherData(result.sort());
                }
            });
        }

        $scope.GatherData = function (keys) {
            var panels = [];

            for(var i = 0; i < keys.length; i++)
            {
                var key = keys[i];

                var dataResults = WebService.GetNumberEntriesByKey($rootScope.SelectedFile, key, Values.EntriesWanted);
                dataResults.get(function (data) {
                    var records = data.records;

                    if (records != null) {
                        
                        var data = [];
                        var times = [];

                        for (var j = 0; j < records.length; j++) {
                            var record = records[j];
                            data.push(record.Data);
                            times.push(record.TimeStamp);
                        }

                        if (data.length > 0 && !isNaN(data[0]))
                        {
                            var id = $rootScope.Data.length + 1;
                            $rootScope.Data.push({ Data: data, Time: times, ID: "chart" + id, Name: records[0].DisplayName });
                        }
                    }
                });
            }
        }

        $scope.GenerateChart = function (type, id) {
            var index = parseInt(id.substring(5)) - 1;

            if (type == 'area') {
                angular.element(document.getElementById(id + "Line"))[0].disabled = true;
                angular.element(document.getElementById(id + "Bar"))[0].disabled = false;
            }
            else if (type == 'bar') {
                angular.element(document.getElementById(id + "Bar"))[0].disabled = true;
                angular.element(document.getElementById(id + "Line"))[0].disabled = false;
            }

            var vals = $rootScope.Data[index].Data;
            var tms = $rootScope.Data[index].Time;

            var parsedTimes = ['time'];
            var values = [$rootScope.Data[index].Name];

            var parser = d3.time.format("%Y-%m-%d %H:%M:%S").parse;

            for (var i = 0; i < tms.length; i++) {
                var tm = tms[i].split('.')[0];
                parsedTimes.push(parser(tm));
                values.push(vals[i]);
            }

            ChartingService.MakeTimeSeriesChart(parsedTimes, values, "#" + id, type);
        }

        $scope.SelectFile = function (file)
        {
            if (file != null)
            {
                $rootScope.SelectedFile = file.title;
                $scope.Display();
            }
        }

        $scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
            var data = $rootScope.Data;

            for (var i = 0; i < data.length; i++) {
                $scope.GenerateChart('area', data[i].ID)
            }

            if ($rootScope.TimeSinceLatestUpdate != "No Data")
            {
                $rootScope.Ticker = $interval(function () {
                    $rootScope.TimeSinceLatestUpdate = $scope.GetTimeSinceLastUpdate($rootScope.LatestUpdate);
                }, 1000);
            }

            //var refresh = Values.RefreshInterval * 1000;

            //$interval(function () {
            //    $scope.Display();
            //}, refresh);
        });

        $scope.GetTimeSinceLastUpdate = function(recentDate)
        {
            var currentDate = new Date();

            var msSince = (currentDate - recentDate);
            var sSince = (msSince / 1000);
            var remaining = sSince;

            var daysSince = Math.floor(remaining / 86400);
            remaining = remaining % 86400;

            var hoursSince = Math.floor(remaining / 3600);
            remaining = remaining % 3600;

            var minutesSince = Math.floor(remaining / 60);
            remaining = remaining % 60;

            var secondsSince = Math.floor(remaining);

            var days = daysSince < 10 ? "0" + daysSince : daysSince;
            var hours = hoursSince < 10 ? "0" + hoursSince : hoursSince;
            var minutes = minutesSince < 10 ? "0" + minutesSince : minutesSince;
            var seconds = secondsSince < 10 ? "0" + secondsSince : secondsSince;

            if (isNaN(days) | isNaN(hours) | isNaN(minutes) | isNaN(seconds))
            {
                return Values.DefaultValue;
            }
            else
            {
                return days + "\n\n" + hours + "\n\n" + minutes + "\n\n" + seconds;
            }
        }

        $scope.Initialize();
    });
}());
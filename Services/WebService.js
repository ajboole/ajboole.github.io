var app = angular.module("service");

app.service('WebService', ["$resource", "$timeout", "$q", "ApiCalls", function ($resource, $timeout, $q, ApiCalls) 
{
    this.GetEntriesByKey = function (file, key) {
        var deferred = $q.defer();
        var call = ApiCalls.getData + "&datafile=" + file + "&datakey=" + key;

        $timeout(function () {
            deferred.resolve($resource(call));
        });

        return deferred.promise;
    }

    this.GetMostRecentStatus = function (file) {
        var call = ApiCalls.getStatus + "&datafile=" + file;
        return $resource(call);
    }

    this.GetNumberEntriesByKey = function (file, key, number) {
        var call = ApiCalls.getData + "&datafile=" + file + "&datakey=" + key + "&samplecount=" + number;
        return $resource(call);
    }

    this.GetLastNumberOfUpdates = function (file, number)
    {
        var deferred = $q.defer();
        var call = ApiCalls.getData + "&datafile=" + file + "&datakey=model_date&samplecount=" + number;

        $timeout(function () {
            deferred.resolve($resource(call));
        });

        return deferred.promise;
    }

    this.GetKeysInFile = function (file) {
        var call = ApiCalls.getKeys + "&datafile=" + file;
        return $resource(call);
    }

    this.GetLastStatus = function (file) {
        ApiCalls.getStatus + "&datafile=" + file
        return $resource(call);
    }

    this.GetAvailableFiles = function () {
        var call = ApiCalls.getFiles;
        return $resource(call);
    }
}]);
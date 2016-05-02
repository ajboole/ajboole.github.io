(function () {
    "use strict";
    angular.module("smhiApp").factory("GetUMaxEntries",
        [
            "$resource",
            "appSettings",
            GetUMaxEntries
        ])

    function GetUMaxEntries($resource, appSettings)
    {
        return $resource(appSettings.serverPath + "&datakey=u_max");
    }
}());
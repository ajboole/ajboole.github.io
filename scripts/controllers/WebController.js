(function () {
    "use strict";
    angular.module("smhiApp").controller("WebController", ["productResource", MakeRequest]);

    function MakeRequest(productResource)
    {
        var cnt = this;

        productResource.get(function (data)
        {
            var result = [];
            var records = data.records;

            for (var i = 0; i < records.length; i++)
            {
                result.push(records[i].TimeStamp)
            }

            cnt.data = result;
        });
    }
}());
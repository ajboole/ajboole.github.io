var app = angular.module("Constants", []);

app.constant("ApiCalls", (function()
{
    //old serverPath
    //var serverPath = "http://students.cs.ndsu.nodak.edu/~jonwalke/API";
    var serverPath = "http://79.125.114.170/API";

    return {
        getData: serverPath + "/Data/GetData.php?",
        getFiles: serverPath + "/Status/GetFilesInConf.php",
        getStatus: serverPath + "/Status/GetStatus.php?",
        getKeys: serverPath + "/Data/GetKeys.php?"
    }
})());

app.constant("Values",
{
    RefreshInterval: 10,            //Seconds before page will automatically refresh
    EntriesWanted: 20,              //Number of entries taken when making call to API
    UpdatesWanted: 5,               //Number of recent updates to pull from API
    DefaultString: "No Data"        //Value displayed when no data is found
});
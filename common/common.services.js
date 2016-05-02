(function () {
	"use strict";
	var app = angular.module("smhiApp", ["ngResource"])
		.constant("appSettings",
		{
			serverPath: "http://students.cs.ndsu.nodak.edu/~jonwalke/API/Data/GetData.php?format=json"
		});
}());
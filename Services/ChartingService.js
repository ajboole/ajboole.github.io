var app = angular.module("service");

app.service('ChartingService', function ()
{
    this.MakeTimeSeriesChart = function (times, values, bind, type)
    {
        var max = Number.MIN_VALUE;
        var min = Number.MAX_VALUE;

        for (var i = 1; i < values.length; i++)
        {
            var value = parseFloat(values[i]);

            if(value > max)
            {
                max = value;
            }

            if(value < min)
            {
                min = value;
            }
        }

        var range = max - min;
        var bias = range * .1;

        var trueMax = max + bias;
        var trueMin = min - bias;

        trueMin = trueMin < 0 ? 0 : trueMin;

        var chart = c3.generate(
        {
            bindto: bind,
            data:
            {
                x: 'time',
                columns: [times, values],
                type: type
            },
            axis:
            {
                x:
                {
                    type: 'timeseries',
                    tick:
                    {
                        format: '%Y-%m-%d \n %I:%M:%S',
                        culling:
                        {
                            max: 4
                        },
                        centered: true
                    },
                },
                y:
                {
                    max: trueMax,
                    min: trueMin,
                }
            }
        });
    }
});
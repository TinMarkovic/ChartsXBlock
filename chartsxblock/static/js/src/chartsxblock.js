/* Javascript for ChartsXBlock. */
var chartData, chartType, chartName;
var target;

function ChartsXBlock(runtime, element, data) {
    $(function ($) {
        chartData = data.chartData;
        chartType = data.chartType;
        chartName = data.chartName;
        target = $(element).find(".chart")[0];

        // Loading Google's chart library - but only if it's not loaded already.
        try{
            drawChart();
        } catch(e){
            if(e instanceof TypeError){
                google.charts.load('current', {'packages':['corechart']});
                google.charts.setOnLoadCallback(drawChart);
            } else throw e;
        }
    });
}

function drawChart() {
    var data = google.visualization.arrayToDataTable(JSON.parse(chartData), false);
    var options = {'title': chartName, is3D: true};
    switch(chartType) {
        case "Pie":
            var chart = new google.visualization.PieChart(target);
            break;
        case "Line":
            var chart = new google.visualization.LineChart(target);
            break;
        case "Column":
            var chart = new google.visualization.ColumnChart(target);
            break;
        case "Area":
            var chart = new google.visualization.AreaChart(target);
            break;
        case "Scatter":
            var chart = new google.visualization.ScatterChart(target);
            break;
        case "Scatter":
            var chart = new google.visualization.ScatterChart(target);
            break;
        case "Bar":
            var chart = new google.visualization.BarChart(target);
            break;
    }

    chart.draw(data, options);
}
/* Javascript for ChartsXBlock-Studio. */
var chartTypes;

function ChartsXBlockStudio(runtime, element, data) {
    $(function ($) {
        chartTypes = data.chartTypes;
    });
    $(element).find(".updateButton").click(function(){
        try{
            runtime.notify('save', {state: 'start'});
            cleanType = ValidateType($(element).find(".chart_type").val());
            cleanName = ValidateName($(element).find(".chart_name").val());
            cleanData = ValidateData($(element).find(".chart_data").val());
            var handlerUrl = runtime.handlerUrl(element, 'edit_data');

            $.ajax({
                type: "POST",
                url: handlerUrl,
                data: JSON.stringify({name: cleanName, type: cleanType, data: cleanData}),
                success: function(){ runtime.notify('save', {state: 'end'});
                }
            });
        } catch (e) {
            console.log("Error with stack trace: \n", e);
            showError(runtime, e );
        }
    });
}

function showError(runtime, errorMsg) {
    runtime.notify('error', {msg: errorMsg});
}

function BadChartError(message) {
    this.message = message;
    // Use V8's native method if available, otherwise fallback
    if ("captureStackTrace" in Error)
        Error.captureStackTrace(this, BadChartError);
    else
        this.stack = (new Error()).stack;
}

BadChartError.prototype = Object.create(Error.prototype);
BadChartError.prototype.name = "Bad Chart Error";
BadChartError.prototype.constructor = BadChartError;

function size(ar){
    var row_count = ar.length;
    var row_sizes = []
    for(var i=0;i<row_count;i++){
        row_sizes.push(ar[i].length)
    }
    if(Math.min.apply(null, row_sizes) != Math.max.apply(null, row_sizes))
        throw new BadChartError("All chart rows are not equal length.")
    return [row_count, Math.min.apply(null, row_sizes)]
}

function ValidateData(inputString) {
    try {
        parsedString = JSON.parse(inputString);
    } catch (e) {
        throw e;
    }
    chartDimensions = size(parsedString);
    if (chartDimensions[0] < 2) throw new BadChartError("Only one row is present in the chart.")
    return inputString;
}

function ValidateType(inputString) {
    if(chartTypes.indexOf(inputString) == -1 ) throw new BadChartError("Using an unsupported chart type.");

    return inputString;
}

function ValidateName(inputString) {
    if(inputString.length < 1) throw new BadChartError("Chart name is empty.");

    return inputString;
}

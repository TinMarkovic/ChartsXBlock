/* Javascript for ChartsXBlock-Studio. */
function ChartsXBlockStudio(runtime, element, data) {
    $(function ($) {
    });
    $("#updateButton").click(function(){
        console.log("Click");
        try{
            runtime.notify('save', {state: 'start'});
            cleanType = ValidateType($("#chart_type").val());
            cleanName = ValidateName($("#chart_name").val());
            cleanData = ValidateData($("#chart_data").val());
            var handlerUrl = runtime.handlerUrl(element, 'edit_data');

            $.ajax({
                type: "POST",
                url: handlerUrl,
                data: JSON.stringify({name: cleanName, type: cleanType, data: cleanData}),
                success: function(){ runtime.notify('save', {state: 'end'});
                }
            });
        } catch (e) {
            console.log("Error: \n", e);
            runtime.notify('cancel', {});
        }
    });
}

/*
TODO: Implement validation of chart before sending it off. (finish this)
function BadChartError(message) {
    this.message = message;
    // Use V8's native method if available, otherwise fallback
    if ("captureStackTrace" in Error)
        Error.captureStackTrace(this, BadChartError);
    else
        this.stack = (new Error()).stack;
}

BadChartError.prototype = Object.create(Error.prototype);
BadChartError.prototype.name = "BadChartError";
BadChartError.prototype.constructor = BadChartError;

function size(ar){
    var row_count = ar.length;
    var row_sizes = []
    for(var i=0;i<row_count;i++){
        row_sizes.push(ar[i].length)
    }
    if(Math.min.apply(null, row_sizes) != Math.max.apply(null, row_sizes)) throw new BadChartError("")
    return [row_count, Math.min.apply(null, row_sizes)]
}
*/

function ValidateData(inputString) {
    //TODO
    try {
        parsedString = JSON.parse(inputString);
    } catch (e) {
        throw e;
    }
    return inputString;
}

function ValidateType(inputString) {
    //TODO
    return inputString;
}

function ValidateName(inputString) {
    //TODO
    return inputString;
}

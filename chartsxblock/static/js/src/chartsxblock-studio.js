/* Javascript for ChartsXBlock-Studio. */
function ChartsXBlockStudio(runtime, element, data) {
    var chart, chartTypes;

    $(function ($) {
        chartTypes = data.chartTypes;
        chart = new ChartTable($(".chartsxblock_table"), data.chartData);
        chart.draw();
        $("td").makeEditable();
    });

    $(element).find(".updateButton").click(function(){
        try{
            runtime.notify('save', {state: 'start'});
            cleanType = ValidateType($(element).find(".chart_type").val(), chartTypes);
            cleanName = ValidateName($(element).find(".chart_name").val());
            cleanData = ValidateData(chart.json());
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
            showError(runtime, e);
        }
    });

    $( ".chart-bottom-add" ).click(function() {
        chart.addRow();
    });
    $( ".chart-right-add" ).click(function() {
        chart.addColumn();
    });
    $( ".chart-bottom-del" ).click(function() {
        try{
            chart.removeRow();
        } catch (e) {
            showError(runtime, e);
        }
    });
    $( ".chart-right-del" ).click(function() {
        try{
            chart.removeColumn();
        } catch (e) {
            showError(runtime, e);
        }
    });

}

$.fn.makeEditable = function() {
    $(this).on('dblclick',function(){
        if($(this).find('input').is(':focus')) return this;
        var cell = $(this);
        var content = $(this).html();
        $(this).html('<input type="text" value="' + $(this).html() + '" />')
        .find('input')
        .trigger('focus')
        .on({
        'blur': function(){
                $(this).trigger('closeEditable');
        },
        'keyup':function(e){
            if(e.which == '13'){ // enter
                $(this).trigger('saveEditable');
            } else if(e.which == '27'){ // escape
                $(this).trigger('closeEditable');
            }
        },
        'closeEditable':function(){
            cell.html(content);
        },
        'saveEditable':function(){
            content = $(this).val();
            $(this).trigger('closeEditable');
        }
        });
    });
    return this;
}

function showError(runtime, errorMsg) {
    runtime.notify('error', {msg: errorMsg});
}

function BadChartError(message) {
    this.name = "Bad Chart Error";
    this.message = message;
    // Use V8's native method if available, otherwise fallback
    if ("captureStackTrace" in Error)
        Error.captureStackTrace(this, BadChartError);
    else
        this.stack = (new Error()).stack;
}

BadChartError.prototype = Object.create(Error.prototype);
BadChartError.prototype.constructor = BadChartError;

function size(ar){
    var row_count = ar.length;
    var row_sizes = []
    for(var i=0;i<row_count;i++){
        row_sizes.push(ar[i].length);
    }
    if(Math.min.apply(null, row_sizes) != Math.max.apply(null, row_sizes))
        throw new BadChartError("All chart rows are not equal length.");
    return [row_count, Math.min.apply(null, row_sizes)];
}

function ValidateData(inputString) {
    try {
        parsedString = JSON.parse(inputString);
    } catch (e) {
        throw e;
    }
    chartDimensions = size(parsedString);
    if (chartDimensions[0] < 2) throw new BadChartError("The chart requires more than one row.")
    return inputString;
}

function ValidateType(inputString, chartTypes) {
    if(chartTypes.indexOf(inputString) == -1 ) throw new BadChartError("Using an unsupported chart type.");
    return inputString;
}

function ValidateName(inputString) {
    if(inputString.length < 1) throw new BadChartError("Chart name is empty.");
    return inputString;
}

function ChartTable(targetDiv, inputJSON){
    this.data = JSON.parse(inputJSON);
    this.rows = this.data.length;
    this.columns = this.data[0].length;
    this.div = targetDiv;

    this.draw = function() {
    // Draws the table in a div
        for (i = 0; i < this.rows; i++) {
            var row = $("<tr>");
            for (j = 0; j < this.columns; j++) {
                var field = $("<td>" + this.data[i][j] + "</td>");
                row.append(field);
            }
            this.div.find("tbody").append(row);
        }
    }

    this.update = function() {
    // Updates the table from its div element
        var dataArray = [];
        var parent = this;
        this.div.find("tbody tr").each(function() {
            var row = [];
            $(this).children("td").each(function() {
                row.push(parent.parse($(this).text()));
            });
            dataArray.push(row);
        });
        this.data = dataArray;
    }

    this.parse = function(val) {
        if (val == parseInt(val)) {
            return parseInt(val);
        }
        else if (val == parseFloat(val)) {
            return parseFloat(val);
        }
        else {
            return val;
        }
    }

    this.json = function(skipUpdate) {
    // If called without parameters - updates then sends a JSON
        if (typeof(skipUpdate)==='undefined') this.update();
        return(JSON.stringify(this.data));
    }

    this.addRow = function() {
        var rowSelector = $('<tr>');
        this.div.find("tbody").append(rowSelector);
        for (i = 0; i < this.columns; i++) {
            rowSelector.append($('<td>').makeEditable());
        }
        this.rows++;
    }

    this.removeRow = function() {
        if(this.rows <2) throw {name: "Dimensions Error", message: "You cannot have 0 rows."};
        this.div.find("tbody > tr:last").remove();
        this.rows--;
    }

    this.addColumn = function() {
        this.div.find("tbody tr").each(function() {
            $(this).append($('<td>').makeEditable());
        });
        this.columns++;
    }

    this.removeColumn = function() {
        if(this.columns <2) throw {name: "Dimensions Error", message: "You cannot have 0 columns."};
        this.div.find("tbody tr").each(function() {
            $(this).find("> td:last").remove();
        });
        this.columns--;
    }
}
/* Javascript for ChartsXBlock-Studio. */
function ChartsXBlockStudio(runtime, element, data) {
    var chart, chartTypes,
        optionsObject = JSON.parse(data.chartOptions),
        $dataText = $(element).find('.dataText'),
        $optionsText = $(element).find('.optionsText'),
        optionsTitle = $(element).find('.title'),
        optionsWidth = $(element).find('.width'),
        optionsHeight = $(element).find('.height'),
        optionsIs3d = $(element).find('.is3d');

    $(element).find('.chartsTitleName').text(optionsObject.title);

    optionsTitle.val(optionsObject.title);
    optionsWidth.val(optionsObject.width);
    optionsHeight.val(optionsObject.height);

    if (optionsObject.is3D === 'true') {
        optionsIs3d.prop('checked', 'checked');
    }

    $(function ($) {
        chartTypes = data.chartTypes;
        chart = new ChartTable($(".chartsxblock_table"), data.chartData, data.chartOptions);
        chart.draw();
        $("td").not('.actions').makeEditable();
    });

    $(element).find(".updateButton").click(function(){
        try{
            runtime.notify('save', {state: 'start'});
            var cleanType = ValidateType($(element).find(".chart_type").val(), chartTypes);
            var cleanData = ValidateData(chart.json());
            var cleanOptions = ValidateOptions(chart.getChartOptions());
            var handlerUrl = runtime.handlerUrl(element, 'edit_data');

            $.ajax({
                type: "POST",
                url: handlerUrl,
                data: JSON.stringify({
                    type: cleanType,
                    data: cleanData,
                    options: cleanOptions}),
                success: function(){ runtime.notify('save', {state: 'end'});
                }
            });
        } catch (e) {
            console.log("Error with stack trace: \n", e);
            showError(runtime, e);
        }
    });

    $dataText.val(chart.json());
    $optionsText.val(data.chartOptions);

    $dataText.prettyJSON();
    $optionsText.prettyJSON();

    $( ".chart-bottom-add" ).click(function() {
        chart.addRow();
    });
    $( ".chart-right-add" ).click(function() {
        chart.addColumn();
    });
    $(element).find('.advanced').click(function() {
        $(element).find('.advancedModal').show();
    });
    $(element).find('.closeModal').click(function() {
        $(element).find('.modal').hide();
    });

    $(element).find('.submitDataText').click(function() {
        $(element).find('.modal').hide();
        var data = $dataText.val(),
            options = $optionsText.val();
        chart.setData(data, options);
    });

    $(element).find('.optionsBtn').click(function() {
        $(element).find('.optionsModal').show();
    });

    $(element).find('.submitOptionsText').click(function () {
        $(element).find('.modal').hide();
        var options = {
            title: optionsTitle.val(),
            width: optionsWidth.val(),
            height: optionsHeight.val(),
            is3D: "true"
        }

        if (!optionsIs3d.prop('checked')) {
            options.is3D = "false";
        }

        options = JSON.stringify(options);
        chart.setOptions(options);
    });

    $(element).on('click', '.deleteRow', function(event) {
        try{
            chart.removeRow($(event.target).parent().parent());
        } catch (e) {
            showError(runtime, e);
        }
    });
    $(element).on('click', '.deleteColumn', function(event) {
        try{
            chart.removeColumn($(event.target).data('columnnumber') + 1);
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
};

/*
    Function to prettify texarea JSON value
 */
$.fn.prettyJSON = function() {
    var ugly = this.val(),
        parsed = JSON.parse(ugly),
        pretty = JSON.stringify(parsed, undefined, 4);

    this.val(pretty);

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
    var row_sizes = [];
    for(var i=0;i<row_count;i++){
        row_sizes.push(ar[i].length);
    }
    if(Math.min.apply(null, row_sizes) != Math.max.apply(null, row_sizes))
        throw new BadChartError("All chart rows are not equal length.");
    return [row_count, Math.min.apply(null, row_sizes)];
}

function ValidateData(inputString) {
    var parsedString;
    try {
        parsedString = JSON.parse(inputString);
    } catch (e) {
        throw e;
    }
    var chartDimensions = size(parsedString);
    if (chartDimensions[0] < 2) throw new BadChartError("The chart requires more than one row.");
    
    ValidateDataType(parsedString);
    
    return inputString;
}

/*
    A function that validates data types for each field in data array
    Throws an error if it finds one
*/
function ValidateDataType(inputArray) {
    inputArray.forEach(function (dataRow, rowIndex) {
        if (rowIndex === 0) {
            dataRow.forEach(function (dataField) {
                if((typeof dataField !== "string") || (typeof dataField !== "string")) {
                    throw new BadChartError("Type error! Header elements must be type 'string'!");
                }
            });
        }
        else {
            dataRow.forEach(function (dataField, fieldIndex) {
                if((typeof dataField !== "number") && fieldIndex !== 0) {
                    throw new BadChartError("Type error! Column data after first column must be type 'number'!");
                }
            });
        }
    });
}

function ValidateType(inputString, chartTypes) {
    if(chartTypes.indexOf(inputString) == -1 ) throw new BadChartError("Using an unsupported chart type.");
    return inputString;
}

function ValidateOptions(inputOptionsString) {
    var optionsJSON;

    try {
        optionsJSON = JSON.parse(inputOptionsString);
    } catch(e) {
        throw e;
    }

    return inputOptionsString;
}

function ChartTable(targetDiv, inputJSON, optionsJSON){
    this.data = JSON.parse(inputJSON);
    this.options = optionsJSON;
    this.rows = this.data.length;
    this.columns = this.data[0].length;
    this.div = targetDiv;

    this.draw = function() {
    // Draws the table in a div
        for (var i = 0; i < this.rows + 1; i++) {
            var row = $("<tr>"),
                deleteButton = '<td class="actions"></td>';
            for (var j = 0; j < this.columns; j++) {
                var field;

                if(i === this.rows) {
                    field = $('<td class="actions"><button data-columnnumber="' + j + '" class="deleteColumn fa fa-times" aria-hidden="true"></button></td>');
                }

                else {
                    field = $("<td>" + this.data[i][j] + "</td>").makeEditable();
                }

                row.append(field);
            }
            if(i !== 0 && i !== this.rows) {
                deleteButton = $('<td class="actions"><button class="deleteRow fa fa-times" aria-hidden="true"></button></td>');
            }
            row.append(deleteButton);
            this.div.find("tbody").append(row);
        }
    };

    this.update = function() {
    // Updates the table from its div element
        var dataArray = [];
        var parent = this;
        this.div.find("tbody tr").not(':last').each(function() {
            var row = [];
            $(this).children("td").not('.actions').each(function() {
                row.push(parent.parse($(this).text()));
            });
            dataArray.push(row);
        });
        this.data = dataArray;
    };

    this.parse = function(val) {
        if (val == parseFloat(val)) {
            return parseFloat(val);
        }
        else {
            return val;
        }
    };

    this.json = function(skipUpdate) {
    // If called without parameters - updates then sends a JSON
        if (typeof(skipUpdate)==='undefined') this.update();
        return(JSON.stringify(this.data));
    };

    this.addRow = function() {
        var rowSelector = $('<tr>');
        for (var i = 0; i < this.columns; i++) {
            rowSelector.append($('<td>').makeEditable());
        }
        rowSelector.append($('<td class="actions"><button class="deleteRow fa fa-times" aria-hidden="true"></button></td>'));
        this.div.find("tbody tr:last").before(rowSelector);
        this.rows++;
    };

    this.removeRow = function(row=null) {
        if(this.rows <2) throw {name: "Dimensions Error", message: "You cannot have 0 rows."};
        if(row) {
            row.remove();
        }
        else {
            this.div.find("tbody > tr:last").remove();
        }
        this.rows--;
    }

    this.addColumn = function() {
        var self = this;

        this.div.find("tbody tr").not(':last').each(function() {
            $(this).find('td:last').before($('<td>').makeEditable());
        });
        this.div.find("tbody tr:last").each(function() {
            $(this).find('td:last').before($('<td class="actions"><button data-columnnumber="' + self.columns + '" class="deleteColumn fa fa-times" aria-hidden="true"></button></td>'));
        });
        this.columns++;
    };

    this.removeColumn = function(columnNumber) {
        if(this.columns <2) throw {name: "Dimensions Error", message: "You cannot have 0 columns."};
        if(columnNumber) {
            this.div.find("tbody tr td:nth-child(" + columnNumber + ")").remove();
            this.div.find("tfoot tr td:nth-child(" + columnNumber + ")").remove();
        }

        else {
            this.div.find("tbody tr").each(function() {
                $(this).find("> td:last").remove();
            });
        }
        this.columns--;
    }

    this.getChartOptions = function() {
        return this.options;
    }

    this.setData = function(newData, newOptions) {
        this.data = JSON.parse(newData);
        this.options = newOptions;
        this.rows = this.data.length;
        this.columns = this.data[0].length;

        this.div.find('table tbody').empty();
        this.draw();
    },

    this.setOptions = function (newOptions) {
        this.options = newOptions;
    }

}
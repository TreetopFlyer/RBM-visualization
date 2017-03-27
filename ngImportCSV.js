angular.module("ngImportCSV", [])
.factory("ParseCSV", [function()
{
    return function(inCSV)
    {
        var i, j;
        var contents;
        var table;
        var row;
        var limit;
        var column;
        var cell;
        
        var state = {
            headers:[],
            data:[]
        }

        contents = inCSV.split("\r");
        contents.pop();
        
        // build table headers
        var headers = [];
        state.headers = [];
        headers = contents[0].split(",");
        for(i=0; i<headers.length; i++){
            state.headers[i] = {
                active:true,
                label:headers[i],
                min:9999999999,
                max:-9999999999,
                map:[],
                uniques:0
            };
        }
        
        //build rows
        state.data = [];
        for(i=1; i<contents.length; i++)
        {
            row = contents[i].split(",");
            for(j=0; j<row.length; j++)
            {
                var mapped, original, column;
                
                original = row[j];
                mapped = parseFloat(row[j]);
                column = state.headers[j];
                
                // if this is a string
                if(isNaN(mapped))
                {
                    // and the string isnt in the mapped list
                    if(!column.map[original])
                    {
                        // add the key
                        mapped = column.uniques;
                        column.map[original] = column.uniques;
                        column.uniques++;
                    }
                    else
                    {
                        mapped = column.map[original]
                    }
                }

                row[j] = mapped;

                
                if(column.min > mapped)
                    column.min = mapped;
                if(column.max < mapped)
                    column.max = mapped;


            }
            state.data.push(row);
        }
        
        return state;

    };

}])
.directive("ngImportCsv", ["$parse", "ParseCSV", function($parse, ParseCSV){

    var directive = {};
    directive.ClassActive = "Import";

    directive.link = function(inScope, inElement, inAttributes){

        function handlerEnter(inEvent)
        {
            if(inEvent)
            {
                inEvent.preventDefault();
            }
            inElement.addClass(directive.ClassActive);
            inEvent.dataTransfer.effectAllowed = 'copy';
            return false;
        }
        
        function handlerDrop(inEvent)
        {
            inElement.removeClass(directive.ClassActive);
            if(inEvent)
            {
                inEvent.preventDefault();
            }
            parse(event.dataTransfer.files[0]);
            return false;
        }
        
        function handlerChange(inEvent)
        {
            inEvent.stopImmediatePropagation();
            parse(inEvent.target.files[0]);
        }
        
        function handlerLeave()
        {
            inElement.removeClass(directive.ClassActive);
        }
        
        function parse(inFile)
        {
            var reader = new FileReader();
            reader.onload = function(inEvent){
                var parsedFile = ParseCSV(inEvent.target.result);
                var setter = $parse(inAttributes.ngImportCsv);

                setter(inScope)(parsedFile)
                inScope.$apply();
            };
            reader.readAsText(inFile);
        }

        inElement.on("dragenter dragstart dragend dragleave dragover drag drop", function (inEvent) {inEvent.preventDefault();});
        inElement.on('dragenter', handlerEnter);
        inElement.on('dragleave', handlerLeave);
        inElement.on('drop', handlerDrop);
        inElement.on('change', handlerChange);
        inElement.on('click', function(inEvent)
        {
            inEvent.stopImmediatePropagation();
        });
    };
    
    return directive;
    
}]);
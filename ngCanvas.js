angular.module("ngCanvas", [])
.directive("ngCanvas", ["$parse", function($parse)
{
    var obj = {};
    obj.link = function(inScope, inElement, inAttributes)
    {   
        var canvas;
        var context;
        var getterURL;
        var getterWrite;
        canvas = inElement[0];
        context = canvas.getContext('2d');
        context.imageSmoothingEnabled = false;

        getterURL = $parse(inAttributes.ngLoad)(inScope);
        if(getterURL)
        {
            var img;
            img = new Image();
            img.onload = function()
            {
                canvas.width = img.width;
                canvas.height = img.height;
                context.drawImage(img, 0, 0);

                setter = $parse(inAttributes.ngOnload);
                setter(inScope)(context.getImageData(0, 0, canvas.width, canvas.height), context, canvas);
                inScope.$apply();
            };
            img.src = getterURL;
        }

        getterBytes = $parse(inAttributes.ngDrawBytes)(inScope);
        if(getterBytes)
        {
            canvas.width = getterBytes.width;
            canvas.height = getterBytes.height;
            context.putImageData(getterBytes, 0, 0);
        }
    };
    return obj;
}])
.factory("Bytes", [function()
{
    var obj = {};
    obj.BytesToVector = function(inBytes)
    {
        var out;
        var i;
        out = [];
        for(i=0; i<inBytes.data.length; i+=4)
        {
            out.push( (inBytes.data[i]/255));
        }
        return out;
    };
    obj.VectorToBytes = function(inVector, inWidth, inHeight)
    {
        var data;
        data = new Uint8ClampedArray(inWidth*inHeight*4);
        for(i=0; i<inVector.length; i++)
        {
            value = inVector[i]*255;
            data[(i*4)+0] = value;
            data[(i*4)+1] = value;
            data[(i*4)+2] = value;
            data[(i*4)+3] = 255;
        }
        return new ImageData(data, inWidth, inHeight);
    };
    return obj;
}])
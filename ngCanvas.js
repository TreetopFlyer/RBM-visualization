angular.module("ngCanvas", [])
.directive("ngDrawVector", ["$parse", "Bytes", function($parse, Bytes)
{
    var obj = {};
    obj.link = function(inScope, inElement, inAttributes)
    {   
        var canvas;
        var context;
        var getterURL;
        var getterWrite;
        
        getterBytes = $parse(inAttributes.ngDrawVector)(inScope);
        getterSize = $parse(inAttributes.ngDrawSize)(inScope);

        if(getterBytes && getterSize)
        {
            canvas = inElement[0];
            context = canvas.getContext('2d');

            canvas.width = getterSize[0];
            canvas.height = getterSize[1];
            context.putImageData(Bytes.VectorToBytes(getterBytes, getterSize[0], getterSize[1]), 0, 0);
        }
    };
    return obj;
}])
.factory("CutUp", ["Bytes", function(Bytes)
{
    return function(inURL, inSize, inGap, inDone)
    {
        var canvas;
        var context;
        var img;
        var output;

        canvas = document.createElement("canvas");
        context = canvas.getContext('2d');

        img = new Image();
        img.onload = function()
        {
            output = [];
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);

            var x, y, b;
            for(y=0; y<(canvas.height); y+=(inSize[1]+inGap[1]) )
            {
                for(x=0; x<(canvas.width ); x+=(inSize[0]+inGap[0]))
                {
                    if(x + inSize[0] > canvas.width || y + inSize[1] > canvas.height)
                        continue;

                    b = context.getImageData(x, y, inSize[0], inSize[1]);
                    output.push(Bytes.BytesToVector(b));
                }
            }
            inDone(output);
        };
        img.src = inURL;
    }
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
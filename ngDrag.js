angular.module("ngDrag", [])
.factory("Lerp", [function(){
    var obj = {};

    obj.Get = function(inMin, inAmount, inMax)
    {
        return (inAmount - inMin)/(inMax - inMin);
    };
    obj.Set = function(inMin, inAmount, inMax)
    {
        return inMin + inAmount*(inMax - inMin);
    };
    obj.Clip = function(inMin, inAmount, inMax)
    {
        if(inAmount < inMin)
        {
            return inMin;
        }
        if(inAmount > inMax)
        {
            return inMax;
        }
        return inAmount;
    };

    return obj;
}])
.directive("ngDrag", ["$document", "$parse", "Lerp", function($document, $parse, Lerp)
{
    var obj = {};

    obj.link = function(inScope, inElement, inAttributes)
    {
        var linker = {};
        linker.element = inElement;
        linker.handlerMove = function($event)
        {
            //coords of AABB within browser window
            var rect = inElement[0].getBoundingClientRect();

            //$event.client is the coords of the mouse within the browser window
            var mouseRect = {
                x:Lerp.Clip(0, $event.clientX - rect.left, rect.width),
                y:Lerp.Clip(0, $event.clientY - rect.top, rect.height)
            };

            var mouseRelative = {
                x:mouseRect.x/rect.width,
                y:mouseRect.y/rect.height
            };

            var minH = $parse(inAttributes.ngDragHMin)(inScope) || 0;
            var maxH = $parse(inAttributes.ngDragHMax)(inScope) || 1;
            var minV = $parse(inAttributes.ngDragVMin)(inScope) || 0;
            var maxV = $parse(inAttributes.ngDragVMax)(inScope) || 1;

            var horizontal = $parse(inAttributes.ngDragH);
            var vertical = $parse(inAttributes.ngDragV);
            var handler = $parse(inAttributes.ngDragHandler)(inScope);

            mouseRelative.x = Lerp.Set(minH, mouseRelative.x, maxH);
            mouseRelative.y = Lerp.Set(minV, mouseRelative.y, maxV);

            if(horizontal.assign)
                horizontal.assign(inScope, mouseRelative.x);

            if(vertical.assign) 
                vertical.assign(inScope, mouseRelative.y);

            if(handler)  
                handler(mouseRelative);

            inScope.$apply();
        };

        linker.handlerDown = function($event)
        {
            $event.preventDefault();
            $document.bind("mousemove", linker.handlerMove);
            $document.bind("mouseup", linker.handlerUp);
            linker.handlerMove($event);
        };

        linker.handlerUp = function($event)
        {
                $document.unbind("mousemove", linker.handlerMove);
                $document.unbind("mouseup", linker.handlerUp);
        };

        inElement.bind("mousedown", linker.handlerDown);
    };
    return obj;
}]);
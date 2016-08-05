var RBM = {};
RBM.Create = function(inDimensionsIn, inDimensionsOut)
{
    var obj = {};
    var min = [];
    var max = [];
    var i;
    
    inDimensionsIn++;
    inDimensionsOut++;

    for(i=0; i<inDimensionsIn; i++)
    {
        min.push(-0.1);
        max.push(0.1);
    }
    
    obj.MatrixForward = M.Box([min, max], inDimensionsOut);
    obj.MatrixBackward = M.Transpose(obj.MatrixForward);
    
    obj.SampleHidden = RBM.Sample.Gaussian;
    obj.SampleVisible = RBM.Sample.Linear;

    return obj;
};



RBM.Sample = {
        Linear:function(inData)
        {
            return inData;
        },
        Bernoulli:function(inData)
        {
            var i, j;
            for(i=0; i<inData.length; i++)
            {
                for(j=0; j<inData[i].length; j++)
                {
                    var rand = Math.random();
                    if(inData[i][j] > rand)
                        inData[i][j] = 1;
                    else
                        inData[i][j] = 0;
                }
            }
            return inData;
        },
        Gaussian:function(inData)
        {
            for(i=0; i<inData.length; i++)
            {
                /* [center coords], radius, pinch, count */
                inData[i] = M.Circle(inData[i], 0.1, 0.1, 1)[0];
            }
            return inData;
        }
};



/*
probability functions. inData must be padded.
*/
//probability of hidden units
RBM.HiddenProbability = function(inRBM, inData)
{
    return  M.Repad( M.Sigmoid(M.Transform(inRBM.MatrixForward, inData)) );
};
//probability of visible units
RBM.VisibleProbability = function(inRBM, inData)
{
    return  M.Repad( M.Sigmoid(M.Transform(inRBM.MatrixBackward, inData)) );
};



RBM.HiddenSample = function(inRBM, inData)
{
    return inRBM.SampleHidden(RBM.HiddenProbability(inRBM, inData));
};

RBM.VisibleSample = function(inRBM, inData)
{
    return inRBM.SampleVisible(RBM.VisibleProbability(inRBM, inData));
};



// contrative divergence
RBM.CD = function(inRBM, inData, inCDN, inRate)
{
    var pos;
    var neg;
    var i;

    var visibleProbability;
    var visibleSample;
    var hiddenProbability;
    var hiddenSample;
    var initial;
    var final;

    hiddenSample = RBM.HiddenSample(inRBM, inData);
    initial = hiddenSample;

    for(i=0; i<inCDN; i++)
    {
        visibleSample = RBM.VisibleSample(inRBM, hiddenSample);

        hiddenSample = RBM.HiddenSample(inRBM, visibleSample);

        final = hiddenSample;
    }

    for(i=0; i<inData.length; i++)
    {
        pos = M.Outer(inData[i], initial[i]);
        neg = M.Outer(inData[i], final[i]);
        inRBM.MatrixForward = M.Add(inRBM.MatrixForward, M.Scale(pos, inRate));
        inRBM.MatrixForward = M.Subtract(inRBM.MatrixForward, M.Scale(neg, inRate));
    }
    
    inRBM.MatrixBackward = M.Transpose(inRBM.MatrixForward);  
};
//batch of Contrastive Divergence calls
RBM.Train = function(inRBM, inData, inIterations, inCDN, inRate)
{
    var i;
    var copy = M.Pad(M.Clone(inData));
    for(i=0; i<inIterations; i++)
    {
        RBM.CD(inRBM, copy, inCDN, inRate);
    }
};


RBM.Fabricate = function(inRBM, inData, inIterations)
{
    var i;
    var hidden, visible;

    visible = M.Pad(M.Clone(inData));
    for(i=0; i<inIterations; i++)
    {
        hidden = RBM.HiddenProbability(inRBM, visible);
        visible = RBM.VisibleProbability(inRBM, hidden);
    }
    return M.Unpad(visible);
};
RBM.Label = function(inRBM, inData, inIterations)
{
    var i;
    var hidden, visible;

    visible = M.Pad(M.Clone(inData));
    for(i=0; i<inIterations; i++)
    {
        hidden = RBM.HiddenProbability(inRBM, visible);
        visible = RBM.VisibleProbability(inRBM, hidden);
    }
    return M.Unpad(RBM.HiddenProbability(inRBM, visible));
};
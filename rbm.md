The role of "stencils" in RBMs is unique in that they are used to not only take an image and produce a series of grades,
but they also can take a series of grades and produce a new image.

A process of continually evaluating, reconstructing, re-evaluating, and then adjusting produces stencils capable of recognizing key features in a set of inputs which can be used for classification.

Create a set of stencils with high-frequency, low-amplitude noise.
Use stencils to produce a series of grades on an image.
Use the grades on the stencils to make a second image.
Use the stencils to grade the new image.

Make each stencil more like the first image based on it's score (the first grade).
Make each stencil less like the second image based on it's score (the second grade).

Make very small, noisy, changes to the stencils to prevent them from taking on the same form.

The idea is that we want the stencils to always become more like the inputs and less like themselves, and hopefully, less like eachother.
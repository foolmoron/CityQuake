import os,sys
import Image

COLOR_TO_TILE = 
{
    
}

def processimage(filename):
    im = None
    pixels = None;
    try:
        im = Image.open(filename)
    except IOError as e:
        print filename + " is not a valid image file\n"
        return;
    if im.format == "PNG":
        print filename
        pixels = im.load()
        w = im.size[0]
        h = im.size[1]
        for x in xrange(10):
            for y in xrange(10):
                print pixels[x, y], 
            print ""

#main
input=raw_input("Enter image file or directory of image files:");
print "\nProcessing images\n\n"
if os.path.isdir(input):
    if input[-1]!='\\':
        input += '\\'
    for filename in os.listdir(input):
        processimage(input + filename);
elif os.path.isfile(input):
    processimage(input);
print "Done!"

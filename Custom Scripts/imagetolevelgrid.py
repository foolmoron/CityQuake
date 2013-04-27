import os,sys
import Image
import pdb

COLOR_TO_TILE = \
{\
(104, 59, 5): 'D',\
(0, 139, 255): 'W',\
(5, 174, 26): 'G',\
(242, 239, 193): 'H',\
(187, 187, 187): 'O',\
(202, 67, 67): 'S',\
(94, 133, 246): 'V',\
(59, 59, 59): 'F',\
}

NUM_TILES = 16
TOP_TILE_X = 127
TOP_TILE_Y = 130
TILE_HEIGHT = 8
def processimage(filename):
    im = None
    pixels = None;
    try:
        im = Image.open(filename)
    except IOError as e:
        print filename + " is not a valid image file\n"
        print ""
        return;
    if im.format == "PNG":
        print filename
        pixels = im.load()
        w = im.size[0]
        h = im.size[1]
        for tileX in xrange(NUM_TILES):
            line = ""
            if tileX == 0:
                line += '[['
            else:
                line += ' ['
            baseX = TOP_TILE_X - (tileX * TILE_HEIGHT)
            baseY = TOP_TILE_Y + (tileX * TILE_HEIGHT/2)
            for tileY in xrange(NUM_TILES):
                x = baseX + (tileY * TILE_HEIGHT)
                y = baseY + (tileY * TILE_HEIGHT/2)
                char = ''
                color = (pixels[x, y][0], pixels[x, y][1], pixels[x, y][2])
                if color in COLOR_TO_TILE:
                    line += COLOR_TO_TILE[color] + ", "
                else:
                    line += "0, "                    
            if (tileX == NUM_TILES-1):
                line = line[:-2] + "]],\n" 
            else:
                line = line[:-2] + "],\n"                
            sys.stdout.write(line);
        print ""
        
#main
input=raw_input("Enter image file or directory of image files:");
print "\nProcessing images\n"
if os.path.isdir(input):
    if input[-1]!='\\':
        input += '\\'
    for filename in os.listdir(input):
        processimage(input + filename);
elif os.path.isfile(input):
    processimage(input);
print "Done!"

from distutils import dir_util
import sys

dir=raw_input("Enter Construct2 root installation folder:");
if dir[-1]!='\\':
    dir += '\\'
dir += "exporters\\html5\\"
    
dir_util.copy_tree("behaviors", dir + "behaviors");
dir_util.copy_tree("plugins", dir + "plugins");
# rxdata-map-to-json
This just converts rxdata map tiles to JSON with events

# Installation and usage

## Installation
Just run these lines:
```
git clone https://github.com/Voxelstice/rxdata-map-to-json
cd rxdata-map-to-json
npm i
```

## Usage
Create the ``map_files`` folder. Then put Map_---.rxdata files from your favorite rpg maker xp game or whatever in ``map_files`` then run the command:
```
node .
```
This will create a new folder: ``output_files``, and your map files will come in the JSON format. Not all values from the original data is included.

# The point
Ok now you might be asking: *what is the point of this????*

well i specifically made this so that you can just put rxdata map files in the ``map_files`` folder (assuming you have ran the script once) and then when you run the script it will give you the width, height, layer 1-3 tile data (2 bytes), and events that only contain the name, x coordinate, and y coordinate. Just open RPG Maker XP and look at the event lines there


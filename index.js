var marshal = require("@hyrious/marshal")
var fs = require("node:fs")
var path = require('node:path')

function getKey(instanceVars, name) {
    var result = undefined
    instanceVars.forEach(element => {
        if (element != null) {
            if (Symbol.keyFor(element[0]) == name) {
                result = element[1]
                return result
            }
        }
    })
    return result
}

async function doProcess(directory, output)
{
    var mapFiles = []

    // Loop through files first
    const dir = await fs.promises.opendir(directory)
    for await (const dirent of dir) {
        var fileread = await fs.readFileSync(directory + '/' + dirent.name)
        var rxdata = await marshal.load(fileread.buffer)
        if (Symbol.keyFor(rxdata.className) == "RPG::Map") {
            mapFiles.push({
                name: dirent.name,
                data: rxdata
            })
        } else {
            console.warn(`${dirent.name} is excluded because it's not RPG::Map data`)
        }
    }

    if (mapFiles.length == 0) {
        console.warn("Nothing found")
    }

    // Parse them
    mapFiles.forEach(element => {
        var resultingJSON = { width: 20, height: 15, layer1: [], layer2: [], layer3: [], events: [] }
        var width = getKey(element.data.instanceVariables, "@width")
        var height = getKey(element.data.instanceVariables, "@height")

        resultingJSON.width = width
        resultingJSON.height = height

        // Tiles
        for (let layer = 1; layer < 4; layer++) {
            var index = 0
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {

                    var layerGap = 0

                    if (layer == 2) {
                        layerGap = (width * height) * 2
                    } else if (layer == 3) {
                        layerGap = (width * height) * 4
                    }

                    var buffer = new Uint8Array(getKey(element.data.instanceVariables, "@data").userDefined)
                    //var t = getTilePosition(128, buffer[index + 20 + layerGap], buffer[index + 1 + 20 + layerGap])

                    resultingJSON["layer" + layer].push([buffer[index + 20 + layerGap], buffer[index + 1 + 20 + layerGap]])

                    index += 2
                }
            }
        }

        // Events
        var notEvents = getKey(element.data.instanceVariables, "@events")
        var events = []

        notEvents.entries.forEach(element => {
            var canAdd = true
            events.forEach(element2 => {
                if (element[0] == element2[0]) {
                    canAdd = false
                }
            })
            if (canAdd == true) {
                events.push(element)
            }
        })

        events.forEach(element => {
            resultingJSON.events.push({
                name: getKey(element[1].instanceVariables, "@name"),
                x: getKey(element[1].instanceVariables, "@x"),
                y: getKey(element[1].instanceVariables, "@y")
            })
        })

        fs.writeFileSync(`output_files/${element.name.replace(path.extname(element.name),"")}.json`, JSON.stringify(resultingJSON, null, "\t"), {encoding:"utf-8"});
        console.log(`${element.name} written to output_files`)
    })
}

if (!fs.existsSync("output_files")) {
    fs.mkdirSync("output_files")
}

if (!fs.existsSync("map_files")) {
    console.warn("map_files directory does not exist, creating")
    fs.mkdirSync("map_files")
}
doProcess("map_files", "output_files")
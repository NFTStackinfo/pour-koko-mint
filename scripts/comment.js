const fs = require("fs")
const path = require("path")

const filePath = path.resolve(__dirname, "../", "build", "index.html")
const data = fs.readFileSync(filePath)
const fd = fs.openSync(filePath, "w+")
const buffer = Buffer.from(`<!--
  _   _ _____ _____ ____  _             _      _        __       
 | \\ | |  ___|_   _/ ___|| |_ __ _  ___| | __ (_)_ __  / _| ___  
 |  \\| | |_    | | \\___ \\| __/ _\` |/ __| |/ / | | '_ \\| |_ / _ \\ 
 | |\\  |  _|   | |  ___) | || (_| | (__|   < _| | | | |  _| (_) |
 |_| \\_|_|     |_| |____/ \\__\\__,_|\\___|_|\\_(_)_|_| |_|_|  \\___/ 
                                                                  
-->`)

fs.writeSync(fd, buffer, 0, buffer.length, 0)
fs.writeSync(fd, data, 0, data.length, buffer.length)
fs.close(fd)

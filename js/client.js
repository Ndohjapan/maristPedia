const fs = require("fs")
const { resolve } = require("path")

let clientControl = ""


function connectToServer(ip, username=0, className=0, imageFile=0, fileSize, port=9999) {
    return new Promise((resolve, reject) => {

        console.log("I have arrived")

        const net = require('net')

        const client = new net.Socket()
        
        client.connect(port, ip, () => {
            console.log("Connected!")

            client.write(JSON.stringify({"[USERNAME]":username, "[CLASS]":className, "[EXT]":imageFile.split(".").slice(-1)[0], "[SIZE]": fileSize}))

            const readStream = fs.createReadStream(imageFile)


            setTimeout(() => {
                readStream.on("data", (chunk) => {
                    client.write(chunk)
                }) 
                
                clientControl = client
                resolve(client)

            }, 1000);
                    
        })
        
        client.on("error", (err) => {
            console.log(err.message)
            reject(err.message)
        })
    })



}

function disconnectClient(){
    console.log("Time To Disconnect")
    clientControl.end("[DISCONNECTED]")
}

// let size = (fs.statSync("C:/Users/USER/Pictures/SlideShow/5.jpg").size)/1024

// connectToServer("192.168.43.53", "Sheggsmann", "UB3", "C:/Users/USER/Pictures/SlideShow/5.jpg", size)


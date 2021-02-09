const electron = require('electron')
const path = require('path')

const { app, BrowserWindow, ipcMain, dialog } = electron


let loadingWindow
let mainWindow

app.on('ready', () => {
    
    loadingWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        },
        width: 500,
        height: 300,
        frame: false
    })


    loadingWindow.loadFile(path.join(__dirname, 'loading.html'))

    setTimeout(() => {
        createMainWindow()
    }, 8000)

})



function createMainWindow() {
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        },
        resizable: false,
        show: false
    })

    mainWindow.maximize()
    mainWindow.show()

    mainWindow.loadFile(path.join(__dirname, 'main.html'))

    setTimeout(() => {
        loadingWindow.destroy()
        loadingWindow = null
    })

    app.on("close", () => {
        mainWindow.webContents.send("Close")
    })
}


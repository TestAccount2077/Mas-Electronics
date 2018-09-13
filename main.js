const {app, BrowserWindow, ipcMain, session, globalShortcut} = require('electron')
const path = require('path')
const url = require('url')
var Dialogs = require('dialogs');
  
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

let splashScreen
  
function createWindow () {
    
    splashScreen = new BrowserWindow({
        width: 300,
        height: 300,
        webPreferences: {
            nodeIntegration: false,
        },
        
        resizable: false,
        transparent: true,
        frame: false
    })
    
    splashScreen.loadURL(url.format({
      pathname: path.join(__dirname, 'templates/splash.html'),
      protocol: 'file',
      slashes: true
    }))
    
    setTimeout(function () {
                
        win = new BrowserWindow({
            width: 1024,
            height: 768,
            webPreferences: {
                nodeIntegration: false,
            },
            
            //fullscreen: true,
            //transparent: true,
            //frame: false
        })
        
        splashScreen.destroy();
        
        // and load the index.html of the app.
        win.loadURL(url.format({
          pathname: ('localhost:8000/devices/device-inventory/'),
          protocol: 'http:',
          slashes: true
        }))
        
        win.webContents.session.clearCache(function () {});
        
        globalShortcut.register('CommandOrControl+R', () => {
            win.webContents.reloadIgnoringCache();
        })
        
        // Open the DevTools.
        //win.webContents.openDevTools()
        
        // Emitted when the window is closed.
        win.on('closed', () => {
          // Dereference the window object, usually you would store windows
          // in an array if your app supports multi windows, this is the time
          // when you should delete the corresponding element.
          win = null
        })
        
    }, 7000);
    // Create the browser window.
    
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit()
    }
})
  
app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
})

ipcMain.on('cookie-setting-channel', (event, arg) => {
    
    var cookie = {url: 'http://localhost:8000/', name: 'user', value: arg}
    session.defaultSession.cookies.set(cookie, (error) => {
        if (error) console.error(error)
    })
})

ipcMain.on('cookie-getting-channel', (event, arg) => {
    
    var username;
    session.defaultSession.cookies.get({name: 'user'}, (error, cookies) => {
        username = cookies[0].value;
    });
    setTimeout(function () {event.returnValue = username;}, 500)
    
})
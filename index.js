const url = require('url');
const path = require('path');
const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const http = require('http');
const fs = require('fs');

let win;
let server;

(async function () {
	// electron
	app.on('ready', function createWindow() {
	    win = new BrowserWindow({ width: 780, height: 585, title: 'Timer' });
	    const template = [
	        {

	        }
	    ];
	    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
		win.setMenu(null);
	    const startUrl = "http://localhost:3579";

	    win.loadURL(startUrl);
	    win.on('closed', () => {
	        win = null;
	    });

		win.webContents.openDevTools();
	});

	app.on('window-all-closed', () => {
        app.quit();
	});

	app.on('activate', () => {
	    if (win === null) {
	        app.emit('ready');
	    }
	});

	ipcMain.on("fullscreen", (e, state) => {
		win.setFullScreen(state);
	})


})()

server = http.createServer((req, res) => {
	if (req.method == "GET") {
		switch (req.url) {
			case '/':
				res.writeHead('200', { 'Content-type': 'text/html' })
				res.write(fs.readFileSync(path.join(__dirname, "index.html")))
				break;
			case '/master.css':
				res.writeHead('200', { 'Content-type': 'text/css' })
				res.write(fs.readFileSync(path.join(__dirname, "master.css")))
				break;
			case '/ui.css':
				res.writeHead('200', { 'Content-type': 'text/css' })
				res.write(fs.readFileSync(path.join(__dirname, "ui.css")))
				break;
			case '/main.js':
				res.writeHead('200', { 'Content-type': 'text/javascript' })
				res.write(fs.readFileSync(path.join(__dirname, "main.js")))
				break;
			case '/ui.js':
				res.writeHead('200', { 'Content-type': 'text/javascript' })
				res.write(fs.readFileSync(path.join(__dirname, "ui.js")))
				break;
			case '/mousetrap.js':
				res.writeHead('200', { 'Content-type': 'text/javascript' })
				res.write(fs.readFileSync(path.join(__dirname, "mousetrap.js")))
				break;
			case '/loop.mp3':
				res.writeHead('200', { 'Content-type': 'audio/mpeg' })
				res.write(fs.readFileSync(path.join(__dirname, "loop.mp3")))
				break;
			default:
				res.writeHead(404)
				res.write("The File Wasn't Found")
		}

		res.end();
	}
})
server.listen(3579)

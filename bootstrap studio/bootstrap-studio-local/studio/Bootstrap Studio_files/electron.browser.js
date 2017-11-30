var electron = {};

(function(){

	// Preload the getting started guide

	var img = new Image()
	img.src = './assets/tutorials/getting-started.json';

	var browserWindow = null;
	var webContents = null;

	electron.os = 'linux';

	electron.development = false;
	electron.homePath = '';
	
	// Will use this to open files from the command line

	electron.commandLineArgs = [];

	electron.saveSetting = voidFunc;

	electron.readSetting = function(set, def){
		return def || null;
	};

	// Prevent the app from triggering the unload dialog

	window.addEventListener('beforeunload', function(e){
		e.stopImmediatePropagation();
		e.stopPropagation();
	});

	// Misc

	electron.reloadWindow = voidFunc;
	electron.toggleDevTools = voidFunc;
	electron.addToRecent = voidFunc;
	electron.quit = voidFunc;
	electron.setTitle = voidFunc;

	// Dialog functions

	function onlyInBstudio(){
		app.alertDialog.open({
			title: "Essa merda esta desabilitada",
			message: 'Nem tente usar esta merda, pois esta desabilitada porra !.'
		});
	}

	function onlyInBstudioPromise(){
		onlyInBstudio();
		return new Promise();
	}

	function voidFunc(){}

	electron.showFileOpenDialog = onlyInBstudio;
	electron.showFileSaveDialog = onlyInBstudio;

	electron.pathExists = function(path){
		return fs.existsSync(path)
	}

	electron.readFile = onlyInBstudioPromise;

	electron.mkdirSync = function(path){
		return false;
	};

	electron.writeFile = onlyInBstudioPromise;

	// Binding to ports

	electron.previewPort = 12345;
	electron.ssePort = 12345;

	var httpServer, sseServer;

	electron.listenOnNetwork = onlyInBstudio;

	electron.stopListeningOnNetwork = voidFunc;

	// Event stream server

	electron.notifySSEClients = voidFunc;

	// Generic functions

	electron.getIPAddresses = function(){
		return ['0.0.0.0'];
	};

	electron.openBrowserWindow = voidFunc;

	// Application menu

	electron.setMenu = voidFunc;

	// Clipboard

	electron.clipboardGet = function(){
		return '';
	};
		
	electron.clipboardGetText = function(){
		return '';
	};

	electron.clipboardGetHTML = function(){
		return '';
	};
	
	electron.clipboardSet = onlyInBstudio;
	electron.clipboardSetText = onlyInBstudio;
	electron.clipboardSetHTML = onlyInBstudio;

})();
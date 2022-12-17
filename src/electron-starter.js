const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { Picovoice } = require("@picovoice/picovoice-node");
const PvRecorder = require("@picovoice/pvrecorder-node");

let voiceCommand = {
  isListen:false,
  command:"",
  detail:""
};

let mainWindow;

async function voiceHandler() {
  const accessKey = "YBJojN3SCle3E/zD3cP+2v3blvThJhCIVb2N96cXryzF/IMvmsae/A==";
	const keywordArgument = "/home/jinwang/smart_mirror_app/src/picovoice/거울아_ko_raspberry-pi_v2_1_0.ppn";
	const contextPath = "/home/jinwang/smart_mirror_app/src/picovoice/SmartMirrorProject_ko_raspberry-pi_v2_1_0.rhn";
	const porcupineModelFilePath = "/home/jinwang/smart_mirror_app/src/picovoice/porcupine_params_ko.pv"; //github @picovoice/porcupine/lib/common/
	const rhinoModelFilePath = "/home/jinwang/smart_mirror_app/src/picovoice/rhino_params_ko.pv"; //github @picovoice/rhino/lib/common/
	const audioDeviceIndex = 0; // In my case : 0
	const sensitivity = 0.5;
	const endpointDurationSec = 1.0;
	const requiresEndpoint = true;
	let isInterrupted = false;

  let keywordCallback = (keyword) => {
    console.log(`듣고 있습니다..`);
    mainWindow.webContents.send('on-air', true);
    voiceCommand.isListen = true;
  };

  let inferenceCallback = (inference) => {
    console.log("Inference:");
    console.log(JSON.stringify(inference, null, 4));
    voiceCommand = inference;
    if(inference.isUnderstood){
      switch(inference.intent){
        case "order2Home":
          mainWindow.loadURL("http://localhost:3000/");
          break;
        case "order2Weather":
          mainWindow.loadURL("http://localhost:3000/Weather");
          break;
        case "order2Calendar":
          mainWindow.loadURL("http://localhost:3000/Calendar");
          break;
        case "order2ToDo":
          mainWindow.loadURL("http://localhost:3000/ToDo");
          break
        case "order2News":
          mainWindow.loadURL("http://localhost:3000/News");
          break;
        case "order2Camera":
          mainWindow.loadURL("http://localhost:3000/Camera");
          break;
        default:
          break;
      }
    }
    voiceCommand.isListen = false;
    mainWindow.webContents.send('on-air', false); //IPC 통신
  };

  let handle = new Picovoice(
    accessKey,
    keywordArgument,
    keywordCallback,
    contextPath,
    inferenceCallback,
    sensitivity,
    sensitivity,
    endpointDurationSec,
    requiresEndpoint,
    porcupineModelFilePath,
    rhinoModelFilePath,
  );

  const frameLength = handle.frameLength;

  const recorder = new PvRecorder(audioDeviceIndex, frameLength);
  recorder.start();

  while (!isInterrupted) {
    const pcm = await recorder.read();
    handle.process(pcm);
  }

  console.log("Stopping...");
  recorder.release();
}


function createWindow () {
  mainWindow = new BrowserWindow({
    frame: false,
    webPreferences: {
        preload: path.join(__dirname, 'preload.js')
    }
  })
  mainWindow.maximize()
  mainWindow.removeMenu()
  mainWindow.loadURL("http://localhost:3000")
}

app.whenReady().then(() => {
  createWindow();
  (async () => {
    try {
      await voiceHandler();
    } catch (e) {
      console.error(e.toString());
    }
  })();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})


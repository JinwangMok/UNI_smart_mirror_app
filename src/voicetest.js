const { Picovoice } = require("@picovoice/picovoice-node");
const PvRecorder = require("@picovoice/pvrecorder-node");

async function test() {
	const accessKey = "YBJojN3SCle3E/zD3cP+2v3blvThJhCIVb2N96cXryzF/IMvmsae/A==";
	const keywordArgument = "./picovoice/거울아_ko_raspberry-pi_v2_1_0.ppn";
	const contextPath = "./picovoice/SmartMirrorProject_ko_raspberry-pi_v2_1_0.rhn";
	const porcupineModelFilePath = "./picovoice/porcupine_params_ko.pv"; //github @picovoice/porcupine/lib/common/
	const rhinoModelFilePath = "./picovoice/rhino_params_ko.pv"; //github @picovoice/rhino/lib/common/
	const audioDeviceIndex = 0; // In my case : 0
	const sensitivity = 0.5;
	const endpointDurationSec = 1.0;
	const requiresEndpoint = true;
	let isInterrupted = false;

  let keywordCallback = (keyword) => {
    console.log(`Wake word detected.`);
  };

  let inferenceCallback = (inference) => {
    console.log("Inference:");
    console.log(JSON.stringify(inference, null, 4));
		//여기서 inference가 이해된 것이면 isInterupted를
		//true로 바꿔서 탈출하는 거로 electron이랑 merge
		//=> 새로운 url을 또 리턴하면 거기의 useEffect에서 다시 실행될테니..
		//그리고 이해못했으면 그냥 계속 듣게 시키면되니까
		//*이 함수에서 이해한 다음 해야할 액션들 정의해야함
		//ex) 캘린더 -> .get(캘린더)로 받아오기 등
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

  console.log(`Using device: ${recorder.getSelectedDevice()}...`);
  console.log("Context info:");
  console.log("-------------");
  console.log(handle.contextInfo);
  console.log("Press ctrl+c to exit.");

  while (!isInterrupted) {
    const pcm = await recorder.read();
    handle.process(pcm);
  }

  console.log("Stopping...");
  recorder.release();
}

// setup interrupt
process.on("SIGINT", function () {
  isInterrupted = true;
});

(async () => {
  try {
    await test();
  } catch (e) {
    console.error(e.toString());
  }
})();
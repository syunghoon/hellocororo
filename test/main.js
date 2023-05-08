// DrumCell 클래스 생성
class DrumCell {
  constructor(outputNode, audioBuffer) {
    this._context = outputNode.context;
    this._buffer = audioBuffer;
    this._outputNode = outputNode;
  }
// playSample 메소드 생성
  playSample() {
    const bufferSource =
      new AudioBufferSourceNode(this._context, {buffer: this._buffer});
    const amp = new GainNode(this._context);
    bufferSource.connect(amp).connect(this._outputNode)
    bufferSource.start();
  }
}

//파일로딩 유틸리티 함수
const getAudioBufferByFileName = async (
    audioContext, fileName, directoryHandle) => {
  const fileHandle = await directoryHandle.getFileHandle(fileName);
  const file = await fileHandle.getFile();
  const arrayBuffer = await file.arrayBuffer();
  return await audioContext.decodeAudioData(arrayBuffer);
};

//buildDrumCellMap 함수
const buildDrumCellMap = async (outputNode, directoryHandle) => {
  const drumCellMap = {};
  for await (const entry of directoryHandle.values()) {
    if (entry.name.startsWith('drum') && entry.name.endsWith('mp3')) {
      const audioBuffer = await getAudioBufferByFileName(
          outputNode.context, entry.name, directoryHandle);
      drumCellMap[entry.name] = new DrumCell(outputNode, audioBuffer);
    }
  }

  return drumCellMap;
};

//키입력처리
const bindKeyToDrumCellMap = (drumCellMap) => {
  const keys = 'qwerasdfzcxv'.split('');
  const drumCells = Object.values(drumCellMap);
  const keyToDrumCellMap = {};
  for (let i = 0; i < drumCells.length; ++i) {
    keyToDrumCellMap[keys[i]] = drumCells[i];
  }

  window.addEventListener('keydown', (event) => {
    if (event.key in keyToDrumCellMap) {
      keyToDrumCellMap[event.key].playSample();
    }
  });
};

//버스 이펙트 추가하기
const buildMainBus = async (audioContext, directoryHandle) => {
  const compressor = new DynamicsCompressorNode(audioContext);
  const irBuffer = await getAudioBufferByFileName(
      audioContext,'ir-hall.mp3',directoryHandle);
  const convolver = new ConvolverNode(audioContext, {buffer: irBuffer});
  const reverbGain = new GainNode(audioContext, {gain: 0.25});

  compressor.connect(audioContext.destination);
  convolver.connect(reverbGain).connect(audioContext.destination);
  compressor.connect(convolver);

  return compressor;
};

//initializeDrumMachine 함수
const initializeDrumMachine = async (audioContext) => {
  const directoryHandle = await window.showDirectoryPicker();
  const mainBus = await buildMainBus(audioContext, directoryHandle);
  const drumCellMap = await buildDrumCellMap(mainBus, directoryHandle);
  await bindKeyToDrumCellMap(drumCellMap);
};

//엔트리 포인트: 웹페이지가 완전히 준비된 후 사용할 수 있도록
const audioContext = new AudioContext();

const onLoad = async () => {
  const buttonE1 = document.getElementById('start-audio');
  buttonE1.disabled = false;
  buttonE1.addEventListener('click', async () => {
    await initializeDrumMachine(audioContext);
    audioContext.resume();
    buttonE1.disabled = true;
    buttonE1.textContent = '파일 로딩 완료';
  }, false);
};

window.addEventListener('load', onLoad);
import { CARTA } from "carta-protobuf";
import { checkConnection, Stream} from './myClient';
import { MessageController } from "./MessageController";
import config from "./config.json";

let testServerUrl: string = config.serverURL0;
let testSubdirectory: string = config.path.QA;
let openFileTimeout: number = config.timeout.openFile;
let connectTimeout: number = config.timeout.connection;
let vectorOverlayTimeout: number = config.timeout.vectorOverlay;

interface IVectorOverlayTileDataExt extends CARTA.IVectorOverlayTileData {
    totalAngleImageDataLength?: Number;
    totalIntensityImageDataLength?: Number;
    selectedAngleImageDataIndex?: Number[];
    selectedAngleImageDataValue?: Number[];
    selectedIntensityImageDataIndex?: Number[];
    selectedIntensityImageDataValue?: Number[];
}

interface AssertItem {
    registerViewer: CARTA.IRegisterViewer;
    filelist: CARTA.IFileListRequest;
    openFile: CARTA.IOpenFile;
    addTilesReq: CARTA.IAddRequiredTiles;
    setVectorOverlayParameters: CARTA.ISetVectorOverlayParameters[];
    VectorOverlayTileData : IVectorOverlayTileDataExt[]
};

let assertItem: AssertItem = {
    registerViewer: {
        sessionId: 0,
        clientFeatureFlags: 5,
    },
    filelist: { directory: testSubdirectory },
    openFile: {
        directory: testSubdirectory,
        file: "HH211_IQU.fits",
        hdu: "",
        fileId: 0,
        renderMode: CARTA.RenderMode.RASTER,
    },
    addTilesReq: {
        fileId: 0,
        compressionQuality: 11,
        compressionType: CARTA.CompressionType.ZFP,
        tiles: [0],
    },
    setVectorOverlayParameters: [
        {
            compressionQuality: 8,
            compressionType: CARTA.CompressionType.NONE,
            debiasing: false,
            fileId: 0,
            fractional: false,
            imageBounds: { xMin: 0, xMax: 1049, yMin: 0, yMax: 1049},
            qError: undefined,
            smoothingFactor: 1,
            stokesAngle: 1,
            stokesIntensity: 1,
            threshold: NaN,
            uError: undefined
        },
        {
            fileId: 0,
            stokesAngle: -1,
            stokesIntensity: -1
        },
        {
            compressionQuality: 8,
            compressionType: CARTA.CompressionType.NONE,
            debiasing: false,
            fileId: 0,
            fractional: false,
            imageBounds: { xMin: 0, xMax: 1049, yMin: 0, yMax: 1049},
            qError: undefined,
            smoothingFactor: 4,
            stokesAngle: 1,
            stokesIntensity: 1,
            threshold: NaN,
            uError: undefined
        },
        {
            compressionQuality: 8,
            compressionType: CARTA.CompressionType.NONE,
            debiasing: false,
            fileId: 0,
            fractional: true,
            imageBounds: { xMin: 0, xMax: 1049, yMin: 0, yMax: 1049},
            qError: undefined,
            smoothingFactor: 4,
            stokesAngle: 1,
            stokesIntensity: 1,
            threshold: NaN,
            uError: undefined
        },
    ],
    VectorOverlayTileData: [
        {
            progress: 1, 
            stokesAngle: 1,
            stokesIntensity: 1,
            compressionQuality: 8,
            totalAngleImageDataLength: 2500,
            angleTiles: [{
                height: 25,
                mip: 1,
                layer: 3,
                width: 25,
                x: 4,
                y: 4
            }],
            totalIntensityImageDataLength: 2500,
            intensityTiles: [{
                height: 25,
                layer: 3,
                mip: 1,
                width: 25,
                x: 4,
                y: 4
            }],
            selectedAngleImageDataIndex: [3,501, 1002,1500, 2000, 2499],
            selectedAngleImageDataValue: [127, 0, 192, 0, 0, 127],
            selectedIntensityImageDataIndex: [3,501, 1002,1500, 2000, 2499],
            selectedIntensityImageDataValue: [127, 0, 192, 0, 0, 127],
        }, 
        {
            progress: 1, 
            stokesAngle: 1,
            stokesIntensity: 1,
            compressionQuality: 8,
            totalAngleImageDataLength: 196,
            angleTiles: [{
                height: 7,
                layer: 1,
                mip: 4,
                width: 7,
                x: 1,
                y: 1
            }],
            totalIntensityImageDataLength: 196,
            intensityTiles: [{
                height: 7,
                layer: 1,
                mip: 4,
                width: 7,
                x: 1,
                y: 1
            }],
            selectedAngleImageDataIndex: [0,50, 100, 143, 190],
            selectedAngleImageDataValue: [0, 192, 0, 127, 192],
            selectedIntensityImageDataIndex: [0,50, 100, 143, 190],
            selectedIntensityImageDataValue: [0, 192, 0, 127, 192],
        }
    ]
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms)).then(() => {});
}

let basepath: string;
describe("PV_GENERATOR_FITS:Testing PV generator with fits file.", () => {
    const msgController = MessageController.Instance;
    describe(`Register a session`, () => {
        beforeAll(async ()=> {
            await msgController.connect(testServerUrl);
        }, connectTimeout);

        checkConnection();
        test(`Get basepath and modify the directory path`, async () => {
            let fileListResponse = await msgController.getFileList("$BASE",0);
            basepath = fileListResponse.directory;
            assertItem.openFile.directory = basepath + "/" + assertItem.openFile.directory;
        });

        describe(`Initialization: open the image`, () => {
            test(`OPEN_FILE_ACK and REGION_HISTOGRAM_DATA should arrive within ${openFileTimeout} ms`, async() => {
                msgController.closeFile(-1);
                msgController.closeFile(0);
                let OpenFileResponse = await msgController.loadFile(assertItem.openFile);
                expect(OpenFileResponse.success).toEqual(true);
                let RegionHistrogramDataResponse = await Stream(CARTA.RegionHistogramData,1);
            }, openFileTimeout);

            test(`return RASTER_TILE_DATA(Stream) and check total length `, async () => {
                msgController.addRequiredTiles(assertItem.addTilesReq);
                let RasterTileData = await Stream(CARTA.RasterTileData,3); //RasterTileData * 1 + RasterTileSync * 2
                expect(JSON.stringify(RasterTileData[2])).toMatch(/{\"endSync\":true}/)
            }, openFileTimeout);
        });

        describe(`(Case 1) Only polarization intensity of Absolute:`, ()=>{
            let VectorOverlayTileDataArray = [];
            let VectorOverlayTileDataResponse: any;
            test(`(Step 1) Request and Response should arrived within ${vectorOverlayTimeout} ms`, async() => {
                msgController.setVectorOverlayParameters(assertItem.setVectorOverlayParameters[0]);
                let VectorOverlayTileDataPromise = new Promise((resolve)=>{
                    msgController.vectorTileStream.subscribe({
                        next: (data) => {
                            VectorOverlayTileDataArray.push(data)
                            if (data.progress === 1) {
                                resolve(VectorOverlayTileDataArray)
                            }
                        }
                    });
                });

                VectorOverlayTileDataResponse = await VectorOverlayTileDataPromise;
            }, vectorOverlayTimeout);

            test(`(Step 2) Verify the Response (the last VECTOR_OVERLAY_TILE_DATA) correctness`, ()=>{
                let lastVectorOverlayTileDataResponse = VectorOverlayTileDataResponse.slice(-1)[0];
                expect(lastVectorOverlayTileDataResponse.progress).toEqual(assertItem.VectorOverlayTileData[0].progress);
                expect(lastVectorOverlayTileDataResponse.stokesAngle).toEqual(assertItem.VectorOverlayTileData[0].stokesAngle);
                expect(lastVectorOverlayTileDataResponse.stokesIntensity).toEqual(assertItem.VectorOverlayTileData[0].stokesIntensity);
                expect(lastVectorOverlayTileDataResponse.compressionQuality).toEqual(assertItem.VectorOverlayTileData[0].compressionQuality);
                
                expect(lastVectorOverlayTileDataResponse.angleTiles[0].height).toEqual(assertItem.VectorOverlayTileData[0].angleTiles[0].height);
                expect(lastVectorOverlayTileDataResponse.angleTiles[0].mip).toEqual(assertItem.VectorOverlayTileData[0].angleTiles[0].mip);
                expect(lastVectorOverlayTileDataResponse.angleTiles[0].layer).toEqual(assertItem.VectorOverlayTileData[0].angleTiles[0].layer);
                expect(lastVectorOverlayTileDataResponse.angleTiles[0].width).toEqual(assertItem.VectorOverlayTileData[0].angleTiles[0].width);
                expect(lastVectorOverlayTileDataResponse.angleTiles[0].x).toEqual(assertItem.VectorOverlayTileData[0].angleTiles[0].x);
                expect(lastVectorOverlayTileDataResponse.angleTiles[0].imageData.length).toEqual(assertItem.VectorOverlayTileData[0].totalAngleImageDataLength);
                assertItem.VectorOverlayTileData[0].selectedAngleImageDataIndex.map((data, index) => {
                    expect(lastVectorOverlayTileDataResponse.angleTiles[0].imageData[data]).toEqual(assertItem.VectorOverlayTileData[0].selectedAngleImageDataValue[index])
                });

                expect(lastVectorOverlayTileDataResponse.intensityTiles[0].height).toEqual(assertItem.VectorOverlayTileData[0].intensityTiles[0].height);
                expect(lastVectorOverlayTileDataResponse.intensityTiles[0].layer).toEqual(assertItem.VectorOverlayTileData[0].intensityTiles[0].layer);
                expect(lastVectorOverlayTileDataResponse.intensityTiles[0].mip).toEqual(assertItem.VectorOverlayTileData[0].intensityTiles[0].mip);
                expect(lastVectorOverlayTileDataResponse.intensityTiles[0].width).toEqual(assertItem.VectorOverlayTileData[0].intensityTiles[0].width);
                expect(lastVectorOverlayTileDataResponse.intensityTiles[0].x).toEqual(assertItem.VectorOverlayTileData[0].intensityTiles[0].x);
                expect(lastVectorOverlayTileDataResponse.intensityTiles[0].imageData.length).toEqual(assertItem.VectorOverlayTileData[0].totalIntensityImageDataLength);
                assertItem.VectorOverlayTileData[0].selectedIntensityImageDataIndex.map((data, index) => {
                    expect(lastVectorOverlayTileDataResponse.intensityTiles[0].imageData[data]).toEqual(assertItem.VectorOverlayTileData[0].selectedIntensityImageDataValue[index])
                });
            });

            test(`(Step 3) Clear Vector Overlay ICD`, done =>{
                msgController.setVectorOverlayParameters(assertItem.setVectorOverlayParameters[1]);
                let receiveNumberCurrent = msgController.messageReceiving();
                setTimeout(() => {
                    let receiveNumberLatter = msgController.messageReceiving();
                    expect(receiveNumberCurrent).toEqual(receiveNumberLatter); //Have received number is equal during 1000 ms
                    done();
                }, 500)
            });
        });

        describe(`(Case 2) With smoothing factor of 4:`, ()=>{
            let VectorOverlayTileDataArray = [];
            let VectorOverlayTileDataResponse: any;
            test(`(Step 1) Request and Response should arrived within ${vectorOverlayTimeout} ms`, async() => {
                await sleep(500);
                msgController.setVectorOverlayParameters(assertItem.setVectorOverlayParameters[2]);
                let VectorOverlayTileDataPromise = new Promise((resolve)=>{
                    msgController.vectorTileStream.subscribe({
                        next: (data) => {
                            VectorOverlayTileDataArray.push(data)
                            if (data.progress === 1) {
                                resolve(VectorOverlayTileDataArray)
                            }
                        }
                    });
                });

                VectorOverlayTileDataResponse = await VectorOverlayTileDataPromise;
            }, vectorOverlayTimeout);

            test(`(Step 2) Verify the Response (the last VECTOR_OVERLAY_TILE_DATA) correctness`, ()=>{
                let lastVectorOverlayTileDataResponse = VectorOverlayTileDataResponse.slice(-1)[0];
                expect(lastVectorOverlayTileDataResponse.progress).toEqual(assertItem.VectorOverlayTileData[1].progress);
                expect(lastVectorOverlayTileDataResponse.stokesAngle).toEqual(assertItem.VectorOverlayTileData[1].stokesAngle);
                expect(lastVectorOverlayTileDataResponse.stokesIntensity).toEqual(assertItem.VectorOverlayTileData[1].stokesIntensity);
                expect(lastVectorOverlayTileDataResponse.compressionQuality).toEqual(assertItem.VectorOverlayTileData[1].compressionQuality);
                
                expect(lastVectorOverlayTileDataResponse.angleTiles[0].height).toEqual(assertItem.VectorOverlayTileData[1].angleTiles[0].height);
                expect(lastVectorOverlayTileDataResponse.angleTiles[0].mip).toEqual(assertItem.VectorOverlayTileData[1].angleTiles[0].mip);
                expect(lastVectorOverlayTileDataResponse.angleTiles[0].width).toEqual(assertItem.VectorOverlayTileData[1].angleTiles[0].width);
                expect(lastVectorOverlayTileDataResponse.angleTiles[0].x).toEqual(assertItem.VectorOverlayTileData[1].angleTiles[0].x);
                expect(lastVectorOverlayTileDataResponse.angleTiles[0].imageData.length).toEqual(assertItem.VectorOverlayTileData[1].totalAngleImageDataLength);
                assertItem.VectorOverlayTileData[1].selectedAngleImageDataIndex.map((data, index) => {
                    expect(lastVectorOverlayTileDataResponse.angleTiles[0].imageData[data]).toEqual(assertItem.VectorOverlayTileData[1].selectedAngleImageDataValue[index])
                });

                expect(lastVectorOverlayTileDataResponse.intensityTiles[0].height).toEqual(assertItem.VectorOverlayTileData[1].intensityTiles[0].height);
                expect(lastVectorOverlayTileDataResponse.intensityTiles[0].layer).toEqual(assertItem.VectorOverlayTileData[1].intensityTiles[0].layer);
                expect(lastVectorOverlayTileDataResponse.intensityTiles[0].mip).toEqual(assertItem.VectorOverlayTileData[1].intensityTiles[0].mip);
                expect(lastVectorOverlayTileDataResponse.intensityTiles[0].width).toEqual(assertItem.VectorOverlayTileData[1].intensityTiles[0].width);
                expect(lastVectorOverlayTileDataResponse.intensityTiles[0].x).toEqual(assertItem.VectorOverlayTileData[1].intensityTiles[0].x);
                expect(lastVectorOverlayTileDataResponse.intensityTiles[0].imageData.length).toEqual(assertItem.VectorOverlayTileData[1].totalIntensityImageDataLength);
                assertItem.VectorOverlayTileData[1].selectedIntensityImageDataIndex.map((data, index) => {
                    expect(lastVectorOverlayTileDataResponse.intensityTiles[0].imageData[data]).toEqual(assertItem.VectorOverlayTileData[1].selectedIntensityImageDataValue[index])
                });
            });

            test(`(Step 3) Clear Vector Overlay ICD`, done =>{
                msgController.setVectorOverlayParameters(assertItem.setVectorOverlayParameters[1]);
                let receiveNumberCurrent = msgController.messageReceiving();
                setTimeout(() => {
                    let receiveNumberLatter = msgController.messageReceiving();
                    expect(receiveNumberCurrent).toEqual(receiveNumberLatter); //Have received number is equal during 1000 ms
                    done();
                }, 500)
            });
        });

        describe(`(Case 3) With smoothing of 4 and polarization intensity of fractional:`, ()=>{
            let VectorOverlayTileDataArray = [];
            let VectorOverlayTileDataResponse: any;
            test(`(Step 1) Request and Response should arrived within ${vectorOverlayTimeout} ms`, async() => {
                await sleep(500);
                msgController.setVectorOverlayParameters(assertItem.setVectorOverlayParameters[3]);
                let VectorOverlayTileDataPromise = new Promise((resolve)=>{
                    msgController.vectorTileStream.subscribe({
                        next: (data) => {
                            VectorOverlayTileDataArray.push(data)
                            if (data.progress === 1) {
                                resolve(VectorOverlayTileDataArray)
                            }
                        }
                    });
                });

                VectorOverlayTileDataResponse = await VectorOverlayTileDataPromise;
            }, vectorOverlayTimeout);
        });

        afterAll(() => msgController.closeConnection());
    });
});
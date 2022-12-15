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

interface IRegionHistogramDataExt extends CARTA.IRegionHistogramData {
    selectBinIndex?: Number[];
    selectBinValue?: Number[];
}

interface IContourImageDataExt extends CARTA.IContourImageData {
    totalCoordinate?: Number;
    selectedCoordinateIndex?: Number[];
    selectedCoordinateValue?: Number[];
    totalStartIndices?: Number;
    selectedStartIndicesIndex?:  Number[];
    selectedStartIndicesValue?: Number[];
}

interface AssertItem {
    registerViewer: CARTA.IRegisterViewer;
    filelist: CARTA.IFileListRequest;
    openFile: CARTA.IOpenFile;
    addTilesReq: CARTA.IAddRequiredTiles;
    setVectorOverlayParameters: CARTA.ISetVectorOverlayParameters[];
    VectorOverlayTileData : IVectorOverlayTileDataExt[];
    setImageChannel: CARTA.ISetImageChannels[];
    regionHistogramData: IRegionHistogramDataExt;
    setContour: CARTA.ISetContourParameters[];
    contourImageData: IContourImageDataExt[]
    precisionDigits: number;
};

let assertItem: AssertItem = {
    registerViewer: {
        sessionId: 0,
        clientFeatureFlags: 5,
    },
    filelist: { directory: testSubdirectory },
    openFile: {
        directory: testSubdirectory,
        file: "HH211_IQU.image",
        hdu: "0",
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
            fractional: true,
            imageBounds: { xMin: 0, xMax: 1049, yMin: 0, yMax: 1049},
            qError: undefined,
            smoothingFactor: 1,
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
            channel: 1,
            totalAngleImageDataLength: 196,
            angleTiles: [{
                height: 7,
                mip: 4,
                layer: 1,
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
        }, 
    ],
    setImageChannel: [
        {
            fileId: 0,
            channel: 1,
            stokes: 0,
            requiredTiles: {
                fileId: 0,
                tiles: [50339842, 50339841, 50335746, 50335745, 50343938, 50339843, 50343937, 50335747, 50339840, 50331650, 50335744, 50331649, 50343939, 50343936, 50331651, 50331648, 50348034, 50339844, 50348033, 50335748, 50348035, 50343940, 50348032, 50331652, 50348036],
                compressionType: CARTA.CompressionType.ZFP,
                compressionQuality: 11,
            },
        },
    ],
    regionHistogramData: {
        channel:1,
        histograms: {
            binWidth: 0.0000605975255894009,
            firstBinCenter: -0.027060849592089653,
            mean: 0.000027204052476844467,
            numBins: 1049,
            stdDev: 0.0028536340154345988
        },
        selectBinIndex:[0, 100, 500, 700, 1000],
        selectBinValue:[0, 100, 500, 700, 1000],
    },
    setContour: [
        {
            fileId: 0,
            referenceFileId: 0,
            imageBounds: {xMin: 0, xMax: 1049, yMin: 0, yMax: 1049},
            levels: [0.014208443731897273, 0.042625331195691826, 0.07104221865948637],
            smoothingMode: CARTA.SmoothingMode.GaussianBlur,
            smoothingFactor: 4,
            decimationFactor: 4,
            compressionLevel: 8,
            contourChunkSize: 100000,
        }
    ],
    contourImageData: [
        {
            contourSets: [{
                decimationFactor: 4,
                level: 0.07104221865948637,
                uncompressedCoordinatesSize: 1056
            }],
            progress: 1,
            totalCoordinate: 301,
            selectedCoordinateIndex: [0,50, 100, 150, 200, 250],
            selectedCoordinateValue: [40, 130, 189, 120, 142, 243],
            totalStartIndices: 48,
            selectedStartIndicesIndex: [0, 20, 40],
            selectedStartIndicesValue: [0, 118, 208]
        },
        {
            contourSets: [{
                decimationFactor: 4,
                level: 0.0426253311956918267,
                uncompressedCoordinatesSize: 23608
            }],
            progress: 1,
            totalCoordinate: 4085,
            selectedCoordinateIndex: [0, 500, 1000, 2500, 3500, 4000],
            selectedCoordinateValue: [40, 191, 159, 143, 79, 196],
            totalStartIndices: 780,
            selectedStartIndicesIndex: [0, 50, 100, 350, 500, 750],
            selectedStartIndicesValue: [0, 0, 10, 0, 46, 0]
        },
        {
            contourSets: [{
                decimationFactor: 4,
                level: 0.014208443731897273,
                uncompressedCoordinatesSize: 353960
            }],
            progress: 1,
            totalCoordinate: 47845,
            selectedCoordinateIndex: [0, 500, 1000, 7500, 10000, 13000, 22000, 35000, 41000, 45000],
            selectedCoordinateValue: [40, 254, 82, 128, 252, 96, 166, 18, 118, 15],
            totalStartIndices: 6396,
            selectedStartIndicesIndex: [0, 500, 1000, 2000, 3000, 4000, 6000],
            selectedStartIndicesValue: [0, 174, 32, 36,  108, 196, 220]
        },
    ],
    precisionDigits: 4,
};

let basepath: string;
describe("VECTOR_OVERLAY_CONTOUR_CHANNEL: Testing the vector overlay ICD messages with the contours and changing the channel", () => {
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

        describe(`(Case 1) Set vector overlay and contours:`, ()=>{
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

            test(`(Step 3) Set Contours parameter, Receive the Stream responses and check the correctness:`, async () => {
                msgController.setContourParameters(assertItem.setContour[0]);
                let ContourImageDataResponse: [] = await Stream(CARTA.ContourImageData, assertItem.setContour[0].levels.length);
                assertItem.contourImageData.map((data)=>{
                    let eachContourImageData: any[] = ContourImageDataResponse.filter(ResponseData => ResponseData.contourSets[0].level == data.contourSets[0].level);
                    expect(eachContourImageData[0].progress).toEqual(data.progress);
                    expect(eachContourImageData[0].contourSets[0].decimationFactor).toEqual(data.contourSets[0].decimationFactor);
                    expect(eachContourImageData[0].contourSets[0].level).toEqual(data.contourSets[0].level);
                    expect(eachContourImageData[0].contourSets[0].uncompressedCoordinatesSize).toEqual(data.contourSets[0].uncompressedCoordinatesSize);
                    data.selectedCoordinateIndex.map((subdata, index) => {
                        expect(eachContourImageData[0].contourSets[0].rawCoordinates[subdata]).toEqual(data.selectedCoordinateValue[index]);
                    })
                    data.selectedStartIndicesIndex.map((subdata, index) => {
                        expect(eachContourImageData[0].contourSets[0].rawStartIndices[subdata]).toEqual(data.selectedStartIndicesValue[index]);
                    })
                })
            });

            // let VectorOverlayTileDataArrayChannel1 = [];
            // let VectorOverlayTileDataResponseChannel1: any;
            // let RegionHistogramData: any;
            // let RasterTileDataChannel1: any;
            // let RasterTileDataSyncChannel1: any;
            // test(`(Step 3) Set Image Channel to 1 and Receive the three type ICD messages:`, async ()=> {
            //     msgController.setChannels(assertItem.setImageChannel[0]);
            //     let VectorOverlayTileDataPromiseChannel1 = new Promise((resolve)=>{
            //         msgController.vectorTileStream.subscribe({
            //             next: (data) => {
            //                 VectorOverlayTileDataArrayChannel1.push(data)
            //                 if (data.progress === 1) {
            //                     resolve(VectorOverlayTileDataArrayChannel1)
            //                 }
            //             }
            //         });
            //     });

            //     let RasterTileData = [];
            //     let RasterTileDataSync = [];

            //     let RasterTileDataSyncPromise = new Promise((resolve) => {
            //         msgController.rasterSyncStream.subscribe({
            //             next: (data) => {
            //                 RasterTileDataSync.push(data)
            //                 if (data.endSync === true) {
            //                     resolve(RasterTileDataSync)
            //                 }
            //             }
            //         })
            //     })

            //     let RasterTileDataPromise = new Promise((resolve) => {
            //         msgController.rasterTileStream.subscribe({
            //             next: (data) => {
            //                 RasterTileData.push(data)
            //                 if (RasterTileData.length === assertItem.setImageChannel[0].requiredTiles.tiles.length) {
            //                     resolve(RasterTileData)
            //                 }
            //             },
            //         })
            //     });

            //     VectorOverlayTileDataResponseChannel1 = await VectorOverlayTileDataPromiseChannel1;
            //     RegionHistogramData = await Stream(CARTA.RegionHistogramData, 1);
        
            //     RasterTileDataChannel1 = await RasterTileDataPromise;
            //     RasterTileDataSyncChannel1 = await RasterTileDataSyncPromise;
            //     // console.log(RasterTileDataChannel1.length);
            //     // console.log(RasterTileDataSyncChannel1);
            // });

            // test(`(Step 4: Verify the Response (the last VECTOR_OVERLAY_TILE_DATA of channel 1) correctness)`, () => {
            //     let lastVectorOverlayTileDataResponse = VectorOverlayTileDataResponseChannel1.slice(-1)[0];
            //     expect(lastVectorOverlayTileDataResponse.progress).toEqual(assertItem.VectorOverlayTileData[1].progress);
            //     expect(lastVectorOverlayTileDataResponse.stokesAngle).toEqual(assertItem.VectorOverlayTileData[1].stokesAngle);
            //     expect(lastVectorOverlayTileDataResponse.stokesIntensity).toEqual(assertItem.VectorOverlayTileData[1].stokesIntensity);
            //     expect(lastVectorOverlayTileDataResponse.compressionQuality).toEqual(assertItem.VectorOverlayTileData[1].compressionQuality);
            //     expect(lastVectorOverlayTileDataResponse.channel).toEqual(assertItem.VectorOverlayTileData[1].channel);

            //     expect(lastVectorOverlayTileDataResponse.angleTiles[0].height).toEqual(assertItem.VectorOverlayTileData[1].angleTiles[0].height);
            //     expect(lastVectorOverlayTileDataResponse.angleTiles[0].mip).toEqual(assertItem.VectorOverlayTileData[1].angleTiles[0].mip);
            //     expect(lastVectorOverlayTileDataResponse.angleTiles[0].layer).toEqual(assertItem.VectorOverlayTileData[1].angleTiles[0].layer);
            //     expect(lastVectorOverlayTileDataResponse.angleTiles[0].width).toEqual(assertItem.VectorOverlayTileData[1].angleTiles[0].width);
            //     expect(lastVectorOverlayTileDataResponse.angleTiles[0].x).toEqual(assertItem.VectorOverlayTileData[1].angleTiles[0].x);
            //     expect(lastVectorOverlayTileDataResponse.angleTiles[0].imageData.length).toEqual(assertItem.VectorOverlayTileData[1].totalAngleImageDataLength);
            //     assertItem.VectorOverlayTileData[0].selectedAngleImageDataIndex.map((data, index) => {
            //         expect(lastVectorOverlayTileDataResponse.angleTiles[0].imageData[data]).toEqual(assertItem.VectorOverlayTileData[1].selectedAngleImageDataValue[index])
            //     });

            //     expect(lastVectorOverlayTileDataResponse.intensityTiles[0].height).toEqual(assertItem.VectorOverlayTileData[1].intensityTiles[0].height);
            //     expect(lastVectorOverlayTileDataResponse.intensityTiles[0].layer).toEqual(assertItem.VectorOverlayTileData[1].intensityTiles[0].layer);
            //     expect(lastVectorOverlayTileDataResponse.intensityTiles[0].mip).toEqual(assertItem.VectorOverlayTileData[1].intensityTiles[0].mip);
            //     expect(lastVectorOverlayTileDataResponse.intensityTiles[0].width).toEqual(assertItem.VectorOverlayTileData[1].intensityTiles[0].width);
            //     expect(lastVectorOverlayTileDataResponse.intensityTiles[0].x).toEqual(assertItem.VectorOverlayTileData[1].intensityTiles[0].x);
            //     expect(lastVectorOverlayTileDataResponse.intensityTiles[0].imageData.length).toEqual(assertItem.VectorOverlayTileData[1].totalIntensityImageDataLength);
            //     assertItem.VectorOverlayTileData[0].selectedIntensityImageDataIndex.map((data, index) => {
            //         expect(lastVectorOverlayTileDataResponse.intensityTiles[0].imageData[data]).toEqual(assertItem.VectorOverlayTileData[1].selectedIntensityImageDataValue[index])
            //     });
            // })

            // test(`(Step 5) Verify the Response (REGION_HISTOGRAM_DATA, RASTER_TILE, and RASTER_TILE_SYNC) correctness`, () => {
            //     expect(RegionHistogramData[0].channel).toEqual(assertItem.regionHistogramData.channel);
            //     expect(RegionHistogramData[0].histograms.binWidth).toBeCloseTo(assertItem.regionHistogramData.histograms.binWidth, assertItem.precisionDigits);
            //     expect(RegionHistogramData[0].histograms.firstBinCenter).toBeCloseTo(assertItem.regionHistogramData.histograms.firstBinCenter, assertItem.precisionDigits);
            //     expect(RegionHistogramData[0].histograms.mean).toBeCloseTo(assertItem.regionHistogramData.histograms.mean, assertItem.precisionDigits);
            //     expect(RegionHistogramData[0].histograms.numBins).toEqual(assertItem.regionHistogramData.histograms.numBins);

            //     RasterTileDataChannel1.map((data) => {
            //         expect(data.channel).toEqual(assertItem.setImageChannel[0].channel);
            //     });
            //     expect(RasterTileDataChannel1.length).toEqual(assertItem.setImageChannel[0].requiredTiles.tiles.length);
            //     RasterTileDataSyncChannel1.map((data) => {
            //         expect(data.channel).toEqual(assertItem.setImageChannel[0].channel);
            //     })
            //     expect(RasterTileDataSyncChannel1[1].endSync).toEqual(true);
            // });
        });

        afterAll(() => msgController.closeConnection());
    });
});
var Ulam = (function(){
        var CanvasEntity = (function(){
            var isCanvas = false;
            var canvas = null;
            var canvasSideSize = 0;
            var getIsCanvas = function(){
                return isCanvas;
            };
            var setIsCanvas = function(param){
                isCanvas = param;
            };
            var getCanvas = function(){
                var result;
                if(isCanvas === true){
                    result = canvas;
                }else{
                    result = createCanvas();
                }
                return result;
            };
            var setCanvas = function(param){
                canvas = param;
            };
            var getCanvasSideSize = function(){
                return canvasSideSize;
            };
            var setCanvasSideSize = function(param){
                canvasSideSize = Math.round(param);
                if(isCanvas === true){
                    canvas = createCanvas();
                }
            };
            var createCanvas = function(){
                if(canvasSideSize === 0){
                    logError("canvasSide is undefined.");
                }
                var c = document.createElement("canvas");
                document.body.appendChild(c);
                c.width = CanvasEntity.getCanvasSideSize();
                c.height = CanvasEntity.getCanvasSideSize();
                var ctx = c.getContext("2d");
                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, c.width, c.height);
                setIsCanvas(true);
                setCanvas(c);
                return c;
            };
            return {
                getIsCanvas: getIsCanvas,
                setIsCanvas: setIsCanvas,
                getCanvas: getCanvas,
                setCanvas: setCanvas,
                getCanvasSideSize: getCanvasSideSize,
                setCanvasSideSize: setCanvasSideSize
            };
    })();
    var UtilsPrime = (function(){
            var requestSize = 0;
            var isWorker = !!self.importScripts;
            var getRequestSize = function(){
                return requestSize;
            };
            var getPrimeNumberArrayFromMainThread = function(detectLength, resolve, workerCount){
                var result = [];
                requestSize = detectLength;
                UtilsTimer.setStartCalculationPrime();
                if(window.Worker){
                    result = getPrimeNumberArrayFromMainThreadEnableWorker(detectLength, resolve, workerCount);
                }else{
                    result = getPrimeNumberArrayFromMainThreadDisableWorker(detectLength, resolve);
                    UtilsTimer.setEndCalculationPrime();
                }
                return result;
            };
            var getPrimeNumberArrayFromWorkerThread = function(detectLength, currentTolerance, maxTolerance ){
                var result = getPrimeNumberArrayEntity(detectLength, currentTolerance, maxTolerance);
                return result;
            };
            var getPrimeNumberArrayFromMainThreadEnableWorker = function(detectLength, resolve, workerCount){
                var result = getPrimeNumberArrayByWorkers(detectLength, resolve, workerCount);
                return result;
            };
            var getPrimeNumberArrayFromMainThreadDisableWorker = function(detectLength, resolve){
                var result = getPrimeNumberArrayEntity(detectLength, 1, 1);
                UtilsTimer.setEndCalculationPrime();
                resolve(result);
                return result;
            };
            var getPrimeNumberArrayEntity = function(detectLength, currentTolerance, maxTolerance){
                var result = [];
                var isOdd;
                for(var i=1+currentTolerance;i<detectLength;i+=1*maxTolerance){
                    isOdd = !!(i & 1);
                    if(i === 0 || i === 1 || i === 2 || i === 3){
                        result.push(i);
                    }else if(isOdd){
                        var judge = isPrimeObject(i);
                        if(judge.type === true){
                            result.push(i);
                        }
                    }
                }
                return result;
            };
            var getPrimeNumberArrayByWorkers = function(detectLength, resolve, workerCount){
                var resultPrimeArray = [];
                var finishedWorker = 0;
                var checkIdEndDetect = function(resultArray){
                    console.log("checkIdEndDetectworker" + finishedWorker);
                    resultPrimeArray = resultPrimeArray.concat(resultArray);
                    finishedWorker += 1;
                    if(finishedWorker >= l){
                        resultPrimeArray.sort(
                            function(a,b){
                                if( a < b ) return -1;
                                if( a > b ) return 1;
                                return 0;
                            }
                        );
                        UtilsTimer.setEndCalculationPrime();
                        resolve(resultPrimeArray);
                    }
                };
                logError("run worker");
                var workers = [];
                var l = workerCount || 1;
                for(var i=0;i<l;i++){
                    workers[i] = setUpWorkerDetectPrime(detectLength, i, l, checkIdEndDetect);
                }
                window.onbeforeunload = function(){
                    for(var i=0;i<workers.detectLength;i++){
                        workers[i].terminate();
                    }
                };
            };
            var setUpWorkerDetectPrime = function(detectLength, tolerance, maxTolerance, callback){
                var WORKER_FILENAME = "worker.js";
                var worker = new Worker(WORKER_FILENAME);
                worker.addEventListener("message", function(e){
                        var data = e.data;
                        if(!data.type){
                            throw "data.type no there !: " * data.type;
                        }
                        switch(data.type){
                            case "returnPrimeNumberArray":
                            console.log("[Worker]calc is end.");
                            var result = data.param;
                            callback(result);
                            break;
                            default:
                            logError("[Worker]unknown event type: " + data.type);
                        }
                });
                worker.postMessage({
                        type: "requestPrimeNumberArray",
                        param: {
                            tolerance: tolerance,
                            maxTolerance: maxTolerance,
                            detectLength: detectLength
                        }
                });
                return worker;
            };
            var isPrimeObject = function(n){
                var type = true, 
                    factorArray = [];
                if(n === 0 || n === 1 || n === 2){
                    type = true;
                }
                for(var i=3;i<=n/2;i+=2){
                    if(n%i === 0){
                        type = false;
                        factorArray.push(i);
                    }
                }
                return {
                    type: type,
                    factor: factorArray
                };
            };
            if(isWorker){
                return {
                    getRequestSize: getRequestSize,
                    getPrimeNumberArrayFromWorkerThread: getPrimeNumberArrayFromWorkerThread
                };
            }else{
                return {
                    getRequestSize: getRequestSize,
                    getPrimeNumberArrayFromMainThread: getPrimeNumberArrayFromMainThread
                };
            }
    })();
    var UtilsTimer = (function(){
        var startCalculationPrime = null;
        var endCalculationPrime = null;
        var startDrawCanvas = null;
        var endDrawCanvas = null;
        var setStartCalculationPrime = function(){
            startCalculationPrime = new Date();
        };
        var setEndCalculationPrime = function(){
            endCalculationPrime = new Date();
        };
        var setStartDrawCanvas = function(){
            startDrawCanvas = new Date();
        };
        var setEndDrawCanvas = function(){
            endDrawCanvas = new Date();
        };
        var measureCalculationPrime = function(){
            var result = endCalculationPrime - startCalculationPrime;
            return result;
        };
        var measureDrawCanvas = function(){
            var result = endDrawCanvas - startDrawCanvas;
            return result;
        };
        var getMeasureResult = function(){
            var primeResult = measureCalculationPrime();
            var drawResult = measureDrawCanvas();
            return {
                prime: primeResult,
                draw: drawResult
            };
        };
        return {
            setStartCalculationPrime: setStartCalculationPrime,
            setEndCalculationPrime: setEndCalculationPrime,
            setStartDrawCanvas: setStartDrawCanvas,
            setEndDrawCanvas: setEndDrawCanvas,
            getMeasureResult: getMeasureResult
        };
    })();
    var init = function(requestSize, workerCount){
        var sideLength = getSideLength(requestSize);
        CanvasEntity.setCanvasSideSize(sideLength);
        var primeNumberArray;
            var fetchArray  = function(){
            return new Promise(function(done){
                    primeNumberArray = UtilsPrime.getPrimeNumberArrayFromMainThread(requestSize, done, workerCount);
            });
        }
        fetchArray().then(function fulfilled(data){
                logError("fulfilled");
                drawUlam(data);
                var timeResult = UtilsTimer.getMeasureResult();
                logError(timeResult.prime);
                console.log(data);
        });
        var p1 = fetchArray();
    };
    var initWorker = function(){
        var isWorker = !!self.importScripts;
        var result;
        if(!isWorker){
            logError("run this method at worker or inline worker.");

        }else{
            result = UtilsPrime.getPrimeNumberArrayFromWorkerThread;
        }
        return result;
    };
    var drawUlam = function(primeArray){
        var currentX = Math.round(CanvasEntity.getCanvasSideSize() / 2);
        var currentY = Math.round(CanvasEntity.getCanvasSideSize() / 2);
        var vecType = 0; // 回転の方向
        var sideCounter = 2; // 現在の一辺の最長
        var currentSideCounter = 1; //現在の一辺の消費数
        var sideCounterRide = 1; // 2辺で方向を転換する
        var l = UtilsPrime.getRequestSize();
        var currentPrimeCounter = 0; //現在探索中の素数の配列上の位置

        UtilsTimer.setStartDrawCanvas();

        for(var i=1;i<l;i++){
            if(primeArray[currentPrimeCounter] === i){
                draw1pixelBlack(currentX, currentY);
                currentPrimeCounter += 1;
            }
            var f2 = vecType % 4;
            if(f2 === 0){
                currentX += 1;
            }else if(f2 === 1){
                currentY -= 1;
            }else if(f2 === 2){
                currentX -= 1;
            }else if(f2 === 3){
                currentY += 1;
            }
            currentSideCounter += 1;
            //方向の転換
            if(currentSideCounter >= sideCounter){
                vecType += 1;
                sideCounterRide += 1; //2辺に入った
                currentSideCounter = 1;
                if(sideCounterRide % 2 === 0){
                    sideCounter += 1;
                }
            }
        }
        UtilsTimer.setEndDrawCanvas();
    };
    var getSideLength = function(n){
        var result = Math.sqrt(n);
        result = Math.ceil(result);
        return result;
    };
    var draw1pixelBlack = function(x, y){
        var ctx = CanvasEntity.getCanvas().getContext("2d");
        ctx.fillStyle = "black";
        ctx.fillRect(x, y, 1, 1);
    };
    var logError = function(str){
        console.log(str);
        var form = document.getElementById("form-log");
        if(form){
         form.value += str + "\n";
        }
    };
    return {
        init: init,
        initWorker: initWorker 
    };
})();


var WORKER_FILENAME = "worker.js";

var Ulam = (function(){
        var CanvasEntity = (function(){
            var isCanvas = false;
            var canvas = null;
            var canvasSideSize = 0;
            var getIsCanvas = function(){
                return isCanvas
            }
            var setIsCanvas = function(param){
                isCanvas = param;
            }
            var getCanvas = function(){
                if(isCanvas === true){
                    result = canvas;
                }else{
                    result = createCanvas();
                }
                return result;
            }
            var setCanvas = function(param){
                canvas = param;
            }
            var getCanvasSideSize = function(){
                return canvasSideSize;
            }
            var setCanvasSideSize = function(param){
                canvasSideSize = Math.round(param);
                if(isCanvas === true){
                    canvas = createCanvas();
                }
            }
            var createCanvas = function(){
                if(canvasSideSize === 0){
                    console.log("canvasSide is undefined.");
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
            }
            return {
                getIsCanvas: getIsCanvas,
                setIsCanvas: setIsCanvas,
                getCanvas: getCanvas,
                setCanvas: setCanvas,
                getCanvasSideSize: getCanvasSideSize,
                setCanvasSideSize: setCanvasSideSize
            }
    })();
    var UtilsPrime = (function(){
            var getPrimeNumberArray = function(length, resolve){
                var result = [];
                var isWorker = !!self.importScripts;
                if(isWorker){
                    result = getPrimeNumberArrayNotWorker(length);
                }else{
                    UtilsTimer.setStartCalculationPrime();
                    if(window.Worker){
                        result = getPrimeNumberArrayByWorker(length, resolve);
                    }else{
                        result = getPrimeNumberArrayNotWorker(length, resolve);
                        UtilsTimer.setEndCalculationPrime();
                    }
                }
                return result;
            }
            var getPrimeNumberArrayByWorker = function(length, resolve){
                console.log("run worker");
                var result = [];
                var worker = new Worker(WORKER_FILENAME);
                worker.addEventListener('message', function(e){
                        var data = e.data;
                        if(!data.type){
                            throw "data.type no there !: " * data.type;
                        }
                        switch(data.type){
                            case "returnPrimeNumberArray":
                            console.log("[Worker]calc is end.");
                            result = data.param;
                            UtilsTimer.setEndCalculationPrime();
                            resolve(result);
                            break;
                            default:
                            console.log("[Worker]unknown event type: " + data.type);
                        }
                });
                worker.postMessage({
                        type: "requestPrimeNumberArray",
                        param: length
                });
                window.onbeforeunload = function(){
                    worker.terminate();
                }
            }
            var getPrimeNumberArrayNotWorker = function(length, resolve){
                var result = [];
                var i = 0;
                for(i=0;i<length;i++){
                    if(i%2 === 1){
                        var judge = isPrimeObject(i);
                        if(judge.type === true){
                            result[i] = true;
                        }else{
                            result[i] = false;
                        }
                    }else{
                        result[i] = false;
                    }
                }
                if(resolve){
                    UtilsTimer.setEndCalculationPrime();
                    resolve(result);
                }
                return result;
            }
            var isPrimeObject = function(n){
                var type = true, 
                    factorArray = [];
                if(n === 0 || n === 1 || n === 2){
                    type = true;
                }
                for(i=3;i<=n/2;i+=2){
                    if(n%i === 0){
                        type = false;
                        factorArray.push(i);
                    }
                }
                return {
                    type: type,
                    factor: factorArray
                };
            }
            return {
                getPrimeNumberArray: getPrimeNumberArray
            }
    })();
    var UtilsTimer = (function(){
        var startCalculationPrime = null;
        var endCalculationPrime = null;
        var startDrawCanvas = null;
        var endDrawCanvas = null;
        var setStartCalculationPrime = function(){
            startCalculationPrime = new Date();
        }
        var setEndCalculationPrime = function(){
            endCalculationPrime = new Date();
        }
        var setStartDrawCanvas = function(){
            startDrawCanvas = new Date();
        }
        var setEndDrawCanvas = function(){
            endDrawCanvas = new Date();
        }
        var measureCalculationPrime = function(){
            var result = endCalculationPrime - startCalculationPrime;
            return result;
        }
        var measureDrawCanvas = function(){
            var result = endDrawCanvas - startDrawCanvas;
            return result;
        }
        var getMeasureResult = function(){
            var primeResult = measureCalculationPrime();
            var drawResult = measureDrawCanvas();
            return {
                prime: primeResult,
                draw: drawResult
            }
        }
        return {
            setStartCalculationPrime: setStartCalculationPrime,
            setEndCalculationPrime: setEndCalculationPrime,
            setStartDrawCanvas: setStartDrawCanvas,
            setEndDrawCanvas: setEndDrawCanvas,
            getMeasureResult: getMeasureResult
        }
    })();
    var init = function(requestSize){
        var sideLength = getSideLength(requestSize);
        CanvasEntity.setCanvasSideSize(sideLength);
        var primeNumberArray;
        var p1 = new Promise(function(resolve){
                primeNumberArray = UtilsPrime.getPrimeNumberArray(requestSize, resolve);
        });
        p1.then(function fulfilled(primeNumberArray){
                console.log("fulfilled");
                drawUlam(primeNumberArray);
                var timeResult = UtilsTimer.getMeasureResult();
                console.log(timeResult);
        }, 
        function rejected(e){
            console.log("rejected");
        });
    }
    var initWorker = function(){
        var isWorker = !!self.importScripts;
        var result;
        if(!isWorker){
            console.log("run this method at worker or inline worker by BlobBuilder.");
        }else{
            result = UtilsPrime.getPrimeNumberArray;
        }
        return result;
    }
    var drawUlam = function(primeArray){
        var currentX = Math.round(CanvasEntity.getCanvasSideSize() / 2);
        var currentY = Math.round(CanvasEntity.getCanvasSideSize() / 2);
        var vecType = 0; // 回転の方向
        var sideCounter = 2; // 現在の一辺の最長
        var currentSideCounter = 1; //現在の一辺の消費数
        var sideCounterRide = 1; // 2辺で方向を転換する
        var l = primeArray.length;

        UtilsTimer.setStartDrawCanvas();

        for(var i=1;i<l;i++){
            if(primeArray[i] === true){
                draw1pixelBlack(currentX, currentY);
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
    }
    var getSideLength = function(n){
        var result = Math.sqrt(n);
        result = Math.ceil(result);
        return result;
    }
    var draw1pixelBlack = function(x, y){
        var ctx = CanvasEntity.getCanvas().getContext("2d");
        ctx.fillStyle = "black";
        ctx.fillRect(x, y, 1, 1);
    }
    return {
        init: init,
        initWorker: initWorker 
    }
})()


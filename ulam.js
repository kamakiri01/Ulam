var WORKER_FILENAME = "worker.js";

var Ulam = (function(){
        var CanvasEntity = (function(){
            var isCanvas = false;
            var canvas = null;
            var canvasSideSize = 0;
            var getIsCanvas = function(){
                return isCanvas}
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
            }
            var createCanvas = function(n){
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
    var Utils = (function(){
            var getPrimeNumberArray = function(length){
                var result = [];
                var isWorker = !!self.importScripts;
                if(isWorker){
                    result = getPrimeNumberArrayNotWorker(length);
                }else{
                    if(window.Worker && false){
                        result = getPrimeNumberArrayByWorker(length);
                    }else{
                        result = getPrimeNumberArrayNotWorker(length);
                    }
                }
                return result;
            }
            var getPrimeNumberArrayByWorker = function(length){
                console.log("run in worker");
                var result = [];
                var worker = new Worker(WORKER_FILENAME);
                worker.addEventListener('message', function(e){
                        var data = e.data;
                        if(!data.type){
                            throw "data.type no there !: " * data.type;
                        }
                        switch(data.type){
                            //正常に生成が終了
                            case "returnPrimeNumberArray":
                            console.log("[Worker]calc is end.");
                            result = data.param;
                            return result;
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
            var getPrimeNumberArrayNotWorker = function(length){
                var result = [];
                var i = 0;
                for(i=0;i<length;i++){
                    var judge = isPrimeObject(i);
                    if(judge.type === true){
                        result[i] = true;
                    }else{
                        result[i] = false;
                    }
                }
                return result;
            }
            //素数判定する
            var isPrimeObject = function(n){
                var type = true, 
                    factorArray = [];
                if(n === 0 || n === 1 || n === 2){
                    type = true;
                }
                for(i=2;i<=n/2;i++){
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

    var init = function(requestSize){
        var sideLength = getSideLength(requestSize);
        CanvasEntity.setCanvasSideSize(sideLength);

//        var primeNumberArray = Utils.getPrimeNumberArray(requestSize);
//        drawulam(primeNumberArray);

        var primeNumberArray;
        var p1 = new Promise(function(resolve){
                console.log("promise start");
                primeNumberArray = Utils.getPrimeNumberArray(requestSize);
                resolve();
        });

        p1.then(function(){
                console.log("then");
                drawUlam(primeNumberArray);
        });
    }
    var initWorker = function(){
        var isWorker = !!self.importScripts;
        var result;
        if(!isWorker){
            console.log("run this method at worker or inline worker by BlobBuilder.");
        }else{
            result = Utils.getPrimeNumberArray;
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


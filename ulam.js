var Ulam = (function(){
        var isCanvas = false;
        var canvas = null;
        var canvasSize = 0;

        var init = function(requestSize){
            var sideLength = getSideLength(requestSize);
            setCanvasSize(sideLength);
            createCanvas(sideLength);

            var currentX = Math.round(canvasSize / 2);
            var currentY = Math.round(canvasSize / 2);

            var vecType = 0; // 回転の方向
            var sideCounter = 2; // 現在の一辺の最長
            var currentSideCounter = 1; //現在の一辺の消費数
            var sideCounterRide = 1; // 2辺で方向を転換する

            var counter = 1; //検証する値
            for(var i=0;i<requestSize;i++){
//            while(sideCounter < canvasSize){ // this is same domain.
                var f = isPrimeObject(counter).type;
                if(f === true){
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
                counter += 1;
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
        var getPrimeNumberArray = function(length){
            var result = [],
                i = 0;
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
        var getSideLength = function(n){
            var result = Math.sqrt(n);
            result = Math.ceil(result);
            return result;
        }
        var setCanvasSize = function(n){
            canvasSize = n;
        }
        var getCanvas = function(){
            var result;
            if(isCanvas === true){
                result = canvas;
            }else{
                result = createCanvas();
            }
            return result;
        }
        var createCanvas = function(n){
            var c = document.createElement("canvas");
            document.body.appendChild(c);
            c.width = canvasSize;
            c.height = canvasSize;
            var ctx = c.getContext("2d");
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvasSize, canvasSize);

            isCanvas = true;
            canvas = c;
            return c;
        }

        var draw1pixelBlack = function(x, y){
            var ctx = getCanvas().getContext("2d");
            ctx.fillStyle = "black";
            ctx.fillRect(x, y, 1, 1);
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
        };
        
        return {
            init :init
        }

})()


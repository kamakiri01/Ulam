importScripts("ulam.js");
var getPrimeNumberArrayFromWorkerThread = Ulam.initWorker();
var sendMessage = function(type, param){
    if(typeof param !== "undefined"){
        console.log(param);
        var mes ={
                type: type,
                param: param
        };
        self.postMessage(mes); //dont user arraybuffer
    }else{
        self.postMessage({
                type: type
        });
    }
};
self.addEventListener("message", function(e){
        var data = e.data;
        if(!data.type){
            throw "data.type no there !: " + data.type;
        }
        switch(data.type){
            case "requestPrimeNumberArray":
            var param = data.param;
            var currentTolerance = param.tolerance; //current worker id
            var maxTolerance = param.maxTolerance; //max workers
            var detectLength = param.detectLength;
            var resultData = getPrimeNumberArrayFromWorkerThread(detectLength, currentTolerance, maxTolerance);
            var result = new ArrayBuffer(resultData.length);
            for(var i=0;i<resultData.length;i++){
                result[i] = resultData[i];
            }
            result = resultData; //dont use arrayBuffer
            sendMessage("returnPrimeNumberArray", result);
            self.close();
            break;
            default:
            sendMessage("unknown event");
            self.close();
        }
});


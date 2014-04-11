importScripts("ulam.js");
var getPrimeNumberArrayFromWorkerThread = Ulam.initWorker();
var sendMessage = function(type, param){
    if(typeof param !== "undefined"){
        self.postMessage({
                type: type,
                param: param
        });
    }else{
        self.postMessage({
                type: type
        });
    }
};
self.addEventListener("message", function(e){
        var data = e.data;
        if(!data.type){
            throw "data.type no there !: " + data.type
        };
        switch(data.type){
            case "requestPrimeNumberArray":
            var param = data.param;
            var currentTolerance = param.tolerance; //current worker id
            var maxTolerance = param.maxTolerance; //max workers
            var detectLength = param.detectLength;
            var result = getPrimeNumberArrayFromWorkerThread(detectLength, currentTolerance, maxTolerance);
            sendMessage("returnPrimeNumberArray", result);
            break;
            throw "unknown event:" + data.type;
        }
});


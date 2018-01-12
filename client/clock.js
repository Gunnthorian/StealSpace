onmessage = function(e) {
  console.log('Web Worker run...');
  setInterval(function(){
    postMessage();
  },1000/60);
}

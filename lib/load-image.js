(function(){

  var THREE = require('three');

  module.exports = function(url, cb){

    var canvas = document.createElement('canvas'),
        image = document.createElement('img'),
        ctx = canvas.getContext('2d');

    // Render

    var load = function () {

      canvas.width  = image.width;
      canvas.height = image.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(image, 0, 0);

      image.removeEventListener('load', load);

      var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height),
          map = new THREE.DataTexture(new Uint8Array(imageData.data), canvas.width, canvas.height, THREE.RGBAFormat);

      map.needsUpdate = true;

      if(cb instanceof Function){
        cb.call(null, null, map, canvas.width, canvas.height);
      }

    };

    image.addEventListener('load', load);

    image.src = url;

  };

})();
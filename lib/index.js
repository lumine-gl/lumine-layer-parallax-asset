(function(){

  var _ = require('lodash'),
      THREE = require('three');

  var ShaderPass = require('lumine').Passes.ShaderPass,
      Tween = require('lumine-tween');

  var loadImage = require('./load-image');

  var READ_BUFFER_SAMPLER = 't0',
      READ_BUFFER_UVC = 'cUv0',
      WRITE_SAMPLER = 't1',
      WRITE_UVC = 'cUv1',
      READ_UVO = 'oUv0',
      WRITE_UVO = 'oUv1',
      BASE_COLOR = 'baseColor';

  var DEFAULT_BASE_COLOR = new THREE.Color(0);

  module.exports = function(Scene, canvas, lumine, layer){

    var color = layer.baseColor || DEFAULT_BASE_COLOR,
        pass = new ShaderPass(canvas.composer, CopyShader, READ_BUFFER_SAMPLER);

    pass.uniforms[READ_BUFFER_UVC].value = new THREE.Vector2(1, 1);
    pass.uniforms[WRITE_UVC].value = new THREE.Vector2(1, 1);

    pass.uniforms[READ_UVO].value = new THREE.Vector2(0, 0);
    pass.uniforms[WRITE_UVO].value = new THREE.Vector2(0, 0);

    pass.uniforms[BASE_COLOR].value = new THREE.Vector4(color.r, color.g, color.b, 1);

    var assetURL = layer.assetURL,
        assetType = layer.assetType,
        colorTransitionDuration = layer.colorTransitionDuration || 200;

    var assetDims = {
          h: null, w: null
        },
        assetReady = false;

    var startAsset = function(){

      switch(assetType){
        case 'image':
          loadImage(assetURL, function(){
            colorTween.start({
              from: 0,
              to: 1
            })
          });
          break;
        case 'video':
          break;
      }

    };

    var colorTween = new Tween({
      duration: colorTransitionDuration
    });

    // Listeners

    canvas.on('resize', function(){});

    canvas.on('scroll', function(){});

    canvas.on('render', function(delta){

      if(colorTween.tweening){
        pass.uniforms[BASE_COLOR].value.w = 1 - colorTween.tick(delta);
      }

    });

    return pass;

  };

})();
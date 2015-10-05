(function(){

  module.exports = {
    uniforms: {
      t0: { type: 't', value: null },
      t1: { type: 't', value: null },
      cUv0: { type: 'v2', value: null },
      cUv1: { type: 'v2', value: null },
      oUv0: { type: 'v2', value: null },
      oUv1: { type: 'v2', value: null },
      baseColor: { type: 'v4', value: null }
    },
    vertexShader: require('lumine').Shaders.copy.vertexShader,
    fragmentShader: require('./parallax.fragment.glsl')
  };


})();
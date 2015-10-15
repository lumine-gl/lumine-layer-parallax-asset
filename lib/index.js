(function(){

  var _ = require('lodash'),
      THREE = require('three');

  var ShaderPass = require('lumine').Passes.ShaderPass,
      ParallaxShader = require('./parallax-shader'),
      Tween = require('lumine-tween'),
      now = require('lumine-now');

  var loadImage = require('./load-image');

  var READ_BUFFER_SAMPLER = 't0',
      READ_BUFFER_UVC = 'cUv0',
      WRITE_SAMPLER = 't1',
      WRITE_UVC = 'cUv1',
      READ_UVO = 'oUv0',
      WRITE_UVO = 'oUv1',
      BASE_COLOR = 'baseColor';

  var DEFAULT_BASE_COLOR = new THREE.Color(0),
      DEFAULT_PARALLAX_AMOUNT = .2;

  module.exports = function(Scene, canvas, lumine, layer){

    var o_v_min, o_v_max;

    var color = layer.baseColor || DEFAULT_BASE_COLOR,
        pass = new ShaderPass(canvas.composer, ParallaxShader, READ_BUFFER_SAMPLER);

    pass.uniforms[WRITE_SAMPLER].value = null;

    pass.uniforms[READ_BUFFER_UVC].value = new THREE.Vector2(1, 1);
    pass.uniforms[WRITE_UVC].value = new THREE.Vector2(1, 1);

    pass.uniforms[READ_UVO].value = new THREE.Vector2(0, 0);
    pass.uniforms[WRITE_UVO].value = new THREE.Vector2(0, 0);

    pass.uniforms[BASE_COLOR].value = new THREE.Vector4(color.r, color.g, color.b, 1);

    var assetURL = layer.assetURL,
        assetType = layer.assetType,
        colorTransitionDuration = layer.colorTransitionDuration || 200;

    var scrollAmount = function(geoY){
      var min = canvas.offset.y + canvas.parent.size.height,
          max = canvas.offset.y - canvas.size.height;

      return Math.max(Math.min(( (geoY - min) / (max - min) ) ,1), 0);
    };

    var onScroll = function(y, x, bottom){
      var geoY = canvas.parent.size.height - y,
          amount = scrollAmount(geoY);

      pass.uniforms[WRITE_UVO].value.y = o_v_min + (amount * (o_v_max - o_v_min));
      // TODO: respond to resize events accordingly
    };

    var startAsset = function(){

      switch(assetType){
        case 'image':
          loadImage(assetURL, function(err, map, w, h, w_o, h_o){

            pass.uniforms[WRITE_SAMPLER].value = map;

            // this algorithm assumes only vertical parallaxing

            var // dimensions
                w_a = w,
                h_a = h,
                w_c = canvas.size.width,
                h_c = canvas.size.height,
                p = 1 + (_.isNumber(layer.parallaxAmount) ? layer.parallaxAmount : DEFAULT_PARALLAX_AMOUNT),
                ph_c = p * h_c,

                // ratios
                r_a = w_a / h_a,
                r_c = w_c / h_c,
                r_oa = w_o / h_o,
                r_pc = w_c / ph_c,

                // correct proportion UVs
                u_p = 1 / ((w_a / w_o) * (r_a > r_c ? 1 + (r_a - r_c) : 1)),
                v_p = 1 / ((h_a / h_o) * (r_a < r_c ? 1 + (r_c - r_a) : 1)),
                o_v_o = 1 - h_o / h,

                // additive and multiplicative UVs from parallax amount
                v_pp = 1 / ((h_a / h_o) * (r_oa < r_pc ? 1/v_p : p)),
                s = 1 + v_p - v_pp,
                u = u_p / s,
                v = v_p / s,
                o_u = Math.max(((w_o / w_a) - u) / 2, 0),
                o_v = Math.max(((h_o / h_a) - v) / 2, 0),
                o_v_mid = o_v_o + o_v;

            o_v_max = o_v_mid + (p - 1) / 2 * v;
            o_v_min = o_v_mid - (p - 1) / 2 * v;

            //window.p = {
            //  pass: pass,
            //  w_a: w_a,
            //  h_a: h_a,
            //  w_o: w_o,
            //  h_o: h_o,
            //  w_c: w_c,
            //  h_c: h_c,
            //  p: p,
            //  r_a: r_a,
            //  r_c: r_c,
            //  r_oa: r_oa,
            //  r_pc: r_pc,
            //  u_p: u_p,
            //  v_p: v_p,
            //  //u_pp: u_pp,
            //  v_pp: v_pp,
            //  o_v_o: o_v_o,
            //  s: s,
            //  u: u,
            //  v: v,
            //  o_u: o_u,
            //  o_v: o_v,
            //  //o_v_i: o_v_i,
            //  o_v_min: o_v_min,
            //  o_v_max: o_v_max
            //};

            pass.uniforms[WRITE_UVC].value.x = u;
            pass.uniforms[WRITE_UVC].value.y = v;

            pass.uniforms[WRITE_UVO].value.x = o_u;

            onScroll(0, 0);

            colorTween.start(now(), {
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

    canvas.on('scroll', onScroll.bind(this));

    canvas.on('render', function(delta){

      if(colorTween.tweening){
        pass.uniforms[BASE_COLOR].value.w = 1 - colorTween.tick(delta);
      }

    });

    // Start
    startAsset();

    return pass;

  };

})();
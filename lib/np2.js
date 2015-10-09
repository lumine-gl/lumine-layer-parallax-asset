(function(){

  module.exports = function( aSize ){ return Math.pow( 2, Math.ceil( Math.log( aSize ) / Math.log( 2 ) ) ); };

});
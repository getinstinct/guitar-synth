!function(g){
  /**
   * This is the main interface
   * for using the Flash GuitarSynth
   *
   * It will embed the swf using swfobject
   * and handle calling the right methods
   * on it.
   *
   * It requires that you have swfobject
   * loaded on the page prior to instantiating
   * an instance.
   */

  var NUM_EMBED_RETRIES = 20
    , MS_TO_WAIT_BETWEEN_RETRIES = 30
    , REQUIRED_FLASH_VERSION = "11";

  var flashParams = {
    objectId: 'flashGuitarSynth',
    expressInstallUrl: '/flash/expressInstall.swf',
    path: '/flash',
    filename: 'GuitarSynth.swf?v=' + new Date().getTime(),
    width: 1,
    height: 1,
    params: {
      'wmode': 'window',
      'id': 'flashGuitarSynth',
      'name': 'flashGuitarSynth'
    }
  };

  g.GuitarSynthFlash = function(ops){
    ops = ops || {};

    // make sure flash available:
    if(!this.isSupported()){
      return false;
    }

    // create the swf path using vars passed in
    // or falling back to defaults:
    this.swfPath = [
      ops.flashPath || flashParams.path,
      ops.flashFilename || flashParams.filename
    ].join("/");

    // callback when swf has been embedded:
    this.onReadyFn = ops.onReady;

    // callback when swf fails to embed:
    this.onErrorFn = ops.onError;

    this._embedSwf();
  }

  g.GuitarSynthFlash.prototype = {

    turnOn: function(){
      this.swf && this.swf.turnOn();
    },

    turnOff: function(){
      this.swf && this.swf.turnOff();
    },

    playNotes: function(notes){
      this.swf && this.swf.playNotes(notes);
    },

    setTuning: function(tuning){
      this.swf && this.swf.setTuning(tuning);
    },

    isSupported: function(){
      if(!swfobject){ return false; }
      if(!swfobject.getFlashPlayerVersion().major){ return false; }

      return true;
    },

    destroy: function(){
      this.turnOff();

      if(!this.el || !this.el.parentNode){ return; }
      this.el.parentNode.removeChild(this.el);
      this.el = null;
    },

    _embedSwf: function(){
      var self = this;

      this.retryCount = 0;

      // create a dom element on the page
      // to embed the swf into, if it already
      // exists, destroy it first:
      if(this.el){ this.destroy(); }
      this.el = document.createElement('div');
      this.el.id = flashParams.objectId;
      document.body.appendChild(this.el);

      // be carefule, swfobject will turn the div into
      // the flash embed object.  So this.el is useless
      // for anything other than keeping track of whether
      // we already previously embedded the swf.

      swfobject.embedSWF(
        this.swfPath,
        flashParams.objectId,
        flashParams.width,
        flashParams.height,
        REQUIRED_FLASH_VERSION,
        flashParams.expressInstallUrl,
        flashParams.params,
        flashParams.params,
        {},
        function(e){
          self._onEmbedded(e);
        }
      );
    },

    _onEmbedded: function(e){
      this.el = document.getElementById(flashParams.objectId);
      this.swf = swfobject.getObjectById(flashParams.objectId);

      if(!this.swf){
        this.retryCount++;

        if(this.retryCount>NUM_EMBED_RETRIES){
          return this.onErrorFn && this.onErrorFn();
        }

        var self = this;
        setTimeout(function(){
          self._onEmbedded();
        },MS_TO_WAIT_BETWEEN_RETRIES);

      } else {
        this.onReadyFn && this.onReadyFn();
      }
    }

  }

}(gsynth);

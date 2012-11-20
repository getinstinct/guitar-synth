!function(g){
  /**
   * This is the main facade
   * that we expose as the main interface.
   *
   * It makes the decision which playback method
   * to use (WebAudio vs. Flash) and encapsulates all
   * of that.
   */

  g.GuitarSynth = function(ops){
    this._initBestPlaybackMethod(ops);
  }

  g.GuitarSynth.prototype = {

    turnOn: function(){
      this.playback && this.playback.turnOn();
    },

    turnOff: function(){
      this.playback && this.playback.turnOff();
    },

    playNotes: function(notes){
      this.playback && this.playback.playNotes(notes);
    },

    setTuning: function(tuning){
      this.playback && this.playback.setTuning(tuning);
    },

    destroy: function(){
      this.playback && this.playback.destroy();
    },

    /**
     * check that we have a playback method
     * and that playback method is supported
     *
     * @returns {Boolean}
     * @api public
     */
    ok: function(){
      return this.playback && this.playback.isSupported();
    },

    /**
     * we only have 2 options right now, WebAudio is preferred
     * and then we fall back to Flash where WebAudio isn't available
     *
     * @param {Object} ops
     * @api private
     */
    _initBestPlaybackMethod: function(ops){
      ops = ops || {};

      // first try WebAudio API, don't try it if it's
      // iOS device and the noiOS op was passed in:
      this._initWebAudio(ops);

      // if we didn't try WebAudio or WebAudio isn't supported, try flash:
      this._initFlashAudio(ops);

      // if we couldn't instantiate any playback method,
      // set playback to null:
      if(!this.playback.isSupported()){
        this.playback = null;
      }
    },

    _initWebAudio: function(ops){
      if(this.playback && this.playback.isSupported()){
        return;
      }

      if(ops.noiOS && iOS()){
        return;
      }

      if(ops.noWebAudio){
        return;
      }

      this.playbackMethod = 'webaudio';
      this.playback = new g.GuitarSynthWebAudio(ops);
    },

    _initFlashAudio: function(ops){
      if(this.playback && this.playback.isSupported()){
        return;
      }

      this.playback = new g.GuitarSynthFlash(ops);
      this.playbackMethod = 'flash'; 
    }
  }

  function iOS(){
    return !!(window.navigator.userAgent.match(/iPod|iPad|iPhone|iOS/g));
  }

}(gsynth);

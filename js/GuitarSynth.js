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

      // first try WebAudio API, unless the noWebAudio op is passed:
      if(!ops.noWebAudio){
        this.playbackMethod = 'webaudio';
        this.playback = new g.GuitarSynthWebAudio(ops);
      }

      if(!this.playback || !this.playback.isSupported()){
        this.playback = new g.GuitarSynthFlash(ops);
        this.playbackMethod = 'flash'; 
      }

      if(!this.playback.isSupported()){
        this.playback = null;
      }
    }

  }

}(gsynth);

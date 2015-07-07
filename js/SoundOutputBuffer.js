!function(g){
  /**
   * This creates the audio node
   * and pulls the sound data directly
   * from the instrument and feeds it into
   * the output buffer
   *
   */

  g.SoundOutputBuffer = function(){
    this._setContext();

    if(this.ok()){
      this._createAudioNode();
    }
  }

  g.SoundOutputBuffer.prototype = {

    useInstrument: function(ins){
      this.instrument = ins;
    },

    turnOn: function(){
      this.node && this.node.connect(this.context.destination);
    },

    turnOff: function(){
      this.node && this.node.disconnect();
    },

    destroy: function(){
      this.turnOff();
      this.node = null;
      this.context = null;
    },

    ok: function(){
      return !!(this.context);
    },

    getSampleRate: function(){
      return this.context && this.context.sampleRate;
    },

    _setContext: function(){
      if(!window['AudioContext'] && !window['webkitAudioContext']){ return; }

      try {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
      } catch(e){
        this.context = null;
      }
    },

    _createAudioNode: function(){
      this.node = this.context.createScriptProcessor(1024, 1, 1);

      var self = this;

      this.node.onaudioprocess = function(e){
        var data = e.outputBuffer.getChannelData(0);

        if(!self.instrument){ return; }

        for (var i = 0; i < data.length; i++) {
          data[i] = self.instrument.getSampleData();
        }
      }
    }
  }

}(gsynth);

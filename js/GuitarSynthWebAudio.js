!function(g){
  /**
   * The main interface for our WebAudio
   * Guitar Synth.
   */

  var STANDARD_TUNING = [64,59,55,50,45,40];

  g.GuitarSynthWebAudio = function(){
    // First try to create the SoundOutputBuffer
    // and make sure we can use WebAudio API
    // if not, return false and don't instantiate
    // anything:
    if(!this.isSupported()){
      return false;
    }

    this.instrument = new g.Guitar({
      tuning: STANDARD_TUNING,
      sampleRate: this.buffer.getSampleRate()
    });

    this.buffer.useInstrument( this.instrument );
  }

  g.GuitarSynthWebAudio.prototype = {

    turnOn: function(){
      this.buffer.turnOn();
    },

    turnOff: function(){
      this.buffer.turnOff();
    },

    playNotes: function(notes){
      this.instrument.playNotes(notes);
      this.turnOn();
    },

    setTuning: function(tuning){
      this.instrument.setTuning(tuning);
    },

    isSupported: function(){
      if(!this.buffer){
        this.buffer = new g.SoundOutputBuffer();
      }

      return this.buffer.ok();
    },

    destroy: function(){
      this.turnOff();

      this.buffer.destroy();
      this.instrument.destroy();
    }
  }

}(gsynth);

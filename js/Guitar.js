!function(g){
  /**
   * The guitar instantiates
   * the right strings, each in the right
   * tuning and will sum the sample
   * data across all strings during playback,
   */

  var DEFAULT_GAIN = 4;

  g.Guitar = function(ops){
    ops = ops || {};

    this.sampleRate = ops.sampleRate;
    this.gain = ops.gain || DEFAULT_GAIN;
    this.tuning = ops.tuning;

    this._createStrings( this.tuning );
  }

  g.Guitar.prototype = {

    setTuning: function(tuning){
      if(!this.strings){ this._createStrings(tuning); }

      for(var i=0;i<this.strings.length;i++){
        this.strings[i].setRootNote(tuning[i]);
      }
    },

    playNotes: function(notes){
      if(!notes || notes.length === 0){
        return this.stopPlaying();
      }

      for(var i=0;i<notes.length;i++){
        this.strings[ notes[i].str ].playNote( notes[i].fret );
      }
    },

    getSampleData: function(){
      var current = 0;

      for(var i=0;i<this.numStrings;i++){
        current += this.strings[i].getSampleData();
      }

      return (current / this.numStrings) * this.gain;
    },

    stopPlaying: function(){
      for(var i=0;i<this.numStrings;i++){
        this.strings[i].stopPlaying();
      }
    },

    destroy: function(){
      this.stopPlaying();
    },

    _createStrings: function(tuning){
      if(this.strings){ this._destroyStrings(); }

      this.numStrings = tuning.length;
      this.strings = [];

      for(var i=0;i<this.numStrings;i++){
        this.strings[i] = new g.PluckedString({
          sampleRate: this.sampleRate,
          rootNote: tuning[i]
        });
      }    
    }

  }

}(gsynth);

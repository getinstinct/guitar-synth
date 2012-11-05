!function(g){

  /**
   * Each instance of this class represents
   * 1 string on the guitar.  It uses
   * a Karplus-Strong like algorithm to
   * generate plucked string sounding oscillations
   * at the appropriate frequency.
   *
   * The rate of decay is dependent on the frequency
   * and fret number (higher fret, shorter string, faster decay)
   */
  var DECAY_CONSTANT = .99999
    , NO_SOUND_THRESHOLD = 0.1;

  g.PluckedString = function(ops){
    // sample rate varies by hardware, need to pass it
    // in from the WebAudio context:
    this.sampleRate = ops.sampleRate;
    this.setRootNote(ops.rootNote);
  }

  g.PluckedString.prototype = {

    getSampleData: function(){
      if(!this.playing){ return 0; }

      if( this.periodIndex == this.N ){
        this.periodIndex = 0;
      }

      if( this.cumulativeIndex < this.N ){
        this.period[ this.periodIndex ] += (Math.random() - Math.random()) / 4;
      }

      this.current += ( this.period[ this.periodIndex ] - this.current ) * this.decay;
      this.period[ this.periodIndex ] = this.current;
    
      ++this.periodIndex;
      ++this.cumulativeIndex;

      this.decay *= DECAY_CONSTANT;
    
      if( this.decay < NO_SOUND_THRESHOLD ){
        this.stopPlaying();
      }

      return this.current;
    },

    setRootNote: function(rootNote){
      this.rootNote = rootNote;
      this.rootFreq = this._midiToFreq(this.rootNote);

      this._setFrequency(this.rootFreq);

      // the goal of the decay being different by string
      // is that the low notes need to decay faster, otherwise
      // they resonate for a really long time.  But the high
      // notes need to decay slower, otherwise they sound really
      // muted and short.
      //
      // this formula is just from trial and error and based
      // on nothing other than what sounded best to my ear:
      this.stringDecay = (this.rootNote / 80) + .1;
    },

    playNote: function(fret){
      this._setFrequency( this._midiToFreq(fret + this.rootNote) );
      this.playing = true;
    },

    stopPlaying: function(){
      this.playing = false;
    },

    _setFrequency: function(freq){
      this.N = Math.round(this.sampleRate / freq);
      this.period = this._createArrayWithZeros(this.N);

      this.periodIndex = 0;
      this.cumulativeIndex = 0;
      this.decay = this.stringDecay;

      this.current = 0;
    },

    _midiToFreq: function(midi){
      return 440.0 * Math.pow(2, (midi - 69) / 12.0);
    },

    _createArrayWithZeros: function(len){
      var arr = [];
      for(var i=0;i<len;i++){
        arr[i] = 0;
      }
      return arr;
    }

  }

}(gsynth);

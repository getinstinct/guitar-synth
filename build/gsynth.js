gsynth = {};
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
      try {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
      } catch(e){
        this.context = null;
      }
    },

    _createAudioNode: function(){
      this.node = this.context.createJavaScriptNode(1024, 1, 1);

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
      try {
        this.swf.turnOn();
      } catch(e) {
        // console.log("error turning on swf",e);
      }
    },

    turnOff: function(){
      try {
        this.swf.turnOff();
      } catch(e) {
        // console.log("error turning off swf",e);
      }
    },

    playNotes: function(notes){
      try {
        this.swf.playNotes(notes);
      } catch(e) {
        // console.log("error playing notes",e);
      }
    },

    setTuning: function(tuning){
      try {
        this.swf.setTuning(tuning);
      } catch(e) {
        // console.log("error setting tuning",e);
      }
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

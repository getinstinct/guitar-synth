package com.instinct.gsynth {

  public class PluckedString {
      
    private var _rootNote:int;
    private var _rootFreq:Number;

    private var _sampleRate:int = 44100;
    private var _N:int = 0;
      
    private var _period:Vector.<Number>;
    private var _periodIndex:int = 0;
    private var _cumulativeIndex:int = 0;
    
    private var _current:Number = 0.0;
    private var _playing:Boolean = false;

    // Decay
    private var _stringDecay: Number = 0;
    private var _decay: Number = 0;
    private const DECAY_CONSTANT:Number = .99999;

    // auto-turning off after sound is done resonating:
    private const NO_SOUND_THRESHOLD:Number = 0.1;
    
    public function PluckedString(rootNote:int){
      setRootNote(rootNote);
    }

    public function getSampleData():Number{
      if(!_playing){
        return 0;
      }

      if( _periodIndex == _N ) {
        _periodIndex = 0;
      }
    
      if( _cumulativeIndex < _N ){
        _period[ _periodIndex ] += (Math.random() - Math.random()) / 4;
      }

      _current += ( _period[ _periodIndex ] - _current ) * _decay;
      _period[ _periodIndex ] = _current;
    
      ++_periodIndex;
      ++_cumulativeIndex;

      _decay *= DECAY_CONSTANT;
    
      if(_decay<NO_SOUND_THRESHOLD){
        stopPlaying();
      }

      return _current;
    }

    public function playNote(fret:int){
      setFrequency( noteToFreq(fret + _rootNote) );
      _playing = true;
    }

    public function setRootNote(note:int){
      _rootNote = note;
      _rootFreq = noteToFreq(_rootNote);
      
      setFrequency( _rootFreq);

      // the goal of the decay being different by string
      // is that the low notes need to decay faster, otherwise
      // they resonate for a really long time.  But the high
      // notes need to decay slower, otherwise they sound really
      // muted and short.
      //
      // this formula is just from trial and error and based
      // on nothing other than what sounded best to my ear:
      _stringDecay = (_rootNote / 80) + .1;
    }

    public function stopPlaying(){
      _playing = false;
    }

    private function setFrequency(freq:int){
      _N = Math.round(_sampleRate / freq);
      _period = new Vector.<Number>( _N, true );

      _periodIndex = 0;
      _cumulativeIndex = 0;
      _decay = _stringDecay;

      _current = 0.0;
    }
    
    private function noteToFreq(note:uint):Number {
      return 440.0 * Math.pow(2, (note - 69) / 12.0);
    }

  }
}



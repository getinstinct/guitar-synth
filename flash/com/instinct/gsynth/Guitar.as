package com.instinct.gsynth {
  
  import com.instinct.gsynth.PluckedString;

  public class Guitar {

    private var _numStrings:int = 6;
    private var _strings:Vector.<PluckedString>;

    private var _current:Number = 0.0;

    public function Guitar(){
      createStrings([64,59,55,50,45,40]);
    }

    public function createStrings(tuning:Array){
      var i:int = 0
        , len:int = tuning.length;

      _strings = new Vector.<PluckedString>(6);

      for(;i<len;i++){
        _strings[i] = new PluckedString(tuning[i]);
      }
    }

    public function getSampleData():Number{
      _current = 0.0;

      var i:int = 0
        , str:PluckedString;

      for(;i<_numStrings;i++){
        str = _strings[i];
        _current += str.getSampleData();
      }

      return _current;
    }

    public function playNotes(notes:Array){
      // if there's no notes, stop playing all strings:
      if(notes.length==0){
        stopPlaying();
        return;
      }

      var i:int = 0
        , len:int = notes.length;

	    for(;i<len;i++){
		    _strings[notes[i].str].playNote(notes[i].fret);
	    }
    }

    // assumes you're never changing the # of strings...
    public function setTuning(tuning:Array){
      var i:int = 0
        , len:int = tuning.length;

      for(;i<len;i++){
        _strings[i].setRootNote(tuning[i]);
      }
    }

    public function stopPlaying(){
      var i:int = 0
        , len:int = _strings.length;

      for(;i<len;i++){
        _strings[i].stopPlaying();
      }
    }
  }
}


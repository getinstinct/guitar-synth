package com.instinct.gsynth {
  
  import com.instinct.gsynth.Guitar;
  
  import flash.events.SampleDataEvent;
  import flash.media.Sound;
  import flash.media.SoundChannel;

  public class SoundOutputBuffer {
    
    // 2048 is min supported by Flash:
    private const MIN_BUFFER_SIZE:int = 2048;

    private var _sound:Sound;
    private var _channel:SoundChannel;
    private var _instrument:Guitar;

    private var _bufferSize:int = MIN_BUFFER_SIZE;
    private var _current:Number = 0.0;
    
    public function SoundOutputBuffer(){
      _sound = new Sound();
      _sound.addEventListener( SampleDataEvent.SAMPLE_DATA, onSampleData );
    }

    public function useInstrument(ins: Guitar){
      _instrument = ins;
    }

    public function turnOn(){
      if(_channel){ return; }

      _channel = _sound.play();
    }

    public function turnOff(){
      if(!_channel){ return; }

      _instrument.stopPlaying();
      _channel = null;
    }

    public function setBufferSize(s:int = MIN_BUFFER_SIZE){
      _bufferSize = s;
    }

    private function onSampleData(event: SampleDataEvent): void{
      var i:int = 0
        , total:Number = 0
        , len:int = _bufferSize;

      for(; i < len; ++i){
        _current = _instrument.getSampleData();

        event.data.writeFloat( _current );
        event.data.writeFloat( _current );
      }
    }

  }
}


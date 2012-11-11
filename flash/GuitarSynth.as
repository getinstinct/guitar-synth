package  {

  import flash.display.Sprite;
  import flash.external.ExternalInterface;
  import flash.utils.*;

  import com.instinct.gsynth.*;

  public class GuitarSynth extends Sprite {

    private var _buf:SoundOutputBuffer;
    private var _instrument:Guitar;

    public function GuitarSynth(){

      _buf = new SoundOutputBuffer();
      _instrument = new Guitar();

      _buf.useInstrument(_instrument);

      onComplete: ExternalInterface.addCallback("turnOff", onTurnOff);
      onComplete: ExternalInterface.addCallback("turnOn", onTurnOn);

      onComplete: ExternalInterface.addCallback("playNotes", onPlayNotes);
      onComplete: ExternalInterface.addCallback("setTuning", onSetTuning);
      onComplete: ExternalInterface.addCallback("setBufferSize", onSetBufferSize);
      // for testing in Flash IDE, comment out
      // ExternalInterfaces and call demo method:
      //demo();
    }

    private function demo():void{
      _buf.turnOn();

      setTimeout(function(){
        trace("play1");
        _instrument.playNotes([{str:5, fret:0}]);
      }, 1000);

      setTimeout(function(){
        trace("play2");
        _instrument.playNotes([{ str: 4, fret: 2 }]);
      }, 2000);
    }

    private function onTurnOn():void{
      _buf.turnOn();
    }

    private function onTurnOff():void{
      _buf.turnOff();
    }

    private function onPlayNotes(notes:Array):void{
      _instrument.playNotes(notes);
      _buf.turnOn();
    }

    private function onSetTuning(tuning:Array):void{
      _instrument.setTuning(tuning);
    }

    private function onSetBufferSize(size:int):void{
      _buf.setBufferSize(size);
    }

  }
}



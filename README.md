An early attempt at a Guitar synth using WebAudioAPI with a Flash fallback.

Cross-browser support:

  - Chrome 12+
  - Safari 5+
  - FF 10+
  - IE 9+
  - Opera 11+
  - iOS 6+
  - Android 3+ (haven't tried yet)


TODO:

  - make it work okay on iOS, the example works, but when it's used with other UI animations at same time
    it gets really choppy.
  - make it sound better, less 'tinny' sounding
  - add attack velocity so some notes can be played harder/decay slower
    than others
  - better performance for Flash synth, it can be slow and laggy on some machines
  - support for more expressive playing (hammers, pulls, bends, slides..)
  - support for strumming (i.e. a fn call to playNotes() with multiple
    notes, should result in timeshifting each string a bit to simulate how someone would strum a chord)
  - support for different types of guitars/effects
  - unit tests


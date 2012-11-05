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


MIT License

Copyright (c) 2012 Brian Stoner

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

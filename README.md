# musa-dsl-atom-repl

An Atom package to allow a Read-Eval-Print-Loop connected with a Musa-DSL REPL server.

[Musa-DSL](https://github.com/javier-sy/musa-dsl) is a Ruby Domain Specific Language for algorithmic musical composition.

The Musa-DSL server should be implemented creating a new REPL instance inside the binding context of the sequencer DSL. A simple instantiation scenario is the following:

```ruby
require 'musa-dsl'
require 'unimidi'

clock_input = UniMIDI::Input.all.select { |x| x.name == 'Apple Inc. Driver IAC' }[1]
output = UniMIDI::Output.all.select { |x| x.name == 'Apple Inc. Driver IAC' }[1]

clock = Musa::InputMidiClock.new clock_input

voices = Musa::MIDIVoices.new sequencer: transport.sequencer, output: output, channels: [0]

transport = Musa::Transport.new clock, 1, 24

transport.sequencer.with do
	Musa::REPL.new binding
end

transport.start
```

This opens a REPL socket in localhost:1327. musa-dsl-atom-repl package automatically connects to this default server.

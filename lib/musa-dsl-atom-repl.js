'use babel';

import Connection from './connection';
import StatusView from './status-view';
import Commands from './commands';

import { CompositeDisposable, Disposable } from 'atom';

export default {

  subscriptions: null,

  connection: null,
  statusView: null,

  commands: null,

  activate(state) {
    console.log("musa-dsl-atom-repl: activate " + state);

    self = this;

    this.connection = new Connection(state ? state["connection"] : null);
    this.statusView = new StatusView();

    this.commands = new Commands(this.connection, this.statusView);

    this.connection.statusView = this.statusView;

    this.connection.open();

    this.subscriptions = new CompositeDisposable(
      atom.commands.add('atom-workspace', {
        'musa-dsl-atom-repl:send': () => this.send()
      }),
      atom.commands.add('atom-workspace', {
        'musa-dsl-atom-repl:toggle': () => this.toggle()
      }),
      atom.workspace.addOpener(uri => {
        if (uri === 'atom://musa-repl-status-view') {
          return self.statusView;
        }
      })
    );
  },

  serialize() {
    return { connection: this.connection.serialize() };
  },

  deactivate() {
    console.log("musa-dsl-atom-repl: deactivate");
    this.subscriptions.dispose();
    this.commands = null;
    this.connection.destroy();
    this.statusView.destroy();
  },

  send() {
    const editor = atom.workspace.getActiveTextEditor();

    if(editor) {
      var selection = editor.getSelectedText();

      if(selection.length == 0) {
        const pos = editor.getCursorScreenPosition();

        editor.moveToEndOfLine();
        editor.selectToBeginningOfLine();

        selection = editor.getSelectedText();

        editor.setCursorScreenPosition(pos);
      }

      if(selection.startsWith('#%')) {
        with(this.commands) {
          result = eval(selection.substring(2));
          this.statusView.status(result);
        }
      } else {
        this.connection.write(selection);
      }
    }
  },

  toggle() {
    atom.workspace.toggle('atom://musa-repl-status-view');
  }
};

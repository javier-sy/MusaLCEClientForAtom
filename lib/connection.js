'use babel';

export default class Connection {

  constructor(state) {
    if(state) {
      this.host = state["host"];
      this.port = state["port"];
    } else {
      this.host = "localhost";
      this.port = 1327;
    }

    this.statusView = null;
    this.error = false;
    this.closed = true;
  }

  serialize() {
      return { host: this.host, port: this.port }
  }

  destroy() {
    if(this.client) {
      this.client.end();
      this.statusView.response("Disconnected from Musa-DSL host");
    }
    this.statusView = null;
    this.client = null;
  }

  open() {
    this.statusView.response('Connecting to Musa-DSL host ' + this.host + ':' + this.port + '...');

    if(this.client != null) this.close();

    this.client = this.createSocket();
    this.error = false;
    this.client.connect(this.port, this.host);
    this.closed = false;
  }

  close() {
    if(this.closed) {
      this.statusView.response('Confirming closing current connection...');
    } else {
      this.statusView.response('Closing current connection...');
      this.client.end();
    }
    this.client = null;
    this.error = false;
    this.closed = true;
  }

  write(message) {
    var self = this;

    if(this.error) this.close();
    if(this.closed) this.open();

    this.client.write('#begin\n');

    for(l of message.split('\n')) {
      if(l === '#begin' || l === '#end') {
        l = '#' + l;
      }
      this.client.write(l + '\n');
    }

    this.client.write('#end\n');
  }

  createSocket() {
    var self = this;

    var net = require('net');
    var socket = new net.Socket();

    socket.on('error', function(error) {
      self.statusView.error('Error on connection to Musa-DSL host ' + self.host + ':' + self.port + ' (' + error + ')');
      self.error = true;
    });

    socket.on('close', function() {
      if(socket == self.client) {
        self.statusView.error('Closed current connection');
        self.closed = true;
      } else {
        self.statusView.error('Closed previous connection');
      }
    });

    socket.on('connect', function() {
      self.statusView.response('... connected');
    });

    var kind = null;
    var error_field = null;

    var echo = [];

    var error_message = [];
    var error_backtrace = [];

    socket.on('data', function(data) {
      if(self.statusView) {
        for(line of data.toString().trim().split('\n')) {
          switch(line) {
          case '//echo':
              kind = 'echo';
              break;

          case '//error':

            kind = 'error';
            error_field = 'message';

            break;

          case '//backtrace':
            error_field = 'backtrace';
            break;

          case '//end':

            switch(kind) {
              case 'error':
                for(e of error_message) {
                  self.statusView.error(e);
                }

                for(bt of error_backtrace) {
                  self.statusView.error("&emsp;&emsp;" + bt);
                }
                error_field = null;
                error_message = [];
                error_backtrace = [];
                break;

              case 'echo':
                for(e of echo) {
                  self.statusView.status(e);
                }
                echo = [];
                break;
            }

            kind = null;

            break;

          default:

            switch(kind) {
              case 'error':
                switch(error_field) {
                case 'message':
                  error_message[error_message.length] = line;
                  break;

                case 'backtrace':
                  error_backtrace[error_backtrace.length] = line
                  break;
                }
                break;

              case 'echo':
                echo[echo.length] = line;
                break;

              default:
                if(line.startsWith('//')) line = line.substring(2);
                self.statusView.success(line);
            }
          }
        }
      } else {
        console.log("data received (no status view available): " + data);
      }
    });

    return socket;
  }
}

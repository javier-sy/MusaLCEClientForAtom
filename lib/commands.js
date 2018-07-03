'use babel';

export default class Commands {
  constructor(connection, statusView) {
    this.connection = connection;
    this.statusView = statusView;
  }

  host(host, port) {
    if(host != null || port != null) {
      this.connection.close();

      if(host != null) {
        this.connection.host = host;
      }
      if(port != null) {
        this.connection.port = port;
      }

      this.connection.open();
    }
  }

  clear() {
    this.statusView.clear();
  }
}

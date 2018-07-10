'use babel';

export default class StatusView {

  constructor() {
    this.element = document.createElement('div');

    this.element.style.position = 'absolute';
    this.element.style.contain = 'strict';
    this.element.style.overflow = 'hidden';

    this.element.classList.add('musa-dsl-atom-repl');

    this.statusView = document.createElement('div');

    this.statusView.style.position = 'absolute';
    this.statusView.style.width = '100%';
    this.statusView.style.height = '100%';
    this.statusView.style.float = 'left';
    this.statusView.style.display = 'flex';
    this.statusView.style.flexDirection = 'column';
    this.statusView.style.overflowY = 'auto';

    this.statusView.addEventListener('scroll',
      (e) => {
        this.userScrolled =
          e.target.scrollHeight - e.target.clientHeight >
          e.target.scrollTop + 1;
      } );

    this.statusView.classList.add('status-view');

    this.element.appendChild(this.statusView);
  }

  status(message) {
    this.addMessage(message, 'status');
  }

  error(message) {
    this.addMessage(message, 'error');
  }

  success(message) {
    this.addMessage(message, 'success');
  }

  response(message) {
    this.addMessage(message, 'response');
  }

  addMessage(text, clazz, pre) {
    if(text) {
      const message = document.createElement('div');

      text = text.replace(/\</g, '&lt;').replace(/\>/g, '&gt;').replace(/\t/g, '&emsp;').replace(/\s/g, '&nbsp;');

      message.classList.add(clazz);
      if(pre) {
        message.innerHTML = `<pre>${text}</pre>`
      } else {
        message.innerHTML = text
      }

      this.statusView.appendChild(message);
      if(!this.userScrolled) {
        this.statusView.scrollTop = this.statusView.scrollHeight;
      }
    }
  }

  clear() {
    this.statusView.innerHTML = "";
  }

  getTitle() {
    // Used by Atom for tab text
    return 'Musa-DSL REPL Status';
  }

  getDefaultLocation() {
    // This location will be used if the user hasn't overridden it by dragging the item elsewhere.
    // Valid values are "left", "right", "bottom", and "center" (the default).
    return 'bottom';
  }

  getAllowedLocations() {
    // The locations into which the item can be moved.
    return ['left', 'right', 'bottom'];
  }

  getURI() {
    // Used by Atom to identify the view when toggling.
    return 'atom://musa-repl-status-view'
  }

  // Tear down any state and detach
  destroy() {
    this.element.remove();
    this.subscriptions.dispose();
  }

  getElement() {
    return this.element;
  }
}

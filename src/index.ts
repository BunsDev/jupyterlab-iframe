import {
  JupyterLab, JupyterLabPlugin, ILayoutRestorer
} from '@jupyterlab/application';

import {
  ICommandPalette, showDialog, Dialog
} from '@jupyterlab/apputils';

import {
  IDocumentManager
} from '@jupyterlab/docmanager';

import {
  Widget
} from '@phosphor/widgets';

import '../style/index.css';

const extension: JupyterLabPlugin<void> = {
  id: 'jupyterlab_iframe',
  autoStart: true,
  requires: [IDocumentManager, ICommandPalette, ILayoutRestorer],
  activate: activate
};

class IFrameWidget extends Widget {
  constructor(path: string) {
    super();
    this.id = path;

    let div = document.createElement('div');
    div.classList.add('iframe-widget');
    let iframe = document.createElement('iframe');
    iframe.setAttribute('baseURI', '');
    iframe.src = path;

    this.iframe = iframe;

    div.appendChild(iframe);
    this.node.appendChild(div);
  }

  iframe: HTMLIFrameElement;
};

class OpenIFrameWidget extends Widget {
  constructor() {
    let body = document.createElement('div');
    let existingLabel = document.createElement('label');
    existingLabel.textContent = 'Site:';

    let input = document.createElement('input');
    input.value = '';
    input.placeholder = 'www.google.com';

    body.appendChild(existingLabel);
    body.appendChild(input);

    super({ node: body });
  }

  getValue(): string {
    return this.inputNode.value;
  }

  get inputNode(): HTMLInputElement {
    return this.node.getElementsByTagName('input')[0] as HTMLInputElement;
  }
}

function activate(app: JupyterLab, docManager: IDocumentManager, palette: ICommandPalette, restorer: ILayoutRestorer) {
  console.log('JupyterLab extension knowledgelab is activated!');

  // Declare a widget variable
  let widget: IFrameWidget;

  // Add an application command
  const open_command = 'iframe:open';

  app.commands.addCommand(open_command, {
    label: 'Open IFrame',
    isEnabled: () => true,
    execute: args => {
      var path = typeof args['path'] === 'undefined' ? '': args['path'] as string;

      if (path === '') {
        showDialog({
          title: 'Open site',
          body: new OpenIFrameWidget(),
          focusNodeSelector: 'input',
          buttons: [Dialog.cancelButton(), Dialog.okButton({ label: 'GO' })]
        }).then(result => {
          if (!result.value) {
            return null;
          }
          path = <string>result.value;
          if (!widget){
            widget = new IFrameWidget(path);
          }
          widget.iframe.src = path;
          app.shell.addToMainArea(widget);
          app.shell.activateById(widget.id);
        });
      } else {
        if (!widget){
          widget = new IFrameWidget(path);
        }
        widget.iframe.src = path;
        app.shell.addToMainArea(widget);
        app.shell.activateById(widget.id);
      }
    }
  });

  // Add the command to the palette.
  palette.addItem({command: open_command, category: 'Tools'});
};


export default extension;

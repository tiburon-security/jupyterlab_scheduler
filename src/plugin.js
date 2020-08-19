require('../style/plugin.css');

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IMainMenu } from '@jupyterlab/mainmenu';
import { Menu, Widget} from '@lumino/widgets';
import { ICommandPalette, MainAreaWidget, showDialog, Dialog } from '@jupyterlab/apputils';
import { ViewScheduledJobs } from './ShowJobs.js';
import { AddJob } from './AddJob.js';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';
import { buildIcon, runIcon } from '@jupyterlab/ui-components';

import { URLExt } from '@jupyterlab/coreutils';

/**
 * Initialization data for the main menu example.
 */
const extension = {
  id: 'jupyterlab_scheduler',
  autoStart: true,
  requires: [ICommandPalette, IMainMenu, IFileBrowserFactory],
  activate: async(
    app,
    palette,
    mainMenu,
    factory
  ) => {
    const { commands } = app;

    console.log('JupyterLab extension jupyterlab_scheduler is activated!');
    console.log(app)

    /**
     * View for seeing Scheduled Jobs & Canceling them
     */

    // Create a menu
    const schedulerMenu = new Menu({ commands });
    schedulerMenu.title.label = 'Cron Scheduler';
    mainMenu.addMenu(schedulerMenu, { rank: 80 });

    const content = new ViewScheduledJobs();
    const widget = new MainAreaWidget({ content });
    widget.title.label = 'React Widget';
    widget.title.closable = true;
    widget.id = 'scheduled-jobs';

    // Add a command
    const command = 'show-cron';
    commands.addCommand(command, {
      label: 'Show cronjobs',
      caption: 'Show cronjobs',
      execute: (args) => {
        console.log(
          `show has been called`
        );

        if (!widget.isAttached) {
          // Attach the widget to the main work area if it's not there
          app.shell.add(widget, 'main');
        }

        // Activate the widget
        app.shell.activateById(widget.id);

      }
    });

    // Add the command to the menu
    schedulerMenu.addItem({ command, args: { origin: 'from the menu' } });


    /**
     * View for Scheduling jobs
     */

    app.commands.addCommand('jupyterlab_scheduler/add-job:open', {
      label: 'Schedule',
      caption: "Schedule Recurring Exectuion of File",
      icon: buildIcon,
      execute: () => {

        const file = factory.tracker.currentWidget.selectedItems().next();
        const fullPath = app._paths.directories.serverRoot.concat("/", file.path)
        const addJob = new AddJob(file.name, fullPath);

        showDialog({
          title: `Schedule Recurring Execution for: ${file.name}`,
          body: addJob,
          buttons: [Dialog.okButton()]
        }).catch(e => console.log(e));
      }
    });

    app.contextMenu.addItem({
      command: 'jupyterlab_scheduler/add-job:open',
      selector: '.jp-DirListing-item',
      rank: 0
    });

  }
};

export default extension;
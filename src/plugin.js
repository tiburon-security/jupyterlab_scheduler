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
import { runIcon } from '@jupyterlab/ui-components';

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
    const { shell, commands } = app;

    console.log('JupyterLab extension jupyterlab_scheduler is activated!');

    /**
     * Create a menu 
     */
    const schedulerMenu = new Menu({ commands });
    schedulerMenu.title.label = 'Cron Scheduler';
    mainMenu.addMenu(schedulerMenu, { rank: 80 });

    /**
     * View for seeing Scheduled Jobs & Canceling them
     */



    // Add a command
    const command = 'show-cron';
    commands.addCommand(command, {
      label: 'Show cronjobs',
      caption: 'Show cronjobs',
      execute: (args) => {

        // Create widget for displaying jobs & attach
        const content = new ViewScheduledJobs(shell);
        const widget = new MainAreaWidget({ content });
        widget.title.label = 'Scheduled Jobs';
        widget.title.closable = true;
        widget.id = 'scheduled-jobs';

        shell.add(widget, 'main');

      }
    });

    // Add the command to the menu
    schedulerMenu.addItem({ command, args: { origin: 'from the menu' } });

    /**
     * View for Scheduling jobs
     */

    // Add command for scheduling a job
    app.commands.addCommand('jupyterlab_scheduler/add-job:open', {
      label: 'Schedule',
      caption: "Schedule Recurring Exectuion of File",
      icon: runIcon,
      execute: () => {

        // Create dialog for scheduling job
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

    // Add command to the context menu
    app.contextMenu.addItem({
      command: 'jupyterlab_scheduler/add-job:open',
      selector: '.jp-DirListing-item',
      rank: 0
    });

  }
};

export default extension;
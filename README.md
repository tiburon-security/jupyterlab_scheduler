# jupyterlab_scheduler

A simple plugin for scheduling files for recurring execution using the cron utility within the Jupyter Lab UI. Use cases

Security Note: Cron jobs are executed under the permission set of the JupyerLab process; if you start jupyter as root (not recommended!) every job that is scheduled via the UI will also run as root.

## Screenshots

### Scheduling a job

![Context Menu](https://raw.githubusercontent.com/tiburon-security/jupyterlab_scheduler/master/screenshots/context-menu.png)

![Schedule Job](https://raw.githubusercontent.com/tiburon-security/jupyterlab_scheduler/master/screenshots/schedule-job.png)

### Viewing Scheduled Jobs

![Menu](https://raw.githubusercontent.com/tiburon-security/jupyterlab_scheduler/master/screenshots/main-menu.png)

![Scheduled Jobs](https://raw.githubusercontent.com/tiburon-security/jupyterlab_scheduler/master/screenshots/scheduled-jobs.png)

### Viewing Run Logs

![View Logs](https://raw.githubusercontent.com/tiburon-security/jupyterlab_scheduler/master/screenshots/view-logs.png)

## Prerequisites

* JupyterLab
* Cron installed on the JupyterLab host

## Installation

To install using pip:

```bash
pip install jupyterlab_scheduler

jupyter labextension install jupyterlab_scheduler
```

## Development

For a development install (requires npm version 4 or later), do the following in the repository directory:

```bash
# Clone the repo to your local environment
# Move to jupyterlab_scheduler directory
# Install dependencies
npm install
npm run build:lib
# Install your development version of the extension
jupyter labextension install .
```

You run JupyterLab in watch mode to watch for changes in the extension's source and automatically rebuild.

```bash
# Run jupyterlab in watch mode
jupyter lab --watch
```

Now every change will be built locally and bundled into JupyterLab. Be sure to refresh your browser page after saving file changes to reload the extension (note: you'll need to wait for webpack to finish, which can take 10s+ at times).

```bash
# Run jupyterlab in auto reload mode
jupyter lab  --autoreload --NotebookApp.token='' --NotebookApp.password='' --no-browser
```

Works better when developing server extensions

## Publishing

To build the plugin for disitibution on Pypi:

```bash
python3 setup.py sdist bdist_wheel

python3 -m twine upload --repository pypi dist/*
```

### Uninstall

```bash
jupyter labextension uninstall jupyterlab_scheduler
```


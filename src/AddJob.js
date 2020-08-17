import { ReactWidget } from '@jupyterlab/apputils';
import { requestAPI } from './api';

import React from 'react';


class Component extends React.Component {

  constructor(){
    super()

    this.state = {value: ''};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    alert('A job was submitted: ' + this.state.value);
    event.preventDefault();
  }


  async addJob(schedule, script){

    const dataToSend = { 
      script,
      schedule
    };

    try {
      const reply = await requestAPI('delete', {
        body: JSON.stringify(dataToSend),
        method: 'POST'
      });


      console.log(reply);

      // delete it from the state object
      let updatedJobs = this.state.jobs.filter(job => job.script == (script && job.schedule == schedule));

      this.setState({
        jobs:updatedJobs
      })


    } catch (reason) {
      console.error(
        `Error sending delete: ${reason}`
      );
    }

  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <div>
        <label>
            Cron Schedule:
            <input type="text" value={this.state.value} onChange={this.handleChange} />
        </label>
        </div>
        <div>
          <input type="submit" value="Schedule" />
        </div>
      </form>
    )
  }
}


/**
 * A Lumino Widget that wraps the react component.
 */
export class AddJob extends ReactWidget {

  constructor(script) {
    super();
    console.log(script)
    this.addClass('ReactWidget');
  }

  render() {
    return <Component />;
  }
}
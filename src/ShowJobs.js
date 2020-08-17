import { ReactWidget } from '@jupyterlab/apputils';
import { requestAPI } from './api';

import React from 'react';


class Jobs extends React.Component {

  constructor(){
    super()

    this.state = {
      jobs: []
    }
  }


  componentDidMount(){
    this.getScheduledJobs()
  }


  async getScheduledJobs() {
    try {
      const data = await requestAPI('list');

      if("data" in data){
        this.setState({jobs:data.data})
      }

      console.log("data", data);

    } catch (reason) {
      console.error(`Error fetching jobs: ${reason}`);
    }
  }

  async deleteJob(schedule, script){

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
      <div>
        <table style={{
          "border" : "1px solid black",
          "borderCollapse": "collapse"
        }}>
          <thead>
            <tr style={{"border" : "1px solid black"}}>
              <th style={{"border" : "1px solid black"}}>Schedule</th>
              <th style={{"border" : "1px solid black"}}>Script</th>
              <th style={{"border" : "1px solid black"}}>Command</th>
              <th style={{"border" : "1px solid black"}}>Log Location</th>
              <th style={{"border" : "1px solid black"}}>Delete</th>
            </tr>
          </thead>
          <tbody>

            {this.state.jobs.map((job, i)=>(
              <tr key={i} style={{"border" : "1px solid black"}}>
                <td style={{"border" : "1px solid black"}}>{job.schedule}</td>
                <td style={{"border" : "1px solid black"}}>{job.script}</td>
                <td style={{"border" : "1px solid black"}}>{job.command}</td>
                <td style={{"border" : "1px solid black"}}>{job.log_file}</td>
                <td style={{"border" : "1px solid black"}}><button onClick={()=>{this.deleteJob(job.schedule, job.script)}}>X</button></td>
              </tr>
            ))}

          </tbody>
        </table>
      </div >
    )
  }
}

/**
 * A Counter Lumino Widget that wraps a react component.
 */
export class ViewScheduledJobs extends ReactWidget {

  constructor() {
    super();
    this.addClass('ReactWidget');
  }

  render() {
    return <Jobs />;
  }
}
import { ReactWidget } from '@jupyterlab/apputils';
import { requestAPI } from './api';
import cronParser from 'cron-parser';

import React from 'react';


class Component extends React.Component {

  constructor(){
    super()

    this.state = {
      schedule: '',
      schedule_examples: [],
      is_schedule_valid: false,
      is_submit_successful: null,
      submitted: false,
      run_evironment: 'bash',
      command: ''
    };

    this.runEnvironmentChange = this.runEnvironmentChange.bind(this);
    this.commandChange = this.commandChange.bind(this);
    this.scheduleChange = this.scheduleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.cronRegex = /(((\d+,)+\d+|(\d+(\/|-)\d+)|\d+|\*) ?){5,7}/g
  }

  componentDidMount(){

    // Force the DOM 'change' event on the select field so that the
    // runEnvironmentChange function is called, updating the command field
    this.triggerInitialEnvSelection()
  }

  triggerInitialEnvSelection(){
    const input = document.getElementById("run_environment");
    const event = new Event("change", { bubbles: true });
    input.dispatchEvent(event);
  
  }

  scheduleChange(event) {

    if(event.target.name === "schedule"){

      const schedule = event.target.value

      // Try to display some examples of the next runs
      try {

        // Throwing shcedule into failed state if it's empty...
        if(schedule === "" || !this.cronRegex.test(schedule)){
          throw new Error
        }

        let examples = []

        var interval = cronParser.parseExpression(schedule);
      
        for(let i=0; i<5; i++){
          examples.push(interval.next().toString())
        }

        this.setState({
          schedule: schedule,
          schedule_examples: examples,
          is_schedule_valid: true
        });


        // Don't actually care if we can't generate example cron runs....
      } catch (err) {
        this.setState({
          schedule: schedule,
          is_schedule_valid: false
        })

      }
    }
  }

  runEnvironmentChange(event) {
    if(event.target.name === "run_environment"){
      const runEnvironment = event.target.value

      let updatedCommand = ''

      switch(runEnvironment){

        case "bash":
          updatedCommand = `bash ${this.props.script_path}`;
          break;
        case "python":
          updatedCommand = `python ${this.props.script_path}`;
          break;
        case "papermill":
          updatedCommand = `papermill ${this.props.script_path} /dev/null`;
          break;
        case "custom":
          updatedCommand = `[CUSTOM_RUN_ENVIRONMENT_GOES_HERE] ${this.props.script_path}`;
          break;
        default:
          updatedCommand = `bash ${this.props.script_path}`;
      }

      this.setState({
        run_evironment: runEnvironment,
        command: updatedCommand
      })
    }

  }

  commandChange(event) {
    console.log("here")
    if(event.target.name === "command"){
      console.log("andhere")
      const command = event.target.value


      this.setState({
        command
      })
    }

  }


  handleSubmit(event) {
    event.preventDefault();
    this.setState({submitted: true})
    this.addJob(this.state.schedule, this.props.script, this.state.command)
  }


  async addJob(schedule, script, command){

    const dataToSend = { 
      script,
      schedule,
      command
    };

    try {
      const reply = await requestAPI('add', {
        body: JSON.stringify(dataToSend),
        method: 'POST'
      });

      this.setState({
        is_submit_successful: true
      })

    } catch (reason) {
      console.error(
        `Error sending delete: ${reason}`
      );

      this.setState({
        is_submit_successful: false
      })
    }

  }

  render() {

    const submissionStatus = (this.state.is_submit_successful ? 
      <span style={{"marginLeft":"5px", "color":"green"}}>Job submitted successfully!</span>
        : 
      <span style={{"marginLeft":"5px", "color":"red"}}>There was an error submitting job!</span>
    )


    return (
      <form onSubmit={this.handleSubmit}>

        <div style={{"display":"flex", "alignContent": "flex-start", "flexDirection":"column"}}>

            <div style={{"display":"flex","flexDirection":"row", "padding":"10px"}}>
              <div style={{"minWidth":"120px"}}>
                Run Environment:
              </div>
              <div>
                <select id="run_environment" value={this.state.run_evironment} name="run_environment" onChange={this.runEnvironmentChange}>
                  <option value="bash">Bash</option>
                  <option value="python">Python</option>
                  <option value="papermill">Jupyter Notebook (Papermill)</option>
                  <option value="custom">Custom (Edit command below)</option>
                </select>
              </div>        
            </div>

          <div style={{"display":"flex","flexDirection":"row", "padding":"10px"}}>
            <div style={{"minWidth":"120px"}}>
              Command: 
            </div>
            <div>
              {this.state.run_evironment === "custom" ?
                <textarea style={{"width":"500px", "height":"50px"}} type="text" name="command" value={this.state.command} onChange={this.commandChange} />
                :
                <textarea style={{"width":"500px", "height":"50px"}} type="text" name="command" value={this.state.command} readOnly disabled/>
              }
            </div>
          </div>

          <div style={{"display":"flex","flexDirection":"row", "padding":"10px"}}>
            <div style={{"minWidth":"120px"}}>
                Cron Schedule:
            </div>
            <div>
                <input type="text" name="schedule" value={this.state.schedule} onChange={this.scheduleChange} />
            </div>
          </div>
          
          <div style={{"display":"flex","flexDirection":"row", "padding":"10px"}}>
            <div style={{"minWidth":"120px"}}>
              Example Runs:
            </div>

            {this.state.is_schedule_valid ?
              (
                null
              )
              :
              (
                <div>
                  <span style={{"color":"red"}}>Invalid chron syntax!</span>
                </div>
              )
            }

          </div>

          {this.state.is_schedule_valid &&
            <div style={{"display":"flex","flexDirection":"row", "padding":"10px"}}>
              <ul>
                
                {this.state.schedule_examples.map((example, i) =>
                  <li key={i}>{example}</li>
                  )}
              </ul>
            </div>
          }

          <div style={{"padding":"10px"}}>
            {this.state.is_schedule_valid &&
              (
                <div>
                  <input type="submit" value="Schedule" />
                  {this.state.submitted && submissionStatus}
                </div>
              )
            }
          </div>
        </div>
      </form>
    )
  }
}


/**
 * A Lumino Widget that wraps the react component.
 */
export class AddJob extends ReactWidget {

  constructor(script, script_path) {
    super();
    this.addClass('ReactWidget');

    this.script=script;
    this.script_path=script_path;

  }

  render() {
    return <Component script={this.script} script_path={this.script_path}/>;
  }
}
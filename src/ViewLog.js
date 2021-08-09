import { ReactWidget, MainAreaWidget } from '@jupyterlab/apputils';
import { requestAPI } from './api';
import { LazyLog } from 'react-lazylog';

import React from 'react';


class Log extends React.Component {

  constructor(){
    super()

    this.state = {
      logs: " "
    }
  }


  componentDidMount(){
    this.getLog(this.props.schedule, this.props.command)
  }

  async getLog(schedule, command){

    try {
      const reply = await requestAPI(`log?command=${command}&schedule=${schedule}`, {
        method: 'GET'
      });

      if("data" in reply){
        this.setState({
          logs: reply.data.join("\n")
        })
      }

    } catch (reason) {
      console.error(
        `Error viewing log: ${reason}`
      );
    }

  }

  render() {
    return (
      <div style={{ height: 800 }}>
        <LazyLog stream text={this.state.logs} />
      </div >
    )
  }
}

/**
 * A Lumino Widget that wraps a react component.
 */
export class ViewLog extends ReactWidget {

  constructor(command, schedule) {
    super();
    this.addClass('ReactWidget');

    this.command = command
    this.schedule = schedule;
  }

  render() {
    return <Log command={this.command} schedule={this.schedule}/>;
  }
}

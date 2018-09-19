import React, { Component } from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import firebase from './firebase';
import logo from './logo.svg';
import * as _ from 'lodash';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Task  from './Components/Task';
import './App.css';

class App extends Component {

  state={
    newTaskName: '',
    newTaskDone: false,
    searchValue: '',
    filterTask: 'all'
  }

  componentDidMount(){
    const starCountRef = firebase.database().ref('tasks');
    starCountRef.on('value',(snapshot) => {
      this.setState({
        tasks: snapshot.val()
      })
    });
  }

  newTaskNameOnChange = (e) => {
    this.setState({
      newTaskName: e.target.value
    })
  }

  TaskStatusOnChange = (e, checked) => {
    this.setState({
      newTaskDone: checked
    })
  }

  CreateTask = () => {
    const newTaskKey = firebase.database().ref().child('tasks').push().key;
    firebase.database().ref('tasks/' + newTaskKey).set({
      name: this.state.newTaskName,
      done: this.state.newTaskDone
    });
  }

  taskDelete = (id) => () => {
    firebase.database().ref('tasks/' + id).remove();
    console.log('is deleted id = ' + id)
  }

  taskRename=(id) => (e) => {
    firebase.database().ref('tasks/' + id).update({
      name: e.target.value
    });
  }

  handleChangeFilter = (e) => {
    this.setState({
      filterTask: e.target.value
    })
  }

  searchValueOnChange = (e) => {
    this.setState({
      searchValue: e.target.value
    })
  }

  render() {
    if(_.every(this.state.tasks, 'done')){
      // alert('All tasks is done')
    }

    const showTask = _.pickBy(this.state.tasks, ({name, done}) => {
      const isFound = this.state.searchValue === '' || name.toLowerCase().includes(this.state.searchValue.toLowerCase())
      const isFiltered = this.state.filterTask === 'all' || ((this.state.filterTask === 'done') === done)
      return isFound && isFiltered
    })
    const tasksComponent = _.map(showTask, (task, key) => {
      return <Task
        taskRename={this.taskRename(key)}
        taskDelete={this.taskDelete(key)}
        taskIsDone={task.done}
        taskName={task.name}
        key={key}/>
    })
    return (
      <div className="app-wrapper">
        <div className="main-block">
          <div className="header">
            <input value={this.state.searchValue} onChange={this.searchValueOnChange} placeholder='Search your task...'/>
            <Select
            value={this.state.filterTask}
            onChange={this.handleChangeFilter}
            inputProps={{
              name: 'age',
              id: 'age-simple',
            }}
          >
            <MenuItem value='all'>All</MenuItem>
            <MenuItem value='done'>Done</MenuItem>
            <MenuItem value='notDone'>Not done</MenuItem>
          </Select>
          </div>
          <div className="main-content">
            <div className="task-wrapper">
              <div className="check-button"><Checkbox checked={this.state.TaskIsDone} onChange={this.TaskStatusOnChange}/></div>
              <input className="task-input" placeholder="Create a new task" value={this.state.newTaskName} onChange={this.newTaskNameOnChange}/>
              <div className="create-button" onClick={this.CreateTask}>Create</div>
            </div>
            {tasksComponent}
          </div>
        </div>
      </div>
    );
  }
}

export default App;

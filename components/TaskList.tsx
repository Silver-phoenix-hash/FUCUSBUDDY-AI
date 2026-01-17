
import React, { useState } from 'react';
import { Task } from '../types';

interface TaskListProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, setTasks }) => {
  const [newTaskText, setNewTaskText] = useState('');

  const addTask = () => {
    if (!newTaskText.trim()) return;
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      text: newTaskText,
      completed: false,
      estimatedMinutes: 25
    };
    setTasks([...tasks, newTask]);
    setNewTaskText('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="glass rounded-3xl p-6 flex flex-col h-full">
      <h3 className="text-xl font-bold mb-4 flex items-center">
        <i className="fas fa-list-check mr-3 text-blue-400"></i>
        Session Goals
      </h3>
      
      <div className="flex space-x-2 mb-6">
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
          placeholder="New study goal..."
          className="flex-1 bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500"
        />
        <button 
          onClick={addTask}
          className="bg-slate-700 hover:bg-slate-600 text-white px-4 rounded-xl transition-colors"
        >
          <i className="fas fa-plus"></i>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {tasks.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            <i className="fas fa-ghost text-4xl mb-3 block"></i>
            <p>No goals set yet.</p>
          </div>
        ) : (
          tasks.map(task => (
            <div 
              key={task.id} 
              className={`flex items-center p-3 rounded-2xl border transition-all ${
                task.completed ? 'bg-green-500/10 border-green-500/30' : 'bg-slate-800/30 border-white/5'
              }`}
            >
              <button 
                onClick={() => toggleTask(task.id)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 transition-colors ${
                  task.completed ? 'bg-green-500 border-green-500' : 'border-slate-500'
                }`}
              >
                {task.completed && <i className="fas fa-check text-white text-[10px]"></i>}
              </button>
              <span className={`flex-1 text-sm ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                {task.text}
              </span>
              <button 
                onClick={() => deleteTask(task.id)}
                className="text-slate-600 hover:text-red-400 ml-2"
              >
                <i className="fas fa-trash-alt text-xs"></i>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskList;

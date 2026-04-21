// tracks follow-ups, viewings, and deadlines
// allows agents to stay organized with their daily pipeline
// provides status updates for each specific task

import React from 'react';
import { CheckCircle2, Clock, AlertCircle, Plus, Calendar } from 'lucide-react';

const Tasks = () => {
  // Mock data for task management
  const tasks = [
    { id: 1, title: 'Follow up with John Doe', priority: 'High', due: 'Today', type: 'Call', status: 'Pending' },
    { id: 2, title: 'Property Viewing: Sunset Villa', priority: 'Medium', due: 'Tomorrow', type: 'Meeting', status: 'In Progress' },
    { id: 3, title: 'Send contract to Sarah Smith', priority: 'High', due: 'Today', type: 'Email', status: 'Pending' },
    { id: 4, title: 'Update listing photos for Oak Ridge', priority: 'Low', due: 'Friday', type: 'Task', status: 'Completed' },
  ];

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50';
      case 'Medium': return 'text-orange-600 bg-orange-50';
      case 'Low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks & Reminders</h1>
          <p className="text-gray-500">Keep track of your daily action items.</p>
        </div>
        <button className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
          <Plus size={20} />
          <span>New Task</span>
        </button>
      </div>

      <div className="grid gap-4">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:border-purple-200 transition-colors">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-full ${task.status === 'Completed' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h3 className={`font-semibold ${task.status === 'Completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                  {task.title}
                </h3>
                <div className="flex items-center gap-3 mt-1 text-sm">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${getPriorityStyle(task.priority)}`}>
                    {task.priority} Priority
                  </span>
                  <span className="text-gray-400 flex items-center gap-1">
                    <Calendar size={14} /> {task.due}
                  </span>
                  <span className="text-gray-400 flex items-center gap-1">
                    <Clock size={14} /> {task.type}
                  </span>
                </div>
              </div>
            </div>
            
            <button className="text-sm font-medium text-purple-600 hover:text-purple-800">
              Edit Task
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tasks;
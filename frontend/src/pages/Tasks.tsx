// tracks follow-ups, viewings, and deadlines
// allows agents to stay organized with their daily pipeline
// provides status updates for each specific task

import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, AlertCircle, Plus, Calendar, Loader2 } from 'lucide-react';
import api from '../utils/api';
import AddTaskModal from '../components/AddTaskModal';

// Define the interface to stop the TypeScript "never[]" error
interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  isCompleted: boolean;
  priority?: string;
}

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      // FIXED: Calling '/tasks' because your route is router.get('/', ...)
      const response = await api.get('/tasks'); 
      
      // Safety check to ensure data is an array
      const data = Array.isArray(response.data) ? response.data : [];
      setTasks(data);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching tasks:", err);
      setError("Failed to load tasks. Check your connection.");
    } finally {
      // This ensures the loading spinner ALWAYS turns off
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleToggleStatus = async (taskId: string) => {
    try {
      // FIXED: Matches your router.patch('/:id/status', ...)
      await api.patch(`/tasks/${taskId}/status`);
      fetchTasks(); 
    } catch (err) {
      console.error("Toggle error:", err);
      alert("Failed to update task.");
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50';
      case 'Medium': return 'text-orange-600 bg-orange-50';
      case 'Low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tasks & Reminders</h1>
            <p className="text-gray-500">Keep track of your daily action items.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus size={20} />
            <span>New Task</span>
          </button>
        </div>

        <div className="grid gap-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 bg-white rounded-xl border border-gray-100">
              <Loader2 className="animate-spin text-purple-600 mb-4" size={32} />
              <p className="text-gray-500 text-sm">Loading your schedule...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 p-10 rounded-xl text-center">
              <AlertCircle className="mx-auto text-red-500 mb-2" size={32} />
              <p className="text-red-600 font-medium">{error}</p>
              <button onClick={fetchTasks} className="mt-4 text-purple-600 font-bold underline text-sm">Try Again</button>
            </div>
          ) : tasks.length === 0 ? (
            <div className="bg-white p-20 rounded-xl border border-dashed border-gray-200 text-center">
              <p className="text-gray-400">No tasks assigned to you yet.</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:border-purple-200 transition-colors">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => handleToggleStatus(task.id)}
                    className={`p-2 rounded-full transition-colors ${task.isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400 hover:text-purple-600'}`}
                  >
                    <CheckCircle2 size={24} />
                  </button>
                  <div>
                    <h3 className={`font-semibold ${task.isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-sm">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${getPriorityStyle(task.priority || 'Medium')}`}>
                        {task.priority || 'Medium'} Priority
                      </span>
                      <span className="text-gray-400 flex items-center gap-1">
                        <Calendar size={14} /> {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                      {task.description && (
                        <span className="text-gray-400 flex items-center gap-1 italic">
                          — {task.description}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <button className="text-sm font-medium text-purple-600 hover:text-purple-800">
                  Edit Task
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <AddTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchTasks} 
      />
    </>
  );
};

export default Tasks;
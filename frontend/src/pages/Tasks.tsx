import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, AlertCircle, Plus, Calendar, Loader2, Trash2, Edit3 } from 'lucide-react'; // Added icons
import api from '../utils/api';
import AddTaskModal from '../components/AddTaskModal';

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
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks'); 
      const data = Array.isArray(response.data) ? response.data : [];
      setTasks(data);
      setError(null);
    } catch (err: any) {
      setError("Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleToggleStatus = async (taskId: string) => {
    try {
      await api.patch(`/tasks/${taskId}/status`);
      fetchTasks(); 
    } catch (err) {
      alert("Failed to update task.");
    }
  };

  // NEW: handle delete with "Are you sure?" check
  const handleDelete = async (taskId: string) => {
    if (window.confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
      try {
        await api.delete(`/tasks/${taskId}`);
        fetchTasks();
      } catch (err) {
        console.error("Delete error:", err);
        alert("Failed to delete task.");
      }
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
            onClick={() => {
              setSelectedTask(null);
              setIsModalOpen(true);
            }}
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
          ) : tasks.length === 0 ? (
            <div className="bg-white p-20 rounded-xl border border-dashed border-gray-200 text-center text-gray-400">
              No tasks assigned to you yet.
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
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      setSelectedTask(task);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                    title="Edit Task"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(task.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Delete Task"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <AddTaskModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }} 
        onSuccess={fetchTasks} 
        initialData={selectedTask}
      />
    </>
  );
};

export default Tasks;
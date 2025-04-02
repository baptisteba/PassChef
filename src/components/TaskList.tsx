import React, { useState } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Plus, 
  Trash2, 
  X,
  AlertCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

export interface DeploymentTask {
  _id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  priority: 'critical' | 'high' | 'medium' | 'low';
  deadline?: string;
  assigned_to?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  deployment_id: string;
}

interface TaskListProps {
  tasks: DeploymentTask[];
  deploymentId: string;
  onAddTask: (task: Omit<DeploymentTask, '_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUpdateTask: (id: string, updates: Partial<DeploymentTask>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
}

const TaskList: React.FC<TaskListProps> = ({ 
  tasks, 
  deploymentId, 
  onAddTask, 
  onUpdateTask, 
  onDeleteTask 
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState<Omit<DeploymentTask, '_id' | 'created_at' | 'updated_at'>>({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    deadline: '',
    created_by: user?.name || user?.email || '',
    deployment_id: deploymentId
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    
    await onAddTask(newTask);
    setNewTask({
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      deadline: '',
      created_by: user?.name || user?.email || '',
      deployment_id: deploymentId
    });
    setShowAddForm(false);
  };

  const getPriorityClass = (priority: string): string => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusClass = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <AlertCircle className="h-4 w-4" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4" />;
      case 'low':
        return <Info className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  const isTaskOverdue = (task: DeploymentTask): boolean => {
    if (!task.deadline || task.status === 'completed') return false;
    return new Date(task.deadline) < new Date();
  };

  // Sort tasks by completed status (incomplete first) and then by priority (critical first)
  const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  const sortedTasks = [...tasks].sort((a, b) => {
    // First, sort by completion status
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    
    // Then, sort by priority
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold flex items-center">
          <CheckCircle2 className="h-5 w-5 mr-2 text-indigo-600" />
          {t('tasks')}
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700 flex items-center text-sm"
        >
          {showAddForm ? (
            <>
              <X className="h-4 w-4 mr-1" />
              {t('cancel')}
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-1" />
              {t('addTask')}
            </>
          )}
        </button>
      </div>
      
      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 p-4 rounded-md">
          <div className="mb-4">
            <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 mb-1">
              {t('title')}
            </label>
            <input
              id="task-title"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder={t('enterTaskTitle')}
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="task-description" className="block text-sm font-medium text-gray-700 mb-1">
              {t('description')}
            </label>
            <textarea
              id="task-description"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={newTask.description || ''}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              placeholder={t('enterTaskDescription')}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label htmlFor="task-priority" className="block text-sm font-medium text-gray-700 mb-1">
                {t('priority')}
              </label>
              <select
                id="task-priority"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
              >
                <option value="low">{t('low')}</option>
                <option value="medium">{t('medium')}</option>
                <option value="high">{t('high')}</option>
                <option value="critical">{t('critical')}</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="task-status" className="block text-sm font-medium text-gray-700 mb-1">
                {t('status')}
              </label>
              <select
                id="task-status"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={newTask.status}
                onChange={(e) => setNewTask({ ...newTask, status: e.target.value as any })}
              >
                <option value="pending">{t('pending')}</option>
                <option value="in_progress">{t('inProgress')}</option>
                <option value="completed">{t('completed')}</option>
                <option value="blocked">{t('blocked')}</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="task-deadline" className="block text-sm font-medium text-gray-700 mb-1">
                {t('deadline')}
              </label>
              <input
                id="task-deadline"
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={newTask.deadline || ''}
                onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700"
            >
              {t('add')}
            </button>
          </div>
        </form>
      )}
      
      {sortedTasks.length === 0 ? (
        <div className="p-6 text-center border-2 border-dashed border-gray-300 rounded-md">
          <CheckCircle2 className="h-10 w-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">{t('noTasksYet')}</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-2 text-indigo-600 hover:text-indigo-800"
          >
            {t('addFirstTask')}
          </button>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {sortedTasks.map((task) => (
            <div key={task._id} className={`py-4 ${task.status === 'completed' ? 'opacity-70' : ''}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-start">
                  <button 
                    onClick={() => onUpdateTask(task._id, { 
                      status: task.status === 'completed' ? 'pending' : 'completed' 
                    })}
                    className="mr-2 mt-1 text-gray-500 hover:text-indigo-600"
                  >
                    {task.status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </button>
                  <div>
                    <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onDeleteTask(task._id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2 ml-7">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusClass(task.status)}`}>
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                  ) : task.status === 'in_progress' ? (
                    <Clock className="h-3 w-3 mr-1" />
                  ) : (
                    <Circle className="h-3 w-3 mr-1" />
                  )}
                  {t(task.status.replace('_', ''))}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityClass(task.priority)}`}>
                  {getPriorityIcon(task.priority)}
                  <span className="ml-1">{t(task.priority)}</span>
                </span>
                {task.deadline && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    isTaskOverdue(task) && task.status !== 'completed' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(task.deadline)}
                    {isTaskOverdue(task) && task.status !== 'completed' && (
                      <span className="ml-1 text-red-600">{t('overdue')}</span>
                    )}
                  </span>
                )}
                {task.assigned_to && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                    {task.assigned_to}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList; 
import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckSquare, 
  Clock, 
  Plus, 
  Trash2, 
  Edit,
  X,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  Circle,
  ChevronDown
} from 'lucide-react';
import { DeploymentTask } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

interface TaskListProps {
  tasks: DeploymentTask[];
  deploymentId: string;
  onAddTask: (task: Omit<DeploymentTask, '_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUpdateTask: (taskId: string, updates: Partial<DeploymentTask>) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
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
  const [filterUpcoming, setFilterUpcoming] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [newTask, setNewTask] = useState<Omit<DeploymentTask, '_id' | 'created_at' | 'updated_at'>>({
    title: '',
    description: '',
    status: 'not_started',
    priority: 'medium',
    created_by: user?.id || '',
    deployment_id: deploymentId
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    
    await onAddTask(newTask);
    setNewTask({
      title: '',
      description: '',
      status: 'not_started',
      priority: 'medium',
      created_by: user?.id || '',
      deployment_id: deploymentId
    });
    setShowAddForm(false);
  };

  const handleTaskStatusChange = async (taskId: string, status: DeploymentTask['status']) => {
    await onUpdateTask(taskId, { status });
  };

  const toggleTaskStatus = async (taskId: string, currentStatus: DeploymentTask['status']) => {
    let newStatus: DeploymentTask['status'];
    
    // Cycle through statuses in a logical progression
    switch (currentStatus) {
      case 'not_started':
        newStatus = 'in_progress';
        break;
      case 'in_progress':
        newStatus = 'completed';
        break;
      case 'completed':
        newStatus = 'not_started';
        break;
      case 'blocked':
        newStatus = 'in_progress';
        break;
      default:
        newStatus = 'not_started';
    }
    
    await onUpdateTask(taskId, { status: newStatus });
  };

  const getPriorityClass = (priority: string): string => {
    switch (priority) {
      case 'low':
        return 'bg-gray-100 text-gray-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'high':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'not_started':
        return <Circle className="h-4 w-4" />;
      case 'in_progress':
        return <Clock className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'blocked':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };
  
  const getStatusClass = (status: string): string => {
    switch (status) {
      case 'not_started':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDeadline = (dateString?: string): string => {
    if (!dateString) return t('noDeadline');
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return t('invalidDate');
      
      return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return t('invalidDate');
    }
  };

  const getRelativeDeadline = (dateString?: string): string => {
    if (!dateString) return '';
    
    const deadline = new Date(dateString);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? t('dayAgo') : t('daysAgo')}`;
    if (diffDays === 0) return t('today');
    if (diffDays === 1) return t('tomorrow');
    if (diffDays < 7) return `${diffDays} ${t('daysLeft')}`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} ${Math.floor(diffDays / 7) === 1 ? t('weekLeft') : t('weeksLeft')}`;
    return `${Math.floor(diffDays / 30)} ${Math.floor(diffDays / 30) === 1 ? t('monthLeft') : t('monthsLeft')}`;
  };

  const isOverdue = (task: DeploymentTask): boolean => {
    if (!task.deadline || task.status === 'completed') return false;
    const deadline = new Date(task.deadline);
    return deadline < new Date();
  };

  const isUpcoming = (task: DeploymentTask): boolean => {
    if (!task.deadline || task.status === 'completed') return false;
    const deadline = new Date(task.deadline);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  };

  // Sort tasks by priority and deadline
  const sortedTasks = [...tasks].sort((a, b) => {
    // First sort by status (completed tasks at the bottom)
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    
    // Overdue tasks come first
    const aOverdue = isOverdue(a);
    const bOverdue = isOverdue(b);
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;
    
    // Then sort by priority
    const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    // Then sort by deadline (if both have deadlines)
    if (a.deadline && b.deadline) {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    
    // Tasks with deadlines come before tasks without deadlines
    if (a.deadline && !b.deadline) return -1;
    if (!a.deadline && b.deadline) return 1;
    
    // Finally, sort by creation date
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Filter tasks based on filter state
  const filteredTasks = filterUpcoming 
    ? sortedTasks.filter(task => isUpcoming(task) || isOverdue(task))
    : sortedTasks;

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold flex items-center">
          <CheckSquare className="h-5 w-5 mr-2 text-indigo-600" />
          {t('tasks')}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilterUpcoming(!filterUpcoming)}
            className={`text-sm px-3 py-1 rounded-md flex items-center ${
              filterUpcoming 
                ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                : 'bg-gray-100 text-gray-600 border border-gray-300'
            }`}
          >
            <Calendar className="h-3 w-3 mr-1" />
            {t('upcomingDeadlines')}
          </button>
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
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              placeholder={t('enterTaskDescription')}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="task-priority" className="block text-sm font-medium text-gray-700 mb-1">
                {t('priority')}
              </label>
              <select
                id="task-priority"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={newTask.priority}
                onChange={(e) => setNewTask({ 
                  ...newTask, 
                  priority: e.target.value as DeploymentTask['priority']
                })}
              >
                <option value="low">{t('low')}</option>
                <option value="medium">{t('medium')}</option>
                <option value="high">{t('high')}</option>
                <option value="critical">{t('critical')}</option>
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
                value={newTask.deadline ? new Date(newTask.deadline).toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  try {
                    const value = e.target.value;
                    const dateValue = value ? new Date(value) : undefined;
                    setNewTask({ 
                      ...newTask, 
                      deadline: dateValue ? dateValue.toISOString() : undefined
                    });
                  } catch (error) {
                    console.error('Error setting deadline date:', error);
                  }
                }}
              />
              <p className="mt-1 text-xs text-gray-500">{t('setDeadlineHint')}</p>
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
              {t('addTask')}
            </button>
          </div>
        </form>
      )}
      
      {filteredTasks.length === 0 ? (
        <div className="p-6 text-center border-2 border-dashed border-gray-300 rounded-md">
          <CheckSquare className="h-10 w-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">
            {filterUpcoming ? t('noUpcomingTasks') : t('noTasksYet')}
          </p>
          <button
            onClick={() => filterUpcoming ? setFilterUpcoming(false) : setShowAddForm(true)}
            className="mt-2 text-indigo-600 hover:text-indigo-800"
          >
            {filterUpcoming ? t('showAllTasks') : t('addFirstTask')}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div 
              key={task._id}
              className={`p-3 border rounded-md ${
                task.status === 'completed' 
                  ? 'bg-gray-50 border-gray-200' 
                  : isOverdue(task)
                    ? 'border-red-300 bg-red-50'
                    : isUpcoming(task)
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start space-x-2">
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveDropdown(activeDropdown === task._id ? null : task._id);
                      }}
                      className={`p-1 rounded-full ${
                        task.status === 'completed' 
                          ? 'text-green-600 hover:bg-green-100'
                          : task.status === 'in_progress'
                            ? 'text-blue-600 hover:bg-blue-100'
                            : task.status === 'blocked'
                              ? 'text-red-600 hover:bg-red-100'
                              : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      aria-label={t('changeTaskStatus')}
                    >
                      {task.status === 'completed' ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : task.status === 'in_progress' ? (
                        <Clock className="h-5 w-5" />
                      ) : task.status === 'blocked' ? (
                        <XCircle className="h-5 w-5" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>
                    <div className={`absolute top-full left-0 mt-1 bg-white shadow-lg rounded-md z-10 py-1 w-36 border border-gray-200 ${activeDropdown === task._id ? '' : 'hidden'}`}>
                      <button 
                        onClick={() => {
                          handleTaskStatusChange(task._id, 'not_started');
                          setActiveDropdown(null);
                        }}
                        className="flex items-center px-3 py-1 text-sm w-full text-left hover:bg-gray-100"
                      >
                        <Circle className="h-4 w-4 mr-2 text-gray-500" />
                        {t('not_started')}
                      </button>
                      <button 
                        onClick={() => {
                          handleTaskStatusChange(task._id, 'in_progress');
                          setActiveDropdown(null);
                        }}
                        className="flex items-center px-3 py-1 text-sm w-full text-left hover:bg-gray-100"
                      >
                        <Clock className="h-4 w-4 mr-2 text-blue-500" />
                        {t('in_progress')}
                      </button>
                      <button 
                        onClick={() => {
                          handleTaskStatusChange(task._id, 'completed');
                          setActiveDropdown(null);
                        }}
                        className="flex items-center px-3 py-1 text-sm w-full text-left hover:bg-gray-100"
                      >
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        {t('completed')}
                      </button>
                      <button 
                        onClick={() => {
                          handleTaskStatusChange(task._id, 'blocked');
                          setActiveDropdown(null);
                        }}
                        className="flex items-center px-3 py-1 text-sm w-full text-left hover:bg-gray-100"
                      >
                        <XCircle className="h-4 w-4 mr-2 text-red-500" />
                        {t('blocked')}
                      </button>
                    </div>
                  </div>
                  <div className={`${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                    <h3 className="font-medium">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {task.deadline && (
                    <div className="text-right">
                      <span className={`text-xs font-medium flex items-center justify-end ${
                        task.status === 'completed'
                          ? 'text-gray-500'
                          : isOverdue(task)
                            ? 'text-red-600'
                            : isUpcoming(task)
                              ? 'text-blue-600'
                              : 'text-gray-600'
                      }`}>
                        <Calendar className="h-3.5 w-3.5 ml-1" />
                      </span>
                      <span className={`text-xs ${
                        task.status === 'completed'
                          ? 'text-gray-500'
                          : isOverdue(task)
                            ? 'text-red-600 font-medium'
                            : 'text-gray-600'
                      }`}>
                        {formatDeadline(task.deadline)}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => onDeleteTask(task._id)}
                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded"
                    aria-label={t('deleteTask')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="ml-7 flex flex-wrap gap-2 items-center">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                  <CheckSquare className="h-3 w-3 mr-1" />
                  {t('task')}
                </span>
                
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusClass(task.status)}`}>
                  {getStatusIcon(task.status)}
                  <span className="ml-1">{t(task.status)}</span>
                </span>
                
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityClass(task.priority)}`}>
                  {task.priority === 'critical' && <AlertCircle className="h-3 w-3 mr-1" />}
                  {t(task.priority)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList; 
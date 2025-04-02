# PassChef - Site Management Solution

PassChef is a comprehensive site management application for managing WiFi deployments, tasks, and infrastructure across multiple locations. The application provides a modern, responsive interface for tracking deployment tasks, deadlines, and progress.

## 🚀 Features

- **Task Management System**: Create, update, and track tasks with priorities, deadlines, and statuses
- **WiFi Deployment Tracking**: Monitor and manage WiFi deployments across multiple sites
- **Status Visualization**: Visual indicators for task status, priority, and deadlines
- **Filtering Options**: Filter tasks based on upcoming deadlines and status
- **Localization Support**: Multi-language support with i18next integration
- **Responsive Design**: Fully responsive UI built with Tailwind CSS

## 🔧 Tech Stack

- **Frontend**:
  - React 18
  - TypeScript
  - Tailwind CSS for styling
  - Lucide React for icons
  - React Router for navigation
  - Zustand for state management
  - i18next for internationalization

- **Backend**:
  - Node.js server (Express)
  - MongoDB for data storage

- **Build Tools**:
  - Vite
  - ESLint
  - TypeScript

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/passchef.git
   cd passchef
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   VITE_API_URL=http://localhost:3000/api
   VITE_MOCK_API=true
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 📚 Project Structure

```
/
├── src/                   # Application source code
│   ├── components/        # Reusable UI components
│   │   └── deployment/    # Deployment-specific components
│   │       └── TaskList.tsx  # Task list component for deployments
│   ├── contexts/          # React contexts (Auth, Language, etc.)
│   ├── pages/             # Page components
│   ├── types/             # TypeScript type definitions
│   ├── locales/           # Localization files
│   ├── App.tsx            # Main application component
│   └── main.tsx           # Entry point
├── server/                # Backend server code
├── public/                # Static assets
├── dist/                  # Build output
└── package.json           # Project dependencies
```

## 🧩 Components

### Task Management

The Task Management module (`TaskList.tsx`) provides the following features:

- **Task Creation**: Add new tasks with title, description, priority, and deadline
- **Status Management**: Change task status through a dropdown menu (Not Started, In Progress, Completed, Blocked)
- **Visual Indicators**: 
  - Color-coded task cards based on deadline status
  - Task labels indicating priority and status
  - Timeline indicators showing task type
- **Filtering**: Filter tasks by upcoming deadlines
- **Sorting**: Automatically sort tasks by status, priority, and deadline

#### Task Status Flow

Tasks follow a specific workflow through various statuses:

1. **Not Started**: Initial status for newly created tasks
2. **In Progress**: Tasks that are currently being worked on
3. **Completed**: Tasks that have been finished
4. **Blocked**: Tasks that cannot proceed due to dependencies or issues

Each status has a distinct visual indicator:
- Not Started: Gray circle icon
- In Progress: Blue clock icon
- Completed: Green checkmark icon
- Blocked: Red X icon

#### Deadline Management

Tasks can have deadlines associated with them, which are displayed prominently:

- **Overdue tasks**: Shown with red background and indicators
- **Upcoming tasks**: Tasks due within the next 7 days shown with blue indicators
- **Normal tasks**: Tasks with deadlines beyond 7 days

The system provides both absolute dates and relative time indicators ("today", "tomorrow", "3 days left", etc.) for better context.

#### Task Priority

Tasks can be assigned one of four priority levels:

- **Low**: Gray tag
- **Medium**: Blue tag
- **High**: Yellow tag
- **Critical**: Red tag with alert icon

#### Timeline Integration

Each task is properly labeled in the timeline view with a "task" indicator, making it easy to distinguish from other event types in the deployment workflow.

#### Sorting Behavior

Tasks are automatically sorted by:
1. Completion status (incomplete tasks first)
2. Overdue status (overdue tasks at the top)
3. Priority (critical → high → medium → low)
4. Deadline proximity (soonest first)
5. Creation date (newest first when other factors are equal)

### Usage Example

```tsx
import { TaskList } from './components/deployment/TaskList';

// Example component usage
function DeploymentView({ deploymentId }) {
  const handleAddTask = async (task) => {
    // Implementation
  };
  
  const handleUpdateTask = async (taskId, updates) => {
    // Implementation
  };
  
  const handleDeleteTask = async (taskId) => {
    // Implementation
  };
  
  return (
    <TaskList
      tasks={tasks}
      deploymentId={deploymentId}
      onAddTask={handleAddTask}
      onUpdateTask={handleUpdateTask}
      onDeleteTask={handleDeleteTask}
    />
  );
}
```

## 🔄 State Management

The application uses Zustand for state management, providing a simple and efficient way to manage application state without the boilerplate of Redux.

## 🌐 Internationalization

The application supports multiple languages using i18next. Translations are stored in the `src/locales` directory.

## 📱 Responsive Design

The UI is built with Tailwind CSS, ensuring a responsive and consistent experience across different devices and screen sizes.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the [MIT License](LICENSE).

## 📞 Support

For support or questions, please open an issue in the GitHub repository or contact the development team.

## 📸 Screenshots

*Screenshots coming soon*

## 🔮 Future Enhancements

The following enhancements are planned for future releases:

### Task Management Improvements

- **Assignee Management**: Ability to assign tasks to specific team members and filter by assignee
- **Task Dependencies**: Create dependencies between tasks to establish proper workflow
- **Bulk Actions**: Select multiple tasks to update status, priority, or deadline simultaneously
- **Comments System**: Allow team members to comment on tasks for better collaboration
- **Attachments**: Upload and attach files to tasks
- **Task Templates**: Create templates for common task types
- **Recurring Tasks**: Support for tasks that repeat on a schedule

### Timeline and Reporting

- **Gantt Chart View**: Visualize tasks on a timeline with dependencies
- **Dashboard Widgets**: Add customizable widgets for tasks overview
- **Export Options**: Export tasks to CSV, PDF, or other formats
- **Burndown Charts**: Track task completion rates over time
- **Time Tracking**: Track time spent on specific tasks

### Notification System

- **Email Notifications**: Send notifications for task assignments and approaching deadlines
- **In-App Notifications**: Real-time notifications for task updates
- **Reminder System**: Set custom reminders for important deadlines

### Integration Possibilities

- **Calendar Integration**: Sync tasks with popular calendar systems
- **Mobile App**: Develop companion mobile application for on-the-go task management
- **API Expansion**: Enhance API for third-party integrations

---

© 2023 PassChef. All rights reserved. 
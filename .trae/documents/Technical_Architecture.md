# Technical Architecture Document: SSH Client Manager

## 1. Architecture Design
The application follows a standard Client-Server architecture, running locally.

- **Frontend**: React application serving as the UI.
- **Backend**: Express.js server handling API requests and SSH connections.
- **Communication**: REST API for management, WebSockets for real-time command output.

## 2. Technology Stack
- **Frontend**:
  - Framework: React (Vite)
  - Language: TypeScript
  - Styling: Tailwind CSS
  - State Management: Zustand
  - Icons: Lucide-React
- **Backend**:
  - Runtime: Node.js
  - Framework: Express.js
  - SSH Client: `ssh2` library
  - WebSockets: `ws` library
  - Storage: Local filesystem (`data/vms.json`)

## 3. Data Model
### 3.1 VM Object
```typescript
interface VM {
  id: string;
  name: string; // Label
  ip: string;
  username: string;
  password?: string; // Encrypted or stored as plain text (local tool constraint)
  port: number; // Default 22
}
```

### 3.2 Execution Log
```typescript
interface ExecutionLog {
  vmId: string;
  command: string;
  output: string;
  status: 'pending' | 'running' | 'success' | 'error';
  timestamp: number;
}
```

## 4. API Definitions
### 4.1 REST API
- `GET /api/vms`: Retrieve list of VMs.
- `POST /api/vms`: Add a new VM.
- `PUT /api/vms/:id`: Update a VM.
- `DELETE /api/vms/:id`: Delete a VM.
- `POST /api/execute`: Trigger command execution on selected VMs.

### 4.2 WebSocket Events
- `connect`: Client connects to stream.
- `output`: Server sends stdout/stderr chunks.
- `status`: Server sends execution status updates.

## 5. Implementation Details
- **SSH Connection**: The backend creates an SSH connection using `ssh2` for each target VM.
- **Concurrency**: Commands can be executed in parallel (Promise.all) or limited concurrency queue.
- **File Structure**:
  - `src/`: Frontend code
  - `api/`: Backend code
  - `data/`: Local storage

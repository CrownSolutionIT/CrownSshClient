# Product Requirements Document: SSH Client Manager

## 1. Product Overview
The SSH Client Manager is a web-based application designed to manage multiple Virtual Machines (VMs) and execute SSH commands across them efficiently. The primary use case is to allow a user to restart FreeSWITCH and the VM itself on multiple servers without manually logging into each one. The tool will provide a dashboard to manage VM credentials and a command execution interface supporting mass operations.

## 2. Core Features
### 2.1 VM Management
- **Add VM**: User can add a new VM with IP, Username, Password, and optional Label.
- **Edit/Delete VM**: User can modify or remove existing VM credentials.
- **List VMs**: Display a list of configured VMs with status indicators (optional connection check).
- **Storage**: VM credentials are stored locally (JSON file) for persistence across sessions.

### 2.2 Command Execution
- **Pre-configured Commands**: Built-in support for the specific FreeSWITCH restart command provided by the user.
- **Custom Commands**: Ability to input and save custom shell commands.
- **Mass Execution**: Select multiple VMs and execute a command on all of them (sequentially or parallel).
- **Execution Mode**:
  - "Run & Log": Execute command and show output.
  - "Restart VM": Execute command then reboot.

### 2.3 Live Monitoring
- **Real-time Logs**: Stream command output from the server to the frontend via WebSockets.
- **Status Reporting**: Show Success/Fail status for each VM after execution.

## 3. User Interface Design
- **Dashboard**: A clean, single-page interface.
- **Left Panel**: List of VMs with checkboxes for selection.
- **Right Panel**: Command input area, execution controls, and terminal-like output window.
- **Theme**: Dark mode enabled (developer-centric).

## 4. Security Considerations
- **Credential Storage**: Credentials are stored in a local JSON file on the server.
- **Transmission**: All communication between frontend and backend is local (localhost).
- **No External Access**: The tool is designed to run locally on the user's machine.

## 5. Specific Requirements
- **FreeSWITCH Command**: `echo 'pkye6x95' | su -c 'cd /usr/local/freeswitch/bin/ && ps aux | grep freeswitch && pkill -9 freeswitch && sync && echo 3 > /proc/sys/vm/drop_caches && ./freeswitch'`
- **Target IP**: 74.81.38.51 (Example)
- **SSH Password**: 'pkye6x95' (Example)

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface CamoufoxConfig {
  headless?: boolean;
  humanize?: boolean | number;
  os?: 'windows' | 'macos' | 'linux';
  geoip?: string | boolean;
  locale?: string;
  block_images?: boolean;
}

export interface TaskParameters extends CamoufoxConfig {
  url?: string;
  selector?: string;
  value?: string;
  script?: string;
  path?: string;
  full_page?: boolean;
  wait_until?: 'load' | 'domcontentloaded' | 'networkidle';
  wait_state?: 'load' | 'domcontentloaded' | 'networkidle';
  // Cookie management
  cookies?: any[];
  cookie_name?: string;
  // Storage operations
  storage_key?: string;
  storage_value?: string;
  storage_type?: 'localStorage' | 'sessionStorage';
  // Network
  intercept_pattern?: string;
  // Geolocation
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  // File operations
  file_path?: string;
  // PDF generation
  pdf_options?: any;
  // Multiple pages
  new_page?: boolean;
  page_index?: number;
  // Device emulation
  device?: string;
  // Permissions
  permissions?: string[];
  origin?: string;
  // Wait options
  timeout?: number;
  // Keyboard/Mouse
  key?: string;
  x?: number;
  y?: number;
  button?: 'left' | 'right' | 'middle';
  // Drag and drop
  source_selector?: string;
  target_selector?: string;
}

export interface TaskData {
  action: 
    // Basic actions
    | 'navigate' | 'screenshot' | 'get_content' | 'click' | 'fill' | 'evaluate'
    // Cookie management
    | 'get_cookies' | 'set_cookies' | 'delete_cookies' | 'clear_cookies'
    // Storage operations
    | 'get_storage' | 'set_storage' | 'delete_storage' | 'clear_storage'
    // Network
    | 'intercept_requests' | 'get_requests'
    // Geolocation
    | 'set_geolocation'
    // File operations
    | 'upload_file' | 'download_file'
    // PDF generation
    | 'generate_pdf'
    // Multiple pages
    | 'new_page' | 'close_page' | 'switch_page' | 'get_pages'
    // Wait operations
    | 'wait_for_selector' | 'wait_for_timeout'
    // Keyboard/Mouse
    | 'press_key' | 'type_text' | 'mouse_click' | 'mouse_move'
    // Drag and drop
    | 'drag_and_drop';
  parameters: TaskParameters;
}

export interface TaskResult {
  success: boolean;
  result?: any;
  error?: string;
}

/**
 * Execute a Camoufox automation task by calling the Python bridge script
 */
export async function executeCamoufoxTask(taskData: TaskData): Promise<TaskResult> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, 'camoufox_bridge.py');
    const taskJson = JSON.stringify(taskData);
    
    // Spawn Python process with the task data as argument
    const pythonProcess = spawn('python3.11', [pythonScript, taskJson]);
    
    let stdout = '';
    let stderr = '';
    
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        resolve({
          success: false,
          error: `Python process exited with code ${code}: ${stderr}`
        });
        return;
      }
      
      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (error) {
        resolve({
          success: false,
          error: `Failed to parse Python output: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    });
    
    pythonProcess.on('error', (error) => {
      resolve({
        success: false,
        error: `Failed to spawn Python process: ${error.message}`
      });
    });
  });
}

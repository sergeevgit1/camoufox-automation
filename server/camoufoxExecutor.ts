import { spawn } from 'child_process';
import path from 'path';

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
}

export interface TaskData {
  action: 'navigate' | 'screenshot' | 'get_content' | 'click' | 'fill' | 'evaluate';
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

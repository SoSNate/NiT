import { spawn } from 'child_process';
import path from 'path';

const cwd = String.raw`C:\Users\12nat\Desktop\חשבונאוטיקנ\כיתת חרום`;

const proc = spawn('npm', ['run', 'dev', '--', '--port', '5179'], {
  cwd,
  stdio: 'inherit',
  shell: true,
});

proc.on('exit', (code) => process.exit(code));


import { spawn } from 'child_process';
import http from 'http';

let fixApplied = false;

function testAPIResponse() {
  return new Promise((resolve) => {
    const data = JSON.stringify({
      email: 'test@test.com',
      password: 'test123'
    });
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };
    
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        const isHTML = body.includes('<!DOCTYPE html>');
        resolve({ isHTML, contentType: res.headers['content-type'] });
      });
    });
    
    req.on('error', () => resolve({ isHTML: true, contentType: 'error' }));
    req.write(data);
    req.end();
  });
}

async function monitorAndFix() {
  if (fixApplied) return;
  
  const result = await testAPIResponse();
  
  if (result.isHTML) {
    console.log('🚨 Detected Vite API interception - applying fix...');
    fixApplied = true;
    
    // Run the fix script
    const fixProcess = spawn('node', ['restore-vite-fix.js'], {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    fixProcess.on('exit', () => {
      console.log('✅ API fix applied successfully');
      fixApplied = false; // Reset for future monitoring
    });
  }
}

// Monitor every 30 seconds
setInterval(monitorAndFix, 30000);

// Initial check after 5 seconds
setTimeout(monitorAndFix, 5000);

export { monitorAndFix };

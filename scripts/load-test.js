#!/usr/bin/env node
/**
 * ==============================================================================
 * CloudRetail - High-Throughput Load & Stress Testing Benchmark
 * Simulates concurrent shoppers hitting API Gateway and microservices.
 * Used for demonstrating Kubernetes Horizontal Pod Autoscaler (HPA) & Prometheus.
 * ==============================================================================
 */

const http = require('http');

// Configurable via CLI arguments or environment variables
const TARGET_URL = process.env.TARGET_URL || process.argv[2] || 'http://localhost:8080';
const CONCURRENCY = parseInt(process.env.CONCURRENCY || process.argv[3] || '20', 10);
const DURATION_SEC = parseInt(process.env.DURATION || process.argv[4] || '15', 10);

console.log('=================================================================');
console.log(' 🚀 CloudRetail - Distributed Load & Stress Testing Benchmark    ');
console.log('=================================================================');
console.log(` Target Host       : ${TARGET_URL}`);
console.log(` Concurrent Clients: ${CONCURRENCY} workers`);
console.log(` Test Duration     : ${DURATION_SEC} seconds`);
console.log('=================================================================\n');

let totalRequests = 0;
let successRequests = 0;
let errorRequests = 0;
const latencies = [];
let isRunning = true;

const targetParsed = new URL(TARGET_URL);

// Realistic scenario endpoints
const scenarios = [
  { path: '/api/products', method: 'GET' },
  { path: '/api/products?category=Electronics', method: 'GET' },
  { path: '/api/products/1', method: 'GET' },
  { path: '/api/cart/load-user-1', method: 'GET' },
  { path: '/api/system/health', method: 'GET' },
];

function sendRequest() {
  if (!isRunning) return;

  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  const startTime = Date.now();

  const options = {
    hostname: targetParsed.hostname,
    port: targetParsed.port || (targetParsed.protocol === 'https:' ? 443 : 80),
    path: scenario.path,
    method: scenario.method,
    headers: {
      'User-Agent': 'CloudRetail-LoadTest-Worker/1.0',
      'Accept': 'application/json'
    },
    timeout: 3000
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
      const duration = Date.now() - startTime;
      totalRequests++;
      if (res.statusCode >= 200 && res.statusCode < 400) {
        successRequests++;
      } else {
        errorRequests++;
      }
      latencies.push(duration);

      if (isRunning) {
        setImmediate(sendRequest);
      }
    });
  });

  req.on('error', (err) => {
    totalRequests++;
    errorRequests++;
    latencies.push(Date.now() - startTime);
    if (isRunning) {
      setTimeout(sendRequest, 100);
    }
  });

  req.on('timeout', () => {
    req.destroy();
  });

  req.end();
}

// Start concurrent client workers
console.log(`[+] Firing ${CONCURRENCY} concurrent client streams...`);
for (let i = 0; i < CONCURRENCY; i++) {
  sendRequest();
}

// Print live progress every second
let elapsed = 0;
const interval = setInterval(() => {
  elapsed++;
  const rps = (totalRequests / elapsed).toFixed(1);
  process.stdout.write(`  ⏳ Running: ${elapsed}s / ${DURATION_SEC}s | Requests: ${totalRequests} | Current Throughput: ${rps} req/sec\r`);

  if (elapsed >= DURATION_SEC) {
    clearInterval(interval);
    isRunning = false;

    setTimeout(() => {
      printReport();
    }, 500);
  }
}, 1000);

function printReport() {
  console.log('\n\n=================================================================');
  console.log(' 📊 Benchmark Summary & Latency Distribution                     ');
  console.log('=================================================================');

  latencies.sort((a, b) => a - b);
  const avgLatency = (latencies.reduce((sum, val) => sum + val, 0) / latencies.length || 0).toFixed(1);
  const p50 = latencies[Math.floor(latencies.length * 0.50)] || 0;
  const p90 = latencies[Math.floor(latencies.length * 0.90)] || 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;
  const minLatency = latencies[0] || 0;
  const maxLatency = latencies[latencies.length - 1] || 0;

  const totalTimeSec = DURATION_SEC;
  const overallRPS = (totalRequests / totalTimeSec).toFixed(2);
  const successRate = totalRequests > 0 ? ((successRequests / totalRequests) * 100).toFixed(1) : 0;

  console.log(` Total Requests Completed : ${totalRequests}`);
  console.log(` Successful (2xx/3xx)     : ${successRequests} (${successRate}%)`);
  console.log(` Failed / Timed Out       : ${errorRequests}`);
  console.log(` Average Throughput       : ${overallRPS} req/sec`);
  console.log('-----------------------------------------------------------------');
  console.log(' Latency Percentiles:');
  console.log(`   • Min Latency          : ${minLatency} ms`);
  console.log(`   • Median (p50)         : ${p50} ms`);
  console.log(`   • 90th Percentile (p90): ${p90} ms`);
  console.log(`   • 95th Percentile (p95): ${p95} ms`);
  console.log(`   • 99th Percentile (p99): ${p99} ms`);
  console.log(`   • Max Latency          : ${maxLatency} ms`);
  console.log('=================================================================');
  console.log(' [✔] Tip: Check Grafana at http://localhost:3001 to see the CPU  ');
  console.log('     and HTTP request throughput spike in real time!             ');
  console.log('=================================================================\n');
}

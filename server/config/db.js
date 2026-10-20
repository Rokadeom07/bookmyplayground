const mongoose = require('mongoose');
const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

let mongodProcess = null;

async function ensureLocalMongodRunning(port = 27017) {
  // Check if port 27017 is already responding or mongod is running
  try {
    const net = require('net');
    const isPortOpen = await new Promise(resolve => {
      const socket = new net.Socket();
      socket.setTimeout(800);
      socket.on('connect', () => {
        socket.destroy();
        resolve(true);
      });
      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });
      socket.on('error', () => {
        socket.destroy();
        resolve(false);
      });
      socket.connect(port, '127.0.0.1');
    });

    if (isPortOpen) {
      console.log(`[Database] MongoDB is already running on port ${port}.`);
      return;
    }
  } catch (err) {
    // Continue to spawn
  }

  // Find local mongod binary
  const binaryPath = path.resolve(__dirname, '../../bin/mongod.exe');
  const dbDataPath = path.resolve(__dirname, '../data/db');

  if (!fs.existsSync(dbDataPath)) {
    fs.mkdirSync(dbDataPath, { recursive: true });
  }

  if (fs.existsSync(binaryPath)) {
    console.log(`[Database] Starting persistent local MongoDB from: ${binaryPath}`);
    console.log(`[Database] Persistent storage path: ${dbDataPath}`);

    mongodProcess = spawn(
      binaryPath,
      ['--dbpath', dbDataPath, '--port', String(port), '--bind_ip', '127.0.0.1'],
      {
        detached: true,
        stdio: 'ignore',
      }
    );
    mongodProcess.unref();

    // Wait for mongod to initialize
    await new Promise(resolve => setTimeout(resolve, 2500));
    console.log(`[Database] Local MongoDB process initiated.`);
  } else {
    console.warn(`[Database] Local mongod binary not found at ${binaryPath}. Expecting system mongod.`);
  }
}

async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bookmyplayground';

  try {
    await ensureLocalMongodRunning(27017);

    console.log(`[Database] Connecting to MongoDB: ${uri}...`);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });

    console.log(`[Database] MongoDB Connected Successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    throw error;
  }
}

module.exports = { connectDB, ensureLocalMongodRunning };

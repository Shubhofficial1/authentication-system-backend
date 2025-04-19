import os from 'os';
import config from '../config/config.js';
import { v4 as uuidv4 } from 'uuid';
import { randomInt } from 'crypto';
import jwt from 'jsonwebtoken';

const getSystemHealth = () => {
    return {
        cpuUsage: os.loadavg(),
        totalMemory: `${(os.totalmem() / 1024 / 1024).toFixed(2)} MB`,
        freeMemory: `${(os.freemem() / 1024 / 1024).toFixed(2)} MB`
    };
};

const getApplicationHealth = () => {
    return {
        environment: config.ENV,
        upTime: `${process.uptime().toFixed(2)} Second`,
        memoryUsage: {
            heapTotal: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`,
            heapUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`
        }
    };
};

const generateRandomId = () => uuidv4();

const generateOtp = (length) => {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return randomInt(min, max).toString();
};

const generateToken = (payload, secret, expiry) => {
    return jwt.sign(payload, secret, {
        expiresIn: expiry
    });
};

const validateToken = (payload, secret) => {
    return jwt.verify(payload, secret);
};
export { getSystemHealth, getApplicationHealth, generateRandomId, generateOtp, generateToken, validateToken };

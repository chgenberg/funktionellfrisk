const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    console.log(`Request: ${req.method} ${req.url} from ${req.connection.remoteAddress}`);
    
    req.setTimeout(30000);
    res.setTimeout(30000);
    
    if (req.url === '/health' || req.url === '/healthz') {
        res.writeHead(200, { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        });
        res.end(JSON.stringify({ 
            status: 'ok', 
            timestamp: new Date().toISOString(),
            port: PORT,
            uptime: process.uptime()
        }));
        return;
    }
    
    let filePath = req.url === '/' ? '/index.html' : req.url;
    if (filePath.includes('?')) filePath = filePath.split('?')[0];
    filePath = path.join(__dirname, filePath);
    
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403, { 'Content-Type': 'text/html' });
        res.end('<!DOCTYPE html><html><head><title>403 Forbidden</title></head><body><h1>403 Forbidden</h1></body></html>');
        return;
    }
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.log(`Error reading ${filePath}:`, err.message);
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<!DOCTYPE html><html><head><title>404 Not Found</title></head><body><h1>404 Not Found</h1><p>The requested file was not found.</p></body></html>');
            return;
        }
        
        const ext = path.extname(filePath);
        const contentTypes = {
            '.html': 'text/html; charset=utf-8',
            '.css': 'text/css; charset=utf-8',
            '.js': 'application/javascript; charset=utf-8',
            '.json': 'application/json; charset=utf-8',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.txt': 'text/plain; charset=utf-8'
        };
        const contentType = contentTypes[ext] || 'application/octet-stream';
        
        // Cache policy: HTML short (no-cache), static assets long cache
        let cacheControl = 'public, max-age=3600';
        if (ext === '.html') {
            cacheControl = 'no-cache';
        } else if (['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg'].includes(ext)) {
            cacheControl = 'public, max-age=31536000, immutable';
        }
        
        res.writeHead(200, { 
            'Content-Type': contentType,
            'Cache-Control': cacheControl
        });
        res.end(data);
    });
});

server.timeout = 60000;
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

server.listen(PORT, '::', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Listening on [::]:${PORT} (IPv6) and 0.0.0.0:${PORT} (IPv4)`);
    console.log(`Files in directory:`, fs.readdirSync(__dirname).slice(0, 10));
    console.log(`✅ Server successfully started and listening on [::]:${PORT}`);
});

server.on('error', (err) => {
    console.error('Server error:', err);
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
        process.exit(1);
    }
});

process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
}); 
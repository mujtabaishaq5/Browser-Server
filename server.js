const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(cors());

const BIN_PATH = path.join(__dirname, 'bin', 'elpl');

app.post('/api/run', (req, res) => {
    const code = req.body.code || req.body.program;
    if (!code) {
        return res.status(400).json({ error: 'No program provided' });
    }

    if (code.length > 10000) {
        return res.status(400).json({ error: 'Error: program too large (maximum 10000 characters)' });
    }

  // Use a clean, consistent filename instead of a random string
    const fileName = 'Main.elpl';
    const filePath = path.join('/tmp', fileName);
    fs.writeFileSync(filePath, userCode);

    try {
        fs.writeFileSync(filePath, code, 'utf8');
        console.log(`[SERVER] Wrote file to ${filePath}`);
    } catch (err) {
        return res.status(500).json({ error: 'Failed to write temporary source file.' });
    }

    const command = `stdbuf -oL "${BIN_PATH}" "${filePath}"`;

    // Inside your server.js route handler where you run the binary:
exec(`stdbuf -oL /usr/src/app/bin/elpl "${filePath}"`, (error, stdout, stderr) => {
    
    // Combine stdout and stderr so nothing gets lost
    let outputData = stdout.trim();
    if (stderr && stderr.trim() !== '') {
        outputData += (outputData ? '\n' : '') + stderr.trim();
    }
    
    // If outputData is still completely empty, fallback cleanly
    if (!outputData) {
        outputData = "Program executed successfully (No print output)";
    }

    res.json({
        exitCode: error ? (error.code || 1) : 0,
        stdout: stdout,
        stderr: stderr,
        output: outputData  // <-- Make sure your frontend reads this 'output' field!
    });
});

      
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Runner environment active on port ${PORT}`);
});

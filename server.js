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

    const fileName = `code_${Date.now()}_${Math.random().toString(36).substring(7)}.elpl`;
    const filePath = path.join('/tmp', fileName);

    try {
        fs.writeFileSync(filePath, code, 'utf8');
        console.log(`[SERVER] Wrote file to ${filePath}`);
    } catch (err) {
        return res.status(500).json({ error: 'Failed to write temporary source file.' });
    }

    const command = `stdbuf -oL "${BIN_PATH}" "${filePath}"`;

    exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
        try {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        } catch (e) {}

        console.log(`[SERVER] Exit Code:`, error ? error.code : 0);
        console.log(`[SERVER] Error Object:`, error);
        console.log(`[SERVER] Stdout:`, JSON.stringify(stdout));
        console.log(`[SERVER] Stderr:`, JSON.stringify(stderr));

       let finalOutput = stdout.trim();
        if (stderr && stderr.trim() !== '') {
            finalOutput += (finalOutput ? '\n' : '') + stderr.trim();
        }
        
        // Fallback: if stdout was empty but the binary ran, show a success message instead of blank text
        if (!finalOutput) {
            finalOutput = "Program executed successfully.";
        }

        res.json({
            exitCode: error ? (error.code || 1) : 0,
            stdout: stdout.trim(),
            stderr: stderr.trim(),
            output: finalOutput
        });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Runner environment active on port ${PORT}`);
});

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises; // Use promises-based fs

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('.'));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
const dataDir = path.join(__dirname, 'data');
fs.mkdir(uploadsDir, { recursive: true });
fs.mkdir(dataDir, { recursive: true });

// --- Multer File Upload Configuration ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

// --- JSON File Helpers ---
const readData = async (collectionName) => {
    const filePath = path.join(dataDir, `${collectionName}.json`);
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') return []; // If file doesn't exist, return empty array
        throw error;
    }
};

const writeData = async (collectionName, data) => {
    const filePath = path.join(dataDir, `${collectionName}.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

// --- API Routes ---

// File Upload Endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    res.json({ success: true, path: `/uploads/${req.file.filename}` });
});

// Generic function to create CRUD endpoints for JSON files
function createCrudEndpoints(collectionName) {
    // GET all items
    app.get(`/api/${collectionName}`, async (req, res) => {
        try {
            const items = await readData(collectionName);
            res.json(items);
        } catch (error) {
            res.status(500).json({ error: `Failed to fetch ${collectionName}` });
        }
    });

    // POST a new item
    app.post(`/api/${collectionName}`, async (req, res) => {
        try {
            const items = await readData(collectionName);
            const newItem = req.body;
            newItem.id = Date.now().toString(); // Assign a unique ID
            newItem.createdAt = Date.now();
            items.push(newItem);
            await writeData(collectionName, items);
            res.status(201).json({ success: true, newItem });
        } catch (error) {
            res.status(500).json({ error: `Failed to save ${collectionName}` });
        }
    });

    // DELETE an item by its unique ID
    app.delete(`/api/${collectionName}/:id`, async (req, res) => {
        try {
            const { id } = req.params;
            let items = await readData(collectionName);
            const initialLength = items.length;
            items = items.filter(item => item.id !== id);

            if (items.length < initialLength) {
                await writeData(collectionName, items);
                res.json({ success: true });
            } else {
                res.status(404).json({ error: 'Item not found' });
            }
        } catch (error) {
            res.status(500).json({ error: `Failed to delete ${collectionName}` });
        }
    });
    
    // UPDATE an item (e.g., for closing jobs)
    app.put(`/api/${collectionName}/:id`, async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = req.body;
            let items = await readData(collectionName);
            const itemIndex = items.findIndex(item => item.id === id);

            if (itemIndex !== -1) {
                items[itemIndex] = { ...items[itemIndex], ...updateData };
                await writeData(collectionName, items);
                res.json({ success: true });
            } else {
                res.status(404).json({ error: 'Item not found' });
            }
        } catch (error) {
            res.status(500).json({ error: `Failed to update ${collectionName}` });
        }
    });
}

// Create endpoints for all collections
const collections = ['novels', 'books', 'initiatives', 'jobs', 'partners'];
collections.forEach(createCrudEndpoints);

// --- Static Files & Server Start ---
app.use('/uploads', express.static('uploads'));
app.use('/admin', express.static('admin'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 RUFOOF Server running at http://localhost:${PORT}`);
    console.log('✅ Server is now using local JSON files for data storage.');
});

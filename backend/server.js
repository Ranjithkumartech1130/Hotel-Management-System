require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');
const { Parser } = require('json2csv');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'orders.json');
const MENU_FILE = path.join(__dirname, 'menu.json');
const TABLES_FILE = path.join(__dirname, 'tables.json');
const SECRET_KEY = process.env.JWT_SECRET || 'admin_secret_key';

app.use(cors());
app.use(bodyParser.json());

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Fallback to index.html for any unknown routes (SPA support)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) return res.status(403).json({ message: 'No token provided' });

        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({ message: 'Token error: Format must be Bearer <token>' });
        }

        const token = parts[1];
        if (!token) return res.status(401).json({ message: 'Token error: Token missing' });

        jwt.verify(token, SECRET_KEY, (err, decoded) => {
            if (err) return res.status(500).json({ message: 'Failed to authenticate token' });
            req.user = decoded;
            next();
        });
    } catch (error) {
        console.error("Token Verification Error:", error);
        return res.status(500).json({ message: 'Internal Server Error during verification' });
    }
};

const initDB = async () => {
    if (!await fs.pathExists(DATA_FILE)) {
        await fs.writeJson(DATA_FILE, []);
    }
    if (!await fs.pathExists(MENU_FILE)) {
        await fs.writeJson(MENU_FILE, []);
    }
    if (!await fs.pathExists(TABLES_FILE)) {
        const initialTables = [
            { id: 1, type: 'rect', seats: 2, label: 'T1', x: 10, y: 10, status: 'available' },
            { id: 2, type: 'rect', seats: 2, label: 'T2', x: 30, y: 10, status: 'available' },
            { id: 3, type: 'rect', seats: 2, label: 'T3', x: 50, y: 10, status: 'available' },
            { id: 4, type: 'rect', seats: 2, label: 'T4', x: 70, y: 10, status: 'available' },

            { id: 5, type: 'diamond', seats: 4, label: 'T5', x: 15, y: 35, status: 'available' },
            { id: 6, type: 'diamond', seats: 4, label: 'T6', x: 35, y: 35, status: 'available' },
            { id: 7, type: 'diamond', seats: 4, label: 'T7', x: 15, y: 55, status: 'available' },
            { id: 8, type: 'diamond', seats: 4, label: 'T8', x: 35, y: 55, status: 'available' },

            { id: 9, type: 'diamond', seats: 4, label: 'T9', x: 60, y: 45, status: 'available' },
            { id: 10, type: 'diamond', seats: 4, label: 'T10', x: 80, y: 45, status: 'available' },

            { id: 11, type: 'round', seats: 4, label: 'T11', x: 30, y: 75, status: 'available' },
            { id: 12, type: 'round', seats: 4, label: 'T12', x: 50, y: 75, status: 'available' },
            { id: 13, type: 'round', seats: 4, label: 'T13', x: 70, y: 75, status: 'available' },
            { id: 14, type: 'round', seats: 4, label: 'T14', x: 20, y: 90, status: 'available' },
            { id: 15, type: 'round', seats: 4, label: 'T15', x: 40, y: 90, status: 'available' },
            { id: 16, type: 'round', seats: 4, label: 'T16', x: 60, y: 90, status: 'available' },
            { id: 17, type: 'round', seats: 4, label: 'T17', x: 80, y: 90, status: 'available' }
        ];
        await fs.writeJson(TABLES_FILE, initialTables);
    }
};
initDB();

app.get('/api/menu', async (req, res) => {
    try {
        const menu = await fs.readJson(MENU_FILE);
        res.json(menu);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching menu' });
    }
});

app.get('/api/tables', async (req, res) => {
    try {
        const tables = await fs.readJson(TABLES_FILE);
        res.json(tables);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tables' });
    }
});

app.put('/api/admin/tables/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const tables = await fs.readJson(TABLES_FILE);
        const index = tables.findIndex(t => t.id == id);
        if (index > -1) {
            tables[index].status = status;
            await fs.writeJson(TABLES_FILE, tables);
            res.json({ success: true, message: 'Table status updated' });
        } else {
            res.status(404).json({ message: 'Table not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating table' });
    }
});

app.put('/api/admin/menu/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { available } = req.body;
        const menu = await fs.readJson(MENU_FILE);
        const itemIndex = menu.findIndex(item => item.id == id);
        if (itemIndex > -1) {
            menu[itemIndex].available = available;
            await fs.writeJson(MENU_FILE, menu);
            res.json({ success: true, message: 'Availability updated' });
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating availability' });
    }
});

app.post('/api/admin/menu', verifyToken, async (req, res) => {
    try {
        const newItem = {
            id: Date.now(),
            ...req.body,
            available: true
        };
        const menu = await fs.readJson(MENU_FILE);
        menu.push(newItem);
        await fs.writeJson(MENU_FILE, menu);
        res.json({ success: true, message: 'Item added successfully', item: newItem });
    } catch (error) {
        res.status(500).json({ message: 'Error adding item' });
    }
});

app.delete('/api/admin/menu/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        let menu = await fs.readJson(MENU_FILE);
        menu = menu.filter(item => item.id != id);
        await fs.writeJson(MENU_FILE, menu);
        res.json({ success: true, message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting item' });
    }
});

app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    const adminUser = process.env.ADMIN_USERNAME || 'admin';
    const adminPass = process.env.ADMIN_PASSWORD || 'admin123';

    if (username === adminUser && password === adminPass) {
        const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
        return res.json({ success: true, token });
    }
    res.status(401).json({ success: false, message: 'Invalid credentials' });
});

const sendOrderConfirmation = async (order) => {
    if (!transporter) {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn('⚠️ Email credentials missing.');
            return;
        }
        transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            connectionTimeout: 15000
        });
    }

    try {
        const itemsList = (order.cart || []).map(item =>
            `<li><strong>${item.title}</strong> - ₹${item.price}</li>`
        ).join('');

        await transporter.sendMail({
            from: `"BestBites" <${process.env.EMAIL_USER}>`,
            to: order.email,
            subject: `Order Confirmation - #${order.id.toString().slice(-6)}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <div style="background-color: #ffc107; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="margin: 0; color: white;">Order Confirmed!</h1>
                    </div>
                    <div style="padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
                        <p>Hi <strong>${order.firstName}</strong>,</p>
                        <p>Thank you for your order!</p>
                        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <h3 style="margin-top: 0; color: #ffc107;">Order Details</h3>
                            <p><strong>Order ID:</strong> #${order.id}</p>
                            <p><strong>Total:</strong> ₹${order.totalCost}</p>
                        </div>
                        <h3>Items:</h3>
                        <ul>${itemsList}</ul>
                        <p style="text-align: center; color: #777;">BestBites Hotel Management</p>
                    </div>
                </div>
            `,
        });
        console.log('📨 Success: Confirmation email sent to', order.email);
    } catch (error) {
        console.error('❌ Email Error:', error.message);
    }
};

// Diagnostic Endpoint
app.post('/api/admin/test-email', verifyToken, async (req, res) => {
    try {
        const testOrder = {
            id: 'TEST123456',
            firstName: 'Pooja',
            email: process.env.EMAIL_USER,
            totalCost: 0,
            cart: [{ title: 'Test Item', price: 0 }],
            date: new Date()
        };
        await sendOrderConfirmation(testOrder);
        res.json({ success: true, message: 'Test email attempt completed. Check server logs for results.' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        const { tableId } = req.body;

        if (tableId) {
            const tables = await fs.readJson(TABLES_FILE);
            const tableIndex = tables.findIndex(t => t.id == tableId);
            if (tableIndex > -1) {
                if (tables[tableIndex].status !== 'available') {
                    return res.status(400).json({ success: false, message: 'Table is no longer available' });
                }
                tables[tableIndex].status = 'occupied';
                await fs.writeJson(TABLES_FILE, tables);
            }
        }

        const newOrder = {
            id: Date.now(),
            ...req.body,
            date: new Date().toISOString()
        };
        const orders = await fs.readJson(DATA_FILE);
        orders.push(newOrder);
        await fs.writeJson(DATA_FILE, orders);

        sendOrderConfirmation(newOrder);

        res.status(201).json({ success: true, message: 'Order placed successfully', order: newOrder });
    } catch (error) {
        console.error("Order Error:", error);
        res.status(500).json({ success: false, message: 'Error saving order' });
    }
});

app.get('/api/admin/orders', verifyToken, async (req, res) => {
    try {
        const orders = await fs.readJson(DATA_FILE).catch(() => []);
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

app.delete('/api/admin/orders', verifyToken, async (req, res) => {
    try {
        await fs.writeJson(DATA_FILE, []);
        res.json({ success: true, message: 'All orders cleared successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error clearing orders' });
    }
});

app.delete('/api/admin/orders/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        let orders = await fs.readJson(DATA_FILE).catch(() => []);
        orders = orders.filter(order => order.id != id);
        await fs.writeJson(DATA_FILE, orders);
        res.json({ success: true, message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting order' });
    }
});

app.get('/api/admin/export', verifyToken, async (req, res) => {
    try {
        const orders = await fs.readJson(DATA_FILE).catch(() => []);

        if (orders.length === 0) {
            const fields = ['Name', 'mail', 'order', 'amount'];
            const json2csvParser = new Parser({ fields });
            const csv = json2csvParser.parse([]);
            res.header('Content-Type', 'text/csv');
            res.attachment('orders.csv');
            return res.send(csv);
        }

        const csvData = orders.map(order => ({
            Name: `${order.firstName} ${order.lastName}`,
            mail: order.email,
            order: (order.cart || []).map(item => item.title).join('; '),
            amount: `₹${order.totalCost}`
        }));

        const fields = ['Name', 'mail', 'order', 'amount'];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(csvData);

        res.header('Content-Type', 'text/csv');
        res.attachment('orders.csv');
        res.send(csv);
    } catch (error) {
        console.error('Export Error:', error);
        res.status(500).json({ message: 'Error exporting CSV' });
    }
});

const server = app.listen(PORT, () => {
    console.log('---------------------------------------------------');
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`   - Menu endpoint: http://localhost:${PORT}/api/menu`);
    console.log('   - Press Ctrl+C to stop the server');
    console.log('---------------------------------------------------');
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use!`);
        console.error('Please close the other server or change the PORT.');
    } else {
        console.error('❌ Server error:', err);
    }
});

// Prevent immediate exit if listen fails silently
setInterval(() => { }, 1 << 30);

// Global Error Handlers
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥', err.message);
    console.error(err.stack);
});

process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! 💥', err);
});

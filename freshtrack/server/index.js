require('dotenv').config();

const express = require('express');
const cors = require('cors');

const { connectMongo } = require('./utils/mongoRuntime');
const { seedDatabase } = require('./seedData');

const dashboardRoutes = require('./routes/dashboard');
const expiryRoutes = require('./routes/expiry');
const suggestionsRoutes = require('./routes/suggestions');
const alertsRoutes = require('./routes/alerts');
const analyticsRoutes = require('./routes/analytics');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'freshtrack',
    time: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.send('Backend is running 🚀');
});

// Routes
app.use('/api/freshtrack', dashboardRoutes);
app.use('/api/freshtrack', expiryRoutes);
app.use('/api/freshtrack', suggestionsRoutes);
app.use('/api/freshtrack', alertsRoutes);
app.use('/api/freshtrack', analyticsRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: 'internal_error',
    message: err?.message || 'Unexpected server error'
  });
});

// ✅ START SERVER FIRST (critical for Render)
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on ${PORT}`);
});

// ✅ THEN connect DB
async function start() {
  try {
    const conn = await connectMongo();

    if (conn.mode === 'memory') {
      const summary = await seedDatabase();
      console.log(
        `✅ (In-memory) Seeded ${summary.products} products, ${summary.inventoryBatches} inventory batches, ${summary.salesRecords} sales records`
      );
    }

  } catch (error) {
    console.error('❌ Failed to connect DB:', error);
  }
}

start();
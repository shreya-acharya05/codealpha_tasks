const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'store.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initializeDatabase() {
  // Create Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Products table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image_url TEXT,
      category TEXT,
      stock INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Cart Items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);

  // Create Orders table
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      shipping_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create Order Items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price_at_purchase REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);

  // Seed products if table is empty
  const count = db.prepare('SELECT COUNT(*) as count FROM products').get();
  if (count.count === 0) {
    const insertProduct = db.prepare(`
      INSERT INTO products (name, description, price, image_url, category, stock) 
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const products = [
      // Electronics
      ['Wireless Bluetooth Headphones', 'Premium noise-cancelling over-ear headphones with 30-hour battery life. Features deep bass, crystal clear mids, and built-in microphone for calls.', 79.99, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', 'Electronics', 25],
      ['Smart Watch Pro', 'Advanced fitness tracker with heart rate monitor, GPS, and 7-day battery life. Water resistant to 50 meters with AMOLED display.', 199.99, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', 'Electronics', 15],
      ['Portable Speaker', 'Waterproof Bluetooth speaker with 360° surround sound. 12-hour playtime, built-in power bank, and rugged design for outdoor adventures.', 49.99, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500', 'Electronics', 30],
      // Clothing
      ['Classic Denim Jacket', 'Timeless denim jacket crafted from premium cotton. Features a modern slim fit, button closure, and versatile medium wash.', 89.99, 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500', 'Clothing', 20],
      ['Running Sneakers', 'Lightweight performance running shoes with responsive cushioning and breathable mesh upper. Perfect for daily training and races.', 129.99, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', 'Clothing', 18],
      ['Leather Crossbody Bag', 'Handcrafted genuine leather crossbody bag with adjustable strap. Multiple compartments and premium brass hardware.', 69.99, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500', 'Clothing', 12],
      // Books
      ['The Art of Programming', 'A comprehensive guide to modern software development practices, design patterns, and clean code principles. 500+ pages of expert knowledge.', 34.99, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500', 'Books', 50],
      ['Mindful Living Guide', 'Discover the power of mindfulness with practical exercises, meditation techniques, and daily habits for a more balanced life.', 19.99, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500', 'Books', 40],
      ['World Cuisine Cookbook', 'Explore 200+ authentic recipes from around the globe. Beautiful photography and step-by-step instructions for every skill level.', 29.99, 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=500', 'Books', 35],
      // Home & Kitchen
      ['Ceramic Pour-Over Set', 'Handmade ceramic pour-over coffee dripper with matching mug. Includes reusable stainless steel filter for the perfect brew every morning.', 44.99, 'https://images.unsplash.com/photo-1517256064527-9d164d0050e5?w=500', 'Home & Kitchen', 22],
      ['Bamboo Desk Organizer', 'Eco-friendly bamboo desktop organizer with multiple compartments for pens, phone, cards, and accessories. Sleek minimalist design.', 24.99, 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500', 'Home & Kitchen', 28],
      ['Aromatic Candle Set', 'Set of 3 hand-poured soy wax candles in lavender, vanilla, and sandalwood. 45-hour burn time each, in elegant glass jars.', 39.99, 'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=500', 'Home & Kitchen', 33],
    ];

    const insertMany = db.transaction((products) => {
      for (const product of products) {
        insertProduct.run(...product);
      }
    });

    insertMany(products);
    console.log('✅ Database seeded with 12 products');
  }

  console.log('✅ Database initialized successfully');
}

module.exports = { db, initializeDatabase };

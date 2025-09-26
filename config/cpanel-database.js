// ===== cPanel MySQL Database Configuration ===== //

const mysql = require('mysql2/promise');
const path = require('path');

class CPanelDatabase {
  constructor() {
    this.connection = null;
    this.pool = null;
    this.isInitialized = false;
  }

  // Initialize MySQL connection for cPanel
  async initialize() {
    try {
      // cPanel database configuration
      const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'cpanel_user',
        password: process.env.DB_PASS || 'your_password',
        database: process.env.DB_NAME || 'cpanel_bus_tracking',
        port: process.env.DB_PORT || 3306,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
        charset: 'utf8mb4',
        timezone: '+00:00',
        acquireTimeout: 60000,
        timeout: 60000,
        reconnect: true
      };

      // Create connection pool for better performance
      this.pool = mysql.createPool({
        ...config,
        connectionLimit: 10,
        queueLimit: 0,
        acquireTimeout: 60000,
        timeout: 60000
      });

      // Test connection
      const connection = await this.pool.getConnection();
      console.log('✅ MySQL Database connected successfully');
      connection.release();

      // Initialize database schema
      await this.createTables();
      
      this.isInitialized = true;
      return true;

    } catch (error) {
      console.error('❌ MySQL Database connection failed:', error);
      throw error;
    }
  }

  // Create necessary tables for cPanel hosting
  async createTables() {
    const tables = [
      // Staff Users table
      `CREATE TABLE IF NOT EXISTS staff_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('conductor', 'driver') NOT NULL,
        phone VARCHAR(20),
        depot VARCHAR(100),
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,

      // Public Users table
      `CREATE TABLE IF NOT EXISTS public_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        preferred_language VARCHAR(10) DEFAULT 'en',
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,

      // Journeys table
      `CREATE TABLE IF NOT EXISTS journeys (
        id INT AUTO_INCREMENT PRIMARY KEY,
        staff_id INT NOT NULL,
        bus_number VARCHAR(20) NOT NULL,
        driver_name VARCHAR(100) NOT NULL,
        conductor_name VARCHAR(100) NOT NULL,
        starting_point VARCHAR(200) NOT NULL,
        destination VARCHAR(200) NOT NULL,
        route VARCHAR(500),
        highway VARCHAR(100),
        depot VARCHAR(100),
        status ENUM('starting', 'running', 'completed', 'cancelled') DEFAULT 'starting',
        start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        end_time TIMESTAMP NULL,
        current_latitude DECIMAL(10, 8),
        current_longitude DECIMAL(11, 8),
        last_location_update TIMESTAMP,
        distance_covered DECIMAL(10, 2) DEFAULT 0,
        estimated_arrival TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (staff_id) REFERENCES staff_users(id)
      )`,

      // Location History table
      `CREATE TABLE IF NOT EXISTS location_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        journey_id INT NOT NULL,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        speed DECIMAL(5, 2) DEFAULT 0,
        heading INT DEFAULT 0,
        accuracy DECIMAL(10, 2),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (journey_id) REFERENCES journeys(id)
      )`,

      // Bus Information table
      `CREATE TABLE IF NOT EXISTS buses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        bus_number VARCHAR(20) UNIQUE NOT NULL,
        capacity INT DEFAULT 50,
        fuel_type ENUM('diesel', 'electric', 'hybrid') DEFAULT 'diesel',
        manufacturer VARCHAR(50),
        model VARCHAR(50),
        year_manufactured YEAR,
        registration_date DATE,
        depot VARCHAR(100),
        status ENUM('active', 'maintenance', 'retired') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,

      // Routes table
      `CREATE TABLE IF NOT EXISTS routes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        route_name VARCHAR(100) NOT NULL,
        starting_point VARCHAR(200) NOT NULL,
        ending_point VARCHAR(200) NOT NULL,
        intermediate_stops JSON,
        distance DECIMAL(10, 2),
        estimated_duration INT,
        highway VARCHAR(100),
        fare DECIMAL(8, 2),
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,

      // System Settings table
      `CREATE TABLE IF NOT EXISTS system_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value TEXT,
        description TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,

      // Chat History table (for AI chatbot)
      `CREATE TABLE IF NOT EXISTS chat_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id VARCHAR(100) NOT NULL,
        user_type ENUM('staff', 'public', 'admin') NOT NULL,
        user_id INT,
        message TEXT NOT NULL,
        response TEXT NOT NULL,
        response_source ENUM('openai', 'static', 'fallback') DEFAULT 'static',
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    try {
      for (const table of tables) {
        await this.pool.execute(table);
      }
      
      // Insert default settings
      await this.insertDefaultSettings();
      
      console.log('✅ Database tables created successfully');
    } catch (error) {
      console.error('❌ Error creating tables:', error);
      throw error;
    }
  }

  // Insert default system settings
  async insertDefaultSettings() {
    const defaultSettings = [
      ['admin_id', 'BCS2024261', 'Default admin login ID'],
      ['admin_password', '$2b$10$hashed_password_here', 'Hashed admin password'],
      ['location_update_interval', '30', 'GPS location update interval in seconds'],
      ['max_journey_duration', '480', 'Maximum journey duration in minutes'],
      ['openai_api_key', '', 'OpenAI API key for chatbot'],
      ['system_name', 'Modern Bus Tracking System', 'System display name'],
      ['theme_default', 'light', 'Default theme for new users']
    ];

    const query = `
      INSERT IGNORE INTO system_settings (setting_key, setting_value, description)
      VALUES (?, ?, ?)
    `;

    try {
      for (const [key, value, description] of defaultSettings) {
        await this.pool.execute(query, [key, value, description]);
      }
      console.log('✅ Default settings inserted');
    } catch (error) {
      console.error('❌ Error inserting default settings:', error);
    }
  }

  // Execute query with connection from pool
  async query(sql, params = []) {
    try {
      const [rows] = await this.pool.execute(sql, params);
      return rows;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  // Get connection from pool
  async getConnection() {
    return await this.pool.getConnection();
  }

  // Close database connection
  async close() {
    if (this.pool) {
      await this.pool.end();
      console.log('✅ Database connection closed');
    }
  }

  // Health check for database
  async healthCheck() {
    try {
      await this.query('SELECT 1 as health');
      return { status: 'healthy', timestamp: new Date() };
    } catch (error) {
      return { status: 'unhealthy', error: error.message, timestamp: new Date() };
    }
  }

  // Backup database (for cPanel compatibility)
  async backup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(__dirname, '../backups', `backup-${timestamp}.sql`);
      
      // This would execute mysqldump command
      // For cPanel, you might need to use different approach
      console.log(`Database backup would be saved to: ${backupFile}`);
      
      return { success: true, backupFile };
    } catch (error) {
      console.error('Backup error:', error);
      return { success: false, error: error.message };
    }
  }

  // Migration helper for cPanel deployment
  async migrate() {
    try {
      // Check if migration is needed
      const tables = await this.query(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = DATABASE()
      `);
      
      if (tables.length === 0) {
        console.log('🔄 Running initial migration...');
        await this.createTables();
      }
      
      console.log('✅ Database migration completed');
      return true;
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }
}

module.exports = CPanelDatabase;

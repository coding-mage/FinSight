import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const DB_FILE = path.join(process.cwd(), 'mock_db.json');

// Helper to read/write persistent mock database
function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (e) {
    return {};
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Enable mock if explicitly set or if MONGO_URI is missing
const useMock = process.env.MOCK_DB === 'true' || !process.env.MONGO_URI;

if (useMock) {
  console.log('⚠️ Running in Mock Database mode. Data will persist in mock_db.json.');

  // Override mongoose.connect to succeed immediately
  mongoose.connect = async () => {
    console.log('✅ Mock MongoDB connected successfully');
    return mongoose.connection;
  };

  // Keep a map of registered model methods to preserve schema methods
  const schemaMethods = {};

  // We want to intercept mongoose.model
  const originalModel = mongoose.model;
  mongoose.model = function(modelName, schema) {
    console.log(`Intercepted mongoose.model for ${modelName}`);

    // Create a MockModel class
    class MockModel {
      constructor(data = {}) {
        Object.assign(this, data);
        if (!this._id) {
          this._id = 'mock_' + Math.random().toString(36).substr(2, 9);
        }
        if (!this.createdAt) {
          this.createdAt = new Date().toISOString();
        }
        // Attach schema methods
        if (schema && schema.methods) {
          for (const [methodName, fn] of Object.entries(schema.methods)) {
            this[methodName] = fn.bind(this);
          }
        }
        // Custom methods if User model
        if (modelName === 'User') {
          this.matchPassword = async function(enteredPassword) {
            return await bcrypt.compare(enteredPassword, this.password);
          };
          this.generateAuthToken = function() {
            return jwt.sign(
              { _id: this._id, region: this.region },
              process.env.JWT_SECRET || 'super_secret_dev_key_98765',
              { expiresIn: '1h' }
            );
          };
        }
      }

      async save() {
        const db = readDB();
        if (!db[modelName]) db[modelName] = [];
        
        // Hash password if User model and not already hashed
        if (modelName === 'User' && this.password && !this.password.startsWith('$2')) {
          const salt = await bcrypt.genSalt(10);
          this.password = await bcrypt.hash(this.password, salt);
        }

        const idx = db[modelName].findIndex(x => x._id === this._id);
        const serialized = JSON.parse(JSON.stringify(this));
        if (idx >= 0) {
          db[modelName][idx] = serialized;
        } else {
          db[modelName].push(serialized);
        }
        writeDB(db);
        return this;
      }

      static async create(data) {
        const instance = new MockModel(data);
        await instance.save();
        return instance;
      }

      static find(query = {}) {
        const queryMethods = {
          _sort: null,
          _limit: null,
          _select: null,
          sort: function(sortOption) {
            this._sort = sortOption;
            return this;
          },
          limit: function(limitOption) {
            this._limit = limitOption;
            return this;
          },
          select: function(selectOption) {
            this._select = selectOption;
            return this;
          },
          then: async function(resolve, reject) {
            try {
              const db = readDB();
              let list = db[modelName] || [];
              
              // Filter list by query
              list = list.filter(item => {
                for (const [key, val] of Object.entries(query)) {
                  if (val && typeof val === 'object') {
                    if (val.$gte !== undefined && item[key] < val.$gte) return false;
                    if (val.$lte !== undefined && item[key] > val.$lte) return false;
                    if (val.$gt !== undefined && item[key] <= val.$gt) return false;
                    if (val.$lt !== undefined && item[key] >= val.$lt) return false;
                    if (val.$ne !== undefined && item[key] === val.$ne) return false;
                    if (val.$in !== undefined && !val.$in.includes(item[key])) return false;
                  } else {
                    if (item[key] !== val) return false;
                  }
                }
                return true;
              });

              // Apply sort
              if (this._sort) {
                const sortKey = Object.keys(this._sort)[0];
                const sortOrder = this._sort[sortKey] === -1 || String(this._sort[sortKey]).includes('-') ? -1 : 1;
                list.sort((a, b) => {
                  if (a[sortKey] < b[sortKey]) return -1 * sortOrder;
                  if (a[sortKey] > b[sortKey]) return 1 * sortOrder;
                  return 0;
                });
              }

              // Apply limit
              if (this._limit) {
                list = list.slice(0, this._limit);
              }

              const instances = list.map(x => new MockModel(x));
              return resolve ? resolve(instances) : instances;
            } catch (err) {
              return reject ? reject(err) : Promise.reject(err);
            }
          }
        };
        return queryMethods;
      }

      static async findOne(query = {}) {
        const db = readDB();
        const list = db[modelName] || [];
        const found = list.find(item => {
          for (const [key, val] of Object.entries(query)) {
            if (item[key] !== val) return false;
          }
          return true;
        });
        return found ? new MockModel(found) : null;
      }

      static async findById(id) {
        const db = readDB();
        const list = db[modelName] || [];
        const found = list.find(item => item._id === id);
        return found ? new MockModel(found) : null;
      }

      static async findByIdAndUpdate(id, update, options = {}) {
        const db = readDB();
        const list = db[modelName] || [];
        const idx = list.findIndex(item => item._id === id);
        if (idx === -1) return null;
        
        let current = list[idx];
        if (update.$set) {
          Object.assign(current, update.$set);
        } else {
          Object.assign(current, update);
        }
        db[modelName][idx] = current;
        writeDB(db);
        return new MockModel(current);
      }

      static async findByIdAndDelete(id) {
        const db = readDB();
        const list = db[modelName] || [];
        const idx = list.findIndex(item => item._id === id);
        if (idx === -1) return null;
        const deleted = list.splice(idx, 1)[0];
        writeDB(db);
        return new MockModel(deleted);
      }

      static async updateOne(query, update) {
        const db = readDB();
        const list = db[modelName] || [];
        const idx = list.findIndex(item => {
          for (const [key, val] of Object.entries(query)) {
            if (item[key] !== val) return false;
          }
          return true;
        });
        if (idx === -1) return { nModified: 0 };
        let current = list[idx];
        if (update.$set) {
          Object.assign(current, update.$set);
        } else {
          Object.assign(current, update);
        }
        db[modelName][idx] = current;
        writeDB(db);
        return { nModified: 1 };
      }

      static async deleteOne(query) {
        const db = readDB();
        const list = db[modelName] || [];
        const idx = list.findIndex(item => {
          for (const [key, val] of Object.entries(query)) {
            if (item[key] !== val) return false;
          }
          return true;
        });
        if (idx === -1) return { deletedCount: 0 };
        list.splice(idx, 1);
        writeDB(db);
        return { deletedCount: 1 };
      }

      static async countDocuments(query = {}) {
        const res = await this.find(query);
        return res.length;
      }
    }

    return MockModel;
  };
}

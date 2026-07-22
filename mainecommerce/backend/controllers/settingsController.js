/**
 * Settings persistence using a simple JSON file so no extra DB collection is needed.
 * File lives at: backend/data/settings.json
 */
const fs = require('fs/promises');
const path = require('path');

const SETTINGS_PATH = path.join(__dirname, '..', 'data', 'settings.json');

const DEFAULTS = {
  storeName: 'GULIT Marketplace',
  email: 'support@gulit.com',
  phone: '+251 900 000 000',
  address: 'Addis Ababa, Ethiopia',
};

async function readSettings() {
  try {
    const raw = await fs.readFile(SETTINGS_PATH, 'utf8');
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

async function writeSettings(data) {
  await fs.mkdir(path.dirname(SETTINGS_PATH), { recursive: true });
  await fs.writeFile(SETTINGS_PATH, JSON.stringify(data, null, 2), 'utf8');
}

exports.getSettings = async (req, res) => {
  try {
    res.json(await readSettings());
  } catch (err) {
    console.error('getSettings error', err.message || err);
    res.status(500).json({ message: 'Failed to load settings' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const current = await readSettings();
    const { storeName, email, phone, address } = req.body;
    const updated = {
      ...current,
      ...(storeName !== undefined && { storeName }),
      ...(email     !== undefined && { email }),
      ...(phone     !== undefined && { phone }),
      ...(address   !== undefined && { address }),
    };
    await writeSettings(updated);
    res.json(updated);
  } catch (err) {
    console.error('updateSettings error', err.message || err);
    res.status(500).json({ message: 'Failed to save settings' });
  }
};

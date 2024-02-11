const { app, BrowserWindow, ipcMain } = require('electron');
const mysql = require('mysql');

let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false // Enable Node.js integration in the renderer process
    },
  });

  mainWindow.loadFile('src/index.html');

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
});

ipcMain.on('connect-to-mysql', (event) => {
  const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'electron',
  });

  connection.connect((err) => {
    if (err) {
      event.reply('mysql-connection-status', { status: 'error', message: err.stack });
      console.log('Error ', err.stack);
    } else {
      event.reply('mysql-connection-status', { status: 'success', message: 'Connection established' });
      console.log('Connection established');
      // You can perform additional database operations here
    }
  });

  connection.end(() => {
    console.log('Connection Closed');
  });
});

ipcMain.on('create-contact', (event, contact) => {
  const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'electron',
  });

  connection.connect();

  const { first_name, last_name, description } = contact;

  const sql = 'INSERT INTO contacts (first_name, last_name, description) VALUES (?, ?, ?)';
  connection.query(sql, [first_name, last_name, description], (error, results) => {
    if (error) {
      event.reply('contact-operation-status', { status: 'error', message: error.message });
    } else {
      event.reply('contact-operation-status', { status: 'success', message: 'Contact created successfully' });
    }
  });

  connection.end(() => {
    fetchAndSendContacts();
  });
});

ipcMain.on('read-contacts', (event) => {
  fetchAndSendContacts();
});

ipcMain.on('update-contact', (event, contact) => {
  const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'electron',
  });

  connection.connect();

  const { id, first_name, last_name, description } = contact;

  const sql = 'UPDATE contacts SET first_name=?, last_name=?, description=? WHERE id=?';
  connection.query(sql, [first_name, last_name, description, id], (error, results) => {
    if (error) {
      event.reply('contact-operation-status', { status: 'error', message: error.message });
    } else {
      event.reply('contact-operation-status', { status: 'success', message: 'Contact updated successfully' });
    }
  });

  connection.end(() => {
    fetchAndSendContacts();
  });
});

ipcMain.on('delete-contact', (event, contactId) => {
  const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'electron',
  });

  connection.connect();

  const sql = 'DELETE FROM contacts WHERE id=?';
  connection.query(sql, [contactId], (error, results) => {
    if (error) {
      event.reply('contact-operation-status', { status: 'error', message: error.message });
    } else {
      event.reply('contact-operation-status', { status: 'success', message: 'Contact deleted successfully' });
    }
  });

  connection.end(() => {
    fetchAndSendContacts();
  });
});

function fetchAndSendContacts() {
  const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'electron',
  });

  connection.connect();

  const sql = 'SELECT * FROM contacts';
  connection.query(sql, (error, results) => {
    if (error) {
      mainWindow.webContents.send('contacts-data', { status: 'error', message: error.message });
    } else {
      mainWindow.webContents.send('contacts-data', { status: 'success', data: results });
    }
  });

  connection.end();
}
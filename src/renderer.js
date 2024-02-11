// renderer.js

const { ipcRenderer } = require('electron');

// Function to fetch and display contacts
function fetchAndDisplayContacts() {
    ipcRenderer.send('read-contacts');
}

// Function to handle contact update
function updateContact(contactId) {
    // You can implement the logic to update the contact
    // For example, open a modal with the contact details for editing
    console.log('Update clicked for contact ID:', contactId);
}

// Function to handle contact delete
function deleteContact(contactId) {
    // You can implement the logic to delete the contact
    // For example, show a confirmation dialog before deleting
    console.log('Delete clicked for contact ID:', contactId);

    // Assuming you have a confirmation dialog, you can open it here
    const confirmDelete = confirm('Are you sure you want to delete this contact?');
    if (confirmDelete) {
        ipcRenderer.send('delete-contact', contactId);
    }
}

// Event listeners
// document.getElementById('btn-connect').addEventListener('click', () => {
//     ipcRenderer.send('connect-to-mysql');
// });

document.getElementById('create-contact-form').addEventListener('submit', (event) => {
    event.preventDefault();

    const contact = {
        first_name: document.getElementById('first_name').value,
        last_name: document.getElementById('last_name').value,
        description: document.getElementById('description').value,
    };

    ipcRenderer.send('create-contact', contact);

    // After creating a new contact, fetch and display updated contacts
    fetchAndDisplayContacts();
});

document.getElementById('btn-read').addEventListener('click', () => {
    fetchAndDisplayContacts();
});

// IPC Event listeners
// ipcRenderer.on('contact-operation-status', (event, data) => {
//     const paraElement = document.getElementById('para');
//     paraElement.textContent = `Operation Status: ${data.message}`;
// });

ipcRenderer.on('contacts-data', (event, data) => {
    const contactsTableBody = document.getElementById('contacts-table-body');

    if (data.status === 'success') {
        const contacts = data.data;
        if (contacts.length > 0) {
            contactsTableBody.innerHTML = ''; // Clear existing table data

            contacts.forEach((contact) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${contact.id}</td>
                    <td>${contact.first_name}</td>
                    <td>${contact.last_name}</td>
                    <td>${contact.description}</td>
                    <td><button class="btn-update" data-contact-id="${contact.id}">Update</button></td>
                    <td><button class="btn-delete" data-contact-id="${contact.id}">Delete</button></td>
                `;
                contactsTableBody.appendChild(row);

                // Add click event listeners for update and delete buttons
                const updateBtn = row.querySelector('.btn-update');
                const deleteBtn = row.querySelector('.btn-delete');

                updateBtn.addEventListener('click', () => {
                    updateContact(contact.id);
                });

                deleteBtn.addEventListener('click', () => {
                    deleteContact(contact.id);
                });
            });
        } else {
            contactsTableBody.innerHTML = ''; // Clear table data if no contacts
        }
    } else {
        contactsTableBody.innerHTML = ''; // Clear table data on error
    }
});

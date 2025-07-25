document.addEventListener('DOMContentLoaded', function() {
    // Initialize transfers table
    loadTransfers();
    
    // Form submission handlers
    document.getElementById('initiateTransferForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());

        const body = {
            fromWallet: data.currentOwner,
            toWallet: data.newOwner,
            remarks: data.reason
        };

        const responseArea = document.getElementById('initiateTransferResponse');
        responseArea.textContent = 'Initiating transfer...';
        responseArea.className = 'response-area alert alert-info';

        try {
            const response = await fetch(`http://localhost:8000/api/land/${data.surveyNumber}/transfer/initiate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            const result = await response.json();

            if (response.ok) {
                responseArea.textContent = `Transfer initiated successfully for survey number ${result.surveyNumber}. Please confirm the transfer.`;
                responseArea.className = 'response-area alert alert-success';
                this.reset();
            } else {
                throw new Error(result.message || 'An unknown error occurred.');
            }
        } catch (error) {
            console.error('Error initiating transfer:', error);
            responseArea.textContent = `Failed to initiate transfer: ${error.message}`;
            responseArea.className = 'response-area alert alert-danger';
        }
    });
    
    document.getElementById('confirmTransferForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());

        const body = {
            fromWallet: data.currentOwner,
            toWallet: data.newOwner,
            remarks: "" // Remarks are not needed for confirmation
        };

        const responseArea = document.getElementById('confirmTransferResponse');
        responseArea.textContent = 'Confirming transfer...';
        responseArea.className = 'response-area alert alert-info';

        try {
            const response = await fetch(`http://localhost:8000/api/land/${data.surveyNumber}/transfer/confirm`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            const result = await response.json();

            if (response.ok) {
                responseArea.textContent = `Transfer confirmed successfully for survey number ${result.surveyNumber}! The new owner is ${result.toWallet}.`;
                responseArea.className = 'response-area alert alert-success';
                loadTransfers(); // Refresh the history table
                this.reset();
            } else {
                throw new Error(result.message || 'An unknown error occurred.');
            }
        } catch (error) {
            console.error('Error confirming transfer:', error);
            responseArea.textContent = `Failed to confirm transfer: ${error.message}`;
            responseArea.className = 'response-area alert alert-danger';
        }
    });

    document.getElementById('uploadDocumentForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const surveyNumber = formData.get('surveyNumber');
        const responseArea = document.getElementById('uploadDocumentResponse');

        responseArea.textContent = 'Uploading document...';
        responseArea.className = 'response-area alert alert-info';

        try {
            const response = await fetch(`http://localhost:8000/api/land/${surveyNumber}/documents`, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                responseArea.textContent = 'Document uploaded successfully!';
                responseArea.className = 'response-area alert alert-success';
                this.reset();
            } else {
                throw new Error(result.message || 'An unknown error occurred.');
            }
        } catch (error) {
            console.error('Error uploading document:', error);
            responseArea.textContent = `Failed to upload document: ${error.message}`;
            responseArea.className = 'response-area alert alert-danger';
        }
    });
    
    // View transfer details button handler
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('view-transfer-btn')) {
            const transferId = e.target.getAttribute('data-id');
            viewTransferDetails(transferId);
        }
    });
});

async function loadTransfers(page = 1, pageSize = 10, filters = {}) {
    try {
        const response = await fetch(`http://localhost:8000/api/transfers`);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to load transfers.');
        }

        const transfers = result;
        const totalTransfers = transfers.length;

        // Update UI
        const tableBody = document.getElementById('transferTableBody');
        if (tableBody) {
            tableBody.innerHTML = transfers.map(transfer => `
                <tr>
                    <td>${transfer.surveyNumber}</td>
                    <td>${transfer.fromWallet}</td>
                    <td>${transfer.toWallet}</td>
                    <td>${transfer.status}</td>
                    <td>${formatDateTime(transfer.initiatedAt)}</td>
                    <td>${formatDateTime(transfer.confirmedAt)}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary view-transfer-btn" data-id="${transfer.surveyNumber}">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </td>
                </tr>
            `).join('');
            
            document.getElementById('transferCount').textContent = 
                `Showing ${1 + (page-1)*pageSize}-${Math.min(page*pageSize, totalTransfers)} of ${totalTransfers} transfers`;
            
            // Update pagination
            const paginationElement = document.querySelector('#transferTabsContent .pagination');
            if (paginationElement) {
                updatePagination(paginationElement, page, Math.ceil(totalTransfers / pageSize), (newPage) => {
                    loadTransfers(newPage, pageSize, filters);
                });
            }
        }
    } catch (error) {
        console.error('Error loading transfers:', error);
    }
}

async function viewTransferDetails(surveyNumber) {
    try {
        const response = await fetch(`http://localhost:8000/api/land/${surveyNumber}/documents`);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to load documents.');
        }

        const documents = result.documents;

        // Show modal with transfer details
        const modal = new bootstrap.Modal(document.getElementById('transferDetailsModal'));
        const modalBody = document.getElementById('transferDetailsContent');
        
        modalBody.innerHTML = `
            <div class="mt-3">
                <h5>Supporting Documents</h5>
                <div class="list-group">
                    ${documents.map(doc => `
                        <a href="#" class="list-group-item list-group-item-action">
                            <i class="fas fa-file-alt me-2"></i> ${doc.fileName} (uploaded ${formatDate(doc.uploadedAt)})
                        </a>
                    `).join('')}
                </div>
            </div>
        `;
        
        modal.show();
    } catch (error) {
        console.error('Error viewing transfer details:', error);
    }
}

// Utility functions
function showAlert(message, type = 'info') {
    // A more robust implementation could create a dismissible alert element
    console.log(`[${type.toUpperCase()}] ${message}`);
}

function formatDate(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatDateTime(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
}

function updatePagination(paginationElement, currentPage, totalPages, onPageClick) {
    if (!paginationElement) return;
    let paginationHtml = '';

    // Previous button
    paginationHtml += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a>
    </li>`;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        paginationHtml += `<li class="page-item ${i === currentPage ? 'active' : ''}">
            <a class="page-link" href="#" data-page="${i}">${i}</a>
        </li>`;
    }

    // Next button
    paginationHtml += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>
    </li>`;

    paginationElement.innerHTML = paginationHtml;

    // Add event listeners
    paginationElement.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = parseInt(e.target.getAttribute('data-page'));
            if (page) {
                onPageClick(page);
            }
        });
    });
}
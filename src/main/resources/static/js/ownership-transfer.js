document.addEventListener('DOMContentLoaded', function() {
    // Initialize transfers table
    loadTransfers();
    
    // Form submission handlers
    document.getElementById('initiateTransferForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        
        // Simulate API call
        showAlert('Transfer initiated successfully!', 'success');
        setTimeout(() => {
            document.getElementById('initiateTransferResponse').textContent = 
                'Transfer initiated successfully!\n\n' + 
                JSON.stringify(Object.fromEntries(formData), null, 2);
            
            // Refresh the transfers table
            loadTransfers();
            this.reset();
        }, 1000);
    });
    
    document.getElementById('confirmTransferForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        
        // Simulate API call
        showAlert('Transfer confirmed successfully!', 'success');
        setTimeout(() => {
            document.getElementById('confirmTransferResponse').textContent = 
                'Transfer confirmed successfully!\n\n' + 
                JSON.stringify(Object.fromEntries(formData), null, 2);
            
            // Refresh the transfers table
            loadTransfers();
            this.reset();
        }, 1000);
    });
    
    // View transfer details button handler
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('view-transfer-btn')) {
            const transferId = e.target.getAttribute('data-id');
            viewTransferDetails(transferId);
        }
    });
});

function loadTransfers(page = 1, pageSize = 10, filters = {}) {
    // Simulate API response
    const totalTransfers = 245;
    const transfers = Array.from({length: pageSize}, (_, i) => ({
        id: `T-${new Date().getFullYear()}-${1000 + i + (page-1)*pageSize}`,
        surveyNumber: `L-${Math.floor(Math.random() * 1000) + 1000}`,
        fromOwner: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`,
        toOwner: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`,
        initiatedDate: new Date(Date.now() - Math.floor(Math.random() * 1000*60*60*24*30)).toISOString(),
        status: ['Pending', 'Completed', 'Rejected'][Math.floor(Math.random() * 3)]
    }));
    
    // Update UI
    const tableBody = document.getElementById('transferTableBody');
    if (tableBody) {
        tableBody.innerHTML = transfers.map(transfer => `
            <tr>
                <td>${transfer.id}</td>
                <td>${transfer.surveyNumber}</td>
                <td>${transfer.fromOwner}</td>
                <td>${transfer.toOwner}</td>
                <td>${formatDate(transfer.initiatedDate)}</td>
                <td><span class="badge bg-${transfer.status === 'Completed' ? 'success' : transfer.status === 'Pending' ? 'warning' : 'danger'}">${transfer.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary view-transfer-btn" data-id="${transfer.id}">
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
}

function viewTransferDetails(transferId) {
    // Simulate API call to get transfer details
    const transferDetails = {
        id: transferId,
        surveyNumber: `L-${Math.floor(Math.random() * 1000) + 1000}`,
        fromOwner: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`,
        toOwner: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`,
        initiatedDate: new Date(Date.now() - Math.floor(Math.random() * 1000*60*60*24*30)).toISOString(),
        completedDate: new Date(Date.now() - Math.floor(Math.random() * 1000*60*60*24*7)).toISOString(),
        status: ['Pending', 'Completed', 'Rejected'][Math.floor(Math.random() * 3)],
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        reason: ['Sale', 'Inheritance', 'Gift', 'Court Order'][Math.floor(Math.random() * 4)],
        documents: [
            { name: 'Transfer Agreement', date: new Date(Date.now() - Math.floor(Math.random() * 1000*60*60*24*7)).toISOString() },
            { name: 'Identity Proof', date: new Date(Date.now() - Math.floor(Math.random() * 1000*60*60*24*14)).toISOString() }
        ]
    };
    
    // Show modal with transfer details
    const modal = new bootstrap.Modal(document.getElementById('transferDetailsModal'));
    const modalBody = document.getElementById('transferDetailsContent');
    
    modalBody.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <h5>Transfer Information</h5>
                <ul class="list-group list-group-flush mb-3">
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Transfer ID:</span>
                        <strong>${transferDetails.id}</strong>
                    </li>
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Survey Number:</span>
                        <strong>${transferDetails.surveyNumber}</strong>
                    </li>
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Status:</span>
                        <span class="badge bg-${transferDetails.status === 'Completed' ? 'success' : transferDetails.status === 'Pending' ? 'warning' : 'danger'}">
                            ${transferDetails.status}
                        </span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Initiated Date:</span>
                        <strong>${formatDateTime(transferDetails.initiatedDate)}</strong>
                    </li>
                </ul>
            </div>
            <div class="col-md-6">
                <h5>Ownership Details</h5>
                <ul class="list-group list-group-flush">
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Current Owner:</span>
                        <strong>${transferDetails.fromOwner}</strong>
                    </li>
                    <li class="list-group-item d-flex justify-content-between">
                        <span>New Owner:</span>
                        <strong>${transferDetails.toOwner}</strong>
                    </li>
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Transaction Hash:</span>
                        <strong class="text-truncate" style="max-width: 150px;">${transferDetails.txHash}</strong>
                    </li>
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Transfer Reason:</span>
                        <strong>${transferDetails.reason}</strong>
                    </li>
                </ul>
            </div>
        </div>
        <div class="mt-3">
            <h5>Supporting Documents</h5>
            <div class="list-group">
                ${transferDetails.documents.map(doc => `
                    <a href="#" class="list-group-item list-group-item-action">
                        <i class="fas fa-file-alt me-2"></i> ${doc.name} (uploaded ${formatDate(doc.date)})
                    </a>
                `).join('')}
            </div>
        </div>
    `;
    
    modal.show();
}
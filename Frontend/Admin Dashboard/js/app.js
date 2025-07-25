// Initialize chart on dashboard
import { connectWalletAndContract } from './web3_utils.js';

document.addEventListener('DOMContentLoaded', function() {
    // Only initialize chart if on dashboard page
    if (document.getElementById('statusChart')) {
        const ctx = document.getElementById('statusChart').getContext('2d');
        const statusChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Lands Registered', 'Active Transfers', 'Open Disputes'],
                datasets: [{
                    data: [1245, 23, 8],
                    backgroundColor: [
                        'rgba(52, 152, 219, 0.8)',
                        'rgba(46, 204, 113, 0.8)',
                        'rgba(231, 76, 60, 0.8)'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    }
                },
                cutout: '70%'
            }
        });
    }

    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Set current year in footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();

    // Add connect wallet button to the body
    const connectWalletBtn = document.createElement('button');
    connectWalletBtn.id = 'connectWalletBtn';
    connectWalletBtn.textContent = 'Connect Wallet';
    connectWalletBtn.className = 'btn btn-primary mt-3'; // Add some Bootstrap styling
    const buttonContainer = document.getElementById('walletButtonContainer');
    if (buttonContainer) {
        buttonContainer.appendChild(connectWalletBtn);
    } else {
        document.body.appendChild(connectWalletBtn); // Fallback if container not found
    }

    document.getElementById('connectWalletBtn').addEventListener('click', connectWalletAndContract);
});

// Shared utility functions
export function showAlert(message, type = 'success') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.role = 'alert';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    const container = document.getElementById('alertsContainer') || document.body;
    container.prepend(alert);
    
    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => alert.remove(), 150);
    }, 5000);
}

export function handleApiError(error) {
    console.error('API Error:', error);
    showAlert(error.message || 'An error occurred. Please try again.', 'danger');
}

export function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            // Try parsing as timestamp if ISO format fails
            const timestamp = parseInt(dateString);
            if (!isNaN(timestamp)) {
                return new Date(timestamp).toLocaleDateString();
            }
            return 'Invalid Date';
        }
        return date.toLocaleDateString();
    } catch (e) {
        console.error('Date formatting error:', e);
        return 'N/A';
    }
}

export function formatDateTime(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

export function updatePagination(element, currentPage, totalPages, callback) {
    let html = `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="prev">Previous</a>
        </li>
    `;
    
    // Always show first page
    if (totalPages > 0) {
        html += `
            <li class="page-item ${currentPage === 1 ? 'active' : ''}">
                <a class="page-link" href="#" data-page="1">1</a>
            </li>
        `;
    }
    
    // Show ellipsis if needed
    if (currentPage > 3) {
        html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
    }
    
    // Show pages around current page
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);
    
    for (let i = startPage; i <= endPage; i++) {
        html += `
            <li class="page-item ${currentPage === i ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `;
    }
    
    // Show ellipsis if needed
    if (currentPage < totalPages - 2) {
        html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
    }
    
    // Always show last page if there's more than one page
    if (totalPages > 1) {
        html += `
            <li class="page-item ${currentPage === totalPages ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a>
            </li>
        `;
    }
    
    html += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="next">Next</a>
        </li>
    `;
    
    element.innerHTML = html;
    
    // Reattach event listeners
    element.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            if (this.parentElement.classList.contains('disabled')) return;
            
            const pageAction = this.getAttribute('data-page');
            let newPage = currentPage;
            
            if (pageAction === 'prev') {
                newPage = currentPage - 1;
            } else if (pageAction === 'next') {
                newPage = currentPage + 1;
            } else {
                newPage = parseInt(pageAction);
            }
            
            callback(newPage);
        });
    });
}
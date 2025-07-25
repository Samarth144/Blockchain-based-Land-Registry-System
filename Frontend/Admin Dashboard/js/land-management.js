import { showAlert, formatDate, updatePagination } from './app.js';
import { api } from './api.js';

const backendApiUrl = 'http://localhost:8000/api/land';

document.addEventListener('DOMContentLoaded', async function() {

    // Initialize the lands table (will be called when tab is shown)
    // await loadLands(); // Removed as it will be called by tab show event

    // Event listener for tab changes to load data when the List Lands tab is shown
    const listTabButton = document.getElementById('list-tab');
    if (listTabButton) {
        listTabButton.addEventListener('shown.bs.tab', async function (e) {
            console.log('List Lands tab shown, loading lands...');
            await loadLands();
        });

        // If the list tab is active on load, load lands immediately
        // This handles cases where the page is reloaded with the list tab already active
        if (listTabButton.classList.contains('active')) {
            console.log('List Lands tab is active on load, loading lands...');
            await loadLands();
        }
    }
    
    // Form submission handlers
    document.getElementById('registerLandForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const surveyNumber = formData.get('surveyNumber');
        const ownerAddress = formData.get('ownerWallet');
        const location = formData.get('location');
        const area = formData.get('area');
        const propertyType = formData.get('propertyType');
        const marketValue = formData.get('marketValue');

        try {
            // Retrieve values from form inputs

            if (!ownerAddress || !/^0x[a-fA-F0-9]{40}$/.test(ownerAddress)) {
                throw new Error('Invalid owner wallet address. Please provide a valid Ethereum address.');
            }

             console.log('Attempting to register land with:', { ownerAddress, location, surveyNumber, area, propertyType, marketValue });
            await registerLand(ownerAddress, location, surveyNumber, area, propertyType, marketValue);
            


            console.log('Land registration successful, updating UI.');
            showAlert('Land registered successfully!', 'success');
            document.getElementById('registerLandResponse').textContent =
                'Land registered successfully!\n\n' +
                `Survey Number: ${surveyNumber}\nOwner: ${ownerAddress}\nLocation: ${location}\nArea: ${area}`;
            loadLands();
            this.reset();
        } catch (error) {
            console.error('Land registration failed:', error);
            console.error('Error message:', error.message);
            showAlert(`Land registration failed: ${error.message || error}`, 'danger');
            document.getElementById('registerLandResponse').textContent =
                `Land registration failed: ${error.message || error}`;
        }
    });
    
    document.getElementById('listLandsForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const filters = Object.fromEntries(formData.entries());
        // Remove empty filter values
        for (const key in filters) {
            if (filters[key] === '') {
                delete filters[key];
            }
        }
        loadLands(1, 10, filters);
    });
    
    document.getElementById('updateDocumentsForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        
        // Simulate API call
        showAlert('Document uploaded successfully!', 'success');
        setTimeout(() => {
            document.getElementById('updateDocumentsResponse').textContent = 
                'Document uploaded successfully!\n\n' + 
                JSON.stringify(Object.fromEntries(formData), null, 2);
            this.reset();
        }, 1000);
    });
    
    // View land details button handler
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('view-land-btn')) {
            const surveyNumber = e.target.getAttribute('data-id');
            viewLandDetails(surveyNumber);
        }
    });
});

// Function to load lands data with pagination
async function loadLands(page = 1, pageSize = 10, filters = {}) {
    try {
        // Call backend API
        console.log('Attempting to fetch lands from backend...');
        const data = await api.getLands(filters);
        console.log('Data received from backend:', data);

        let lands = data.lands;
        console.log('Extracted lands array:', lands);

        // Apply filters on frontend if desired
        const filteredLands = lands.filter(land => {
            let match = true;
            if (filters.surveyNumber && !land.surveyNumber?.includes(filters.surveyNumber)) match = false;
            if (filters.owner && !land.ownerAddress?.toLowerCase().includes(filters.owner.toLowerCase())) match = false;
            if (filters.location && land.location !== filters.location) match = false;
            if (filters.status && land.status !== filters.status) match = false;
            return match;
        });

        // Pagination
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedLands = filteredLands.slice(startIndex, endIndex);

        // Render in table
        const tableBody = document.getElementById('landTableBody');
        if (tableBody) {
            console.log('Populating landTableBody with:', paginatedLands);
            // In loadLands() function, update the table row generation:
            tableBody.innerHTML = paginatedLands.map(land => `
                <tr>
                    <td>${land.surveyNumber}</td>
                    <td>${land.ownerWallet || 'N/A'}</td>
                    <td>${land.location}</td>
                    <td>${land.area ? land.area.toLocaleString() + ' m²' : 'N/A'}</td>
                    <td><span class="badge bg-success">${land.status || 'REGISTERED'}</span></td>
                    <td>${land.createdAt ? formatDate(land.createdAt) : 'N/A'}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary view-land-btn" 
                                data-id="${land.tokenId || land.surveyNumber}">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </td>
                </tr>
            `).join('');
            console.log('landTableBody outerHTML after population:', tableBody.outerHTML);
        }

        document.getElementById('landCount').textContent =
            `Showing ${startIndex + 1}-${Math.min(endIndex, filteredLands.length)} of ${filteredLands.length} lands`;

        // Update pagination
        const paginationElement = document.querySelector('#landManagementTabsContent .pagination');
        if (paginationElement) {
            updatePagination(paginationElement, page, Math.ceil(filteredLands.length / pageSize), (newPage) => {
                loadLands(newPage, pageSize, filters);
            });
        }

    } catch (error) {
        console.error('Error loading lands from backend:', error);
        showAlert(`Error loading lands from backend: ${error.message || error}`, 'danger');
    }
}

// Function to register land on the blockchain
async function registerLand(ownerAddress, location, surveyNumber, area, propertyType, marketValue) {
    try {
        console.log('Sending land registration request to backend:', { ownerAddress, location, surveyNumber, area, propertyType, marketValue });

        const landData = {
            ownerWallet: ownerAddress,
            location: location,
            surveyNumber: surveyNumber,
            area: parseInt(area),
            propertyType: propertyType,
            marketValue: parseInt(marketValue)
        };

        const response = await api.registerLand(landData);
        console.log('Backend response:', response);

        // Only proceed to backend if blockchain tx succeeds
        await api.registerLand({
            surveyNumber,
            ownerWallet: ownerAddress,
            location,
            area,
            propertyType,
            marketValue
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        
        // Try to decode revert reason if available
        if (error.data) {
            const revertReason = ethers.utils.toUtf8String(error.data);
            console.log('Revert reason:', revertReason);
            throw new Error(`Smart contract rejected transaction: ${revertReason}`);
        }
        
        throw error;
    }
}

async function viewLandDetails(surveyNumber) {
    const { contract } = await connectWalletAndContract();
    
    try {
        let landDetails = null;
        // First try to get by tokenId if it's a number
        if (!isNaN(identifier)) {
            const land = await contract.landParcels(identifier);
            landDetails = {
                tokenId: identifier,
                surveyNumber: land.surveyNumber,
                owner: await contract.ownerOf(identifier),
                location: land.location,
                area: land.area.toNumber(),
                propertyType: land.propertyType,
                status: land.hasDispute ? 'Disputed' : 'Registered',
                registeredDate: new Date(land.lastTransferDate.toNumber() * 1000)
            };
        } 
        // Otherwise try to find by surveyNumber
        else {
            const totalLands = (await contract.getTokenIdCounter()).toNumber();
            for (let i = 1; i <= totalLands; i++) {
                const land = await contract.landParcels(i);
                if (land.surveyNumber === identifier) {
                    landDetails = {
                        tokenId: i,
                        surveyNumber: land.surveyNumber,
                        owner: await contract.ownerOf(i),
                        location: land.location,
                        area: land.area.toNumber(),
                        propertyType: land.propertyType,
                        status: land.hasDispute ? 'Disputed' : 'Registered',
                        registeredDate: new Date(land.lastTransferDate.toNumber() * 1000)
                    };
                    break;
                }
            }
        }
    } catch (error) {
        console.error('Error fetching land details from blockchain:', error);
        showAlert('Error fetching land details from blockchain. Check console for details.', 'danger');
        return;
    }
    
    // Show modal with land details
    const modal = new bootstrap.Modal(document.getElementById('landDetailsModal'));
    const modalBody = document.getElementById('landDetailsContent');
    
    modalBody.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <h5>Basic Information</h5>
                <ul class="list-group list-group-flush mb-3">
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Survey Number:</span>
                        <strong>${landDetails.surveyNumber}</strong>
                    </li>
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Current Owner:</span>
                        <strong>${landDetails.owner}</strong>
                    </li>
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Location:</span>
                        <strong>${landDetails.location}</strong>
                    </li>
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Area:</span>
                        <strong>${landDetails.area.toLocaleString()} m²</strong>
                    </li>
                </ul>
            </div>
            <div class="col-md-6">
                <h5>Additional Details</h5>
                <ul class="list-group list-group-flush">
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Status:</span>
                        <span class="badge bg-${landDetails.status === 'Registered' ? 'success' : landDetails.status === 'Transfer Pending' ? 'warning' : 'danger'}">
                            ${landDetails.status}
                        </span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Registration Date:</span>
                        <strong>${formatDate(landDetails.registeredDate)}</strong>
                    </li>
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Coordinates:</span>
                        <strong>${landDetails.coordinates}</strong>
                    </li>
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Zoning:</span>
                        <strong>${landDetails.zoning}</strong>
                    </li>
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Tax Status:</span>
                        <strong class="text-${landDetails.taxPaid ? 'success' : 'danger'}">
                            ${landDetails.taxPaid ? 'Paid' : 'Pending'}
                        </strong>
                    </li>
                </ul>
            </div>
        </div>
        <div class="mt-3">
            <h5>Documents</h5>
            <div class="list-group">
                <a href="#" class="list-group-item list-group-item-action">
                    <i class="fas fa-file-contract me-2"></i> Title Deed (uploaded ${formatDate(new Date(Date.now() - Math.floor(Math.random() * 1000*60*60*24*30)).toISOString())})
                </a>
                <a href="#" class="list-group-item list-group-item-action">
                    <i class="fas fa-map me-2"></i> Survey Map (uploaded ${formatDate(new Date(Date.now() - Math.floor(Math.random() * 1000*60*60*24*60)).toISOString())})
                </a>
            </div>
        </div>
    `;
    
    modal.show();
}
document.addEventListener('DOMContentLoaded', function() {
    // Initialize users table
    loadUsers();
    loadRoles();
    loadActivityLog();
    
    // Form submission handlers
    document.getElementById('newUserForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        
        // Simulate API call
        showAlert('User created successfully!', 'success');
        setTimeout(() => {
            // Refresh the users table
            loadUsers();
            // Close modal
            bootstrap.Modal.getInstance(document.getElementById('newUserModal')).hide();
            this.reset();
        }, 1000);
    });
    
    document.getElementById('newRoleForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        
        // Simulate API call
        showAlert('Role created successfully!', 'success');
        setTimeout(() => {
            // Refresh the roles table
            loadRoles();
            // Close modal
            bootstrap.Modal.getInstance(document.getElementById('newRoleModal')).hide();
            this.reset();
        }, 1000);
    });
    
    // Save buttons for modals
    document.getElementById('saveUserBtn')?.addEventListener('click', function() {
        document.getElementById('newUserForm').dispatchEvent(new Event('submit'));
    });
    
    document.getElementById('saveRoleBtn')?.addEventListener('click', function() {
        document.getElementById('newRoleForm').dispatchEvent(new Event('submit'));
    });
    
    // Filter change handlers
    document.getElementById('activityUserFilter')?.addEventListener('change', function() {
        loadActivityLog();
    });
    
    document.getElementById('activityTypeFilter')?.addEventListener('change', function() {
        loadActivityLog();
    });
    
    document.getElementById('activityDateFilter')?.addEventListener('change', function() {
        loadActivityLog();
    });
});

function loadUsers(page = 1, pageSize = 10) {
    // Simulate API response
    const totalUsers = 42;
    const users = Array.from({length: pageSize}, (_, i) => ({
        id: `U-${1000 + i + (page-1)*pageSize}`,
        username: `user${i + (page-1)*pageSize}`,
        email: `user${i + (page-1)*pageSize}@landregistry.org`,
        walletAddress: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`,
        role: ['Administrator', 'Registrar', 'Inspector', 'Viewer'][Math.floor(Math.random() * 4)],
        status: ['Active', 'Pending', 'Suspended'][Math.floor(Math.random() * 3)],
        lastLogin: new Date(Date.now() - Math.floor(Math.random() * 1000*60*60*24*30)).toISOString()
    }));
    
    // Update UI
    const tableBody = document.getElementById('userTableBody');
    if (tableBody) {
        tableBody.innerHTML = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td class="text-truncate" style="max-width: 150px;">${user.walletAddress}</td>
                <td><span class="badge bg-${user.role === 'Administrator' ? 'danger' : 
                    user.role === 'Registrar' ? 'primary' : 
                    user.role === 'Inspector' ? 'info' : 'secondary'}">${user.role}</span></td>
                <td><span class="badge bg-${user.status === 'Active' ? 'success' : 
                    user.status === 'Pending' ? 'warning' : 'danger'}">${user.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
        // Update pagination
        const paginationElement = document.querySelector('#usersPagination');
        if (paginationElement) {
            updatePagination(paginationElement, page, Math.ceil(totalUsers / pageSize), (newPage) => {
                loadUsers(newPage, pageSize);
            });
        }
    }
}

function loadRoles() {
    // Simulate API response
    const roles = [
        {
            id: 'R-100',
            name: 'Administrator',
            permissions: ['All permissions'],
            users: 3
        },
        {
            id: 'R-101',
            name: 'Land Registrar',
            permissions: ['Register land', 'Modify land records', 'View all records'],
            users: 12
        },
        {
            id: 'R-102',
            name: 'Land Inspector',
            permissions: ['View all records', 'Flag disputes', 'Upload documents'],
            users: 8
        },
        {
            id: 'R-103',
            name: 'Viewer',
            permissions: ['View public records'],
            users: 19
        }
    ];
    
    // Update UI
    const tableBody = document.getElementById('roleTableBody');
    if (tableBody) {
        tableBody.innerHTML = roles.map(role => `
            <tr>
                <td>${role.id}</td>
                <td><strong>${role.name}</strong></td>
                <td>
                    <ul class="list-unstyled mb-0">
                        ${role.permissions.map(perm => `<li>• ${perm}</li>`).join('')}
                    </ul>
                </td>
                <td>${role.users} users</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${role.users === 0 ? `
                    <button class="btn btn-sm btn-outline-danger">
                        <i class="fas fa-trash"></i>
                    </button>
                    ` : ''}
                </td>
            </tr>
        `).join('');
    }
}

function loadActivityLog(page = 1, pageSize = 10) {
    // Get filter values
    const userFilter = document.getElementById('activityUserFilter')?.value || '';
    const typeFilter = document.getElementById('activityTypeFilter')?.value || '';
    const dateFilter = document.getElementById('activityDateFilter')?.value || '';
    
    // Simulate API response with filtering
    const totalActivities = 128;
    const activities = Array.from({length: pageSize}, (_, i) => {
        const activityTypes = ['login', 'land', 'document', 'user', 'system'];
        const type = typeFilter || activityTypes[Math.floor(Math.random() * activityTypes.length)];
        
        return {
            timestamp: new Date(Date.now() - Math.floor(Math.random() * 1000*60*60*24*30)).toISOString(),
            user: userFilter || `user${Math.floor(Math.random() * 20)}@landregistry.org`,
            activity: type === 'login' ? 'User login' :
                type === 'land' ? ['Land registered', 'Transfer initiated', 'Dispute reported'][Math.floor(Math.random() * 3)] :
                type === 'document' ? ['Document uploaded', 'Document verified'][Math.floor(Math.random() * 2)] :
                type === 'user' ? ['User created', 'Role modified'][Math.floor(Math.random() * 2)] :
                'System maintenance',
            details: type === 'login' ? 'Successful login from 192.168.1.' + Math.floor(Math.random() * 100) :
                type === 'land' ? 'Survey #L-' + (Math.floor(Math.random() * 1000) + 1000 :
                type === 'document' ? 'Document ID: DOC-' + (Math.floor(Math.random() * 1000) + 1000 :
                type === 'user' ? 'User ID: U-' + (Math.floor(Math.random() * 1000) + 1000 :
                'System updated to v1.' + Math.floor(Math.random() * 5),
            ip: `192.168.1.${Math.floor(Math.random() * 100)}`
        };
    }).filter(activity => {
        // Apply filters
        if (userFilter && activity.user !== userFilter) return false;
        if (dateFilter && !activity.timestamp.startsWith(dateFilter)) return false;
        return true;
    });
    
    // Update UI
    const tableBody = document.getElementById('activityTableBody');
    if (tableBody) {
        tableBody.innerHTML = activities.map(activity => `
            <tr>
                <td>${formatDateTime(activity.timestamp)}</td>
                <td>${activity.user}</td>
                <td>${activity.activity}</td>
                <td>${activity.details}</td>
                <td>${activity.ip}</td>
            </tr>
        `).join('');
        
        // Update pagination
        const paginationElement = document.querySelector('#activityPagination');
        if (paginationElement) {
            updatePagination(paginationElement, page, Math.ceil(totalActivities / pageSize), (newPage) => {
                loadActivityLog(newPage, pageSize);
            });
        }
    }
    
    // Populate user filter dropdown if empty
    const userFilterDropdown = document.getElementById('activityUserFilter');
    if (userFilterDropdown && userFilterDropdown.options.length <= 1) {
        const uniqueUsers = [...new Set(Array.from({length: 20}, (_, i) => `user${i}@landregistry.org`))];
        uniqueUsers.forEach(user => {
            const option = document.createElement('option');
            option.value = user;
            option.textContent = user;
            userFilterDropdown.appendChild(option);
        });
    }
}
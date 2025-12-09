const ADMIN_USERNAME = 'admin1234';
const ADMIN_PASSWORD = '202025';

let data = {
    novels: [],
    books: [],
    initiatives: [],
    jobs: [],
    partners: []
};

// ========== API HELPERS ==========

async function apiRequest(method, url, body = null) {
    try {
        const options = { 
            method,
            headers: { 'Content-Type': 'application/json' },
        };
        if (body) {
            options.body = JSON.stringify(body);
        }
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Request failed with status ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.error(`${method} ${url} failed:`, error);
        showAlert('error', `فشل الطلب: ${error.message}`);
        throw error;
    }
}

// ========== AUTHENTICATION ==========

function checkAuth() {
    if (!sessionStorage.getItem('adminLoggedIn')) {
        showLogin();
    } else {
        showDashboard();
    }
}

function login(username, password) {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        sessionStorage.setItem('adminLoggedIn', 'true');
        showDashboard();
        return true;
    }
    return false;
}

function logout() {
    sessionStorage.removeItem('adminLoggedIn');
    showLogin();
}

function showLogin() {
    document.getElementById('login-section').classList.remove('hidden');
    document.getElementById('dashboard-section').classList.add('hidden');
}

function showDashboard() {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('dashboard-section').classList.remove('hidden');
    loadAllData();
}

// ========== DATA MANAGEMENT ==========

async function loadAllData() {
    const collections = ['novels', 'books', 'initiatives', 'jobs', 'partners'];
    try {
        for (const col of collections) {
            data[col] = await apiRequest('GET', `/api/${col}`);
        }
        console.log('✅ Data loaded from Server:', data);
        displayAllContent();
    } catch (error) {
        console.error('Error loading data from server:', error);
    }
}

async function uploadFile(file) {
    if (!file) return '';
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) {
            throw new Error('File upload failed');
        }
        const result = await response.json();
        return result.path; // The server returns the relative path
    } catch (error) {
        console.error('File upload error:', error);
        showAlert('error', 'فشل رفع الملف.');
        return '';
    }
}

// ========== GENERIC ADD/DELETE/DISPLAY FUNCTIONS ==========

async function addItem(e, collectionName, createItemObject) {
    e.preventDefault();
    const form = e.target;
    try {
        const newItem = await createItemObject(form);
        if (!newItem) return; // createItemObject can return null to cancel

        await apiRequest('POST', `/api/${collectionName}`, newItem);
        
        await loadAllData(); // Reload all data to keep everything in sync
        
        form.reset();
        // Reset file input display names
        form.querySelectorAll('.file-name-display').forEach(el => el.textContent = '');

        showAlert('success', '✨ تم إضافة العنصر بنجاح!');
    } catch (error) {
        console.error(`Error adding ${collectionName}:`, error);
    }
}

async function deleteItem(collectionName, itemId) {
    if (confirm('هل أنت متأكد من حذف هذا العنصر؟')) {
        try {
            await apiRequest('DELETE', `/api/${collectionName}/${itemId}`);
            await loadAllData(); // Reload all data to keep everything in sync
            showAlert('success', 'تم الحذف بنجاح');
        } catch (error) {
            console.error(`Error deleting ${collectionName}:`, error);
        }
    }
}

// ========== NOVELS MANAGEMENT ==========
window.addNovel = (e) => addItem(e, 'novels', async (form) => ({
    title: form.novelTitle.value,
    description: form.novelDescription.value,
    driveLink: form.novelDriveLink.value || '',
    visible: form.novelVisible.checked,
    coverImage: await uploadFile(form.novelCover.files[0]),
    pdfFile: await uploadFile(form.novelPdf.files[0])
}));

window.deleteNovel = (id) => deleteItem('novels', id);

function displayNovels() {
    const container = document.getElementById('novels-list');
    container.innerHTML = data.novels.map((item) => `
    <div class="content-item">
        <div class="content-info"><b>${item.title}</b></div>
        <div class="content-actions">
            <button class="btn btn-danger btn-small" onclick="deleteNovel('${item.id}')">حذف</button>
        </div>
    </div>`).join('') || '<p>لا توجد روايات</p>';
}

// ========== BOOKS MANAGEMENT ==========
window.addBook = (e) => addItem(e, 'books', async (form) => ({
    title: form.bookTitle.value,
    author: form.bookAuthor.value,
    description: form.bookDescription.value,
    category: form.bookCategory.value || 'عام',
    publishYear: form.bookYear.value || '',
    driveLink: form.bookDriveLink.value || '',
    visible: form.bookVisible.checked,
    coverImage: await uploadFile(form.bookCover.files[0]),
    pdfFile: await uploadFile(form.bookPdf.files[0]),
}));

window.deleteBook = (id) => deleteItem('books', id);

function displayBooks() {
    const container = document.getElementById('books-list');
    container.innerHTML = data.books.map((item) => `
    <div class="content-item">
        <div class="content-info"><b>${item.title}</b> - ${item.author}</div>
        <div class="content-actions">
            <button class="btn btn-danger btn-small" onclick="deleteBook('${item.id}')">حذف</button>
        </div>
    </div>`).join('') || '<p>لا توجد كتب</p>';
}

// ========== INITIATIVES MANAGEMENT ==========
window.addInitiative = (e) => addItem(e, 'initiatives', async (form) => ({
    name: form.initiativeName.value,
    description: form.initiativeDescription.value,
    visible: form.initiativeVisible.checked,
    image: await uploadFile(form.initiativeImage.files[0]),
}));

window.deleteInitiative = (id) => deleteItem('initiatives', id);

function displayInitiatives() {
    const container = document.getElementById('initiatives-list');
    container.innerHTML = data.initiatives.map((item) => `
    <div class="content-item">
        <div class="content-info"><b>${item.name}</b></div>
        <div class="content-actions">
            <button class="btn btn-danger btn-small" onclick="deleteInitiative('${item.id}')">حذف</button>
        </div>
    </div>`).join('') || '<p>لا توجد مبادرات</p>';
}

// ========== JOBS MANAGEMENT ==========
window.addJob = (e) => addItem(e, 'jobs', (form) => Promise.resolve({
    type: form.jobType.value,
    postDate: form.jobPostDate.value,
    expiryDate: form.jobExpiryDate.value,
    status: form.jobStatus.value,
    visible: form.jobVisible.checked,
}));

window.deleteJob = (id) => deleteItem('jobs', id);

window.closeJob = async (id) => {
    if (confirm('هل أنت متأكد من إغلاق هذه الوظيفة؟')) {
        try {
            await apiRequest('PUT', `/api/jobs/${id}`, { status: 'مغلقة' });
            await loadAllData();
            showAlert('success', 'تم إغلاق الوظيفة');
        } catch (error) {
             console.error(`Error closing job:`, error);
        }
    }
};

function displayJobs() {
    const container = document.getElementById('jobs-list');
    container.innerHTML = data.jobs.map((item) => `
    <div class="content-item">
        <div class="content-info"><b>${item.type}</b> (الحالة: ${item.status})</div>
        <div class="content-actions">
            ${item.status !== 'مغلقة' ? `<button class="btn btn-warning btn-small" onclick="closeJob('${item.id}')">إغلاق</button>` : ''}
            <button class="btn btn-danger btn-small" onclick="deleteJob('${item.id}')">حذف</button>
        </div>
    </div>`).join('') || '<p>لا توجد وظائف</p>';
}

// ========== PARTNERS MANAGEMENT ==========
window.addPartner = (e) => addItem(e, 'partners', async (form) => ({
    name: form.partnerName.value,
    description: form.partnerDescription.value,
    website: form.partnerWebsite.value || '',
    visible: form.partnerVisible.checked,
    logo: await uploadFile(form.partnerLogo.files[0]),
}));

window.deletePartner = (id) => deleteItem('partners', id);

function displayPartners() {
    const container = document.getElementById('partners-list');
    container.innerHTML = data.partners.map((item) => `
    <div class="content-item">
        <div class="content-info"><b>${item.name}</b></div>
        <div class="content-actions">
            <button class="btn btn-danger btn-small" onclick="deletePartner('${item.id}')">حذف</button>
        </div>
    </div>`).join('') || '<p>لا يوجد شركاء</p>';
}


// ========== UTILITY AND INITIALIZATION ==========

function displayAllContent() {
    displayNovels();
    displayBooks();
    displayInitiatives();
    displayJobs();
    displayPartners();
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabName + '-tab').classList.add('active');
    document.querySelector(`[onclick="switchTab('${tabName}')"]`).classList.add('active');
}

function showAlert(type, message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    document.querySelector('.dashboard-container').insertBefore(alertDiv, document.querySelector('.dashboard-container').firstChild);
    setTimeout(() => alertDiv.remove(), 5000);
}

function updateFileName(input, displayId) {
    const display = document.getElementById(displayId);
    display.textContent = input.files[0] ? input.files[0].name : '';
}

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();

    document.getElementById('login-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!login(e.target.username.value, e.target.password.value)) {
            showAlert('error', 'اسم المستخدم أو كلمة المرور غير صحيحة ❌');
        }
    });

    document.getElementById('logout-btn')?.addEventListener('click', logout);

    // Attach form submit listeners
    document.getElementById('novel-form')?.addEventListener('submit', window.addNovel);
    document.getElementById('book-form')?.addEventListener('submit', window.addBook);
    document.getElementById('initiative-form')?.addEventListener('submit', window.addInitiative);
    document.getElementById('job-form')?.addEventListener('submit', window.addJob);
    document.getElementById('partner-form')?.addEventListener('submit', window.addPartner);
});

// Expose functions to window for HTML onclick access
window.switchTab = switchTab;
window.updateFileName = updateFileName;

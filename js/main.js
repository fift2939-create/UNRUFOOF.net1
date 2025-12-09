function loadDataFromWindow() {
    if (window.SITE_DATA) {
        console.log('✅ Data loaded from window.SITE_DATA');
        // Filter for items marked as visible
        const filteredData = {};
        for (const key in window.SITE_DATA) {
            if (Array.isArray(window.SITE_DATA[key])) {
                filteredData[key] = window.SITE_DATA[key].filter(item => item.visible === true);
            }
        }
        return filteredData;
    } else {
        console.warn('🟡 window.SITE_DATA is not defined. Displaying empty data. Did you run `npm run build`?');
        return {
            novels: [],
            books: [],
            initiatives: [],
            jobs: [],
            partners: []
        };
    }
}

// Display novels
function displayNovels(data) {
    const container = document.getElementById('novels-container');
    if (!container) return;
    if (!data.novels || data.novels.length === 0) {
        container.innerHTML = '<p>لا توجد روايات متاحة حالياً</p>';
        return;
    }
    container.innerHTML = data.novels.map(novel => `
    <div class="novel-card">
      <div class="novel-cover"><img src="${novel.coverImage || ''}" alt="${novel.title}"></div>
      <div class="novel-info">
        <h3 class="novel-title">${novel.title}</h3>
        <p class="novel-description">${novel.description}</p>
        <div class="novel-actions">
          <a href="${novel.pdfFile || novel.driveLink}" class="btn btn-primary" target="_blank">قراءة أو تحميل</a>
        </div>
      </div>
    </div>`).join('');
}

// Display books
function displayBooks(data) {
    const container = document.getElementById('books-container');
    if (!container) return;

    if (!data.books || data.books.length === 0) {
        container.innerHTML = '<p>لا توجد كتب متاحة حالياً</p>';
        return;
    }

    container.innerHTML = data.books.map(book => `
    <div class="novel-card">
        <div class="novel-cover"><img src="${book.coverImage || ''}" alt="${book.title}"></div>
        <div class="novel-info">
            <h3 class="novel-title">${book.title}</h3>
            <p class="novel-description"><strong>المؤلف:</strong> ${book.author}</p>
            <p class="novel-description">${book.description}</p>
            <div class="novel-actions">
                 <a href="${book.pdfFile || book.driveLink}" class="btn btn-primary" target="_blank">قراءة أو تحميل</a>
            </div>
        </div>
    </div>
  `).join('');
}


// Display initiatives
function displayInitiatives(data) {
  const container = document.getElementById('initiatives-container');
  if (!container) return;

  if (!data.initiatives || data.initiatives.length === 0) {
    container.innerHTML = '<p>لا توجد مبادرات متاحة حالياً</p>';
    return;
  }

  container.innerHTML = data.initiatives.map(initiative => `
    <div class="initiative-card">
      <div class="initiative-image"><img src="${initiative.image || ''}" alt="${initiative.name}"></div>
      <h3 class="initiative-name">${initiative.name}</h3>
      <p class="initiative-description">${initiative.description}</p>
    </div>
  `).join('');
}

// Display jobs
function displayJobs(data) {
  const container = document.getElementById('jobs-container');
  if (!container) return;

  if (!data.jobs || data.jobs.length === 0) {
    container.innerHTML = '<p>لا توجد وظائف متاحة حالياً</p>';
    return;
  }

  container.innerHTML = data.jobs.map(job => {
    const isClosed = job.status === 'مغلقة' || new Date() > new Date(job.expiryDate);
    const statusClass = isClosed ? 'expired' : 'available';
    const statusText = isClosed ? 'مغلقة' : 'متاحة';

    return `
      <div class="job-card">
        <div class="job-type">${job.type}</div>
        <div class="job-date"><strong>تاريخ النشر:</strong><br>${job.postDate}</div>
        <div class="job-expiry"><strong>تاريخ الانتهاء:</strong><br>${job.expiryDate}</div>
        <div class="job-status ${statusClass}">${statusText}</div>
      </div>
    `;
  }).join('');
}

// Display partners
function displayPartners(data) {
    const container = document.getElementById('partners-container');
    if (!container) return;
    if (!data.partners || data.partners.length === 0) {
        container.innerHTML = '<p>لا يوجد شركاء حالياً</p>';
        return;
    }
    container.innerHTML = data.partners.map(partner => `
    <div class="partner-card">
        <div class="partner-logo"><img src="${partner.logo || ''}" alt="${partner.name}" style="object-fit: contain;"></div>
        <h3>${partner.name}</h3>
        <p>${partner.description}</p>
        ${partner.website ? `<a href="${partner.website}" target="_blank" class="btn btn-primary">زيارة الموقع</a>` : ''}
    </div>`).join('');
}


// Mobile menu toggle
function initMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => navLinks.classList.toggle('active'));
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => navLinks.classList.remove('active'));
    });
  }
}

// Theme Toggle
function initTheme() {
  const toggleBtn = document.getElementById('theme-toggle');
  const storedTheme = localStorage.getItem('theme');
  if (storedTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    if (toggleBtn) toggleBtn.textContent = '🌙';
  } else {
     if (toggleBtn) toggleBtn.textContent = '☀️';
  }
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      if (document.documentElement.getAttribute('data-theme') === 'light') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'dark');
        toggleBtn.textContent = '☀️';
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        toggleBtn.textContent = '🌙';
      }
    });
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  const data = loadDataFromWindow();
  displayNovels(data);
  displayBooks(data);
  displayInitiatives(data);
  displayJobs(data);
  displayPartners(data);
  initMobileMenu();
  initTheme();
});

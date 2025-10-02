// Initial Data with Capital Management
const initialData = {
  capitalEntries: [
    {"id": 1, "source": "Monthly Salary", "amount": 150000, "date": "2025-09-25", "description": "Regular monthly salary from OLIVE TS", "type": "Salary"},
    {"id": 2, "source": "Freelance Project", "amount": 75000, "date": "2025-09-28", "description": "IoT project completion bonus", "type": "Freelance"},
    {"id": 3, "source": "Investment Returns", "amount": 25000, "date": "2025-09-30", "description": "Monthly dividend from investments", "type": "Investment"}
  ],
  plannedExpenses: [
    {"id": 1, "name": "Apa", "amount": 5000, "category": "Family", "priority": "High", "dateAdded": "2025-10-01"},
    {"id": 2, "name": "Baji Fareeda", "amount": 8000, "category": "Family", "priority": "High", "dateAdded": "2025-10-01"},
    {"id": 3, "name": "Zahid Money for FSD", "amount": 12000, "category": "Personal", "priority": "Medium", "dateAdded": "2025-10-01"},
    {"id": 4, "name": "Aunti Farzana", "amount": 45000, "category": "Family", "priority": "High", "dateAdded": "2025-10-01"},
    {"id": 5, "name": "Huzaifa", "amount": 13000, "category": "Personal", "priority": "Medium", "dateAdded": "2025-10-01"},
    {"id": 6, "name": "GPL Gorilla Ads Money", "amount": 20000, "category": "Business", "priority": "High", "dateAdded": "2025-10-01"},
    {"id": 7, "name": "House Rent", "amount": 90000, "category": "Housing", "priority": "Critical", "dateAdded": "2025-10-01"}
  ],
  paidExpenses: [
    {"id": 1, "name": "GPL Gorilla Ads", "amount": 20000, "category": "Business", "datePaid": "2025-10-01", "paymentMethod": "Bank Transfer"},
    {"id": 2, "name": "Yango Car", "amount": 785, "category": "Transport", "datePaid": "2025-10-01", "paymentMethod": "Cash"},
    {"id": 3, "name": "Yango Car", "amount": 1000, "category": "Transport", "datePaid": "2025-10-01", "paymentMethod": "Cash"}
  ],
  categories: ["Family", "Personal", "Business", "Transport", "Housing", "Food", "Utilities", "Entertainment", "Healthcare", "Education"],
  priorities: ["Critical", "High", "Medium", "Low"],
  paymentMethods: ["Cash", "Bank Transfer", "Credit Card", "Debit Card", "JazzCash", "EasyPaisa", "Online Banking"],
  capitalTypes: ["Salary", "Freelance", "Business", "Investment", "Rental", "Gift", "Bonus", "Other"]
};

// Simple localStorage helper functions
function saveData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('Cannot save to localStorage');
  }
}

function loadData(key, defaultValue) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

// Application State with localStorage
let appState = {
  capitalEntries: loadData('capitalEntries', [...initialData.capitalEntries]),
  plannedExpenses: loadData('plannedExpenses', [...initialData.plannedExpenses]),
  paidExpenses: loadData('paidExpenses', [...initialData.paidExpenses]),
  categories: [...initialData.categories],
  priorities: [...initialData.priorities],
  paymentMethods: [...initialData.paymentMethods],
  capitalTypes: [...initialData.capitalTypes],
  nextPlannedId: loadData('nextPlannedId', Math.max(...initialData.plannedExpenses.map(e => e.id), 0) + 1),
  nextPaidId: loadData('nextPaidId', Math.max(...initialData.paidExpenses.map(e => e.id), 0) + 1),
  nextCapitalId: loadData('nextCapitalId', Math.max(...initialData.capitalEntries.map(e => e.id), 0) + 1),
  editingEntry: null,
  editingType: null
};

// Charts
let categoryChart = null;
let capitalFlowChart = null;

// PKR Currency Formatter
function formatPKR(amount) {
  return 'Rs. ' + new Intl.NumberFormat('en-PK').format(amount);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

function initializeApp() {
  updateDashboard();
  renderPlannedExpensesTable();
  renderPaidExpensesTable();
  renderCapitalTable();
  initializeCharts();
  setupEventListeners();
  populateFormOptions();
}

// Setup Event Listeners
function setupEventListeners() {
  // Add Capital Modal
  const addCapitalBtn = document.getElementById('addCapitalBtn');
  const addCapitalModal = document.getElementById('addCapitalModal');
  const cancelCapitalBtn = document.getElementById('cancelCapitalBtn');
  const capitalForm = document.getElementById('capitalForm');

  if (addCapitalBtn) addCapitalBtn.addEventListener('click', () => openAddCapitalModal());
  if (cancelCapitalBtn) cancelCapitalBtn.addEventListener('click', () => closeModal(addCapitalModal));
  if (capitalForm) capitalForm.addEventListener('submit', handleCapitalForm);

  // Add Planned Expense Modal
  const addPlannedBtn = document.getElementById('addPlannedBtn');
  const addPlannedModal = document.getElementById('addPlannedModal');
  const cancelPlannedBtn = document.getElementById('cancelPlannedBtn');
  const plannedForm = document.getElementById('plannedForm');

  if (addPlannedBtn) addPlannedBtn.addEventListener('click', () => openAddPlannedModal());
  if (cancelPlannedBtn) cancelPlannedBtn.addEventListener('click', () => closeModal(addPlannedModal));
  if (plannedForm) plannedForm.addEventListener('submit', handlePlannedForm);

  // Add Paid Expense Modal
  const addPaidBtn = document.getElementById('addPaidBtn');
  const addPaidModal = document.getElementById('addPaidModal');
  const cancelPaidBtn = document.getElementById('cancelPaidBtn');
  const paidForm = document.getElementById('paidForm');

  if (addPaidBtn) addPaidBtn.addEventListener('click', () => openAddPaidModal());
  if (cancelPaidBtn) cancelPaidBtn.addEventListener('click', () => closeModal(addPaidModal));
  if (paidForm) paidForm.addEventListener('submit', handlePaidForm);

  // Export functionality
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) exportBtn.addEventListener('click', exportData);

  // Search functionality
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.addEventListener('input', handleSearch);

  // Filter functionality
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => handleFilter(e.target.dataset.filter));
  });
}

// Modal Functions
function openModal(modal) {
  if (modal) modal.classList.add('modal--active');
}

function closeModal(modal) {
  if (modal) modal.classList.remove('modal--active');
  // Reset editing state
  appState.editingEntry = null;
  appState.editingType = null;
}

// Open Modal Functions
function openAddCapitalModal() {
  appState.editingEntry = null;
  appState.editingType = null;
  const modal = document.getElementById('addCapitalModal');
  const form = document.getElementById('capitalForm');
  const modalTitle = modal.querySelector('.modal-header h2');
  const submitBtn = modal.querySelector('button[type="submit"]');

  if (modalTitle) modalTitle.innerHTML = '<i class="fas fa-plus"></i> Add Capital Entry';
  if (submitBtn) submitBtn.textContent = 'Add Capital';
  if (form) form.reset();

  // Set today's date as default
  const dateInput = document.getElementById('capitalDate');
  if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

  openModal(modal);
}

function openEditCapitalModal(capitalId) {
  const capital = appState.capitalEntries.find(e => e.id === capitalId);
  if (!capital) return;

  appState.editingEntry = capital;
  appState.editingType = 'capital';

  const modal = document.getElementById('addCapitalModal');
  const modalTitle = modal.querySelector('.modal-header h2');
  const submitBtn = modal.querySelector('button[type="submit"]');

  if (modalTitle) modalTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Capital Entry';
  if (submitBtn) submitBtn.textContent = 'Update Capital';

  // Populate form with existing data
  document.getElementById('capitalSource').value = capital.source;
  document.getElementById('capitalAmount').value = capital.amount;
  document.getElementById('capitalType').value = capital.type;
  document.getElementById('capitalDate').value = capital.date;
  document.getElementById('capitalDescription').value = capital.description || '';

  openModal(modal);
}

function openAddPlannedModal() {
  appState.editingEntry = null;
  appState.editingType = null;
  const modal = document.getElementById('addPlannedModal');
  const form = document.getElementById('plannedForm');
  const modalTitle = modal.querySelector('.modal-header h2');
  const submitBtn = modal.querySelector('button[type="submit"]');

  if (modalTitle) modalTitle.innerHTML = '<i class="fas fa-plus"></i> Add Planned Expense';
  if (submitBtn) submitBtn.textContent = 'Add Planned Expense';
  if (form) form.reset();

  openModal(modal);
}

function openEditPlannedModal(plannedId) {
  const planned = appState.plannedExpenses.find(e => e.id === plannedId);
  if (!planned) return;

  appState.editingEntry = planned;
  appState.editingType = 'planned';

  const modal = document.getElementById('addPlannedModal');
  const modalTitle = modal.querySelector('.modal-header h2');
  const submitBtn = modal.querySelector('button[type="submit"]');

  if (modalTitle) modalTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Planned Expense';
  if (submitBtn) submitBtn.textContent = 'Update Expense';

  // Populate form with existing data
  document.getElementById('plannedName').value = planned.name;
  document.getElementById('plannedAmount').value = planned.amount;
  document.getElementById('plannedCategory').value = planned.category;
  document.getElementById('plannedPriority').value = planned.priority;

  openModal(modal);
}

function openAddPaidModal() {
  appState.editingEntry = null;
  appState.editingType = null;
  const modal = document.getElementById('addPaidModal');
  const form = document.getElementById('paidForm');
  const modalTitle = modal.querySelector('.modal-header h2');
  const submitBtn = modal.querySelector('button[type="submit"]');

  if (modalTitle) modalTitle.innerHTML = '<i class="fas fa-plus"></i> Add Paid Expense';
  if (submitBtn) submitBtn.textContent = 'Add Paid Expense';
  if (form) form.reset();

  // Set today's date as default
  const dateInput = document.getElementById('paidDate');
  if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

  openModal(modal);
}

function openEditPaidModal(paidId) {
  const paid = appState.paidExpenses.find(e => e.id === paidId);
  if (!paid) return;

  appState.editingEntry = paid;
  appState.editingType = 'paid';

  const modal = document.getElementById('addPaidModal');
  const modalTitle = modal.querySelector('.modal-header h2');
  const submitBtn = modal.querySelector('button[type="submit"]');

  if (modalTitle) modalTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Paid Expense';
  if (submitBtn) submitBtn.textContent = 'Update Expense';

  // Populate form with existing data
  document.getElementById('paidName').value = paid.name;
  document.getElementById('paidAmount').value = paid.amount;
  document.getElementById('paidCategory').value = paid.category;
  document.getElementById('paidDate').value = paid.datePaid;
  document.getElementById('paidPaymentMethod').value = paid.paymentMethod;

  openModal(modal);
}

// Form Handlers
function handleCapitalForm(e) {
  e.preventDefault();
  const formData = new FormData(e.target);

  const capitalData = {
    source: formData.get('source'),
    amount: parseInt(formData.get('amount')),
    date: formData.get('date'),
    description: formData.get('description'),
    type: formData.get('type')
  };

  if (appState.editingEntry && appState.editingType === 'capital') {
    // Edit existing capital
    const index = appState.capitalEntries.findIndex(e => e.id === appState.editingEntry.id);
    if (index !== -1) {
      appState.capitalEntries[index] = { ...appState.editingEntry, ...capitalData };
    }
  } else {
    // Add new capital
    const newCapital = {
      id: appState.nextCapitalId++,
      ...capitalData
    };
    appState.capitalEntries.push(newCapital);
    saveData('nextCapitalId', appState.nextCapitalId);
  }

  saveData('capitalEntries', appState.capitalEntries);
  updateDashboard();
  renderCapitalTable();
  updateCharts();

  closeModal(document.getElementById('addCapitalModal'));
  e.target.reset();
}

function handlePlannedForm(e) {
  e.preventDefault();
  const formData = new FormData(e.target);

  const plannedData = {
    name: formData.get('name'),
    amount: parseInt(formData.get('amount')),
    category: formData.get('category'),
    priority: formData.get('priority')
  };

  if (appState.editingEntry && appState.editingType === 'planned') {
    // Edit existing planned expense
    const index = appState.plannedExpenses.findIndex(e => e.id === appState.editingEntry.id);
    if (index !== -1) {
      appState.plannedExpenses[index] = { ...appState.editingEntry, ...plannedData };
    }
  } else {
    // Add new planned expense
    const newExpense = {
      id: appState.nextPlannedId++,
      ...plannedData,
      dateAdded: new Date().toISOString().split('T')[0]
    };
    appState.plannedExpenses.push(newExpense);
    saveData('nextPlannedId', appState.nextPlannedId);
  }

  saveData('plannedExpenses', appState.plannedExpenses);
  updateDashboard();
  renderPlannedExpensesTable();
  updateCharts();

  closeModal(document.getElementById('addPlannedModal'));
  e.target.reset();
}

function handlePaidForm(e) {
  e.preventDefault();
  const formData = new FormData(e.target);

  const paidData = {
    name: formData.get('name'),
    amount: parseInt(formData.get('amount')),
    category: formData.get('category'),
    datePaid: formData.get('datePaid'),
    paymentMethod: formData.get('paymentMethod')
  };

  if (appState.editingEntry && appState.editingType === 'paid') {
    // Edit existing paid expense
    const index = appState.paidExpenses.findIndex(e => e.id === appState.editingEntry.id);
    if (index !== -1) {
      appState.paidExpenses[index] = { ...appState.editingEntry, ...paidData };
    }
  } else {
    // Add new paid expense
    const newExpense = {
      id: appState.nextPaidId++,
      ...paidData
    };
    appState.paidExpenses.push(newExpense);
    saveData('nextPaidId', appState.nextPaidId);
  }

  saveData('paidExpenses', appState.paidExpenses);
  updateDashboard();
  renderPaidExpensesTable();
  updateCharts();

  closeModal(document.getElementById('addPaidModal'));
  e.target.reset();
}

// Mark Planned Expense as Paid
function markAsPaid(plannedId) {
  const plannedExpense = appState.plannedExpenses.find(e => e.id === plannedId);
  if (!plannedExpense) return;

  const paidExpense = {
    id: appState.nextPaidId++,
    name: plannedExpense.name,
    amount: plannedExpense.amount,
    category: plannedExpense.category,
    datePaid: new Date().toISOString().split('T')[0],
    paymentMethod: 'Bank Transfer'
  };

  appState.paidExpenses.push(paidExpense);
  appState.plannedExpenses = appState.plannedExpenses.filter(e => e.id !== plannedId);

  saveData('plannedExpenses', appState.plannedExpenses);
  saveData('paidExpenses', appState.paidExpenses);
  saveData('nextPaidId', appState.nextPaidId);

  updateDashboard();
  renderPlannedExpensesTable();
  renderPaidExpensesTable();
  updateCharts();
}

// Delete Functions
function deleteCapital(capitalId) {
  if (confirm('Are you sure you want to delete this capital entry?')) {
    appState.capitalEntries = appState.capitalEntries.filter(e => e.id !== capitalId);
    saveData('capitalEntries', appState.capitalEntries);
    updateDashboard();
    renderCapitalTable();
    updateCharts();
  }
}

function deletePlannedExpense(plannedId) {
  if (confirm('Are you sure you want to delete this planned expense?')) {
    appState.plannedExpenses = appState.plannedExpenses.filter(e => e.id !== plannedId);
    saveData('plannedExpenses', appState.plannedExpenses);
    updateDashboard();
    renderPlannedExpensesTable();
    updateCharts();
  }
}

function deletePaidExpense(paidId) {
  if (confirm('Are you sure you want to delete this paid expense?')) {
    appState.paidExpenses = appState.paidExpenses.filter(e => e.id !== paidId);
    saveData('paidExpenses', appState.paidExpenses);
    updateDashboard();
    renderPaidExpensesTable();
    updateCharts();
  }
}

// Update Dashboard
function updateDashboard() {
  const totalCapital = appState.capitalEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const totalPlanned = appState.plannedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalPaid = appState.paidExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remainingBalance = totalCapital - totalPlanned - totalPaid;

  const totalCapitalEl = document.getElementById('totalCapital');
  const totalPlannedEl = document.getElementById('totalPlanned');
  const totalPaidEl = document.getElementById('totalPaid');
  const remainingBalanceEl = document.getElementById('remainingBalance');

  if (totalCapitalEl) totalCapitalEl.textContent = formatPKR(totalCapital);
  if (totalPlannedEl) totalPlannedEl.textContent = formatPKR(totalPlanned);
  if (totalPaidEl) totalPaidEl.textContent = formatPKR(totalPaid);
  if (remainingBalanceEl) remainingBalanceEl.textContent = formatPKR(remainingBalance);

  // Update financial health indicator
  const healthIndicator = document.querySelector('.financial-health');
  const healthText = document.querySelector('.health-status');

  if (healthIndicator && healthText) {
    if (remainingBalance > 50000) {
      healthIndicator.className = 'financial-health financial-health--good';
      healthText.textContent = 'Good Financial Health';
    } else if (remainingBalance > 0) {
      healthIndicator.className = 'financial-health financial-health--fair';
      healthText.textContent = 'Fair Financial Health';
    } else {
      healthIndicator.className = 'financial-health financial-health--poor';
      healthText.textContent = 'Needs Attention';
    }
  }
}

// Render Tables
function renderCapitalTable() {
  const tableBody = document.querySelector('#capitalTable tbody');
  if (!tableBody) return;

  tableBody.innerHTML = appState.capitalEntries.map(entry => `
    <tr>
      <td>${entry.source}</td>
      <td><span class="amount amount--positive">${formatPKR(entry.amount)}</span></td>
      <td><span class="badge badge--success">${entry.type}</span></td>
      <td>${entry.date}</td>
      <td>${entry.description || ''}</td>
      <td>
        <button class="btn btn--sm btn--primary" onclick="openEditCapitalModal(${entry.id})" title="Edit">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn--sm btn--danger" onclick="deleteCapital(${entry.id})" title="Delete">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function renderPlannedExpensesTable() {
  const tableBody = document.querySelector('#plannedTable tbody');
  if (!tableBody) return;

  tableBody.innerHTML = appState.plannedExpenses.map(expense => `
    <tr>
      <td>${expense.name}</td>
      <td><span class="amount amount--negative">${formatPKR(expense.amount)}</span></td>
      <td><span class="badge badge--primary">${expense.category}</span></td>
      <td><span class="badge badge--${getPriorityClass(expense.priority)}">${expense.priority}</span></td>
      <td>${expense.dateAdded}</td>
      <td>
        <button class="btn btn--sm btn--success" onclick="markAsPaid(${expense.id})" title="Mark as Paid">
          <i class="fas fa-check"></i>
        </button>
        <button class="btn btn--sm btn--primary" onclick="openEditPlannedModal(${expense.id})" title="Edit">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn--sm btn--danger" onclick="deletePlannedExpense(${expense.id})" title="Delete">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function renderPaidExpensesTable() {
  const tableBody = document.querySelector('#paidTable tbody');
  if (!tableBody) return;

  tableBody.innerHTML = appState.paidExpenses.map(expense => `
    <tr>
      <td>${expense.name}</td>
      <td><span class="amount amount--negative">${formatPKR(expense.amount)}</span></td>
      <td><span class="badge badge--primary">${expense.category}</span></td>
      <td>${expense.datePaid}</td>
      <td><span class="badge badge--info">${expense.paymentMethod}</span></td>
      <td>
        <button class="btn btn--sm btn--primary" onclick="openEditPaidModal(${expense.id})" title="Edit">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn--sm btn--danger" onclick="deletePaidExpense(${expense.id})" title="Delete">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

// Helper Functions
function getPriorityClass(priority) {
  const classes = {
    'Critical': 'danger',
    'High': 'warning',
    'Medium': 'info',
    'Low': 'secondary'
  };
  return classes[priority] || 'secondary';
}

// Populate Form Options
function populateFormOptions() {
  // Capital types
  const capitalTypeSelect = document.getElementById('capitalType');
  if (capitalTypeSelect) {
    capitalTypeSelect.innerHTML = appState.capitalTypes.map(type => 
      `<option value="${type}">${type}</option>`
    ).join('');
  }

  // Categories for both planned and paid forms
  const plannedCategorySelect = document.getElementById('plannedCategory');
  if (plannedCategorySelect) {
    plannedCategorySelect.innerHTML = appState.categories.map(category => 
      `<option value="${category}">${category}</option>`
    ).join('');
  }

  const paidCategorySelect = document.getElementById('paidCategory');
  if (paidCategorySelect) {
    paidCategorySelect.innerHTML = appState.categories.map(category => 
      `<option value="${category}">${category}</option>`
    ).join('');
  }

  // Priorities
  const prioritySelect = document.getElementById('plannedPriority');
  if (prioritySelect) {
    prioritySelect.innerHTML = appState.priorities.map(priority => 
      `<option value="${priority}">${priority}</option>`
    ).join('');
  }

  // Payment methods
  const paymentMethodSelect = document.getElementById('paidPaymentMethod');
  if (paymentMethodSelect) {
    paymentMethodSelect.innerHTML = appState.paymentMethods.map(method => 
      `<option value="${method}">${method}</option>`
    ).join('');
  }
}

// Charts
function initializeCharts() {
  // Category Distribution Chart
  const categoryCtx = document.getElementById('categoryChart');
  if (categoryCtx) {
    const categoryData = getCategoryData();
    categoryChart = new Chart(categoryCtx, {
      type: 'doughnut',
      data: {
        labels: categoryData.labels,
        datasets: [{
          data: categoryData.data,
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
            '#9966FF', '#FF9F40', '#C9CBCF', '#4BC0C0'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.label + ': ' + formatPKR(context.parsed);
              }
            }
          }
        }
      }
    });
  }

  // Capital Flow Chart
  const capitalCtx = document.getElementById('capitalFlowChart');
  if (capitalCtx) {
    const totalCapital = appState.capitalEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const totalPaid = appState.paidExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalPlanned = appState.plannedExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    capitalFlowChart = new Chart(capitalCtx, {
      type: 'bar',
      data: {
        labels: ['Capital', 'Paid', 'Planned', 'Remaining'],
        datasets: [{
          data: [totalCapital, totalPaid, totalPlanned, totalCapital - totalPaid - totalPlanned],
          backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return formatPKR(context.parsed.y);
              }
            }
          }
        },
        scales: {
          y: {
            ticks: {
              callback: function(value) {
                return formatPKR(value);
              }
            }
          }
        }
      }
    });
  }
}

function updateCharts() {
  // Update category chart
  if (categoryChart) {
    const categoryData = getCategoryData();
    categoryChart.data.labels = categoryData.labels;
    categoryChart.data.datasets[0].data = categoryData.data;
    categoryChart.update();
  }

  // Update capital flow chart
  if (capitalFlowChart) {
    const totalCapital = appState.capitalEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const totalPaid = appState.paidExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalPlanned = appState.plannedExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    capitalFlowChart.data.datasets[0].data = [
      totalCapital, totalPaid, totalPlanned, totalCapital - totalPaid - totalPlanned
    ];
    capitalFlowChart.update();
  }
}

function getCategoryData() {
  const categoryTotals = {};

  // Combine planned and paid expenses by category
  [...appState.plannedExpenses, ...appState.paidExpenses].forEach(expense => {
    categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
  });

  return {
    labels: Object.keys(categoryTotals),
    data: Object.values(categoryTotals)
  };
}

// Search and Filter Functions
function handleSearch(e) {
  const searchTerm = e.target.value.toLowerCase();
  const tables = document.querySelectorAll('table tbody tr');

  tables.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm) ? '' : 'none';
  });
}

function handleFilter(filter) {
  // Update active filter button
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('filter-btn--active');
  });

  // Find and activate the clicked button
  const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
  if (activeBtn) activeBtn.classList.add('filter-btn--active');

  // Apply filter logic
  const sections = document.querySelectorAll('.content-section');

  sections.forEach(section => {
    if (filter === 'all') {
      section.style.display = 'block';
    } else if (filter === 'capital' && section.id === 'capitalSection') {
      section.style.display = 'block';
    } else if (filter === 'planned' && section.id === 'plannedSection') {
      section.style.display = 'block';
    } else if (filter === 'paid' && section.id === 'paidSection') {
      section.style.display = 'block';
    } else if (filter !== 'all') {
      section.style.display = 'none';
    }
  });
}

// Export Function
function exportData() {
  const data = {
    capital: appState.capitalEntries,
    planned: appState.plannedExpenses,
    paid: appState.paidExpenses,
    exportDate: new Date().toISOString()
  };

  const csvContent = generateCSV(data);
  downloadCSV(csvContent, 'expense-data.csv');
}

function generateCSV(data) {
  let csv = 'Type,Name/Source,Amount,Category/Type,Date,Additional Info\n';

  // Add capital entries
  data.capital.forEach(entry => {
    csv += `Capital,"${entry.source}",${entry.amount},"${entry.type}","${entry.date}","${entry.description || ''}"\n`;
  });

  // Add planned expenses
  data.planned.forEach(expense => {
    csv += `Planned,"${expense.name}",${expense.amount},"${expense.category}","${expense.dateAdded}","Priority: ${expense.priority}"\n`;
  });

  // Add paid expenses
  data.paid.forEach(expense => {
    csv += `Paid,"${expense.name}",${expense.amount},"${expense.category}","${expense.datePaid}","Payment: ${expense.paymentMethod}"\n`;
  });

  return csv;
}

function downloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

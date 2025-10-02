// Initial Data
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

// ONLY localStorage functions added
function saveToStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
function loadFromStorage(key, defaultData) {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : defaultData;
}

// Application State
let appState = {
  capitalEntries: loadFromStorage('capital', [...initialData.capitalEntries]),
  plannedExpenses: loadFromStorage('planned', [...initialData.plannedExpenses]),
  paidExpenses: loadFromStorage('paid', [...initialData.paidExpenses]),
  categories: [...initialData.categories],
  priorities: [...initialData.priorities],
  paymentMethods: [...initialData.paymentMethods],
  capitalTypes: [...initialData.capitalTypes],
  nextPlannedId: Math.max(...initialData.plannedExpenses.map(e => e.id), 0) + 1,
  nextPaidId: Math.max(...initialData.paidExpenses.map(e => e.id), 0) + 1,
  nextCapitalId: Math.max(...initialData.capitalEntries.map(e => e.id), 0) + 1
};

let categoryChart = null;
let capitalFlowChart = null;

function formatPKR(amount) {
  return 'Rs. ' + new Intl.NumberFormat('en-PK').format(amount);
}

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

function setupEventListeners() {
  const addCapitalBtn = document.getElementById('addCapitalBtn');
  const addCapitalModal = document.getElementById('addCapitalModal');
  const cancelCapitalBtn = document.getElementById('cancelCapitalBtn');
  const capitalForm = document.getElementById('capitalForm');

  addCapitalBtn?.addEventListener('click', () => openModal(addCapitalModal));
  cancelCapitalBtn?.addEventListener('click', () => closeModal(addCapitalModal));
  capitalForm?.addEventListener('submit', handleAddCapital);

  const addPlannedBtn = document.getElementById('addPlannedBtn');
  const addPlannedModal = document.getElementById('addPlannedModal');
  const cancelPlannedBtn = document.getElementById('cancelPlannedBtn');
  const plannedForm = document.getElementById('plannedForm');

  addPlannedBtn?.addEventListener('click', () => openModal(addPlannedModal));
  cancelPlannedBtn?.addEventListener('click', () => closeModal(addPlannedModal));
  plannedForm?.addEventListener('submit', handleAddPlannedExpense);

  const addPaidBtn = document.getElementById('addPaidBtn');
  const addPaidModal = document.getElementById('addPaidModal');
  const cancelPaidBtn = document.getElementById('cancelPaidBtn');
  const paidForm = document.getElementById('paidForm');

  addPaidBtn?.addEventListener('click', () => openModal(addPaidModal));
  cancelPaidBtn?.addEventListener('click', () => closeModal(addPaidModal));
  paidForm?.addEventListener('submit', handleAddPaidExpense);

  const exportBtn = document.getElementById('exportBtn');
  exportBtn?.addEventListener('click', exportData);

  const searchInput = document.getElementById('searchInput');
  searchInput?.addEventListener('input', handleSearch);

  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => handleFilter(btn.dataset.filter));
  });
}

function openModal(modal) {
  modal?.classList.add('modal--active');
}

function closeModal(modal) {
  modal?.classList.remove('modal--active');
}

function handleAddCapital(e) {
  e.preventDefault();
  const formData = new FormData(e.target);

  const newCapital = {
    id: appState.nextCapitalId++,
    source: formData.get('source'),
    amount: parseInt(formData.get('amount')),
    date: formData.get('date'),
    description: formData.get('description'),
    type: formData.get('type')
  };

  appState.capitalEntries.push(newCapital);
  saveToStorage('capital', appState.capitalEntries); // SAVE

  updateDashboard();
  renderCapitalTable();
  updateCharts();
  closeModal(document.getElementById('addCapitalModal'));
  e.target.reset();
}

function handleAddPlannedExpense(e) {
  e.preventDefault();
  const formData = new FormData(e.target);

  const newExpense = {
    id: appState.nextPlannedId++,
    name: formData.get('name'),
    amount: parseInt(formData.get('amount')),
    category: formData.get('category'),
    priority: formData.get('priority'),
    dateAdded: new Date().toISOString().split('T')[0]
  };

  appState.plannedExpenses.push(newExpense);
  saveToStorage('planned', appState.plannedExpenses); // SAVE

  updateDashboard();
  renderPlannedExpensesTable();
  updateCharts();
  closeModal(document.getElementById('addPlannedModal'));
  e.target.reset();
}

function handleAddPaidExpense(e) {
  e.preventDefault();
  const formData = new FormData(e.target);

  const newExpense = {
    id: appState.nextPaidId++,
    name: formData.get('name'),
    amount: parseInt(formData.get('amount')),
    category: formData.get('category'),
    datePaid: formData.get('datePaid'),
    paymentMethod: formData.get('paymentMethod')
  };

  appState.paidExpenses.push(newExpense);
  saveToStorage('paid', appState.paidExpenses); // SAVE

  updateDashboard();
  renderPaidExpensesTable();
  updateCharts();
  closeModal(document.getElementById('addPaidModal'));
  e.target.reset();
}

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

  saveToStorage('planned', appState.plannedExpenses); // SAVE
  saveToStorage('paid', appState.paidExpenses); // SAVE

  updateDashboard();
  renderPlannedExpensesTable();
  renderPaidExpensesTable();
  updateCharts();
}

function deleteCapital(capitalId) {
  if (confirm('Are you sure you want to delete this capital entry?')) {
    appState.capitalEntries = appState.capitalEntries.filter(e => e.id !== capitalId);
    saveToStorage('capital', appState.capitalEntries); // SAVE
    updateDashboard();
    renderCapitalTable();
    updateCharts();
  }
}

function deletePlannedExpense(plannedId) {
  if (confirm('Are you sure you want to delete this planned expense?')) {
    appState.plannedExpenses = appState.plannedExpenses.filter(e => e.id !== plannedId);
    saveToStorage('planned', appState.plannedExpenses); // SAVE
    updateDashboard();
    renderPlannedExpensesTable();
    updateCharts();
  }
}

function deletePaidExpense(paidId) {
  if (confirm('Are you sure you want to delete this paid expense?')) {
    appState.paidExpenses = appState.paidExpenses.filter(e => e.id !== paidId);
    saveToStorage('paid', appState.paidExpenses); // SAVE
    updateDashboard();
    renderPaidExpensesTable();
    updateCharts();
  }
}

function updateDashboard() {
  const totalCapital = appState.capitalEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const totalPlanned = appState.plannedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalPaid = appState.paidExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remainingBalance = totalCapital - totalPlanned - totalPaid;

  document.getElementById('totalCapital').textContent = formatPKR(totalCapital);
  document.getElementById('totalPlanned').textContent = formatPKR(totalPlanned);
  document.getElementById('totalPaid').textContent = formatPKR(totalPaid);
  document.getElementById('remainingBalance').textContent = formatPKR(remainingBalance);

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

function renderCapitalTable() {
  const tableBody = document.querySelector('#capitalTable tbody');
  if (!tableBody) return;

  tableBody.innerHTML = appState.capitalEntries.map(entry => `
    <tr>
      <td>${entry.source}</td>
      <td><span class="amount amount--positive">${formatPKR(entry.amount)}</span></td>
      <td><span class="badge badge--success">${entry.type}</span></td>
      <td>${entry.date}</td>
      <td>${entry.description}</td>
      <td>
        <button class="btn btn--sm btn--danger" onclick="deleteCapital(${entry.id})">
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
        <button class="btn btn--sm btn--success" onclick="markAsPaid(${expense.id})">
          <i class="fas fa-check"></i> Mark Paid
        </button>
        <button class="btn btn--sm btn--danger" onclick="deletePlannedExpense(${expense.id})">
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
        <button class="btn btn--sm btn--danger" onclick="deletePaidExpense(${expense.id})">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function getPriorityClass(priority) {
  const classes = {
    'Critical': 'danger',
    'High': 'warning',
    'Medium': 'info',
    'Low': 'secondary'
  };
  return classes[priority] || 'secondary';
}

function populateFormOptions() {
  const capitalTypeSelect = document.getElementById('capitalType');
  if (capitalTypeSelect) {
    capitalTypeSelect.innerHTML = appState.capitalTypes.map(type => 
      `<option value="${type}">${type}</option>`
    ).join('');
  }

  const categorySelects = document.querySelectorAll('select[name="category"]');
  categorySelects.forEach(select => {
    select.innerHTML = appState.categories.map(category => 
      `<option value="${category}">${category}</option>`
    ).join('');
  });

  const prioritySelect = document.getElementById('plannedPriority');
  if (prioritySelect) {
    prioritySelect.innerHTML = appState.priorities.map(priority => 
      `<option value="${priority}">${priority}</option>`
    ).join('');
  }

  const paymentMethodSelect = document.getElementById('paidPaymentMethod');
  if (paymentMethodSelect) {
    paymentMethodSelect.innerHTML = appState.paymentMethods.map(method => 
      `<option value="${method}">${method}</option>`
    ).join('');
  }
}

function initializeCharts() {
  const categoryCtx = document.getElementById('categoryChart');
  if (categoryCtx) {
    const categoryData = getCategoryData();
    categoryChart = new Chart(categoryCtx, {
      type: 'doughnut',
      data: {
        labels: categoryData.labels,
        datasets: [{
          data: categoryData.data,
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
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
          legend: { display: false },
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
  if (categoryChart) {
    const categoryData = getCategoryData();
    categoryChart.data.labels = categoryData.labels;
    categoryChart.data.datasets[0].data = categoryData.data;
    categoryChart.update();
  }

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
  [...appState.plannedExpenses, ...appState.paidExpenses].forEach(expense => {
    categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
  });
  return {
    labels: Object.keys(categoryTotals),
    data: Object.values(categoryTotals)
  };
}

function handleSearch(e) {
  const searchTerm = e.target.value.toLowerCase();
  const tables = document.querySelectorAll('table tbody tr');
  tables.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm) ? '' : 'none';
  });
}

function handleFilter(filter) {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('filter-btn--active');
  });
  event.target.classList.add('filter-btn--active');

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
  data.capital.forEach(entry => {
    csv += `Capital,"${entry.source}",${entry.amount},"${entry.type}","${entry.date}","${entry.description}"\n`;
  });
  data.planned.forEach(expense => {
    csv += `Planned,"${expense.name}",${expense.amount},"${expense.category}","${expense.dateAdded}","Priority: ${expense.priority}"\n`;
  });
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

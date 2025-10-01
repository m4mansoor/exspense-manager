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

// Application State
let appState = {
  capitalEntries: [...initialData.capitalEntries],
  plannedExpenses: [...initialData.plannedExpenses],
  paidExpenses: [...initialData.paidExpenses],
  categories: [...initialData.categories],
  priorities: [...initialData.priorities],
  paymentMethods: [...initialData.paymentMethods],
  capitalTypes: [...initialData.capitalTypes],
  nextCapitalId: Math.max(...initialData.capitalEntries.map(e => e.id)) + 1,
  nextPlannedId: Math.max(...initialData.plannedExpenses.map(e => e.id)) + 1,
  nextPaidId: Math.max(...initialData.paidExpenses.map(e => e.id)) + 1,
  currentEditType: null,
  currentEditId: null,
  filters: {
    search: '',
    category: '',
    status: ''
  }
};

// Chart instances
let flowChart = null;
let pieChart = null;

// Utility Functions
const formatCurrency = (amount) => {
  return `Rs. ${amount.toLocaleString()}`;
};

const getCategoryIcon = (category) => {
  const icons = {
    'Family': 'fas fa-users',
    'Personal': 'fas fa-user',
    'Business': 'fas fa-briefcase',
    'Transport': 'fas fa-car',
    'Housing': 'fas fa-home',
    'Food': 'fas fa-utensils',
    'Utilities': 'fas fa-plug',
    'Entertainment': 'fas fa-film',
    'Healthcare': 'fas fa-heartbeat',
    'Education': 'fas fa-graduation-cap'
  };
  return icons[category] || 'fas fa-tag';
};

const getCapitalTypeIcon = (type) => {
  const icons = {
    'Salary': 'fas fa-building',
    'Freelance': 'fas fa-laptop-code',
    'Business': 'fas fa-chart-line',
    'Investment': 'fas fa-coins',
    'Rental': 'fas fa-home',
    'Gift': 'fas fa-gift',
    'Bonus': 'fas fa-star',
    'Other': 'fas fa-plus-circle'
  };
  return icons[type] || 'fas fa-money-bill-wave';
};

const getPriorityClass = (priority) => {
  return `priority-indicator--${priority.toLowerCase()}`;
};

const getCapitalTypeClass = (type) => {
  return `capital-type-indicator--${type.toLowerCase()}`;
};

const calculateFinancialHealth = (capital, planned, paid) => {
  const availableBalance = capital - planned - paid;
  const totalExpenses = planned + paid;
  
  if (availableBalance > totalExpenses * 0.5) {
    return { status: 'surplus', text: 'Surplus', icon: 'fas fa-smile' };
  } else if (availableBalance > totalExpenses * 0.1) {
    return { status: 'tight', text: 'Tight Budget', icon: 'fas fa-meh' };
  } else {
    return { status: 'deficit', text: 'Budget Deficit', icon: 'fas fa-frown' };
  }
};

// Dashboard Updates
const updateDashboard = () => {
  const totalCapital = appState.capitalEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const totalPlanned = appState.plannedExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalPaid = appState.paidExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const availableBalance = totalCapital - totalPlanned - totalPaid;

  // Update metric displays
  document.getElementById('totalCapital').textContent = formatCurrency(totalCapital);
  document.getElementById('totalPlanned').textContent = formatCurrency(totalPlanned);
  document.getElementById('totalPaid').textContent = formatCurrency(totalPaid);
  document.getElementById('availableBalance').textContent = formatCurrency(availableBalance);

  // Update counts
  document.getElementById('capitalCount').textContent = `${appState.capitalEntries.length} items`;
  document.getElementById('plannedCount').textContent = `${appState.plannedExpenses.length} items`;
  document.getElementById('paidCount').textContent = `${appState.paidExpenses.length} items`;

  // Update financial health indicator
  const health = calculateFinancialHealth(totalCapital, totalPlanned, totalPaid);
  const healthIcon = document.getElementById('financialHealthIcon');
  const healthText = document.getElementById('financialHealthText');
  
  // Remove existing health classes
  healthIcon.classList.remove('surplus', 'tight', 'deficit');
  healthText.classList.remove('surplus', 'tight', 'deficit');
  
  // Add new health classes
  healthIcon.classList.add(health.status);
  healthText.classList.add(health.status);
  healthText.textContent = health.text;

  updateCharts();
};

// Chart Updates
const updateCharts = () => {
  updateFlowChart();
  updatePieChart();
};

const updateFlowChart = () => {
  const ctx = document.getElementById('flowChart').getContext('2d');
  
  const totalCapital = appState.capitalEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const totalPlanned = appState.plannedExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalPaid = appState.paidExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  if (flowChart) {
    flowChart.destroy();
  }

  flowChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Capital', 'Planned Expenses', 'Paid Expenses', 'Available Balance'],
      datasets: [{
        label: 'Amount (Rs.)',
        data: [totalCapital, totalPlanned, totalPaid, totalCapital - totalPlanned - totalPaid],
        backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return formatCurrency(context.parsed.y);
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return formatCurrency(value);
            }
          }
        }
      }
    }
  });
};

const updatePieChart = () => {
  const ctx = document.getElementById('pieChart').getContext('2d');
  
  // Calculate category totals from all expenses
  const categoryTotals = {};
  [...appState.plannedExpenses, ...appState.paidExpenses].forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);
  const colors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B'];

  if (pieChart) {
    pieChart.destroy();
  }

  if (labels.length === 0) {
    // Show empty state
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.font = '14px Arial';
    ctx.fillStyle = '#666';
    ctx.textAlign = 'center';
    ctx.fillText('No expense data available', ctx.canvas.width / 2, ctx.canvas.height / 2);
    return;
  }

  pieChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors.slice(0, labels.length),
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 15
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.label}: ${formatCurrency(context.parsed)}`;
            }
          }
        }
      }
    }
  });
};

// Table Rendering
const renderTables = () => {
  renderCapitalTable();
  renderPlannedTable();
  renderPaidTable();
};

const renderCapitalTable = () => {
  const tbody = document.querySelector('#capitalTable tbody');
  const filteredEntries = filterEntries(appState.capitalEntries, 'capital');
  
  if (filteredEntries.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">
          <i class="fas fa-coins"></i>
          <p>No capital entries found</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filteredEntries.map(entry => `
    <tr class="fade-in">
      <td>
        <div class="source-icon">
          <i class="${getCapitalTypeIcon(entry.type)}"></i>
          ${entry.source}
        </div>
      </td>
      <td class="amount amount--large amount--positive">${formatCurrency(entry.amount)}</td>
      <td>
        <span class="capital-type-indicator ${getCapitalTypeClass(entry.type)}">
          ${entry.type}
        </span>
      </td>
      <td>${new Date(entry.date).toLocaleDateString()}</td>
      <td>
        <div class="table-actions">
          <button class="btn-icon btn-icon--edit" onclick="editTransaction('capital', ${entry.id})" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon btn-icon--delete" onclick="deleteTransaction('capital', ${entry.id})" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
};

const renderPlannedTable = () => {
  const tbody = document.querySelector('#plannedTable tbody');
  const filteredExpenses = filterEntries(appState.plannedExpenses, 'planned');
  
  if (filteredExpenses.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">
          <i class="fas fa-calendar-plus"></i>
          <p>No planned expenses found</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filteredExpenses.map(exp => `
    <tr class="fade-in">
      <td>
        <div class="category-icon">
          <i class="${getCategoryIcon(exp.category)}"></i>
          ${exp.name}
        </div>
      </td>
      <td class="amount amount--large">${formatCurrency(exp.amount)}</td>
      <td>${exp.category}</td>
      <td>
        <span class="priority-indicator ${getPriorityClass(exp.priority)}">
          ${exp.priority}
        </span>
      </td>
      <td>
        <div class="table-actions">
          <button class="btn-icon btn-icon--pay" onclick="markAsPaid(${exp.id})" title="Mark as Paid">
            <i class="fas fa-check"></i>
          </button>
          <button class="btn-icon btn-icon--edit" onclick="editTransaction('planned', ${exp.id})" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon btn-icon--delete" onclick="deleteTransaction('planned', ${exp.id})" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
};

const renderPaidTable = () => {
  const tbody = document.querySelector('#paidTable tbody');
  const filteredExpenses = filterEntries(appState.paidExpenses, 'paid');
  
  if (filteredExpenses.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">
          <i class="fas fa-receipt"></i>
          <p>No paid expenses found</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filteredExpenses.map(exp => `
    <tr class="fade-in">
      <td>
        <div class="category-icon">
          <i class="${getCategoryIcon(exp.category)}"></i>
          ${exp.name}
        </div>
      </td>
      <td class="amount amount--large amount--negative">${formatCurrency(exp.amount)}</td>
      <td>${exp.category}</td>
      <td>${new Date(exp.datePaid).toLocaleDateString()}</td>
      <td>
        <div class="table-actions">
          <button class="btn-icon btn-icon--edit" onclick="editTransaction('paid', ${exp.id})" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon btn-icon--delete" onclick="deleteTransaction('paid', ${exp.id})" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
};

// Filtering
const filterEntries = (entries, type) => {
  return entries.filter(entry => {
    const searchText = type === 'capital' ? entry.source : entry.name;
    const matchesSearch = !appState.filters.search || 
      searchText.toLowerCase().includes(appState.filters.search.toLowerCase());
    
    const entryCategory = type === 'capital' ? entry.type : entry.category;
    const matchesCategory = !appState.filters.category || 
      entryCategory === appState.filters.category;
    
    const matchesStatus = !appState.filters.status || 
      appState.filters.status === type;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
};

// Modal Management
const showModal = (modalId) => {
  document.getElementById(modalId).classList.remove('hidden');
  document.body.style.overflow = 'hidden';
};

const hideModal = (modalId) => {
  document.getElementById(modalId).classList.add('hidden');
  document.body.style.overflow = '';
};

const populateSelectOptions = () => {
  const selects = [
    { id: 'capitalType', options: appState.capitalTypes },
    { id: 'plannedCategory', options: appState.categories },
    { id: 'paidCategory', options: appState.categories },
    { id: 'plannedPriority', options: appState.priorities },
    { id: 'paymentMethod', options: appState.paymentMethods },
    { id: 'categoryFilter', options: [...appState.categories, ...appState.capitalTypes] }
  ];

  selects.forEach(({ id, options }) => {
    const select = document.getElementById(id);
    if (id === 'categoryFilter') {
      select.innerHTML = '<option value="">All Categories</option>' + 
        options.map(opt => `<option value="${opt}">${opt}</option>`).join('');
    } else {
      select.innerHTML = options.map(opt => `<option value="${opt}">${opt}</option>`).join('');
    }
  });
};

// Capital Management
const addCapital = (formData) => {
  const newEntry = {
    id: appState.nextCapitalId++,
    source: formData.source,
    amount: parseInt(formData.amount),
    type: formData.type,
    date: formData.date,
    description: formData.description || ''
  };
  
  appState.capitalEntries.push(newEntry);
  updateDashboard();
  renderTables();
  hideModal('addCapitalModal');
};

// Expense Management
const addPlannedExpense = (formData) => {
  const newExpense = {
    id: appState.nextPlannedId++,
    name: formData.name,
    amount: parseInt(formData.amount),
    category: formData.category,
    priority: formData.priority,
    dateAdded: new Date().toISOString().split('T')[0]
  };
  
  appState.plannedExpenses.push(newExpense);
  updateDashboard();
  renderTables();
  hideModal('addPlannedModal');
};

const addPaidExpense = (formData) => {
  const newExpense = {
    id: appState.nextPaidId++,
    name: formData.name,
    amount: parseInt(formData.amount),
    category: formData.category,
    datePaid: formData.datePaid,
    paymentMethod: formData.paymentMethod
  };
  
  appState.paidExpenses.push(newExpense);
  updateDashboard();
  renderTables();
  hideModal('addPaidModal');
};

const markAsPaid = (plannedId) => {
  const plannedExpense = appState.plannedExpenses.find(exp => exp.id === plannedId);
  if (!plannedExpense) return;

  const paidExpense = {
    id: appState.nextPaidId++,
    name: plannedExpense.name,
    amount: plannedExpense.amount,
    category: plannedExpense.category,
    datePaid: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash'
  };

  appState.paidExpenses.push(paidExpense);
  appState.plannedExpenses = appState.plannedExpenses.filter(exp => exp.id !== plannedId);
  
  updateDashboard();
  renderTables();
};

const editTransaction = (type, id) => {
  let transaction;
  if (type === 'capital') {
    transaction = appState.capitalEntries.find(entry => entry.id === id);
  } else if (type === 'planned') {
    transaction = appState.plannedExpenses.find(exp => exp.id === id);
  } else {
    transaction = appState.paidExpenses.find(exp => exp.id === id);
  }
  
  if (!transaction) return;

  appState.currentEditType = type;
  appState.currentEditId = id;

  const modalTitles = {
    'capital': 'Edit Capital Entry',
    'planned': 'Edit Planned Expense',
    'paid': 'Edit Paid Expense'
  };

  document.getElementById('editModalTitle').textContent = modalTitles[type];

  let formContent = '';
  
  if (type === 'capital') {
    formContent = `
      <div class="form-group">
        <label class="form-label" for="editSource">Source Name</label>
        <input type="text" class="form-control" id="editSource" value="${transaction.source}" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="editAmount">Amount</label>
        <input type="number" class="form-control" id="editAmount" value="${transaction.amount}" min="0" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="editType">Type</label>
        <select class="form-control" id="editType" required>
          ${appState.capitalTypes.map(type => `<option value="${type}" ${type === transaction.type ? 'selected' : ''}>${type}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="editDate">Date</label>
        <input type="date" class="form-control" id="editDate" value="${transaction.date}" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="editDescription">Description</label>
        <textarea class="form-control" id="editDescription" rows="3">${transaction.description || ''}</textarea>
      </div>
    `;
  } else if (type === 'planned') {
    formContent = `
      <div class="form-group">
        <label class="form-label" for="editName">Expense Name</label>
        <input type="text" class="form-control" id="editName" value="${transaction.name}" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="editAmount">Amount</label>
        <input type="number" class="form-control" id="editAmount" value="${transaction.amount}" min="0" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="editCategory">Category</label>
        <select class="form-control" id="editCategory" required>
          ${appState.categories.map(cat => `<option value="${cat}" ${cat === transaction.category ? 'selected' : ''}>${cat}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="editPriority">Priority</label>
        <select class="form-control" id="editPriority" required>
          ${appState.priorities.map(pri => `<option value="${pri}" ${pri === transaction.priority ? 'selected' : ''}>${pri}</option>`).join('')}
        </select>
      </div>
    `;
  } else {
    formContent = `
      <div class="form-group">
        <label class="form-label" for="editName">Expense Name</label>
        <input type="text" class="form-control" id="editName" value="${transaction.name}" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="editAmount">Amount</label>
        <input type="number" class="form-control" id="editAmount" value="${transaction.amount}" min="0" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="editCategory">Category</label>
        <select class="form-control" id="editCategory" required>
          ${appState.categories.map(cat => `<option value="${cat}" ${cat === transaction.category ? 'selected' : ''}>${cat}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="editDate">Date Paid</label>
        <input type="date" class="form-control" id="editDate" value="${transaction.datePaid}" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="editPaymentMethod">Payment Method</label>
        <select class="form-control" id="editPaymentMethod" required>
          ${appState.paymentMethods.map(method => `<option value="${method}" ${method === transaction.paymentMethod ? 'selected' : ''}>${method}</option>`).join('')}
        </select>
      </div>
    `;
  }

  document.getElementById('editFormContent').innerHTML = formContent;
  showModal('editModal');
};

const updateTransaction = (formData) => {
  if (appState.currentEditType === 'capital') {
    const entry = appState.capitalEntries.find(entry => entry.id === appState.currentEditId);
    if (entry) {
      entry.source = formData.source;
      entry.amount = parseInt(formData.amount);
      entry.type = formData.type;
      entry.date = formData.date;
      entry.description = formData.description || '';
    }
  } else if (appState.currentEditType === 'planned') {
    const expense = appState.plannedExpenses.find(exp => exp.id === appState.currentEditId);
    if (expense) {
      expense.name = formData.name;
      expense.amount = parseInt(formData.amount);
      expense.category = formData.category;
      expense.priority = formData.priority;
    }
  } else {
    const expense = appState.paidExpenses.find(exp => exp.id === appState.currentEditId);
    if (expense) {
      expense.name = formData.name;
      expense.amount = parseInt(formData.amount);
      expense.category = formData.category;
      expense.datePaid = formData.datePaid;
      expense.paymentMethod = formData.paymentMethod;
    }
  }

  updateDashboard();
  renderTables();
  hideModal('editModal');
};

const deleteTransaction = (type, id) => {
  if (!confirm('Are you sure you want to delete this transaction?')) return;

  if (type === 'capital') {
    appState.capitalEntries = appState.capitalEntries.filter(entry => entry.id !== id);
  } else if (type === 'planned') {
    appState.plannedExpenses = appState.plannedExpenses.filter(exp => exp.id !== id);
  } else {
    appState.paidExpenses = appState.paidExpenses.filter(exp => exp.id !== id);
  }

  updateDashboard();
  renderTables();
};

// Export Functionality
const exportToCSV = () => {
  const csvData = [];
  
  // Headers
  csvData.push(['Type', 'Name/Source', 'Amount', 'Category/Type', 'Priority/Payment Method', 'Date', 'Description']);
  
  // Capital entries
  appState.capitalEntries.forEach(entry => {
    csvData.push(['Capital', entry.source, entry.amount, entry.type, '', entry.date, entry.description || '']);
  });
  
  // Planned expenses
  appState.plannedExpenses.forEach(exp => {
    csvData.push(['Planned', exp.name, exp.amount, exp.category, exp.priority, exp.dateAdded, '']);
  });
  
  // Paid expenses
  appState.paidExpenses.forEach(exp => {
    csvData.push(['Paid', exp.name, exp.amount, exp.category, exp.paymentMethod, exp.datePaid, '']);
  });
  
  const csvContent = csvData.map(row => row.map(field => `"${field}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `financial_report_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  
  window.URL.revokeObjectURL(url);
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Initialize UI
  populateSelectOptions();
  updateDashboard();
  renderTables();
  
  // Set default dates
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('capitalDate').value = today;
  document.getElementById('paidDate').value = today;

  // Modal controls
  document.getElementById('addCapitalBtn').addEventListener('click', () => showModal('addCapitalModal'));
  document.getElementById('addPlannedBtn').addEventListener('click', () => showModal('addPlannedModal'));
  document.getElementById('addPaidBtn').addEventListener('click', () => showModal('addPaidModal'));
  
  // Close modal buttons
  document.querySelectorAll('.modal__close, [id*="cancel"], [id*="close"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal');
      if (modal) hideModal(modal.id);
    });
  });

  // Modal overlay clicks
  document.querySelectorAll('.modal__overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        const modal = e.target.closest('.modal');
        if (modal) hideModal(modal.id);
      }
    });
  });

  // Form submissions
  document.getElementById('capitalForm').addEventListener('submit', (e) => {
    e.preventDefault();
    addCapital({
      source: document.getElementById('capitalSource').value,
      amount: document.getElementById('capitalAmount').value,
      type: document.getElementById('capitalType').value,
      date: document.getElementById('capitalDate').value,
      description: document.getElementById('capitalDescription').value
    });
    e.target.reset();
    document.getElementById('capitalDate').value = today;
  });

  document.getElementById('plannedExpenseForm').addEventListener('submit', (e) => {
    e.preventDefault();
    addPlannedExpense({
      name: document.getElementById('plannedName').value,
      amount: document.getElementById('plannedAmount').value,
      category: document.getElementById('plannedCategory').value,
      priority: document.getElementById('plannedPriority').value
    });
    e.target.reset();
  });

  document.getElementById('paidExpenseForm').addEventListener('submit', (e) => {
    e.preventDefault();
    addPaidExpense({
      name: document.getElementById('paidName').value,
      amount: document.getElementById('paidAmount').value,
      category: document.getElementById('paidCategory').value,
      datePaid: document.getElementById('paidDate').value,
      paymentMethod: document.getElementById('paymentMethod').value
    });
    e.target.reset();
    document.getElementById('paidDate').value = today;
  });

  document.getElementById('editForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = {};
    
    if (appState.currentEditType === 'capital') {
      formData.source = document.getElementById('editSource').value;
      formData.amount = document.getElementById('editAmount').value;
      formData.type = document.getElementById('editType').value;
      formData.date = document.getElementById('editDate').value;
      formData.description = document.getElementById('editDescription').value;
    } else if (appState.currentEditType === 'planned') {
      formData.name = document.getElementById('editName').value;
      formData.amount = document.getElementById('editAmount').value;
      formData.category = document.getElementById('editCategory').value;
      formData.priority = document.getElementById('editPriority').value;
    } else {
      formData.name = document.getElementById('editName').value;
      formData.amount = document.getElementById('editAmount').value;
      formData.category = document.getElementById('editCategory').value;
      formData.datePaid = document.getElementById('editDate').value;
      formData.paymentMethod = document.getElementById('editPaymentMethod').value;
    }
    
    updateTransaction(formData);
  });

  // Search and filters
  document.getElementById('searchInput').addEventListener('input', (e) => {
    appState.filters.search = e.target.value;
    renderTables();
  });

  document.getElementById('categoryFilter').addEventListener('change', (e) => {
    appState.filters.category = e.target.value;
    renderTables();
  });

  document.getElementById('statusFilter').addEventListener('change', (e) => {
    appState.filters.status = e.target.value;
    renderTables();
  });

  // Export functionality
  document.getElementById('exportBtn').addEventListener('click', exportToCSV);
});

// Global functions for onclick handlers
window.markAsPaid = markAsPaid;
window.editTransaction = editTransaction;
window.deleteTransaction = deleteTransaction;
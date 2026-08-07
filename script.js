const expenseForm = document.getElementById('expense-form');
const dateInput = document.getElementById('date');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const monthInput = document.getElementById('month');
const prevMonthButton = document.getElementById('prev-month');
const nextMonthButton = document.getElementById('next-month');
const expenseList = document.getElementById('expense-list');
const monthlyTotalElement = document.getElementById('monthly-total');
const selectedMonthDisplay = document.getElementById('selected-month-display');

const storageKey = 'bdtExpenseTracker';
const monthKey = 'bdtExpenseMonth';
const expenses = loadExpenses();
let selectedMonth = loadSelectedMonth();

function formatCurrency(value) {
  return value.toLocaleString('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function loadExpenses() {
  const stored = localStorage.getItem(storageKey);
  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed)
      ? parsed.map((item) => ({
          category: item.category,
          amount: Number(item.amount) || 0,
        }))
      : [];
  } catch (error) {
    console.warn('Failed to load saved expenses:', error);
    return [];
  }
}

function loadSelectedMonth() {
  const storedMonth = localStorage.getItem(monthKey);
  if (storedMonth) {
    return storedMonth;
  }

  const today = new Date();
  const defaultMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  localStorage.setItem(monthKey, defaultMonth);
  return defaultMonth;
}

function saveExpenses() {
  localStorage.setItem(storageKey, JSON.stringify(expenses));
}

function saveSelectedMonth(month) {
  localStorage.setItem(monthKey, month);
}

function renderSelectedMonth() {
  const [year, month] = selectedMonth.split('-');
  const readableMonth = new Date(year, Number(month) - 1).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });
  selectedMonthDisplay.textContent = readableMonth;
  monthInput.value = selectedMonth;
}

function updateSummary() {
  const monthlyExpenses = expenses.filter((expense) => expense.date.startsWith(selectedMonth));
  const total = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  monthlyTotalElement.textContent = formatCurrency(total);
}

function renderExpenses() {
  expenseList.innerHTML = '';

  const monthlyExpenses = expenses.filter((expense) => expense.date.startsWith(selectedMonth));

  if (monthlyExpenses.length === 0) {
    const row = document.createElement('tr');
    const noData = document.createElement('td');
    noData.className = 'no-data';
    noData.colSpan = 4;
    noData.textContent = 'No expenses found for this month. Add a new expense to begin tracking.';
    row.appendChild(noData);
    expenseList.appendChild(row);
    return;
  }

  monthlyExpenses.forEach((expense) => {
    const row = document.createElement('tr');

    const dateCell = document.createElement('td');
    dateCell.textContent = new Date(expense.date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const categoryCell = document.createElement('td');
    categoryCell.textContent = expense.category;

    const amountCell = document.createElement('td');
    amountCell.textContent = formatCurrency(expense.amount);

    const actionCell = document.createElement('td');
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'action-btn';
    deleteButton.addEventListener('click', () => {
      const index = expenses.indexOf(expense);
      if (index >= 0) {
        expenses.splice(index, 1);
        saveExpenses();
        renderExpenses();
        updateSummary();
      }
    });
    actionCell.appendChild(deleteButton);

    row.appendChild(dateCell);
    row.appendChild(categoryCell);
    row.appendChild(amountCell);
    row.appendChild(actionCell);
    expenseList.appendChild(row);
  });
}

dateInput.addEventListener('change', (event) => {
  selectedDate = event.target.value;
});

monthInput.addEventListener('change', (event) => {
  selectedMonth = event.target.value;
  saveSelectedMonth(selectedMonth);
  renderSelectedMonth();
  renderExpenses();
  updateSummary();
});

function changeMonth(offset) {
  const [year, month] = selectedMonth.split('-').map(Number);
  const date = new Date(year, month - 1 + offset, 1);
  selectedMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  saveSelectedMonth(selectedMonth);
  renderSelectedMonth();
  renderExpenses();
  updateSummary();
}

prevMonthButton.addEventListener('click', () => changeMonth(-1));
nextMonthButton.addEventListener('click', () => changeMonth(1));

expenseForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const amount = parseFloat(amountInput.value);
  const category = categoryInput.value;
  const date = dateInput.value;

  if (!date || isNaN(amount) || amount < 0 || !category.trim()) {
    return;
  }

  expenses.push({ date, category: category.trim(), amount: Number(amount.toFixed(2)) });
  saveExpenses();
  renderExpenses();
  updateSummary();

  amountInput.value = '';
  categoryInput.value = '';
  amountInput.focus();
});

renderSelectedMonth();
updateSummary();
renderExpenses();

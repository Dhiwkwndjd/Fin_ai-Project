import axiosInstance from "./axiosInstance";

export async function getAccounts() {
  const response = await axiosInstance.get("/accounts");
  return response.data;
}

export async function createAccount(values) {
  const response = await axiosInstance.post("/accounts", values);
  return response.data;
}

export async function updateAccount(accountId, values) {
  const response = await axiosInstance.put(`/accounts/${accountId}`, values);
  return response.data;
}

export async function deleteAccount(accountId) {
  await axiosInstance.delete(`/accounts/${accountId}`);
}

export async function getCategories() {
  const response = await axiosInstance.get("/categories");
  return response.data;
}

export async function createCategory(values) {
  const response = await axiosInstance.post("/categories", values);
  return response.data;
}

export async function updateCategory(categoryId, values) {
  const response = await axiosInstance.put(`/categories/${categoryId}`, values);
  return response.data;
}

export async function deleteCategory(categoryId) {
  await axiosInstance.delete(`/categories/${categoryId}`);
}

export async function createCommonCategory(values) {
  const response = await axiosInstance.post("/admin/categories", values);
  return response.data;
}

export async function updateCommonCategory(categoryId, values) {
  const response = await axiosInstance.put(`/admin/categories/${categoryId}`, values);
  return response.data;
}

export async function deleteCommonCategory(categoryId) {
  await axiosInstance.delete(`/admin/categories/${categoryId}`);
}

function convertTransactionValues(values) {
  return {
    account_id: values.accountId,
    category_id: values.categoryId,
    amount: values.amount,
    kind: values.kind,
    description: values.description,
    date: values.date,
  };
}

export async function createTransaction(values) {
  const response = await axiosInstance.post("/transactions", convertTransactionValues(values));
  return response.data;
}

export async function updateTransaction(transactionId, values) {
  const response = await axiosInstance.put(`/transactions/${transactionId}`, convertTransactionValues(values));
  return response.data;
}

export async function deleteTransaction(transactionId) {
  await axiosInstance.delete(`/transactions/${transactionId}`);
}

function convertBudgetValues(values) {
  return {
    category_id: values.categoryId,
    month: values.month,
    limit_amount: values.limitAmount,
  };
}

export async function createBudget(values) {
  const response = await axiosInstance.post("/budgets", convertBudgetValues(values));
  return response.data;
}

export async function updateBudget(budgetId, values) {
  const response = await axiosInstance.put(`/budgets/${budgetId}`, convertBudgetValues(values));
  return response.data;
}

export async function deleteBudget(budgetId) {
  await axiosInstance.delete(`/budgets/${budgetId}`);
}

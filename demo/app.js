const PAGE_SIZE = 10;
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "Aa123456"
};

const seedRecords = [
  {
    id: "seed-1",
    type: "CR",
    applicant: "张敏",
    projectCode: "ALPHA01",
    serial: 1,
    createdAt: "2026-04-08 09:15:00"
  },
  {
    id: "seed-2",
    type: "DCP",
    applicant: "李航",
    projectCode: "BETA88",
    serial: 12,
    createdAt: "2026-04-09 11:42:00"
  },
  {
    id: "seed-3",
    type: "CN",
    applicant: "王静",
    projectCode: "NOVA02",
    serial: 7,
    createdAt: "2026-04-09 16:20:00"
  }
];

const roleDescriptions = {
  admin: "管理员可以申请编号、查看记录并导出历史表单。",
  user: "普通账号可以申请编号和查看记录，但不能导出历史表单。"
};

const typeStyles = {
  CR: "CR 类",
  DCP: "DCP 类",
  CN: "CN 类"
};

const state = {
  role: "user",
  isAdminAuthenticated: false,
  records: loadRecords(),
  captcha: createCaptcha(),
  keyword: "",
  currentPage: 1
};

const applicationForm = document.getElementById("applicationForm");
const applicantNameInput = document.getElementById("applicantName");
const projectCodeInput = document.getElementById("projectCode");
const requestTypeInput = document.getElementById("requestType");
const captchaQuestionEl = document.getElementById("captchaQuestion");
const captchaAnswerInput = document.getElementById("captchaAnswer");
const resultCard = document.getElementById("resultCard");
const recordsTableBody = document.getElementById("recordsTableBody");
const statsGrid = document.getElementById("statsGrid");
const exportBtn = document.getElementById("exportBtn");
const permissionHint = document.getElementById("permissionHint");
const roleDescription = document.getElementById("roleDescription");
const searchInput = document.getElementById("searchInput");
const resetFormBtn = document.getElementById("resetFormBtn");
const roleButtons = document.querySelectorAll(".role-btn");
const adminLoginForm = document.getElementById("adminLoginForm");
const adminUsernameInput = document.getElementById("adminUsername");
const adminPasswordInput = document.getElementById("adminPassword");
const cancelAdminLoginBtn = document.getElementById("cancelAdminLoginBtn");
const adminSessionBar = document.getElementById("adminSessionBar");
const logoutAdminBtn = document.getElementById("logoutAdminBtn");
const actionHeader = document.getElementById("actionHeader");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const pageIndicator = document.getElementById("pageIndicator");
const paginationInfo = document.getElementById("paginationInfo");

function loadRecords() {
  const saved = localStorage.getItem("numbering-records");
  const records = saved ? JSON.parse(saved) : seedRecords;
  return records.map((record, index) => ({
    id: record.id || `record-${Date.now()}-${index}`,
    ...record
  }));
}

function saveRecords() {
  localStorage.setItem("numbering-records", JSON.stringify(state.records));
}

function createCaptcha() {
  const a = Math.floor(Math.random() * 8) + 1;
  const b = Math.floor(Math.random() * 8) + 1;
  return { a, b, answer: String(a + b) };
}

function refreshCaptcha() {
  state.captcha = createCaptcha();
  captchaQuestionEl.textContent = `${state.captcha.a} + ${state.captcha.b} = ?`;
  captchaAnswerInput.value = "";
}

function formatSerial(serial) {
  return String(serial).padStart(4, "0");
}

function formatNumber(record) {
  return `${record.type}-${record.projectCode}-${formatSerial(record.serial)}`;
}

function normalizeProjectCode(value) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
}

function getNextSerial(type, projectCode) {
  const related = state.records.filter(
    (item) => item.type === type && item.projectCode === projectCode
  );
  const maxSerial = related.reduce((max, item) => Math.max(max, item.serial), 0);
  return maxSerial + 1;
}

function showMessage(message, variant) {
  resultCard.textContent = message;
  resultCard.className = `result-card ${variant}`;
}

function isAdmin() {
  return state.role === "admin" && state.isAdminAuthenticated;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function getFilteredRecords() {
  const keyword = state.keyword.trim().toLowerCase();
  if (!keyword) return [...state.records].reverse();

  return [...state.records]
    .filter((record) => {
      const fullNumber = formatNumber(record).toLowerCase();
      return [
        record.applicant.toLowerCase(),
        record.projectCode.toLowerCase(),
        record.type.toLowerCase(),
        fullNumber
      ].some((field) => field.includes(keyword));
    })
    .reverse();
}

function getPaginationMeta(records) {
  const totalPages = Math.max(1, Math.ceil(records.length / PAGE_SIZE));
  state.currentPage = Math.min(state.currentPage, totalPages);
  state.currentPage = Math.max(state.currentPage, 1);

  const start = (state.currentPage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;

  return {
    totalPages,
    start,
    end,
    pageRecords: records.slice(start, end)
  };
}

function renderStats() {
  const totals = {
    total: state.records.length,
    CR: state.records.filter((item) => item.type === "CR").length,
    DCP: state.records.filter((item) => item.type === "DCP").length,
    CN: state.records.filter((item) => item.type === "CN").length
  };

  statsGrid.innerHTML = `
    <div class="stat-item">
      <span class="stat-label">总申请数</span>
      <span class="stat-value">${totals.total}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">CR 申请</span>
      <span class="stat-value">${totals.CR}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">DCP 申请</span>
      <span class="stat-value">${totals.DCP}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">CN 申请</span>
      <span class="stat-value">${totals.CN}</span>
    </div>
  `;
}

function renderTable() {
  const records = getFilteredRecords();
  const { totalPages, start, end, pageRecords } = getPaginationMeta(records);
  const adminMode = isAdmin();
  actionHeader.classList.toggle("hidden", !adminMode);

  if (!records.length) {
    recordsTableBody.innerHTML = `
      <tr>
        <td class="table-empty" colspan="${adminMode ? 6 : 5}">暂无匹配记录</td>
      </tr>
    `;
    paginationInfo.textContent = "当前没有可显示的数据";
    pageIndicator.textContent = "第 1 / 1 页";
    prevPageBtn.disabled = true;
    nextPageBtn.disabled = true;
    prevPageBtn.classList.add("disabled");
    nextPageBtn.classList.add("disabled");
    return;
  }

  recordsTableBody.innerHTML = pageRecords
    .map((record) => {
      return `
        <tr>
          <td>${record.createdAt}</td>
          <td>${record.applicant}</td>
          <td><span class="tag">${typeStyles[record.type]}</span></td>
          <td>${record.projectCode}</td>
          <td>${formatNumber(record)}</td>
          ${adminMode ? `<td class="action-cell"><button class="mini-btn delete" data-record-id="${record.id}" type="button">删除</button></td>` : ""}
        </tr>
      `;
    })
    .join("");

  paginationInfo.textContent = `显示第 ${start + 1}-${Math.min(end, records.length)} 条，共 ${records.length} 条`;
  pageIndicator.textContent = `第 ${state.currentPage} / ${totalPages} 页`;
  prevPageBtn.disabled = state.currentPage === 1;
  nextPageBtn.disabled = state.currentPage === totalPages;
  prevPageBtn.classList.toggle("disabled", prevPageBtn.disabled);
  nextPageBtn.classList.toggle("disabled", nextPageBtn.disabled);
}

function updateRoleUI() {
  const adminMode = isAdmin();
  roleButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.role === state.role);
  });

  exportBtn.disabled = !adminMode;
  exportBtn.classList.toggle("disabled", !adminMode);
  permissionHint.textContent = adminMode
    ? "管理员可导出全部申请记录。"
    : "当前是普通账号，导出功能已禁用。";
  roleDescription.textContent = adminMode ? roleDescriptions.admin : roleDescriptions.user;
  adminLoginForm.classList.toggle("hidden", state.role !== "admin" || state.isAdminAuthenticated);
  adminSessionBar.classList.toggle("hidden", !adminMode);
  renderTable();
}

function exportRecords() {
  if (!isAdmin()) {
    showMessage("普通账号没有导出权限，请切换为管理员账号后重试。", "error");
    return;
  }

  const header = ["申请时间", "申请人", "类型", "项目代号", "已申请编号"];
  const rows = state.records.map((record) => [
    record.createdAt,
    record.applicant,
    record.type,
    record.projectCode,
    formatNumber(record)
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `编号申请历史_${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);

  showMessage("历史记录已导出为 CSV 文件。", "success");
}

function handleSubmit(event) {
  event.preventDefault();

  const applicant = applicantNameInput.value.trim();
  const projectCode = normalizeProjectCode(projectCodeInput.value);
  const type = requestTypeInput.value;
  const captchaAnswer = captchaAnswerInput.value.trim();

  if (!applicant || !projectCode) {
    showMessage("请完整填写申请人和项目代号。", "error");
    return;
  }

  if (captchaAnswer !== state.captcha.answer) {
    showMessage("提交验证失败，请重新输入正确答案。", "error");
    refreshCaptcha();
    captchaAnswerInput.focus();
    return;
  }

  const serial = getNextSerial(type, projectCode);
  const newRecord = {
    id: crypto.randomUUID ? crypto.randomUUID() : `record-${Date.now()}`,
    type,
    applicant,
    projectCode,
    serial,
    createdAt: formatDate(new Date())
  };

  state.records.push(newRecord);
  state.currentPage = 1;
  saveRecords();
  renderStats();
  renderTable();
  showMessage(`申请成功，已生成编号：${formatNumber(newRecord)}`, "success");

  applicationForm.reset();
  requestTypeInput.value = type;
  refreshCaptcha();
}

function initializeRoleEvents() {
  roleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.role === "user") {
        state.role = "user";
        state.isAdminAuthenticated = false;
        adminLoginForm.reset();
        updateRoleUI();
        showMessage("已切换为普通账号。", "success");
        return;
      }

      state.role = "admin";
      state.isAdminAuthenticated = false;
      adminLoginForm.classList.remove("hidden");
      adminUsernameInput.focus();
      updateRoleUI();
      showMessage("请输入管理员用户名和密码后登录。", "success");
    });
  });
}

function handleAdminLogin(event) {
  event.preventDefault();

  const username = adminUsernameInput.value.trim();
  const password = adminPasswordInput.value;

  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    state.role = "admin";
    state.isAdminAuthenticated = true;
    adminLoginForm.reset();
    updateRoleUI();
    showMessage("管理员登录成功，已开启导出和删除权限。", "success");
    return;
  }

  state.role = "user";
  state.isAdminAuthenticated = false;
  adminLoginForm.reset();
  updateRoleUI();
  showMessage("管理员账号或密码错误，已返回普通账号。", "error");
}

function handleDeleteRecord(recordId) {
  if (!isAdmin()) {
    showMessage("只有管理员可以删除历史记录。", "error");
    return;
  }

  const record = state.records.find((item) => item.id === recordId);
  if (!record) {
    showMessage("未找到要删除的记录。", "error");
    return;
  }

  const confirmed = window.confirm(
    `确认删除这条记录吗？\n申请人：${record.applicant}\n编号：${formatNumber(record)}\n删除后将无法恢复。`
  );

  if (!confirmed) {
    showMessage("已取消删除操作。", "success");
    return;
  }

  state.records = state.records.filter((item) => item.id !== recordId);
  saveRecords();
  renderStats();
  renderTable();
  showMessage(`记录已删除：${formatNumber(record)}`, "success");
}

applicationForm.addEventListener("submit", handleSubmit);
adminLoginForm.addEventListener("submit", handleAdminLogin);
exportBtn.addEventListener("click", exportRecords);
searchInput.addEventListener("input", (event) => {
  state.keyword = event.target.value;
  state.currentPage = 1;
  renderTable();
});
resetFormBtn.addEventListener("click", () => {
  applicationForm.reset();
  refreshCaptcha();
  showMessage("表单已重置，可以重新申请编号。", "success");
});
cancelAdminLoginBtn.addEventListener("click", () => {
  state.role = "user";
  state.isAdminAuthenticated = false;
  adminLoginForm.reset();
  updateRoleUI();
  showMessage("已取消管理员登录，当前为普通账号。", "success");
});
logoutAdminBtn.addEventListener("click", () => {
  state.role = "user";
  state.isAdminAuthenticated = false;
  updateRoleUI();
  showMessage("管理员已退出，当前为普通账号。", "success");
});
prevPageBtn.addEventListener("click", () => {
  if (state.currentPage > 1) {
    state.currentPage -= 1;
    renderTable();
  }
});
nextPageBtn.addEventListener("click", () => {
  const totalPages = Math.max(1, Math.ceil(getFilteredRecords().length / PAGE_SIZE));
  if (state.currentPage < totalPages) {
    state.currentPage += 1;
    renderTable();
  }
});
recordsTableBody.addEventListener("click", (event) => {
  const button = event.target.closest("[data-record-id]");
  if (!button) return;
  handleDeleteRecord(button.dataset.recordId);
});

initializeRoleEvents();
refreshCaptcha();
renderStats();
renderTable();
updateRoleUI();

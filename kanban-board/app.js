// 数据管理
const STORAGE_KEY = 'kanban-board-data';
const LANG_STORAGE_KEY = 'kanban-board-lang';

// 语言配置
const translations = {
    zh: {
        app: {
            title: '📋 待办事项看板'
        },
        button: {
            addTask: '➕ 添加任务',
            export: '📤 导出',
            save: '保存',
            cancel: '取消',
            delete: '删除',
            edit: '编辑',
            close: '关闭'
        },
        column: {
            todo: '待办',
            inProgress: '进行中',
            done: '已完成'
        },
        form: {
            title: '标题',
            description: '描述',
            dueDate: '截止日期',
            priority: '优先级',
            tags: '标签（用逗号分隔）',
            tagsPlaceholder: '前端, 设计',
            selectDate: '选择日期',
            required: '（必填）',
            addTask: '添加任务',
            editTask: '编辑任务'
        },
        datePicker: {
            sun: '日',
            mon: '一',
            tue: '二',
            wed: '三',
            thu: '四',
            fri: '五',
            sat: '六',
            january: '1月',
            february: '2月',
            march: '3月',
            april: '4月',
            may: '5月',
            june: '6月',
            july: '7月',
            august: '8月',
            september: '9月',
            october: '10月',
            november: '11月',
            december: '12月'
        },
        priority: {
            low: '低',
            medium: '中',
            high: '高'
        },
        message: {
            taskCreated: '任务已创建',
            taskUpdated: '任务已更新',
            taskDeleted: '任务已删除',
            taskMoved: '任务已移动',
            titleRequired: '请填写标题内容',
            dataExported: '数据已导出',
            emptyState: '暂无任务'
        },
        confirm: {
            deleteTask: '确定要删除这个任务吗？',
            deleteTaskTitle: '确定要删除任务"{title}"吗？'
        }
    },
    en: {
        app: {
            title: '📋 Kanban Board'
        },
        button: {
            addTask: '➕ Add Task',
            export: '📤 Export',
            save: 'Save',
            cancel: 'Cancel',
            delete: 'Delete',
            edit: 'Edit',
            close: 'Close'
        },
        column: {
            todo: 'To Do',
            inProgress: 'In Progress',
            done: 'Done'
        },
        form: {
            title: 'Title',
            description: 'Description',
            dueDate: 'Due Date',
            priority: 'Priority',
            tags: 'Tags (comma separated)',
            tagsPlaceholder: 'Frontend, Design',
            selectDate: 'Select Date',
            required: ' (required)',
            addTask: 'Add Task',
            editTask: 'Edit Task'
        },
        datePicker: {
            sun: 'Sun',
            mon: 'Mon',
            tue: 'Tue',
            wed: 'Wed',
            thu: 'Thu',
            fri: 'Fri',
            sat: 'Sat',
            january: 'January',
            february: 'February',
            march: 'March',
            april: 'April',
            may: 'May',
            june: 'June',
            july: 'July',
            august: 'August',
            september: 'September',
            october: 'October',
            november: 'November',
            december: 'December'
        },
        priority: {
            low: 'Low',
            medium: 'Medium',
            high: 'High'
        },
        message: {
            taskCreated: 'Task created',
            taskUpdated: 'Task updated',
            taskDeleted: 'Task deleted',
            taskMoved: 'Task moved',
            titleRequired: 'Please enter title',
            dataExported: 'Data exported',
            emptyState: 'No tasks'
        },
        confirm: {
            deleteTask: 'Are you sure you want to delete this task?',
            deleteTaskTitle: 'Are you sure you want to delete task "{title}"?'
        }
    }
};

let currentLang = localStorage.getItem(LANG_STORAGE_KEY) || 'en';

// 切换语言
function toggleLanguage() {
    currentLang = currentLang === 'zh' ? 'en' : 'zh';
    localStorage.setItem(LANG_STORAGE_KEY, currentLang);
    updateLanguage();
}

// 更新页面语言
function updateLanguage() {
    // 更新所有带有 data-i18n 属性的元素
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = getTranslation(key);
        if (translation) {
            element.textContent = translation;
        }
    });

    // 更新所有带有 data-i18n-placeholder 属性的元素
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        const translation = getTranslation(key);
        if (translation) {
            element.placeholder = translation;
        }
    });

    // 更新所有带有 data-i18n-aria 属性的元素
    document.querySelectorAll('[data-i18n-aria]').forEach(element => {
        const key = element.getAttribute('data-i18n-aria');
        const translation = getTranslation(key);
        if (translation) {
            element.setAttribute('aria-label', translation);
        }
    });

    // 更新 select 下拉框的选项
    document.querySelectorAll('select[data-i18n-options]').forEach(select => {
        const optionsKey = select.getAttribute('data-i18n-options');
        select.querySelectorAll('option').forEach(option => {
            const value = option.value;
            const key = `${optionsKey}.${value}`;
            const translation = getTranslation(key);
            if (translation) {
                option.textContent = translation;
            }
        });
    });

    // 更新所有 select 下的 option (通过 data-i18n 属性)
    document.querySelectorAll('option[data-i18n]').forEach(option => {
        const key = option.getAttribute('data-i18n');
        const translation = getTranslation(key);
        if (translation) {
            option.textContent = translation;
        }
    });

    // 更新 HTML lang 属性
    document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';

    // 重新渲染看板以更新动态内容
    renderBoard();

    // 更新日期选择器的月份标题
    const customDatePicker = document.getElementById('customDatePicker');
    if (customDatePicker && customDatePicker.classList.contains('show')) {
        renderCalendar(currentMonth, currentYear);
    }
}

// 获取翻译文本
function getTranslation(key) {
    const keys = key.split('.');
    let value = translations[currentLang];
    for (const k of keys) {
        value = value?.[k];
    }
    return value;
}

// 格式化翻译（支持变量替换）
function t(key, params = {}) {
    let text = getTranslation(key);
    if (text && params) {
        Object.keys(params).forEach(param => {
            text = text.replace(`{${param}}`, params[param]);
        });
    }
    return text || key;
}

// 检查 LocalStorage 是否可用
function isLocalStorageAvailable() {
    try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

// 显示 LocalStorage 不可用警告
function showStorageWarning() {
    const warning = document.createElement('div');
    warning.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #ff9800;
        color: white;
        padding: 15px;
        text-align: center;
        z-index: 9999;
        font-weight: 500;
    `;
    warning.textContent = '⚠️ 警告：无法访问本地存储，数据不会保存';

    document.body.insertBefore(warning, document.body.firstChild);
}

// 获取数据
function getData() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
        return { tasks: [], version: '1.0.0' };
    }
    try {
        return JSON.parse(data);
    } catch (error) {
        console.error('数据解析失败:', error);
        return { tasks: [], version: '1.0.0' };
    }
}

// 保存数据
function saveData(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('数据保存失败:', error);
        showToast('数据保存失败', 'error');
        return false;
    }
}

// 提示消息
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, type === 'success' ? 3000 : type === 'warning' ? 4000 : 5000);
}

// 获取优先级文本
function getPriorityText(priority) {
    return t(`priority.${priority}`);
}

// 创建任务卡片 HTML
function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.draggable = true;
    card.dataset.taskId = task.id;

    // 设置优先级 data 属性（用于左侧彩色条）
    if (task.priority) {
        card.dataset.priority = task.priority;
    }

    // 拖拽开始事件
    card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', task.id);
        card.classList.add('dragging');
    });

    card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
    });

    // 标签
    let tagsHtml = '';
    if (task.tags && task.tags.length > 0) {
        tagsHtml = `<div class="task-tags">
            ${task.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
        </div>`;
    }

    // 卡片底部元数据（优先级和截止日期）
    let metaHtml = '<div class="task-footer">';

    // 优先级文字
    if (task.priority) {
        const priorityText = getPriorityText(task.priority);
        const priorityLabel = t('form.priority');
        metaHtml += `<span class="task-priority-text" data-priority="${task.priority}">${priorityLabel}：${priorityText}</span>`;
    }

    // 截止日期（右侧）
    if (task.dueDate) {
        metaHtml += `<span class="task-due-date">📅 ${escapeHtml(task.dueDate)}</span>`;
    }

    metaHtml += '</div>';

    card.innerHTML = `
        <button class="card-delete-btn" data-task-id="${task.id}" aria-label="${t('button.delete')}">×</button>
        ${tagsHtml}
        <div class="task-title">${escapeHtml(task.title)}</div>
        ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
        ${metaHtml}
    `;

    // 删除按钮事件
    const deleteBtn = card.querySelector('.card-delete-btn');
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // 阻止事件冒泡，避免触发卡片点击
        if (confirm(t('confirm.deleteTaskTitle', { title: task.title }))) {
            deleteTask(task.id);
        }
    });

    return card;
}

// HTML 转义，防止 XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 渲染看板
function renderBoard() {
    const data = getData();
    const tasks = data.tasks || [];

    // 按 status 分组
    const todoTasks = tasks.filter(t => t.status === 'todo');
    const inProgressTasks = tasks.filter(t => t.status === 'inProgress');
    const doneTasks = tasks.filter(t => t.status === 'done');

    // 对每列任务进行排序
    const sortedTodoTasks = sortTasks(todoTasks);
    const sortedInProgressTasks = sortTasks(inProgressTasks);
    const sortedDoneTasks = sortTasks(doneTasks);

    // 渲染每列
    renderColumn('todo-tasks', 'todo-count', sortedTodoTasks);
    renderColumn('inprogress-tasks', 'inprogress-count', sortedInProgressTasks);
    renderColumn('done-tasks', 'done-count', sortedDoneTasks);

    // 设置拖拽
    setupDragAndDrop();
}

// 任务排序：先按截止日期升序，再按优先级排序
function sortTasks(tasks) {
    return [...tasks].sort((a, b) => {
        // 优先级权重
        const priorityWeight = {
            'high': 3,
            'medium': 2,
            'low': 1,
            'undefined': 0
        };

        const aPriority = priorityWeight[a.priority] || 0;
        const bPriority = priorityWeight[b.priority] || 0;

        // 如果有截止日期，先按截止日期升序排列
        if (a.dueDate && b.dueDate) {
            const dateCompare = new Date(a.dueDate) - new Date(b.dueDate);
            if (dateCompare !== 0) return dateCompare;
            // 日期相同，按优先级排序
            return bPriority - aPriority;
        } else if (a.dueDate && !b.dueDate) {
            return -1; // 有截止日期的排前面
        } else if (!a.dueDate && b.dueDate) {
            return 1; // 有截止日期的排前面
        } else {
            // 都没有截止日期，只按优先级排序
            return bPriority - aPriority;
        }
    });
}

// 渲染单列
function renderColumn(containerId, countId, tasks) {
    const container = document.getElementById(containerId);
    const countEl = document.getElementById(countId);

    // 更新计数
    countEl.textContent = tasks.length;

    // 清空容器
    container.innerHTML = '';

    // 渲染任务卡片
    if (tasks.length === 0) {
        container.innerHTML = `<div class="empty-state">${t('message.emptyState')}</div>`;
    } else {
        tasks.forEach(task => {
            const card = createTaskCard(task);
            container.appendChild(card);
        });
    }
}

// 设置拖拽功能
function setupDragAndDrop() {
    const columns = document.querySelectorAll('.column');

    columns.forEach(column => {
        // 拖拽悬停
        column.addEventListener('dragover', (e) => {
            e.preventDefault();
            column.classList.add('drag-over');
        });

        // 拖拽离开
        column.addEventListener('dragleave', () => {
            column.classList.remove('drag-over');
        });

        // 放置
        column.addEventListener('drop', (e) => {
            e.preventDefault();
            column.classList.remove('drag-over');
            column.style.backgroundColor = '';

            const taskId = e.dataTransfer.getData('text/plain');
            const newStatus = column.dataset.status;

            if (taskId && newStatus) {
                moveTaskToStatus(taskId, newStatus);
            }
        });
    });

    // 任务卡片点击事件
    document.querySelectorAll('.task-card').forEach(card => {
        card.addEventListener('click', () => {
            const taskId = card.dataset.taskId;
            openEditModal(taskId);
        });
    });
}

// 移动任务到新状态
function moveTaskToStatus(taskId, newStatus) {
    const data = getData();
    const task = data.tasks.find(t => t.id === taskId);

    if (task && task.status !== newStatus) {
        task.status = newStatus;
        task.updatedAt = new Date().toISOString();

        if (saveData(data)) {
            renderBoard();
            showToast(t('message.taskMoved'));
        }
    }
}

// 打开任务模态框（直接编辑模式）
function openEditModal(taskId) {
    const data = getData();
    const task = data.tasks.find(t => t.id === taskId);

    if (!task) {
        showToast('Task not found', 'error');
        return;
    }

    // 显示编辑头部，隐藏预览头部
    document.getElementById('editHeader').style.display = 'flex';
    document.getElementById('previewHeader').style.display = 'none';

    // 设置标题
    document.getElementById('modalTitle').textContent = t('form.editTask');

    // 隐藏预览模式，显示编辑模式
    document.getElementById('taskPreview').style.display = 'none';
    document.getElementById('taskForm').style.display = 'block';

    // 填充表单数据
    document.getElementById('taskId').value = task.id;
    document.getElementById('title').value = task.title || '';
    document.getElementById('description').value = task.description || '';
    document.getElementById('dueDate').value = task.dueDate || '';
    document.getElementById('priority').value = task.priority || 'medium';
    document.getElementById('tags').value = task.tags ? task.tags.join(', ') : '';

    document.getElementById('taskModal').classList.add('show');
}

// 删除任务
function deleteTask(taskId) {
    if (!confirm(t('confirm.deleteTask'))) {
        return;
    }

    const data = getData();
    const initialLength = data.tasks.length;
    data.tasks = data.tasks.filter(t => t.id !== taskId);

    if (data.tasks.length < initialLength) {
        if (saveData(data)) {
            renderBoard();
            closeModal('taskModal');
            showToast(t('message.taskDeleted'));
        }
    } else {
        showToast('Task not found', 'error');
    }
}

// 导出数据
function exportData() {
    const data = getData();

    // 创建 JSON 字符串
    const jsonString = JSON.stringify(data, null, 2);

    // 创建 Blob
    const blob = new Blob([jsonString], { type: 'application/json' });

    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    // 生成文件名（带日期）
    const date = new Date().toISOString().split('T')[0];
    a.download = `kanban-backup-${date}.json`;

    // 触发下载
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // 释放 URL
    URL.revokeObjectURL(url);

    showToast(t('message.dataExported'));
}

// 打开创建任务模态框
function openCreateModal() {
    // 显示编辑头部，隐藏预览头部
    document.getElementById('editHeader').style.display = 'flex';
    document.getElementById('previewHeader').style.display = 'none';

    document.getElementById('modalTitle').textContent = t('form.addTask');

    // 隐藏预览模式
    document.getElementById('taskPreview').style.display = 'none';
    document.getElementById('taskForm').style.display = 'block';

    document.getElementById('taskForm').reset();
    document.getElementById('taskId').value = '';

    // 设置截止日期默认为当天
    selectedDate = new Date();
    const today = formatDate(selectedDate);
    document.getElementById('dueDate').value = today;

    // 隐藏编辑和删除按钮
    document.getElementById('editTaskBtn').style.display = 'none';
    document.getElementById('deleteTaskBtn').style.display = 'none';

    document.getElementById('taskModal').classList.add('show');
}

// 关闭模态框
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

// 处理表单提交
function handleTaskSubmit(e) {
    e.preventDefault();

    const taskId = document.getElementById('taskId').value;
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const dueDate = document.getElementById('dueDate').value;
    const priority = document.getElementById('priority').value;
    const tagsInput = document.getElementById('tags').value.trim();

    // 清除之前的错误状态
    document.getElementById('titleGroup').classList.remove('has-error');

    // 验证标题
    if (!title) {
        document.getElementById('titleGroup').classList.add('has-error');
        return;
    }

    // 更新错误提示
    document.getElementById('titleError').textContent = t('message.titleRequired');

    // 解析标签
    const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];

    const data = getData();

    if (taskId) {
        // 编辑现有任务
        const taskIndex = data.tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            data.tasks[taskIndex] = {
                ...data.tasks[taskIndex],
                title,
                description,
                dueDate,
                priority,
                tags,
                updatedAt: new Date().toISOString()
            };
            showToast(t('message.taskUpdated'));
        }
    } else {
        // 创建新任务
        const newTask = {
            id: `task-${Date.now()}`,
            title,
            description,
            status: 'todo',
            priority,
            dueDate,
            tags,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        data.tasks.push(newTask);
        showToast(t('message.taskCreated'));
    }

    saveData(data);
    renderBoard();
    closeModal('taskModal');
}

// 事件监听器
function setupEventListeners() {
    // 添加任务按钮
    document.getElementById('addTaskBtn').addEventListener('click', openCreateModal);

    // 导出按钮
    document.getElementById('exportBtn').addEventListener('click', exportData);

    // 表单提交
    document.getElementById('taskForm').addEventListener('submit', handleTaskSubmit);

    // 标题输入时清除错误状态
    document.getElementById('title').addEventListener('input', () => {
        document.getElementById('titleGroup').classList.remove('has-error');
    });

    // 预览模式的编辑按钮
    document.getElementById('previewEditBtn').addEventListener('click', () => {
        const taskId = document.getElementById('previewEditBtn').dataset.taskId;
        if (taskId) {
            switchToEditMode(taskId);
        }
    });

    // 编辑任务按钮
    document.getElementById('editTaskBtn').addEventListener('click', () => {
        const taskId = document.getElementById('editTaskBtn').dataset.taskId;
        if (taskId) {
            switchToEditMode(taskId);
        }
    });

    // 删除任务按钮
    document.getElementById('deleteTaskBtn').addEventListener('click', () => {
        const taskId = document.getElementById('deleteTaskBtn').dataset.taskId;
        if (taskId) {
            deleteTask(taskId);
        }
    });

    // 关闭按钮
    document.querySelectorAll('.close, .close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.classList.remove('show');
            }
        });
    });

    // 点击遮罩层关闭
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    });

    // ESC 键关闭
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.show').forEach(modal => {
                modal.classList.remove('show');
            });
        }
    });

    // 日期选择器相关
    setupDatePicker();
}

// ===== 自定义日期选择器功能 =====

let currentDate = new Date();
let selectedDate = null;
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

function setupDatePicker() {
    const datePickerBtn = document.getElementById('datePickerBtn');
    const dateInput = document.getElementById('dueDate');
    const customDatePicker = document.getElementById('customDatePicker');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');

    // 点击按钮显示/隐藏日期选择器
    datePickerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        customDatePicker.classList.toggle('show');
        renderCalendar(currentMonth, currentYear);
    });

    // 点击输入框也显示日期选择器
    dateInput.addEventListener('click', (e) => {
        e.stopPropagation();
        customDatePicker.classList.add('show');
        renderCalendar(currentMonth, currentYear);
    });

    // 点击其他地方关闭日期选择器
    document.addEventListener('click', (e) => {
        if (!customDatePicker.contains(e.target) && e.target !== datePickerBtn && e.target !== dateInput) {
            customDatePicker.classList.remove('show');
        }
    });

    // 上下月切换
    prevMonthBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar(currentMonth, currentYear);
    });

    nextMonthBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar(currentMonth, currentYear);
    });
}

function renderCalendar(month, year) {
    const pickerDays = document.getElementById('pickerDays');
    const pickerTitle = document.getElementById('pickerTitle');

    // 更新标题 - 使用翻译
    const monthNames = [
        getTranslation('datePicker.january'),
        getTranslation('datePicker.february'),
        getTranslation('datePicker.march'),
        getTranslation('datePicker.april'),
        getTranslation('datePicker.may'),
        getTranslation('datePicker.june'),
        getTranslation('datePicker.july'),
        getTranslation('datePicker.august'),
        getTranslation('datePicker.september'),
        getTranslation('datePicker.october'),
        getTranslation('datePicker.november'),
        getTranslation('datePicker.december')
    ];

    if (currentLang === 'zh') {
        pickerTitle.textContent = `${year}年${month + 1}月`;
    } else {
        pickerTitle.textContent = `${monthNames[month]} ${year}`;
    }

    // 清空日期
    pickerDays.innerHTML = '';

    // 获取当月第一天和最后一天
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay(); // 0 是周日
    const totalDays = lastDay.getDate();

    // 获取上月最后几天
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    // 填充上月的日期
    for (let i = startingDay - 1; i >= 0; i--) {
        const day = prevMonthLastDay - i;
        const dayBtn = createDayButton(day, 'other-month');
        dayBtn.addEventListener('click', () => selectDate(year, month - 1, day));
        pickerDays.appendChild(dayBtn);
    }

    // 填充当月的日期
    const today = new Date();
    for (let day = 1; day <= totalDays; day++) {
        let className = 'picker-day';

        // 检查是否是今天
        if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
            className += ' today';
        }

        // 检查是否被选中
        if (selectedDate && year === selectedDate.getFullYear() && month === selectedDate.getMonth() && day === selectedDate.getDate()) {
            className += ' selected';
        }

        const dayBtn = createDayButton(day, className);
        dayBtn.addEventListener('click', () => selectDate(year, month, day));
        pickerDays.appendChild(dayBtn);
    }

    // 填充下月的日期（补齐到35天，5行）
    const remainingDays = 35 - (startingDay + totalDays);
    for (let day = 1; day <= remainingDays; day++) {
        const dayBtn = createDayButton(day, 'other-month');
        dayBtn.addEventListener('click', () => selectDate(year, month + 1, day));
        pickerDays.appendChild(dayBtn);
    }
}

function createDayButton(day, className) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = day;
    return button;
}

function selectDate(year, month, day) {
    selectedDate = new Date(year, month, day);

    // 格式化日期为 YYYY-MM-DD
    const formattedDate = formatDate(selectedDate);

    // 更新输入框
    document.getElementById('dueDate').value = formattedDate;

    // 隐藏日期选择器
    document.getElementById('customDatePicker').classList.remove('show');

    // 重新渲染日历以显示选中状态
    renderCalendar(selectedDate.getMonth(), selectedDate.getFullYear());
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 初始化应用
function initApp() {
    console.log('看板应用初始化');

    // 检查 LocalStorage
    if (!isLocalStorageAvailable()) {
        showStorageWarning();
        return;
    }

    // 设置初始语言
    updateLanguage();

    renderBoard();
    setupEventListeners();
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initApp);

// Listen for language change messages from parent window
window.addEventListener('message', (event) => {
    console.log('Kanban Board received message:', event.data);
    if (event.data.type === 'languageChange') {
        const newLanguage = event.data.language;
        console.log('Kanban Board language change requested:', newLanguage, 'current:', currentLang);
        if (newLanguage && newLanguage !== currentLang) {
            currentLang = newLanguage;
            localStorage.setItem(LANG_STORAGE_KEY, currentLang);
            console.log('Kanban Board updating language to:', currentLang);
            updateLanguage();
        }
    }
});

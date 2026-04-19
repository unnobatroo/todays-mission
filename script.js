const DEFAULT_ACTIVITIES = [
    "Go out for a walk.", "Read a book.", "Watch a TV show.", "Make a new recipe.",
    "Join a workout class.", "Write a letter to your future self.", "Do the house chores.",
    "Laundry.", "Make a vision board.", "Organize your space.", "Meal prep.", "Meditate.",
    "Listen to a podcast.", "Get a massage.", "Accomplish a to-do list.", "Create a music playlist.",
    "Join a cooking/baking class.", "Go to the gym.", "Fix your resume.", "Re-decorate your home.",
    "Try a new hairstyle.", "Wash your car.", "Make yummy snacks.", "Play music.",
    "Do a face mask.", "Organize your closet.", "Do a hair mask.", "Learn a new language.",
    "Write a journal.", "Online shopping.", "Have a pamper day.", "Call your parents.",
    "Bake something.", "Start a free course.", "Work on your current goals.",
    "Declutter your email inbox.", "Go out for a coffee.", "Drive to a nice lookout.",
    "Plan your upcoming week.", "Catch up on some sleep.", "Donate to charity.",
    "Treat yourself with good food.", "Backup your phone/computer.", "Watch a TED talk.",
    "Go for a bike ride.", "Weed your garden.", "Join a book club.", "Watch a movie at the cinema.",
    "Spend time around animals.", "Visit a forest.", "Turn off your phone.", "Burn a nice smelling candle.",
    "Learn how to knit.", "Reorganize your kitchen cabinet.", "Play dress up."
];

const STORAGE_KEYS = {
    savedActivities: "savedActivities",
    currentActivity: "currentActivity",
    theme: "theme"
};

const dom = {
    body: document.body,
    activity: document.getElementById("activity"),
    newActivity: document.getElementById("newActivity"),
    addedActivities: document.getElementById("addedActivities"),
    alert: document.getElementById("alert"),
    themeIcon: document.getElementById("theme-icon"),
    themeToggle: document.getElementById("themeToggle"),
    deleteCurrentBtn: document.getElementById("deleteCurrentBtn"),
    randomTaskBtn: document.getElementById("randomTaskBtn"),
    uploadTaskBtn: document.getElementById("uploadTaskBtn"),
    purgeTasksBtn: document.getElementById("purgeTasksBtn")
};

let activities = [...DEFAULT_ACTIVITIES];
let userActivities = [];
let hideAlertTimer;

const safeParseArray = (value) => {
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const saveUserActivities = () => {
    localStorage.setItem(STORAGE_KEYS.savedActivities, JSON.stringify(userActivities));
};

const refreshActivities = () => {
    activities = DEFAULT_ACTIVITIES.concat(userActivities);
};

const setThemeIcon = (theme) => {
    dom.themeIcon.className = theme === "j-mode" ? "fa-solid fa-book" : "fa-solid fa-heart";
};

const setActivity = (task) => {
    dom.activity.textContent = task;
    localStorage.setItem(STORAGE_KEYS.currentActivity, task);
};

const showNoActivities = () => {
    dom.activity.textContent = "No activities left.";
};

const randomActivity = () => {
    if (activities.length === 0) {
        showNoActivities();
        return;
    }
    const randomTask = activities[Math.floor(Math.random() * activities.length)];
    setActivity(randomTask);
};

const showAlert = (message) => {
    dom.alert.textContent = message;
    dom.alert.style.display = "block";
    dom.alert.style.background = getComputedStyle(dom.body).getPropertyValue("--primary-color");

    clearTimeout(hideAlertTimer);
    hideAlertTimer = setTimeout(() => {
        dom.alert.style.display = "none";
    }, 2000);
};

const renderUserActivities = () => {
    dom.addedActivities.innerHTML = "";
    const fragment = document.createDocumentFragment();

    userActivities.forEach((task) => {
        const li = document.createElement("li");
        li.dataset.task = task;

        const label = document.createElement("span");
        label.textContent = task;

        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.textContent = "X";
        deleteBtn.className = "delete";
        deleteBtn.dataset.action = "delete";

        li.appendChild(label);
        li.appendChild(deleteBtn);
        fragment.appendChild(li);
    });

    dom.addedActivities.appendChild(fragment);
};

const removeUserActivity = (task) => {
    userActivities = userActivities.filter((item) => item !== task);
    refreshActivities();
    saveUserActivities();
    renderUserActivities();

    if (dom.activity.textContent === task) {
        randomActivity();
    }
};

const removeActivity = () => {
    const currentTask = dom.activity.textContent;

    if (!userActivities.includes(currentTask)) {
        showAlert("You can't delete default activities.");
        return;
    }

    removeUserActivity(currentTask);

    if (userActivities.length > 0) {
        setActivity(userActivities[0]);
    } else {
        showNoActivities();
    }
};

const addCustomActivity = () => {
    const task = dom.newActivity.value.trim();

    if (!task) {
        showAlert("Please enter a valid task.");
        return;
    }

    if (activities.includes(task)) {
        showAlert("Task already exists!");
        return;
    }

    userActivities.push(task);
    refreshActivities();
    saveUserActivities();
    renderUserActivities();
    setActivity(task);
    showAlert("Task uploaded successfully.");
    dom.newActivity.value = "";
};

const removeAddedActivities = () => {
    userActivities = [];
    refreshActivities();
    localStorage.removeItem(STORAGE_KEYS.savedActivities);
    renderUserActivities();
};

const toggleTheme = () => {
    const currentTheme = dom.body.getAttribute("data-theme");
    const newTheme = currentTheme === "j-mode" ? "s-mode" : "j-mode";
    dom.body.setAttribute("data-theme", newTheme);
    localStorage.setItem(STORAGE_KEYS.theme, newTheme);
    setThemeIcon(newTheme);
};

const loadTheme = () => {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.theme) || "j-mode";
    dom.body.setAttribute("data-theme", savedTheme);
    setThemeIcon(savedTheme);
};

const loadActivities = () => {
    userActivities = safeParseArray(localStorage.getItem(STORAGE_KEYS.savedActivities));
    refreshActivities();
    renderUserActivities();

    const savedCurrent = localStorage.getItem(STORAGE_KEYS.currentActivity);
    if (savedCurrent && activities.includes(savedCurrent)) {
        setActivity(savedCurrent);
        return;
    }

    if (activities.length > 0) {
        setActivity(activities[0]);
        return;
    }

    showNoActivities();
};

const attachEvents = () => {
    dom.themeToggle.addEventListener("click", toggleTheme);
    dom.deleteCurrentBtn.addEventListener("click", removeActivity);
    dom.randomTaskBtn.addEventListener("click", randomActivity);
    dom.uploadTaskBtn.addEventListener("click", addCustomActivity);
    dom.purgeTasksBtn.addEventListener("click", removeAddedActivities);

    dom.newActivity.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            addCustomActivity();
        }
    });

    dom.addedActivities.addEventListener("click", (event) => {
        const listItem = event.target.closest("li");
        if (!listItem) return;

        const task = listItem.dataset.task;
        if (!task) return;

        if (event.target.closest("button[data-action='delete']")) {
            removeUserActivity(task);
            return;
        }

        setActivity(task);
    });
};

const init = () => {
    loadTheme();
    loadActivities();
    attachEvents();
};

init();

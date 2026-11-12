const path = require("node:path");
const PROJECT_ROOT = path.resolve(__dirname, "..");
const fs = require("fs"),
  vm = require("vm"),
  assert = require("assert");
const nodes = new Map(),
  storage = new Map(),
  checked = {};
function node(s) {
  if (!nodes.has(s))
    nodes.set(s, {
      innerHTML: "",
      textContent: "",
      value: "",
      style: {},
      dataset: {},
      open: false,
      classList: { toggle() {}, add() {} },
      querySelectorAll: () => [],
      querySelector: () => ({ value: "test" }),
      showModal() {
        this.open = true;
      },
      close() {
        this.open = false;
      },
      focus() {},
      setSelectionRange() {},
    });
  return nodes.get(s);
}
const ctx = {
  structuredClone,
  document: { querySelector: node, querySelectorAll: (s) => checked[s] || [] },
  localStorage: {
    getItem: (k) => storage.get(k),
    setItem: (k, v) => storage.set(k, v),
    removeItem: (k) => storage.delete(k),
  },
  location: { hash: "" },
  history: { replaceState() {} },
  window: { addEventListener() {}, scrollTo() {} },
  clearTimeout() {},
  setTimeout() {},
  confirm: () => false,
  Blob,
  URL,
};
vm.createContext(ctx);
vm.runInContext(
  fs.readFileSync(path.join(PROJECT_ROOT, "dist/app.js"), "utf8"),
  ctx,
);
const run = (s) => vm.runInContext(s, ctx);
for (const p of ["home", "library", "schedule"]) {
  run(`page='${p}';render()`);
  assert(node("#content").innerHTML.length > 500);
}
for (const id of ["stats", "english", "python"])
  for (const t of ["overview", "sources", "path", "study", "practice"]) {
    run(`page='course';courseId='${id}';tab='${t}';render()`);
    assert(node("#content").innerHTML.includes(run("esc(course().name)")));
  }
run(
  "courseId='stats';page='course';tab='study';study('Phản biện độc lập và xung khắc')",
);
assert.equal(run("course().messages.length"), 2);
assert.equal(run("state.courses.find(c=>c.id==='english').messages.length"), 0);
run("courseId='english';study('Ví dụ khác')");
assert.equal(run("course().messages.length"), 2);
assert.equal(run("state.courses.find(c=>c.id==='stats').messages.length"), 2);
node("#teleCourse").value = "stats";
run("page='schedule';tele('mai học lúc 20h')");
assert.equal(run("state.courses[0].date"), "2026-11-12");
assert(run("state.tele.at(-1).text").includes("trùng môn"));
run("tele('mai học lúc 21h')");
assert.equal(run("state.courses[0].time"), "21:00");
assert.equal(run("state.courses[0].date"), "2026-11-13");
assert.equal(run("state.courses[1].time"), "20:00");
run("tele('lùi 30 phút')");
assert.equal(run("state.courses[0].time"), "21:30");
run("tele('Hôm nay chỉ học 15 phút thôi')");
assert.equal(run("state.courses[0].duration"), 15);
assert.equal(run("state.courses[0].date"), "2026-11-12");
run("tele('mai lúc 25h')");
assert.equal(run("state.courses[0].date"), "2026-11-12");
assert(run("state.tele.at(-1).text").includes("chưa hợp lệ"));
run("courseId='stats';page='course';tab='sources';pickSources()");
assert(node("#modal").innerHTML.includes("Chọn các nguồn cùng học"));
checked['input[name="source"]:checked'] = ["s1", "s2", "s4", "s5"].map(
  (value) => ({ value }),
);
run("actions.saveSources()");
assert.equal(run("course().sources.length"), 4);
assert.equal(run("state.files.length"), 11);
assert(run("state.courses.find(c=>c.id==='python').sources.includes('s5')"));
run("buildPlan()");
node("#mainSource").value = "s2";
node("#planPace").value = "Vừa sức · 3 buổi / tuần";
run("actions.applyPlan()");
assert.equal(run("course().sources[0]"), "s2");
assert(run("course().plan"));
assert.equal(run("tab"), "path");
run("newCourse()");
node("#courseName").value = "Machine Learning";
node("#courseGoal").value = "Tự làm một dự án";
node("#newCourseForm").onsubmit({ preventDefault() {} });
assert.equal(run("state.courses.length"), 4);
assert.equal(run("course().sources.length"), 0);
assert.equal(run("tab"), "sources");
assert(storage.has("nhiphoc-v2"));
assert.equal(run("parseTime('lúc 20:30')"), 1230);
assert.equal(run("parseTime('20h99')"), -1);
console.log(
  "PASS: 18 views; isolated course conversations; shared sources; multi-source plan; course creation; schedule conflict, reschedule, duration and invalid time; persisted state.",
);

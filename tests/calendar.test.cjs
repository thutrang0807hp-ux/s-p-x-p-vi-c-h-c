const path = require("node:path");
const PROJECT_ROOT = path.resolve(__dirname, "..");
const fs = require("fs"),
  vm = require("vm"),
  assert = require("assert");
const nodes = new Map(),
  storage = new Map();
function node(s) {
  if (!nodes.has(s))
    nodes.set(s, {
      innerHTML: "",
      textContent: "",
      value: "",
      style: {},
      dataset: {},
      hidden: true,
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
      scrollIntoView() {},
      setSelectionRange() {},
    });
  return nodes.get(s);
}
const ctx = {
  structuredClone,
  document: {
    body: { classList: { toggle() {} } },
    querySelector: node,
    querySelectorAll: () => [],
  },
  localStorage: {
    getItem: (k) => storage.get(k),
    setItem: (k, v) => storage.set(k, v),
    removeItem: (k) => storage.delete(k),
  },
  location: { hash: "" },
  history: { replaceState() {} },
  window: {
    addEventListener() {},
    scrollTo() {},
    matchMedia: () => ({ matches: false }),
  },
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
let config;
ctx.FullCalendar = {
  Calendar: class {
    constructor(el, cfg) {
      config = cfg;
      this.cfg = cfg;
      this.date = new Date(cfg.initialDate + "T12:00:00");
      this.type = cfg.initialView;
    }
    getDate() {
      return this.date;
    }
    destroy() {}
    render() {
      this.cfg.datesSet({
        view: { title: "Tháng 11, 2026", type: this.type, calendar: this },
      });
    }
    gotoDate(d) {
      this.date = new Date(d + "T12:00:00");
      this.render();
    }
    changeView(t) {
      this.type = t;
      this.render();
    }
    prev() {}
    next() {}
  },
};
run("page='schedule';render()");
assert.equal(config.initialView, "timeGridWeek");
assert.equal(config.locale, "vi");
assert(config.editable);
assert(config.selectable);
assert.equal(config.events.length, 10);
assert.equal(run("getSessions().length"), 10);
assert(
  config.events.some(
    (e) => e.extendedProps.courseName === "Tiếng Anh giao tiếp",
  ),
);
assert(node("#content").innerHTML.includes("dayGridMonth"));
node("#calToday").onclick();
assert.equal(run("calendarDate"), "2026-11-12");
const malicious = config.eventContent({
  timeText: "20:00",
  event: {
    title: "<img src=x onerror=alert(1)>",
    extendedProps: { courseName: "A&B" },
  },
}).html;
assert(!malicious.includes("<img"));
assert(malicious.includes("&lt;img"));
assert(malicious.includes("A&amp;B"));
assert(run("validateSession(null,'2026-11-12','20:00',30)").includes("Trùng"));
assert.equal(run("validateSession(null,'2026-11-12','21:00',45)"), null);
assert(
  run("validateSession(null,'2026-11-12','23:30',90)").includes("cùng ngày"),
);
run("sessionEditor(null,'2026-11-12','21:00')");
node("#sessionCourse").value = "stats";
node("#sessionTitle").value = "Ôn Bayes";
node("#sessionDate").value = "2026-11-12";
node("#sessionTime").value = "21:00";
node("#sessionDuration").value = "45";
node("#sessionForm").onsubmit({ preventDefault() {} });
assert.equal(run("state.extraSessions.length"), 8);
assert.equal(run("getSessions().length"), 11);
assert.equal(config.events.length, 11);
const newId = run("state.extraSessions.at(-1).id");
let reverted = false;
config.eventDrop({
  event: {
    id: newId,
    title: "Ôn Bayes",
    start: new Date("2026-11-12T20:00:00"),
    end: new Date("2026-11-12T20:45:00"),
  },
  revert() {
    reverted = true;
  },
});
assert(reverted);
assert.equal(run("state.extraSessions.at(-1).time"), "21:00");
reverted = false;
config.eventDrop({
  event: {
    id: newId,
    title: "Ôn Bayes",
    start: new Date("2026-11-12T22:00:00"),
    end: new Date("2026-11-12T22:45:00"),
  },
  revert() {
    reverted = true;
  },
});
assert(!reverted);
assert.equal(run("state.extraSessions.at(-1).time"), "22:00");
node("#teleCourse").value = "stats";
run("tele('Hôm nay học lúc 22h')");
assert(
  run("state.tele.at(-1).text").includes("Trùng") ||
    run("state.tele.at(-1).text").includes("trùng"),
);
assert.equal(run("state.courses[0].time"), "20:00");
run("editSession('" + newId + "')");
node("#sessionDelete").onclick();
assert.equal(run("getSessions().length"), 10);
run("page='course';courseId='stats';tab='study';render()");
assert(node("#content").innerHTML.includes("lesson-desk"));
assert(node("#content").innerHTML.includes("dice-outcomes"));
assert(node("#content").innerHTML.includes("Tập trung"));
assert(node("#content").innerHTML.includes("Chỉ đọc bài"));
run("actions.toggleTutor()");
assert(node("#content").innerHTML.includes("reader-only"));
assert(!node("#content").innerHTML.includes('id="lessonTutor"'));
run("actions.openNotes()");
assert(node("#content").innerHTML.includes('id="notes"'));
assert(node("#content").innerHTML.includes('id="lessonTutor"'));
run("actions.largerText()");
assert.equal(run("readerSize"), 18);
run("actions.focusLesson()");
assert(run("focusLesson"));
console.log(
  "PASS: FullCalendar config and 10 events; escaped titles; add/delete sessions; drag conflict and successful move; Telegram conflict with extra session; larger lesson, hide tutor, notes, text size and focus.",
);

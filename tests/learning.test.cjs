const path = require("node:path");
const PROJECT_ROOT = path.resolve(__dirname, "..");
const fs = require("fs"),
  vm = require("vm"),
  assert = require("assert");
const { parseHTML } = require("linkedom");
const { IDBFactory } = require("fake-indexeddb");
const indexedDB = new IDBFactory(),
  cache = new Map();
let downloads = [];
class Reader {
  readAsDataURL(blob) {
    blob
      .arrayBuffer()
      .then((a) => {
        this.result =
          "data:" + blob.type + ";base64," + Buffer.from(a).toString("base64");
        this.onload();
      })
      .catch(() => this.onerror());
  }
}
function launch(factory = indexedDB) {
  const { window, document } = parseHTML(
    fs.readFileSync(path.join(PROJECT_ROOT, "dist/index.html"), "utf8"),
  );
  window.matchMedia = () => ({ matches: false });
  window.scrollTo = () => {};
  window.HTMLElement.prototype.scrollIntoView = () => {};
  window.HTMLElement.prototype.focus = () => {};
  window.HTMLElement.prototype.showModal = function () {
    this.open = true;
  };
  window.HTMLElement.prototype.close = function () {
    this.open = false;
  };
  const ctx = {
    document,
    window,
    indexedDB: factory,
    Blob,
    FileReader: Reader,
    structuredClone,
    crypto: require("crypto").webcrypto,
    navigator: { clipboard: { writeText: async (t) => (ctx.copied = t) } },
    location: { hash: "#home", reload() {} },
    history: {
      replaceState(a, b, h) {
        ctx.location.hash = h;
      },
    },
    localStorage: {
      getItem: (k) => cache.get(k) || null,
      setItem: (k, v) => cache.set(k, v),
      removeItem: (k) => cache.delete(k),
    },
    URL: {
      createObjectURL: (b) => {
        downloads.push(b);
        return "blob:test";
      },
      revokeObjectURL() {},
    },
    atob: (s) => Buffer.from(s, "base64").toString("binary"),
    setTimeout,
    clearTimeout,
    confirm: () => false,
    console,
  };
  vm.createContext(ctx);
  for (const f of ["app.js", "storage.js", "bridge.js"])
    vm.runInContext(
      fs.readFileSync(path.join(PROJECT_ROOT, "dist", f), "utf8"),
      ctx,
      { filename: f },
    );
  return ctx;
}
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
async function ready(c) {
  for (let i = 0; i < 100; i++) {
    if (vm.runInContext("storageEngine.ready", c)) {
      await vm.runInContext("storageEngine.queue", c);
      await delay(5);
      return;
    }
    await delay(5);
  }
  throw Error("DB not ready");
}
(async () => {
  let c = launch();
  await ready(c);
  const run = (s) => vm.runInContext(s, c);
  assert(run("storageEngine.db!==null"));
  assert.equal(run("state.courses.length"), 3);
  run("go('profile')");
  assert(c.document.querySelector("#learnerForm"));
  assert(
    c.document.querySelector("#content").textContent.includes("IndexedDB"),
  );
  run("go('course','stats','bridge')");
  assert(c.document.querySelector("#prepareForm"));
  assert.equal(
    c.document.querySelectorAll("input[name=packetSource]:checked").length,
    5,
  );
  // Pure prompt builder includes only selected source excerpts and stable IDs.
  run(
    "state.files[0].excerpt='A and B are independent when P(A∩B)=P(A)P(B).';state.files[0].range='Chương 2';course().notes='My own notes';course().memory.weak=['Confuses disjoint and independent'];state.learner.preferences='Use visual examples'",
  );
  const p = run(
    "makePacket(course(),{lesson:'Independent events',minutes:30,objective:'Explain using an example',sourceIds:['s1'],request:'Ask one question at a time'})",
  );
  assert(p.id.startsWith("packet-"));
  assert(p.prompt.includes("My own notes"));
  assert(p.prompt.includes("Use visual examples"));
  assert(p.prompt.includes("P(A∩B)"));
  assert(!p.prompt.includes("Introduction to Probability"));
  assert(p.prompt.includes("Không bịa nội dung sách"));
  c.packet = p;
  run("course().packets.push(packet);save()");
  await run("flushLearningData()");
  c.rawSummary = {
    format: "nhiphoc-session",
    version: 1,
    packetId: p.id,
    courseId: "stats",
    lesson: "AI must not override packet lesson",
    summary: "Understood independence using two coins.",
    mastered: ["Independence"],
    needsReview: ["Conditional probability"],
    nextLesson: "Bayes",
    notes: "Review tomorrow",
    minutesStudied: 25,
    quiz: { correct: 2, total: 3 },
    suggestedProgress: 50,
  };
  c.summaryText = JSON.stringify(c.rawSummary);
  const summary = run("parseSummary(summaryText)");
  assert.equal(summary.lesson, "Independent events");
  c.summary = summary;
  run("applySummary(summary,{appendNotes:true,applyProgress:false})");
  await run("flushLearningData()");
  assert.equal(run("course().sessions.length"), 1);
  assert.equal(run("course().progress"), 38);
  assert(run("course().memory.weak.includes('Conditional probability')"));
  assert(run('course().notes.includes("Understood independence")'));
  assert.equal(run("state.courses[1].sessions.length"), 0);
  assert.throws(() => run("parseSummary(summaryText)"), /đã được nhập/);
  const bad = { ...c.rawSummary, packetId: "packet-unknown" };
  c.bad = JSON.stringify(bad);
  assert.throws(() => run("parseSummary(bad)"), /Không tìm thấy/);
  run("courseId='english'");
  assert.throws(() => run("parseSummary(summaryText)"), /môn khác/);
  run("courseId='stats'");
  // Genuine IndexedDB blob roundtrip and versioned backup restore.
  c.record = {
    id: "file-local",
    name: "notes.md",
    blob: new Blob(["Hello học tập"], { type: "text/markdown" }),
  };
  await run("putOriginalFiles([record])");
  run(
    "state.files.push({id:'file-local',name:'notes.md',kind:'MD',author:'me',role:'Notes',sample:false,hasBlob:true,bytes:record.blob.size,excerpt:'Hello học tập'});course().sources.push('file-local');save()",
  );
  await run("flushLearningData()");
  assert.equal(
    await (await run("dbRead('files','file-local')")).blob.text(),
    "Hello học tập",
  );
  const backup = await run("makeBackup()");
  assert.equal(backup.files.length, 1);
  assert(backup.data.courses[0].sessions.length === 1);
  c.backupText = JSON.stringify(backup);
  const preview = run("parseBackup(backupText)");
  assert.equal(await preview.files[0].blob.text(), "Hello học tập");
  // Restore is atomic, updates the workspace, and retains the prior workspace.
  run("state.learner.name='Changed after backup';save()");
  await run("flushLearningData()");
  c.preview = preview;
  await run("replaceWorkspace(preview)");
  assert.equal(run("state.learner.name"), "Minh");
  assert.equal(
    (await run("dbRead('workspace','previous')")).data.learner.name,
    "Changed after backup",
  );
  assert.equal(
    await (await run("dbRead('files','file-local')")).blob.text(),
    "Hello học tập",
  );
  // Reopen in a different DOM context: persisted memory, history and blobs survive.
  run("storageEngine.db.close()");
  c = launch();
  await ready(c);
  assert.equal(vm.runInContext("state.courses[0].sessions.length", c), 1);
  assert.equal(
    vm.runInContext("state.courses[0].memory.nextLesson", c),
    "Bayes",
  );
  assert.equal(
    await (
      await vm.runInContext("dbRead('files','file-local')", c)
    ).blob.text(),
    "Hello học tập",
  );
  // Reject malformed backup envelopes, oversized or invalid state and duplicate IDs.
  c.badBackup = JSON.stringify({ ...backup, version: 99 });
  assert.throws(
    () => vm.runInContext("parseBackup(badBackup)", c),
    /không phải/,
  );
  const invalid = structuredClone(backup);
  invalid.data.courses[0].date = "2026-02-31";
  c.invalid = JSON.stringify(invalid);
  assert.throws(() => vm.runInContext("parseBackup(invalid)", c), /ngày giờ/);
  const invalidFile = structuredClone(backup);
  invalidFile.files[0].bytes += 1;
  c.invalid = JSON.stringify(invalidFile);
  assert.throws(() => vm.runInContext("parseBackup(invalid)", c), /không khớp/);
  const duplicate = structuredClone(backup);
  duplicate.data.courses.push(duplicate.data.courses[0]);
  c.invalid = JSON.stringify(duplicate);
  assert.throws(() => vm.runInContext("parseBackup(invalid)", c), /Môn học/);
  // Source text is escaped, not interpreted as HTML.
  vm.runInContext(
    "state.files[0].excerpt='<img src=x onerror=alert(1)>';go('course','stats','bridge');sourceModal('s1')",
    c,
  );
  assert.equal(c.document.querySelectorAll("#modal img").length, 0);
  assert(/<img|&lt;img/.test(c.document.querySelector("#sourceExcerpt").value));
  // Exercise the real form handlers and reviewed import UI against the DOM.
  vm.runInContext("go('course','stats','bridge')", c);
  c.document.querySelector("#packetLesson").value = "A real form lesson";
  c.document.querySelector("#packetObjective").value = "Review what I learned";
  c.document.querySelector("#packetRequest").value = "Ask me one question";
  await c.document
    .querySelector("#prepareForm")
    .onsubmit({
      preventDefault() {},
      target: c.document.querySelector("#prepareForm"),
    });
  assert(c.document.querySelector("#packetOutput"));
  assert(
    c.document
      .querySelector("#packetOutput")
      .value.includes("A real form lesson"),
  );
  const currentPacket = vm.runInContext("course().packets.at(-1)", c);
  c.uiSummary = JSON.stringify({
    format: "nhiphoc-session",
    version: 1,
    packetId: currentPacket.id,
    courseId: "stats",
    summary: "Completed a reviewed session",
    mastered: ["Conditional probability"],
    needsReview: [],
    nextLesson: "Next topic",
    notes: "A note",
    minutesStudied: 20,
    quiz: null,
    suggestedProgress: null,
  });
  vm.runInContext("summaryDialog()", c);
  c.document.querySelector("#summaryInput").value = c.uiSummary;
  c.document.querySelector("#previewSummary").onclick();
  assert(c.document.querySelector("#commitSummary"));
  assert.equal(vm.runInContext("course().sessions.length", c), 1);
  c.document.querySelector("#appendSessionNotes").checked = true;
  await c.document.querySelector("#commitSummary").onclick();
  assert.equal(vm.runInContext("course().sessions.length", c), 2);
  assert.equal(vm.runInContext("course().progress", c), 38);
  vm.runInContext("backupImportDialog()", c);
  c.preview = preview;
  vm.runInContext("showBackupPreview(preview)", c);
  await c.document.querySelector("#restoreCommit").onclick();
  assert(
    c.document.querySelector("#backupError").textContent.includes("xác nhận"),
  );
  assert.equal(vm.runInContext("state.courses[0].sessions.length", c), 2);
  // A backup remains possible even if the previous local write has failed.
  vm.runInContext("storageEngine.error='Simulated write failure'", c);
  const rescue = await vm.runInContext("makeBackup()", c);
  assert.equal(rescue.data.courses[0].sessions.length, 2);
  vm.runInContext("storageEngine.error=''", c);
  // Original upload commits metadata and its blob together.
  vm.runInContext("upload()", c);
  const uploadBlob = new Blob(["New original text"], { type: "text/markdown" });
  Object.defineProperty(uploadBlob, "name", { value: "fresh.md" });
  Object.defineProperty(c.document.querySelector("#fileUpload"), "files", {
    value: [uploadBlob],
  });
  await c.document.querySelector("#storeOriginals").onclick();
  assert(
    vm.runInContext("state.files.some(f=>f.name==='fresh.md'&&f.hasBlob)", c),
  );
  assert.equal((await vm.runInContext("dbRead('files')", c)).length, 2);
  // A newer synchronous mirror recovers a note if the last IndexedDB write never completed.
  const mirrored = JSON.parse(cache.get("nhiphoc-v2"));
  mirrored.courses[0].notes = "Recovered from newer mirror";
  mirrored.updatedAt = new Date(Date.now() + 1000).toISOString();
  cache.set("nhiphoc-v2", JSON.stringify(mirrored));
  vm.runInContext("storageEngine.db.close()", c);
  c = launch();
  await ready(c);
  assert.equal(
    vm.runInContext("state.courses[0].notes", c),
    "Recovered from newer mirror",
  );
  vm.runInContext("storageEngine.db.close()", c);
  // Unsupported IndexedDB is shown as a fallback, rather than claiming durable file storage.
  c = launch(null);
  await ready(c);
  assert.equal(vm.runInContext("storageEngine.db", c), null);
  vm.runInContext("go('profile')", c);
  assert(c.document.querySelector("#content").textContent.includes("dự phòng"));
  console.log(
    "PASS: DOM-emulated views, source-scoped packet, ID matching, duplicate/wrong-course protection, memory/history updates, IndexedDB-emulated transactions and blobs, backup/restore with previous snapshot, reload durability, invalid backup rejection and escaped source text.",
  );
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

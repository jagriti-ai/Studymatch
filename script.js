// StudyMatch - Jagriti
// Matches students by subject, free time, level and goal.

var SUBJECTS = ["Maths", "Physics", "Chemistry", "Biology", "Computer Science", "English", "Economics"];
var SLOTS = ["Morning", "Afternoon", "Evening", "Weekend"];
var LEVELS = ["Beginner", "Intermediate", "Advanced"];
var GOALS = ["Exam preparation", "Homework help", "Project work", "Revision"];

// sample students (made up for the demo)
var students = [
  { name: "Aarav", contact: "aarav@example.com", level: "Intermediate", goal: "Exam preparation", subjects: ["Physics", "Maths"], slots: ["Evening", "Weekend"] },
  { name: "Meera", contact: "meera@example.com", level: "Beginner", goal: "Homework help", subjects: ["Maths", "Computer Science"], slots: ["Morning", "Evening"] },
  { name: "Riya", contact: "919800000001", level: "Intermediate", goal: "Revision", subjects: ["Physics", "Chemistry"], slots: ["Afternoon", "Weekend"] },
  { name: "Kabir", contact: "kabir@example.com", level: "Advanced", goal: "Project work", subjects: ["Computer Science", "Maths"], slots: ["Evening"] },
  { name: "Sana", contact: "919800000002", level: "Beginner", goal: "Exam preparation", subjects: ["Biology", "Chemistry"], slots: ["Morning", "Weekend"] },
  { name: "Dev", contact: "dev@example.com", level: "Intermediate", goal: "Revision", subjects: ["Economics", "English"], slots: ["Afternoon", "Evening"] },
  { name: "Isha", contact: "isha@example.com", level: "Beginner", goal: "Project work", subjects: ["Computer Science", "English"], slots: ["Evening", "Weekend"] },
  { name: "Rohan", contact: "919800000003", level: "Advanced", goal: "Exam preparation", subjects: ["Physics", "Maths", "Computer Science"], slots: ["Morning", "Weekend"] }
];

var me = null;            // the user's profile after they press the button
var inviteMessages = [];  // messages for the "copy" buttons


// ---------- filling the form ----------

function fillSelect(id, items) {
  var html = "";
  for (var i = 0; i < items.length; i++) {
    html += "<option>" + items[i] + "</option>";
  }
  document.getElementById(id).innerHTML = html;
}

function fillChecks(id, items, name) {
  var html = "";
  for (var i = 0; i < items.length; i++) {
    html += '<label><input type="checkbox" name="' + name + '" value="' + items[i] + '">' + items[i] + "</label>";
  }
  document.getElementById(id).innerHTML = html;
}

fillSelect("level", LEVELS);
fillSelect("goal", GOALS);
fillChecks("subjects", SUBJECTS, "subject");
fillChecks("slots", SLOTS, "slot");


// ---------- small helper functions ----------

// get the ticked boxes of one group
function getChecked(name) {
  var boxes = document.querySelectorAll('input[name="' + name + '"]:checked');
  var values = [];
  for (var i = 0; i < boxes.length; i++) {
    values.push(boxes[i].value);
  }
  return values;
}

// find what two lists have in common
function sharedItems(listA, listB) {
  var shared = [];
  for (var i = 0; i < listA.length; i++) {
    if (listB.indexOf(listA[i]) !== -1) {
      shared.push(listA[i]);
    }
  }
  return shared;
}

// stops text from being read as html
function safe(text) {
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// email gets a mailto link, a number gets a whatsapp link
function contactLink(contact) {
  if (contact.indexOf("@") !== -1) {
    return "mailto:" + contact;
  }
  return "https://wa.me/" + contact.replace(/[^0-9]/g, "");
}

function makeTags(items, shared) {
  var html = "";
  for (var i = 0; i < items.length; i++) {
    var css = "tag";
    if (shared.indexOf(items[i]) !== -1) {
      css = "tag shared";
    }
    html += '<span class="' + css + '">' + safe(items[i]) + "</span>";
  }
  return html;
}


// ---------- the matching ----------

// points: shared subject = 2, shared free slot = 1, same level = 1, same goal = 1
function getScore(person, other) {
  var result = {};
  result.sharedSubjects = sharedItems(person.subjects, other.subjects);
  result.sharedSlots = sharedItems(person.slots, other.slots);
  result.sameLevel = (person.level === other.level);
  result.sameGoal = (person.goal === other.goal);

  var points = result.sharedSubjects.length * 2 + result.sharedSlots.length;
  if (result.sameLevel) { points = points + 1; }
  if (result.sameGoal) { points = points + 1; }

  var maxPoints = person.subjects.length * 2 + person.slots.length + 2;
  result.points = points;
  result.percent = Math.round(points / maxPoints * 100);
  return result;
}

function showMatches() {
  if (me === null) { return; }

  var onlySameLevel = document.getElementById("sameLevel").checked;
  var onlySameTime = document.getElementById("sameTime").checked;

  // score everyone and keep the ones who pass the filters
  var matches = [];
  for (var i = 0; i < students.length; i++) {
    var s = students[i];
    var r = getScore(me, s);
    if (r.sharedSubjects.length === 0) { continue; }
    if (onlySameLevel && !r.sameLevel) { continue; }
    if (onlySameTime && r.sharedSlots.length === 0) { continue; }
    matches.push({ student: s, result: r });
  }

  // best match first
  matches.sort(function (a, b) {
    return b.result.points - a.result.points;
  });

  var list = document.getElementById("matchList");
  if (matches.length === 0) {
    list.innerHTML = '<p class="empty">No one found. Try more subjects, or untick a filter.</p>';
    return;
  }

  inviteMessages = [];
  var html = "";
  for (var j = 0; j < matches.length; j++) {
    var st = matches[j].student;
    var res = matches[j].result;

    var message = "Hi " + st.name + "! I'm " + me.name + ". We both study " + res.sharedSubjects[0] + ", want to study together";
    if (res.sharedSlots.length > 0) {
      message += " on " + res.sharedSlots[0].toLowerCase();
    }
    message += "?";
    inviteMessages.push(message);

    html += '<div class="card">';
    html += '<div class="card-top"><span class="who">' + safe(st.name) + '</span><span class="percent">' + res.percent + '% match</span></div>';
    html += '<div class="meta">' + safe(st.level) + ", studying for " + safe(st.goal.toLowerCase()) + "</div>";
    html += "<div>" + makeTags(st.subjects, res.sharedSubjects) + "</div>";
    html += "<div>" + makeTags(st.slots, res.sharedSlots) + "</div>";
    html += '<div class="card-links">';
    html += '<a href="' + contactLink(st.contact) + '" target="_blank">contact ' + safe(st.name) + '</a>';
    html += '<button data-number="' + j + '">copy a message to send</button>';
    html += "</div></div>";
  }
  list.innerHTML = html;
}


// ---------- button clicks ----------

document.getElementById("findBtn").onclick = function () {
  var error = document.getElementById("error");

  var profile = {
    name: document.getElementById("name").value.trim(),
    contact: document.getElementById("contact").value.trim(),
    level: document.getElementById("level").value,
    goal: document.getElementById("goal").value,
    subjects: getChecked("subject"),
    slots: getChecked("slot")
  };

  if (profile.name === "" || profile.contact === "") {
    error.textContent = "Please add your name and how to reach you.";
    return;
  }
  if (profile.subjects.length === 0 || profile.slots.length === 0) {
    error.textContent = "Tick at least one subject and one free time.";
    return;
  }

  error.textContent = "";
  me = profile;

  // save the profile in the browser for next time
  try {
    localStorage.setItem("studymatch-profile", JSON.stringify(profile));
  } catch (e) {
    // storage not available, ignore
  }

  showMatches();
  document.getElementById("matchList").scrollIntoView();
};

document.getElementById("sameLevel").onchange = showMatches;
document.getElementById("sameTime").onchange = showMatches;

// the copy buttons are made later, so listen on the whole list
document.getElementById("matchList").onclick = function (event) {
  var button = event.target;
  if (button.getAttribute("data-number") === null) { return; }

  var text = inviteMessages[button.getAttribute("data-number")];
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
    button.textContent = "copied!";
  } else {
    prompt("Copy this message:", text);
  }
};


// ---------- load the saved profile ----------

try {
  var saved = JSON.parse(localStorage.getItem("studymatch-profile"));
  if (saved) {
    document.getElementById("name").value = saved.name;
    document.getElementById("contact").value = saved.contact;
    document.getElementById("level").value = saved.level;
    document.getElementById("goal").value = saved.goal;

    var subjectBoxes = document.querySelectorAll('input[name="subject"]');
    for (var a = 0; a < subjectBoxes.length; a++) {
      subjectBoxes[a].checked = saved.subjects.indexOf(subjectBoxes[a].value) !== -1;
    }
    var slotBoxes = document.querySelectorAll('input[name="slot"]');
    for (var b = 0; b < slotBoxes.length; b++) {
      slotBoxes[b].checked = saved.slots.indexOf(slotBoxes[b].value) !== -1;
    }
  }
} catch (e) {
  // nothing saved yet
}


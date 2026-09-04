(() => {
  const source = window.NNADO_PORTAL_DEMO;
  if (!source) return;

  // Demo-only preview state. Real projects must receive this state from authenticated backend data.
  const data = { ...source };
  if (new URLSearchParams(location.search).get("view") === "complete") data.projectState = "complete";

  const all = (selector) => [...document.querySelectorAll(selector)];
  const set = (selector, value) => all(selector).forEach((node) => { node.textContent = value; });
  const esc = (value = "") => String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
  const statusClass = (status = "") => `status-${status.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
  const projectLink = (label, url, classes = "portal-link") => url
    ? `<a class="${classes}" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`
    : `<span class="${classes} is-disabled" aria-disabled="true">${esc(label)} <small>Demo</small></span>`;

  set("[data-client-name]", data.clientDisplayName);
  set("[data-project-name]", data.projectName);
  set("[data-project-type]", data.projectType);
  set("[data-project-year]", data.projectYear);
  set("[data-current-phase]", data.projectState === "complete" ? "Project Complete ♡" : data.currentPhase);
  set("[data-next-milestone]", data.projectState === "complete" ? "Final files ready" : data.nextMilestone);

  const action = document.querySelector("#action-needed");
  const actionData = data.projectState === "complete" ? { needed: false } : data.action;
  action.classList.toggle("is-clear", !actionData.needed);
  action.innerHTML = actionData.needed
    ? `<div><p class="eyebrow">Your move</p><h2 id="action-title">${esc(actionData.title)}</h2><p>${esc(actionData.message)}</p></div>${projectLink(actionData.label, actionData.url, "button")}`
    : `<div><p class="eyebrow">No homework today</p><h2 id="action-title">You’re all caught up ♡</h2><p>Nothing needed from you right now. I’ll reach out when the next step is ready.</p></div>`;

  document.querySelector("#timeline-list").innerHTML = data.phases.map((phase, index) => {
    const status = data.projectState === "complete" ? "complete" : phase.status;
    return `<li class="${statusClass(status)}"><span>${String(index + 1).padStart(2, "0")}</span><h3>${esc(phase.name)}</h3><p>${esc(status)}${status === "complete" ? " ✓" : ""}</p></li>`;
  }).join("");

  const snapshot = [
    ["Project", data.projectType], ["Start date", data.startDate], ["Estimated completion", data.estimatedCompletion],
    ["Current phase", data.projectState === "complete" ? "Project Complete" : data.currentPhase],
    ["Revision round", data.projectState === "complete" ? "Complete" : data.revisionRound],
    ["Next meeting", data.meeting.scheduled && data.projectState !== "complete" ? `${data.meeting.date} / ${data.meeting.time}` : "No meeting scheduled"]
  ];
  document.querySelector("#snapshot-list").innerHTML = snapshot.map(([term, description]) => `<div><dt>${esc(term)}</dt><dd>${esc(description)}</dd></div>`).join("");

  const renderRows = (items) => items.map((item) => `<article class="${statusClass(item.status)}"><div><h3>${esc(item.name)}</h3><p>${esc(item.status)}${item.status === "Complete" ? " ✓" : ""}</p></div>${projectLink(item.label, item.url)}</article>`).join("");
  document.querySelector("#onboarding-list").innerHTML = renderRows(data.onboarding);
  document.querySelector("#resources-list").innerHTML = renderRows(data.resources);

  document.querySelector("#deliverables-list").innerHTML = data.deliverables.map((item, index) => {
    const status = data.projectState === "complete" ? "Delivered" : item.status;
    return `<article class="${statusClass(status)}"><span>${String(index + 1).padStart(2, "0")}</span><h3>${esc(item.name)}</h3><p>${esc(status)}${["Approved", "Delivered"].includes(status) ? " ✓" : ""}</p></article>`;
  }).join("");

  document.querySelector("#revision-total").textContent = `${data.revisions.included} rounds included`;
  document.querySelector("#revision-list").innerHTML = data.revisions.rounds.map((round) => `<article><span>${esc(round.name)}</span><div><h3>${esc(data.projectState === "complete" ? "Complete" : round.status)}</h3><p>${esc(data.projectState === "complete" ? "Feedback incorporated" : round.detail)}</p></div>${round.label && data.projectState !== "complete" ? projectLink(round.label, round.url) : ""}</article>`).join("");

  const payment = data.payment;
  const totals = [["Project total", payment.total], ["Paid", data.projectState === "complete" ? payment.total : payment.paid], ["Remaining balance", data.projectState === "complete" ? "$0" : payment.remaining], ["Next payment", data.projectState === "complete" ? "Paid ✓" : payment.next]];
  document.querySelector("#payment-totals").innerHTML = totals.map(([term, description]) => `<div><dt>${esc(term)}</dt><dd>${esc(description)}</dd></div>`).join("");
  document.querySelector("#payment-milestones").innerHTML = payment.milestones.map((item, index) => `<article><span>${String(index + 1).padStart(2, "0")}</span><h3>${esc(item.name)}</h3><p>${esc(data.projectState === "complete" ? "Paid ✓" : item.status)}</p></article>`).join("");
  document.querySelector("#invoice-link").innerHTML = data.projectState === "complete" ? "" : projectLink("View invoice →", payment.invoiceUrl, "button");

  const meeting = data.meeting;
  const meetingRoot = document.querySelector("#meeting-details");
  if (meeting.scheduled && data.projectState !== "complete") {
    meetingRoot.innerHTML = `<div class="meeting-copy"><h3>${esc(meeting.name)}</h3><p>${esc(meeting.date)}<br>${esc(meeting.time)}</p></div><div class="portal-actions">${projectLink("Join meeting →", meeting.meetingUrl, "button")}${projectLink("Reschedule →", meeting.schedulingUrl, "text-link")}</div>`;
  } else {
    meetingRoot.innerHTML = `<div class="meeting-copy"><h3>No meeting scheduled</h3><p>I’ll send you a booking link when we need one.</p></div>`;
  }

  document.querySelector("#next-copy").textContent = data.projectState === "complete" ? "Your project is wrapped! Your final files and brand guidelines are ready below. Keep a copy of everything somewhere safe, and email me if you need help finding the right file for a future application." : data.nextCopy;
  const note = document.querySelector("#donna-note");
  if (data.donnaNote && data.projectState !== "complete") note.innerHTML = `<p class="handwritten">A note from Donna ♡</p><p>${esc(data.donnaNote)}</p>`;
  else note.hidden = true;

  const completion = document.querySelector("#completion-panel");
  if (data.projectState === "complete") {
    completion.hidden = false;
    completion.innerHTML = `<p class="eyebrow">Everything is ready</p><h2 id="completion-title">Project complete ♡</h2><div class="completion-files"><p><span>Final files</span><b>Ready</b></p><p><span>Brand guidelines</span><b>Ready</b></p><p><span>Final payment</span><b>${esc(data.completion.finalPaymentStatus)} ✓</b></p></div>${projectLink("Download final files →", data.completion.finalFilesUrl, "button")}<p class="handwritten">thank you for making something good with me ♡</p><a class="text-link" href="start-project.html">Work together again →</a>`;
  }

  document.querySelector("#booking-link").innerHTML = projectLink("Book a call →", data.bookingUrl, "text-link");

  const finePointer = window.matchMedia("(pointer: fine)");
  if (finePointer.matches) {
    const cursor = document.createElement("div");
    cursor.className = "star-cursor";
    cursor.setAttribute("aria-hidden", "true");
    cursor.textContent = "☆";
    document.body.append(cursor);
    document.body.classList.add("custom-cursor-ready");
    let frame;
    let pointerX = 0;
    let pointerY = 0;
    const placeCursor = () => {
      cursor.style.transform = `translate3d(${pointerX}px,${pointerY}px,0) translate(-50%,-50%)`;
      frame = null;
    };
    window.addEventListener("pointermove", (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      cursor.classList.add("is-visible");
      if (!frame) frame = requestAnimationFrame(placeCursor);
    });
    document.addEventListener("pointerover", (event) => cursor.classList.toggle("is-active", Boolean(event.target.closest("a, button"))));
    document.documentElement.addEventListener("mouseleave", () => cursor.classList.remove("is-visible"));
    document.documentElement.addEventListener("mouseenter", () => cursor.classList.add("is-visible"));
  }
})();

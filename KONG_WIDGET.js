// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KONG — BLOOM ROOM WIDGET
// V16 — PROCESS STATUS COLORS
//
// NORMAL       = BLACK
// PROCESS +2D  = YELLOW
// PROCESS +1D  = ORANGE
// PROCESS TODAY = RED
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const fm = FileManager.local();


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NORMAL COLORS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const GREEN = new Color("#63D66B");
const WHITE = new Color("#F4F4F4");
const GRAY = new Color("#777777");
const LIGHT_GRAY = new Color("#999999");
const DARK_GRAY = new Color("#292929");
const BLACK = new Color("#050505");


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STATUS COLORS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const STATUS_RED = new Color("#FF3B30");
const STATUS_ORANGE = new Color("#FF9500");
const STATUS_YELLOW = new Color("#FFD60A");

const STATUS_GRAY = new Color("#666666");
const STATUS_LIGHT_GRAY = new Color("#999999");
const STATUS_BOX = new Color("#A8A8A8");
const STATUS_BOX_TEXT = new Color("#555555");


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UNIQUE ROOM
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const SCRIPT_NAME = Script.name();

const ROOM_ID = SCRIPT_NAME
  .trim()
  .toUpperCase()
  .replace(/[^A-Z0-9_-]/g, "_");

const configFile = fm.joinPath(
  fm.documentsDirectory(),
  `KONG_ROOM_${ROOM_ID}.json`
);


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DATE HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function normalize(date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}

function todayStart() {
  return normalize(new Date());
}

function addDays(date, amount) {
  const d = new Date(date);

  d.setDate(
    d.getDate() + amount
  );

  return normalize(d);
}

function daysBetween(a, b) {
  return Math.floor(
    (
      normalize(a).getTime() -
      normalize(b).getTime()
    ) / 86400000
  );
}

function dateToString(date) {

  const y = date.getFullYear();

  const m =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const d =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

function stringToDate(value) {

  const p = value.split("-");

  return new Date(
    Number(p[0]),
    Number(p[1]) - 1,
    Number(p[2])
  );
}

function timeToString(date) {

  const h =
    String(
      date.getHours()
    ).padStart(2, "0");

  const m =
    String(
      date.getMinutes()
    ).padStart(2, "0");

  return `${h}:${m}`;
}

function timeStringToDate(value) {

  const p = value.split(":");

  const d = new Date();

  d.setHours(
    Number(p[0]),
    Number(p[1]),
    0,
    0
  );

  return d;
}

function formatClock(hour, minute) {

  const d = new Date();

  d.setHours(
    hour,
    minute,
    0,
    0
  );

  const f = new DateFormatter();

  f.locale = "en_US";
  f.useNoDateStyle();
  f.useShortTimeStyle();

  return f.string(d);
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIG
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function defaultConfig() {
  return {
    title: SCRIPT_NAME,
    roomCode: "K",
    strain: "G47",
    startDate: dateToString(todayStart()),
    weeks: 9,
    lightOn: "01:00"
  };
}

function loadConfig() {

  const defaults = defaultConfig();

  if (!fm.fileExists(configFile)) {
    return defaults;
  }

  try {

    return {
      ...defaults,
      ...JSON.parse(
        fm.readString(configFile)
      )
    };

  } catch (e) {
    return defaults;
  }
}

function saveConfig(cfg) {

  fm.writeString(
    configFile,
    JSON.stringify(cfg)
  );
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EDIT ROOM
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function editRoomInfo(cfg) {

  const a = new Alert();

  a.title = "ROOM INFORMATION";

  a.addTextField(
    "ROOM TITLE",
    cfg.title
  );

  a.addTextField(
    "ROOM CODE",
    cfg.roomCode
  );

  a.addTextField(
    "STRAIN",
    cfg.strain
  );

  a.addAction("SAVE");
  a.addCancelAction("CANCEL");

  const result = await a.present();

  if (result === -1) {
    return cfg;
  }

  const title =
    a.textFieldValue(0).trim();

  const code =
    a.textFieldValue(1).trim();

  const strain =
    a.textFieldValue(2).trim();

  if (title) cfg.title = title;
  if (code) cfg.roomCode = code;
  if (strain) cfg.strain = strain;

  return cfg;
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BLOOM DATE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function chooseBloomDate(cfg) {

  const picker = new DatePicker();

  picker.initialDate =
    stringToDate(cfg.startDate);

  const selected =
    await picker.pickDate();

  if (selected) {

    cfg.startDate =
      dateToString(selected);
  }

  return cfg;
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LIGHT TIME
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function chooseLightTime(cfg) {

  const picker = new DatePicker();

  picker.initialDate =
    timeStringToDate(cfg.lightOn);

  const selected =
    await picker.pickTime();

  if (selected) {

    cfg.lightOn =
      timeToString(selected);
  }

  return cfg;
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FLOWER LENGTH
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function chooseWeeks(cfg) {

  const a = new Alert();

  a.title = "FLOWER LENGTH";

  a.addAction("8 WEEKS");
  a.addAction("9 WEEKS");
  a.addCancelAction("CANCEL");

  const result =
    await a.presentSheet();

  if (result === 0) {
    cfg.weeks = 8;
  }

  if (result === 1) {
    cfg.weeks = 9;
  }

  return cfg;
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LIGHTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function getLightsOnText(lightOn) {

  const p = lightOn.split(":");

  return formatClock(
    Number(p[0]),
    Number(p[1])
  );
}

function getLightsOffText(lightOn) {

  const p = lightOn.split(":");

  const start =
    Number(p[0]) * 60 +
    Number(p[1]);

  const off =
    (start + 720) % 1440;

  return formatClock(
    Math.floor(off / 60),
    off % 60
  );
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BLOOM STAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function bloomStage(day) {

  if (day <= 7) return "TRANSITION";
  if (day <= 21) return "STRETCH";
  if (day <= 35) return "STACKING";
  if (day <= 49) return "BULK";
  if (day <= 56) return "FINISH";

  return "RIPENING";
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROCESS / MILESTONES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function milestoneForDay(day, totalDays) {

  if (day === 10) {
    return "T";
  }

  if (day === 21) {
    return "DEFOL";
  }

  if (day === 34) {
    return "CLONS";
  }

  if (day === 41) {
    return "T1";
  }

  if (day === 42) {
    return "DEFOL";
  }

  if (day === 52) {
    return "T2";
  }

  if (day === totalDays) {
    return "HARVEST";
  }

  return null;
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROCESS STATUS
//
// TODAY      → RED
// TOMORROW   → ORANGE
// +2 DAYS    → YELLOW
// NOTHING    → BLACK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function getProcessStatus(
  bloomDay,
  totalDays
) {

  const todayProcess =
    milestoneForDay(
      bloomDay,
      totalDays
    );

  if (todayProcess) {
    return {
      level: 0,
      process: todayProcess,
      background: STATUS_RED
    };
  }


  const tomorrowProcess =
    milestoneForDay(
      bloomDay + 1,
      totalDays
    );

  if (tomorrowProcess) {
    return {
      level: 1,
      process: tomorrowProcess,
      background: STATUS_ORANGE
    };
  }


  const twoDaysProcess =
    milestoneForDay(
      bloomDay + 2,
      totalDays
    );

  if (twoDaysProcess) {
    return {
      level: 2,
      process: twoDaysProcess,
      background: STATUS_YELLOW
    };
  }


  return {
    level: -1,
    process: null,
    background: BLACK
  };
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NOTIFICATION HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function notificationDate(
  bloomStart,
  bloomDay,
  hour,
  minute,
  dayOffset = 0
) {

  const eventDate =
    addDays(
      bloomStart,
      bloomDay - 1 + dayOffset
    );

  eventDate.setHours(
    hour,
    minute,
    0,
    0
  );

  return eventDate;
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NOTIFICATION IDS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function allNotificationIDs() {

  const days =
    [21, 42, 56, 63];

  const ids = [];

  for (const day of days) {

    ids.push(
      `KONG_${ROOM_ID}_D${day}_PRE`
    );

    ids.push(
      `KONG_${ROOM_ID}_D${day}_DAY`
    );
  }

  return ids;
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CREATE NOTIFICATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function createRoomNotification(
  identifier,
  date,
  title,
  body
) {

  if (
    date.getTime() <=
    new Date().getTime()
  ) {
    return;
  }

  const n =
    new Notification();

  n.identifier =
    identifier;

  n.title =
    title;

  n.body =
    body;

  n.sound =
    "alert";

  n.threadIdentifier =
    `KONG_${ROOM_ID}`;

  n.setTriggerDate(
    date
  );

  await n.schedule();
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROGRAM NOTIFICATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function scheduleRoomNotifications(cfg) {

  try {

    await Notification.removePending(
      allNotificationIDs()
    );

  } catch (e) {}


  const bloomStart =
    stringToDate(
      cfg.startDate
    );

  const totalDays =
    cfg.weeks * 7;

  const room =
    cfg.roomCode
      .trim()
      .toUpperCase();


  const events = [
    {
      day: 21,
      name: "Defoliation"
    },
    {
      day: 42,
      name: "Defoliation"
    },
    {
      day: totalDays,
      name: "Harvest"
    }
  ];


  for (const event of events) {

    // PREVIOUS DAY — 10 PM

    const previousNight =
      notificationDate(
        bloomStart,
        event.day,
        22,
        0,
        -1
      );


    await createRoomNotification(
      `KONG_${ROOM_ID}_D${event.day}_PRE`,
      previousNight,
      `Room (${room}) — Tomorrow`,
      `Day ${event.day} ${event.name}`
    );


    // SAME DAY — 7:30 AM

    const sameMorning =
      notificationDate(
        bloomStart,
        event.day,
        7,
        30,
        0
      );


    await createRoomNotification(
      `KONG_${ROOM_ID}_D${event.day}_DAY`,
      sameMorning,
      `Room (${room})`,
      `Day ${event.day} ${event.name}`
    );
  }
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXACT CALENDAR IMAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function makeCalendarImage(
  today,
  bloomStart,
  totalDays,
  statusMode
) {

  const WIDTH = 216;
  const HEIGHT = 76;

  const ctx =
    new DrawContext();

  ctx.size =
    new Size(
      WIDTH,
      HEIGHT
    );

  ctx.opaque = false;

  ctx.respectScreenScale =
    true;


  const letters =
    ["S", "M", "T", "W", "T", "F", "S"];


  const cellWidth =
    WIDTH / 7;


  const statusActive =
    statusMode.level >= 0;


  const accentColor =
    statusActive
      ? BLACK
      : GREEN;


  const dateColor =
    statusActive
      ? STATUS_GRAY
      : WHITE;


  const normalGray =
    statusActive
      ? STATUS_GRAY
      : GRAY;


  const milestoneColor =
    statusActive
      ? STATUS_GRAY
      : LIGHT_GRAY;


  for (let i = 0; i < 7; i++) {

    const date =
      addDays(
        today,
        i
      );


    const flowerDay =
      daysBetween(
        date,
        bloomStart
      ) + 1;


    const x =
      i * cellWidth;


    // WEEKDAY

    ctx.setFont(
      Font.boldSystemFont(9)
    );


    ctx.setTextColor(
      i === 0
        ? accentColor
        : normalGray
    );


    ctx.setTextAlignedCenter();


    ctx.drawTextInRect(
      letters[
        date.getDay()
      ],
      new Rect(
        x,
        0,
        cellWidth,
        13
      )
    );


    // DATE

    ctx.setFont(
      Font.boldSystemFont(16)
    );


    ctx.setTextColor(
      dateColor
    );


    ctx.setTextAlignedCenter();


    ctx.drawTextInRect(
      String(
        date.getDate()
      ),
      new Rect(
        x,
        19,
        cellWidth,
        22
      )
    );


    // MILESTONE

    const milestone =
      milestoneForDay(
        flowerDay,
        totalDays
      );


    if (milestone) {

      ctx.setFont(
        Font.systemFont(5)
      );


      ctx.setTextColor(
        milestoneColor
      );


      ctx.setTextAlignedCenter();


      let y = 43;


      for (const ch of milestone) {

        ctx.drawTextInRect(
          ch,
          new Rect(
            x,
            y,
            cellWidth,
            6
          )
        );

        y += 5;
      }
    }
  }


  return ctx.getImage();
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SETTINGS MENU
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function configurationMenu() {

  let cfg =
    loadConfig();


  while (true) {

    const df =
      new DateFormatter();


    df.dateFormat =
      "MMM d, yyyy";


    const harvestDay =
      cfg.weeks * 7;


    const menu =
      new Alert();


    menu.title =
      `KONG — ${SCRIPT_NAME}`;


    menu.message =
      `${cfg.title} · ${cfg.roomCode}\n` +
      `${cfg.strain}\n` +
      `Bloom: ${df.string(stringToDate(cfg.startDate))}\n` +
      `${cfg.weeks} weeks · Harvest D${harvestDay}\n` +
      `ON: ${getLightsOnText(cfg.lightOn)}\n` +
      `OFF: ${getLightsOffText(cfg.lightOn)}`;


    menu.addAction(
      "✏️ ROOM / CODE / STRAIN"
    );

    menu.addAction(
      "📅 BLOOM START"
    );

    menu.addAction(
      "⏰ LIGHTS ON"
    );

    menu.addAction(
      "🌸 FLOWER LENGTH"
    );

    menu.addAction(
      "👁 PREVIEW"
    );

    menu.addCancelAction(
      "DONE"
    );


    const result =
      await menu.presentSheet();


    if (result === -1) {

      saveConfig(cfg);

      await scheduleRoomNotifications(
        cfg
      );

      break;
    }


    if (result === 0) {

      cfg =
        await editRoomInfo(
          cfg
        );
    }


    if (result === 1) {

      cfg =
        await chooseBloomDate(
          cfg
        );
    }


    if (result === 2) {

      cfg =
        await chooseLightTime(
          cfg
        );
    }


    if (result === 3) {

      cfg =
        await chooseWeeks(
          cfg
        );
    }


    saveConfig(cfg);


    if (
      result === 0 ||
      result === 1 ||
      result === 3
    ) {

      await scheduleRoomNotifications(
        cfg
      );
    }


    if (result === 4) {

      const preview =
        await buildWidget(
          cfg
        );

      await preview.presentMedium();
    }
  }
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BUILD WIDGET
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function buildWidget(cfg) {

  const widget =
    new ListWidget();


  // ─────────────────────────────
  // CALCULATIONS
  // ─────────────────────────────

  const today =
    todayStart();


  const bloomStart =
    stringToDate(
      cfg.startDate
    );


  let bloomDay =
    daysBetween(
      today,
      bloomStart
    ) + 1;


  if (bloomDay < 1) {
    bloomDay = 1;
  }


  const totalDays =
    cfg.weeks * 7;


  let currentWeek =
    Math.ceil(
      bloomDay / 7
    );


  currentWeek =
    Math.max(
      1,
      Math.min(
        currentWeek,
        cfg.weeks
      )
    );


  const stage =
    bloomStage(
      bloomDay
    );


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PROCESS STATUS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const status =
    getProcessStatus(
      bloomDay,
      totalDays
    );


  const statusActive =
    status.level >= 0;


  widget.backgroundColor =
    status.background;


  // Anything normally GREEN
  // becomes BLACK when status active.

  const accentColor =
    statusActive
      ? BLACK
      : GREEN;


  // White becomes gray.

  const primaryColor =
    statusActive
      ? STATUS_GRAY
      : WHITE;


  const secondaryColor =
    statusActive
      ? STATUS_GRAY
      : GRAY;


  const tertiaryColor =
    statusActive
      ? STATUS_GRAY
      : LIGHT_GRAY;


  const progressOffColor =
    statusActive
      ? STATUS_LIGHT_GRAY
      : DARK_GRAY;


  widget.setPadding(
    8,
    14,
    7,
    14
  );


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MAIN
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const main =
    widget.addStack();

  main.layoutHorizontally();


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LEFT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const left =
    main.addStack();

  left.layoutVertically();

  left.size =
    new Size(
      218,
      0
    );

  left.addSpacer(3);


  // ─────────────────────────────
  // HEADER
  // ─────────────────────────────

  const top =
    left.addStack();

  top.layoutHorizontally();


  const titleSide =
    top.addStack();

  titleSide.layoutVertically();


  const title =
    titleSide.addText(
      cfg.title.toUpperCase()
    );


  title.font =
    Font.boldSystemFont(15);


  title.textColor =
    primaryColor;


  title.lineLimit = 1;

  title.minimumScaleFactor =
    0.6;


  titleSide.addSpacer(2);


  const phase =
    titleSide.addStack();

  phase.layoutHorizontally();


  const week =
    phase.addText(
      `WEEK ${currentWeek}`
    );


  week.font =
    Font.boldSystemFont(15);


  week.textColor =
    accentColor;


  week.lineLimit = 1;


  phase.addSpacer(11);


  const stageText =
    phase.addText(stage);


  stageText.font =
    Font.boldSystemFont(15);


  stageText.textColor =
    accentColor;


  stageText.lineLimit = 1;


  stageText.minimumScaleFactor =
    0.5;


  top.addSpacer();


  // ─────────────────────────────
  // STRAIN
  // ─────────────────────────────

  const strainBox =
    top.addStack();


  strainBox.layoutVertically();


  strainBox.size =
    new Size(
      55,
      31
    );


  const strainLabel =
    strainBox.addText(
      "STRAIN"
    );


  strainLabel.font =
    Font.boldSystemFont(7);


  strainLabel.textColor =
    secondaryColor;


  strainBox.addSpacer(1);


  const strain =
    strainBox.addText(
      cfg.strain.toUpperCase()
    );


  strain.font =
    Font.boldSystemFont(8);


  strain.textColor =
    primaryColor;


  strain.lineLimit = 2;


  strain.minimumScaleFactor =
    0.45;


  left.addSpacer(6);


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PROGRESS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const progressWidth =
    216;


  const progress =
    Math.min(
      Math.max(
        bloomDay / totalDays,
        0
      ),
      1
    );


  const filledWidth =
    Math.max(
      2,
      Math.round(
        progressWidth *
        progress
      )
    );


  const progressRow =
    left.addStack();


  progressRow.layoutHorizontally();


  const progressOn =
    progressRow.addStack();


  progressOn.size =
    new Size(
      filledWidth,
      3
    );


  progressOn.backgroundColor =
    accentColor;


  progressOn.cornerRadius = 2;


  if (
    filledWidth <
    progressWidth
  ) {

    const progressOff =
      progressRow.addStack();


    progressOff.size =
      new Size(
        progressWidth -
        filledWidth,
        3
      );


    progressOff.backgroundColor =
      progressOffColor;


    progressOff.cornerRadius = 2;
  }


  left.addSpacer(6);


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CALENDAR
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const calendarImage =
    makeCalendarImage(
      today,
      bloomStart,
      totalDays,
      status
    );


  const calendar =
    left.addImage(
      calendarImage
    );


  calendar.imageSize =
    new Size(
      216,
      76
    );


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GAP
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  main.addSpacer(9);


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RIGHT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const right =
    main.addStack();


  right.layoutVertically();


  right.size =
    new Size(
      80,
      0
    );


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ROOM CODE BOX
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const codeTopRow =
    right.addStack();


  codeTopRow.layoutHorizontally();


  codeTopRow.centerAlignContent();


  codeTopRow.backgroundColor =
    statusActive
      ? STATUS_BOX
      : new Color("#202020");


  codeTopRow.cornerRadius = 6;


  codeTopRow.size =
    new Size(
      80,
      21
    );


  codeTopRow.addSpacer();


  const roomCode =
    codeTopRow.addText(
      cfg.roomCode.toUpperCase()
    );


  roomCode.font =
    Font.boldSystemFont(12);


  roomCode.textColor =
    statusActive
      ? STATUS_BOX_TEXT
      : WHITE;


  roomCode.lineLimit = 1;


  roomCode.centerAlignText();


  codeTopRow.addSpacer();


  right.addSpacer(2);


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DXX
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const dayRow =
    right.addStack();


  dayRow.layoutHorizontally();


  dayRow.addSpacer();


  const day =
    dayRow.addText(
      `D${bloomDay}`
    );


  day.font =
    Font.boldSystemFont(29);


  day.textColor =
    accentColor;


  day.lineLimit = 1;


  day.minimumScaleFactor =
    0.55;


  day.centerAlignText();


  dayRow.addSpacer();


  right.addSpacer(7);


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LIGHTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const lightBox =
    right.addStack();


  lightBox.layoutVertically();


  // LIGHTS ON

  const onRow =
    lightBox.addStack();


  onRow.layoutHorizontally();


  onRow.addSpacer();


  const sunSymbol =
    SFSymbol.named(
      "sun.max.fill"
    );


  const sun =
    onRow.addImage(
      sunSymbol.image
    );


  sun.imageSize =
    new Size(
      8,
      8
    );


  sun.tintColor =
    tertiaryColor;


  onRow.addSpacer(4);


  const on =
    onRow.addText(
      getLightsOnText(
        cfg.lightOn
      )
    );


  on.font =
    Font.systemFont(7);


  on.textColor =
    tertiaryColor;


  on.lineLimit = 1;


  onRow.addSpacer();


  lightBox.addSpacer(5);


  // LIGHTS OFF

  const offRow =
    lightBox.addStack();


  offRow.layoutHorizontally();


  offRow.addSpacer();


  const moonSymbol =
    SFSymbol.named(
      "moon.fill"
    );


  const moon =
    offRow.addImage(
      moonSymbol.image
    );


  moon.imageSize =
    new Size(
      8,
      8
    );


  moon.tintColor =
    tertiaryColor;


  offRow.addSpacer(4);


  const off =
    offRow.addText(
      getLightsOffText(
        cfg.lightOn
      )
    );


  off.font =
    Font.systemFont(7);


  off.textColor =
    tertiaryColor;


  off.lineLimit = 1;


  offRow.addSpacer();


  return widget;
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RUN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if (config.runsInWidget) {

  const widget =
    await buildWidget(
      loadConfig()
    );


  Script.setWidget(
    widget
  );

} else {

  await configurationMenu();
}


Script.complete();

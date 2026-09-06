// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KONG — BLOOM ROOM WIDGET
// V17 — REMOTE ROOMS
//
// CENTRAL CONFIG:
// KONG_CONFIG.json
//
// WIDGET PARAMETER:
// K1 / K2 / B1 / B2 / ETC.
//
// NORMAL        = BLACK
// PROCESS +2D   = YELLOW
// PROCESS +1D   = ORANGE
// PROCESS TODAY = RED
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// REMOTE CONFIG
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CONFIG_URL =
  "https://raw.githubusercontent.com/patokong/KONG/main/KONG_CONFIG.json";

const fm = FileManager.local();

const CACHE_FILE =
  fm.joinPath(
    fm.documentsDirectory(),
    "KONG_REMOTE_CONFIG_CACHE.json"
  );


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COLORS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const GREEN = new Color("#63D66B");
const WHITE = new Color("#F4F4F4");
const GRAY = new Color("#777777");
const LIGHT_GRAY = new Color("#999999");
const DARK_GRAY = new Color("#292929");
const BLACK = new Color("#050505");

const STATUS_RED = new Color("#FF3B30");
const STATUS_ORANGE = new Color("#FF9500");
const STATUS_YELLOW = new Color("#FFD60A");

const STATUS_GRAY = new Color("#666666");
const STATUS_LIGHT_GRAY = new Color("#999999");
const STATUS_BOX = new Color("#A8A8A8");
const STATUS_BOX_TEXT = new Color("#555555");


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

  return normalize(
    new Date()
  );
}


function addDays(date, amount) {

  const d =
    new Date(date);

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


function stringToDate(value) {

  const p =
    String(value)
      .split("-");

  return new Date(
    Number(p[0]),
    Number(p[1]) - 1,
    Number(p[2])
  );
}


function formatClock(
  hour,
  minute
) {

  const d =
    new Date();

  d.setHours(
    hour,
    minute,
    0,
    0
  );

  const f =
    new DateFormatter();

  f.locale =
    "en_US";

  f.useNoDateStyle();

  f.useShortTimeStyle();

  return f.string(d);
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LIGHTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function getLightsOnText(
  lightOn
) {

  const p =
    String(lightOn)
      .split(":");

  return formatClock(
    Number(p[0]),
    Number(p[1])
  );
}


function getLightsOffText(
  lightOn
) {

  const p =
    String(lightOn)
      .split(":");

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

  if (day <= 7) {
    return "TRANSITION";
  }

  if (day <= 21) {
    return "STRETCH";
  }

  if (day <= 35) {
    return "STACKING";
  }

  if (day <= 49) {
    return "BULK";
  }

  if (day <= 56) {
    return "FINISH";
  }

  return "RIPENING";
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DOWNLOAD REMOTE CONFIG
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function downloadRemoteConfig() {

  try {

    const req =
      new Request(
        CONFIG_URL
      );

    req.timeoutInterval = 10;

    const text =
      await req.loadString();

    const data =
      JSON.parse(text);


    if (
      data &&
      data.rooms
    ) {

      fm.writeString(
        CACHE_FILE,
        text
      );

      console.log(
        "KONG: Remote config updated."
      );

      return data;
    }

  } catch (error) {

    console.log(
      "KONG CONFIG DOWNLOAD ERROR: " +
      error
    );
  }


  // ─────────────────────────────
  // OFFLINE CACHE
  // ─────────────────────────────

  try {

    if (
      fm.fileExists(
        CACHE_FILE
      )
    ) {

      const cached =
        JSON.parse(
          fm.readString(
            CACHE_FILE
          )
        );

      if (
        cached &&
        cached.rooms
      ) {

        console.log(
          "KONG: Using cached config."
        );

        return cached;
      }
    }

  } catch (error) {

    console.log(
      "KONG CACHE ERROR: " +
      error
    );
  }


  return null;
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROOM HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function roomKeys(data) {

  if (
    !data ||
    !data.rooms
  ) {
    return [];
  }

  return Object.keys(
    data.rooms
  );
}


function normalizeRoomID(value) {

  return String(
    value || ""
  )
    .trim()
    .toUpperCase();
}


function getRoom(
  data,
  roomID
) {

  const wanted =
    normalizeRoomID(
      roomID
    );

  if (
    !wanted ||
    !data ||
    !data.rooms
  ) {
    return null;
  }


  // Exact key

  if (
    data.rooms[wanted]
  ) {
    return data.rooms[wanted];
  }


  // Case-insensitive fallback

  for (
    const key of
    Object.keys(data.rooms)
  ) {

    if (
      key.toUpperCase() ===
      wanted
    ) {

      return data.rooms[key];
    }
  }


  return null;
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROCESSES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function getProcesses(cfg) {

  if (
    !cfg ||
    !Array.isArray(
      cfg.processes
    )
  ) {

    return [];
  }


  return cfg.processes
    .filter(p => {

      return (
        p &&
        Number.isFinite(
          Number(p.day)
        ) &&
        String(
          p.name || ""
        ).trim()
      );

    })
    .map(p => {

      return {
        day: Number(p.day),
        name:
          String(p.name)
            .trim()
            .toUpperCase()
      };

    });
}


function milestoneForDay(
  day,
  cfg
) {

  const processes =
    getProcesses(cfg);


  const matches =
    processes.filter(
      p =>
        p.day === day
    );


  if (
    matches.length > 0
  ) {

    return matches
      .map(p => p.name)
      .join("/");
  }


  // Automatic harvest fallback

  const totalDays =
    Number(cfg.weeks) * 7;


  if (
    day === totalDays
  ) {

    return "HARVEST";
  }


  return null;
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROCESS STATUS
//
// TODAY    → RED
// TOMORROW → ORANGE
// +2 DAYS  → YELLOW
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function getProcessStatus(
  bloomDay,
  cfg
) {

  const todayProcess =
    milestoneForDay(
      bloomDay,
      cfg
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
      cfg
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
      cfg
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
// CALENDAR IMAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function makeCalendarImage(
  today,
  bloomStart,
  cfg,
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
    [
      "S",
      "M",
      "T",
      "W",
      "T",
      "F",
      "S"
    ];


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


  for (
    let i = 0;
    i < 7;
    i++
  ) {

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
      i *
      cellWidth;


    // ───────────────────────────
    // WEEKDAY
    // ───────────────────────────

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


    // ───────────────────────────
    // DATE
    // ───────────────────────────

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


    // ───────────────────────────
    // PROCESS
    // ───────────────────────────

    const milestone =
      milestoneForDay(
        flowerDay,
        cfg
      );


    if (milestone) {

      ctx.setFont(
        Font.systemFont(5)
      );


      ctx.setTextColor(
        milestoneColor
      );


      ctx.setTextAlignedCenter();


      let display =
        milestone;


      if (
        display.length > 9
      ) {

        display =
          display.substring(
            0,
            9
          );
      }


      let y = 43;


      for (
        const ch of display
      ) {

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


        if (
          y > 72
        ) {
          break;
        }
      }
    }
  }


  return ctx.getImage();
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ERROR WIDGET
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function errorWidget(
  title,
  message
) {

  const widget =
    new ListWidget();


  widget.backgroundColor =
    BLACK;


  widget.setPadding(
    18,
    18,
    18,
    18
  );


  const titleText =
    widget.addText(
      title
    );


  titleText.font =
    Font.boldSystemFont(18);


  titleText.textColor =
    STATUS_RED;


  widget.addSpacer(7);


  const messageText =
    widget.addText(
      message
    );


  messageText.font =
    Font.systemFont(11);


  messageText.textColor =
    LIGHT_GRAY;


  messageText.lineLimit = 5;


  return widget;
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BUILD WIDGET
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function buildWidget(
  cfg
) {

  const widget =
    new ListWidget();


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CALCULATIONS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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


  if (
    bloomDay < 1
  ) {

    bloomDay = 1;
  }


  const totalDays =
    Number(cfg.weeks) * 7;


  let currentWeek =
    Math.ceil(
      bloomDay / 7
    );


  currentWeek =
    Math.max(
      1,
      Math.min(
        currentWeek,
        Number(cfg.weeks)
      )
    );


  const stage =
    bloomStage(
      bloomDay
    );


  const status =
    getProcessStatus(
      bloomDay,
      cfg
    );


  const statusActive =
    status.level >= 0;


  widget.backgroundColor =
    status.background;


  const accentColor =
    statusActive
      ? BLACK
      : GREEN;


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
      String(
        cfg.title ||
        cfg.roomCode ||
        "KONG"
      ).toUpperCase()
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
    phase.addText(
      stage
    );


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
      String(
        cfg.strain ||
        "-"
      ).toUpperCase()
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
        bloomDay /
        totalDays,
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
      cfg,
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
      : new Color(
          "#202020"
        );


  codeTopRow.cornerRadius = 6;


  codeTopRow.size =
    new Size(
      80,
      21
    );


  codeTopRow.addSpacer();


  const roomCode =
    codeTopRow.addText(
      String(
        cfg.roomCode ||
        "-"
      ).toUpperCase()
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
        cfg.lightOn ||
        "01:00"
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
        cfg.lightOn ||
        "01:00"
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
// ROOM SELECTOR
// Used when script is opened manually.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function roomSelector(
  data
) {

  const keys =
    roomKeys(
      data
    );


  if (
    keys.length === 0
  ) {

    const a =
      new Alert();

    a.title =
      "KONG";

    a.message =
      "No rooms found.";

    a.addAction(
      "OK"
    );

    await a.present();

    return;
  }


  const menu =
    new Alert();


  menu.title =
    "KONG ROOMS";


  menu.message =
    "Select a room to preview.";


  for (
    const key of keys
  ) {

    const cfg =
      data.rooms[key];


    menu.addAction(
      `${key} · ${
        cfg.strain || ""
      }`
    );
  }


  menu.addCancelAction(
    "DONE"
  );


  const result =
    await menu.presentSheet();


  if (
    result < 0
  ) {
    return;
  }


  const selectedKey =
    keys[result];


  const cfg =
    data.rooms[
      selectedKey
    ];


  const preview =
    await buildWidget(
      cfg
    );


  await preview.presentMedium();
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RUN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const remoteData =
  await downloadRemoteConfig();


if (!remoteData) {

  const widget =
    errorWidget(
      "KONG",
      "Unable to download room configuration."
    );


  if (
    config.runsInWidget
  ) {

    Script.setWidget(
      widget
    );

  } else {

    await widget.presentMedium();
  }


  Script.complete();

  return;
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WIDGET MODE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if (
  config.runsInWidget
) {

  const parameter =
    normalizeRoomID(
      args.widgetParameter
    );


  if (!parameter) {

    const available =
      roomKeys(
        remoteData
      )
        .join(
          " · "
        );


    const widget =
      errorWidget(
        "SELECT ROOM",
        `Add a Widget Parameter.\n\nAvailable: ${available}`
      );


    Script.setWidget(
      widget
    );


  } else {

    const room =
      getRoom(
        remoteData,
        parameter
      );


    if (!room) {

      const available =
        roomKeys(
          remoteData
        )
          .join(
            " · "
          );


      const widget =
        errorWidget(
          `ROOM ${parameter}`,
          `Not found.\n\nAvailable: ${available}`
        );


      Script.setWidget(
        widget
      );


    } else {

      const widget =
        await buildWidget(
          room
        );


      Script.setWidget(
        widget
      );
    }
  }


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// APP MODE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

} else {

  await roomSelector(
    remoteData
  );
}


Script.complete();

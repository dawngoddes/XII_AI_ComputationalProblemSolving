const SPREADSHEET_ID = '1wc2ns721Rxlv7BR4WDNiJLNAaR839s-FVC1v18A2XV8';
const RESULT_SHEET = 'Hasil UH';
const ANSWER_SHEET = 'Jawaban UH';

const STUDENTS = ["ABDUL KARIM", "AFIDA FAIRUS FATIN", "AGUNG SETIAWAN", "AILSA AGRA MAYCHANA", "ANASTASIA VIERA GERNADI", "ARDIAN CAHYO SAPUTRO", "AULIA NUGRAHENI ASOKA CINTA", "AYUDHYA PUTRI GIOVERRY", "BINTANG", "DELA ALVIAH PRIANA NABILA", "DIMAS FIRTA SANTAYA", "DZIKRI DWI ANGGAKARA", "ELSA SETYOWATI", "FAISAL UMAR MANDALA", "FARDAN ARDHIONA YUDHATAMA", "IBNU ARIEF IKHSAN", "ILHAM MANDALATAMA WIBOWO", "INDRA SYAH PUTRA", "INDRIANA VALIN", "KIRANA KARUNIA PUTRI", "LUQMAN HAKIM", "MARSHA DWI SAFITRI", "MICHELP YONERI", "MOHAMAD FAJAR PRATAMA", "MUHAMAD RENDRA HARIYANTO", "NAUFAL ASYRAF RIZQULLAH", "NAZWA RIMA PUTRI", "PRADIGTA AULIA HAYUNINGTYAS", "RAVADITYA ISMAWAN", "SALSA NURUL FATIMAH", "SANDY FEBRI SETIAWAN", "SHAKILLA RAHMADHANI PUTRI", "TEGAR ANGGARA SUSILO", "VIKO REVALINO ARDYANZAH", "ZAHRO NUR HANIFAH", "ZULFA LAILA"];
const ANSWER_KEY = {"1": 1, "2": 3, "3": 2, "4": 1, "5": 1, "6": 1, "7": 1, "8": 2, "9": 0, "10": 2, "11": 1, "12": 1, "13": 0, "14": 0, "15": 1, "16": 2, "17": 1, "18": 1, "19": 0, "20": 1, "21": 1, "22": 0, "23": 0, "24": 2, "25": 0, "26": 0, "27": 0, "28": 0, "29": 0, "30": 1};
const TOPICS = {"1": "Algoritma &amp; Flowchart", "2": "Algoritma &amp; Flowchart", "3": "Algoritma &amp; Flowchart", "4": "Algoritma &amp; Flowchart", "5": "Algoritma &amp; Flowchart", "6": "AI di Kehidupan Sehari-hari", "7": "AI di Kehidupan Sehari-hari", "8": "AI di Kehidupan Sehari-hari", "9": "AI di Kehidupan Sehari-hari", "10": "AI di Kehidupan Sehari-hari", "11": "Self-Driving, IoT &amp; ML", "12": "Self-Driving, IoT &amp; ML", "13": "Self-Driving, IoT &amp; ML", "14": "Self-Driving, IoT &amp; ML", "15": "Self-Driving, IoT &amp; ML", "16": "AI Detective", "17": "AI Detective", "18": "AI Detective", "19": "AI Detective", "20": "AI Detective", "21": "Data BPS → Infografis", "22": "Data BPS → Infografis", "23": "Data BPS → Infografis", "24": "Data BPS → Infografis", "25": "Data BPS → Infografis", "26": "One-Shot Prompt", "27": "One-Shot Prompt", "28": "One-Shot Prompt", "29": "One-Shot Prompt", "30": "One-Shot Prompt"};

function doGet(e) {
  const p = (e && e.parameter) ? e.parameter : {};
  const action = p.action || 'ping';
  let result;

  if (action === 'check') {
    result = checkName_(String(p.name || '').trim());
  } else if (action === 'status') {
    result = getSubmissionStatus_(String(p.submissionId || '').trim());
  } else {
    result = {ok:true, service:'Ulangan Harian Informatika XII Fase F'};
  }

  const callback = String(p.callback || '').trim();
  if (callback && /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback)) {
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify(result) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const raw = e && e.parameter ? e.parameter.payload : '';
    const payload = JSON.parse(raw || '{}');
    saveSubmission_(payload);
    return HtmlService.createHtmlOutput('<!doctype html><html><body>OK</body></html>');
  } catch (err) {
    return HtmlService.createHtmlOutput('<!doctype html><html><body>ERROR</body></html>');
  }
}

function setupSheets() {
  const ss = getSS_();

  let result = ss.getSheetByName(RESULT_SHEET);
  if (!result) result = ss.insertSheet(RESULT_SHEET);
  if (result.getLastRow() === 0) {
    result.appendRow([
      'Timestamp','Submission ID','Nama','No Absen','Skor Mini Game',
      'Mini Game Benar','Mini Game Terjawab','Essay Terisi','Uraian Terisi','Status'
    ]);
    result.setFrozenRows(1);
  }

  let answers = ss.getSheetByName(ANSWER_SHEET);
  if (!answers) answers = ss.insertSheet(ANSWER_SHEET);
  if (answers.getLastRow() === 0) {
    answers.appendRow([
      'Timestamp','Submission ID','Nama','No Absen','No Soal',
      'Tipe','Topik','Jawaban','Benar','Skor'
    ]);
    answers.setFrozenRows(1);
  }
  return 'OK';
}

function getSS_() {
  if (!SPREADSHEET_ID || SPREADSHEET_ID === 'PASTE_SPREADSHEET_ID_DI_SINI') {
    throw new Error('SPREADSHEET_ID belum diisi.');
  }
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function checkName_(name) {
  if (!STUDENTS.includes(name)) return {valid:false,submitted:false};
  const ss = getSS_();
  const sh = ss.getSheetByName(RESULT_SHEET);
  if (!sh || sh.getLastRow() < 2) return {valid:true,submitted:false};
  const names = sh.getRange(2,3,sh.getLastRow()-1,1).getValues().flat().map(String);
  return {valid:true,submitted:names.includes(name)};
}

function saveSubmission_(payload) {
  if (!payload || !payload.name || !payload.submissionId) throw new Error('Payload tidak lengkap.');

  const name = String(payload.name).trim();
  const submissionId = String(payload.submissionId).trim();
  if (!STUDENTS.includes(name)) throw new Error('Nama tidak valid.');

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    const ss = getSS_();
    setupSheets();
    const resultSheet = ss.getSheetByName(RESULT_SHEET);
    const answerSheet = ss.getSheetByName(ANSWER_SHEET);

    const last = resultSheet.getLastRow();
    if (last >= 2) {
      const rows = resultSheet.getRange(2,2,last-1,2).getValues();
      for (let i=0; i<rows.length; i++) {
        if (String(rows[i][0]) === submissionId || String(rows[i][1]) === name) {
          return {saved:false,duplicate:true,submissionId:submissionId};
        }
      }
    }

    const now = new Date();
    const noAbsen = STUDENTS.indexOf(name) + 1;
    const objective = Array.isArray(payload.objective) ? payload.objective : [];
    const essays = Array.isArray(payload.essays) ? payload.essays : [];

    let correctCount = 0;
    let answeredCount = 0;
    let shortCount = 0;
    let longCount = 0;
    const answerRows = [];

    objective.forEach(item => {
      const qid = Number(item.qid);
      const selectedIndex = Number(item.selectedIndex);
      if (!Object.prototype.hasOwnProperty.call(ANSWER_KEY, qid) || Number.isNaN(selectedIndex)) return;

      answeredCount++;
      const correct = ANSWER_KEY[qid] === selectedIndex;
      if (correct) correctCount++;

      const options = Array.isArray(item.options) ? item.options : [];
      const answerText = options[selectedIndex] || '';

      answerRows.push([
        now, submissionId, name, noAbsen, qid, 'Mini Game',
        TOPICS[qid] || '', safeCell_(answerText), correct ? 'BENAR' : 'SALAH',
        correct ? 2 : 0
      ]);
    });

    essays.forEach(item => {
      const type = String(item.type || '');
      const qid = String(item.qid || '');
      const answer = safeCell_(String(item.answer || '').trim());

      if (type === 'Essay Singkat' && answer) shortCount++;
      if (type === 'Uraian Panjang' && answer) longCount++;

      if (type === 'Essay Singkat' || type === 'Uraian Panjang') {
        answerRows.push([now,submissionId,name,noAbsen,qid,type,'',answer,'','']);
      }
    });

    const status = (answeredCount === 30 && shortCount === 10 && longCount === 5)
      ? 'LENGKAP' : 'BELUM LENGKAP';

    resultSheet.appendRow([
      now, submissionId, name, noAbsen, correctCount*2, correctCount,
      answeredCount, shortCount, longCount, status
    ]);

    if (answerRows.length) {
      answerSheet
        .getRange(answerSheet.getLastRow()+1,1,answerRows.length,answerRows[0].length)
        .setValues(answerRows);
    }

    return {
      saved:true,duplicate:false,submissionId:submissionId,
      name:name,noAbsen:noAbsen,score:correctCount*2,
      correctCount:correctCount,answeredCount:answeredCount,
      shortCount:shortCount,longCount:longCount,status:status
    };
  } finally {
    lock.releaseLock();
  }
}

function getSubmissionStatus_(submissionId) {
  if (!submissionId) return {saved:false};
  const ss = getSS_();
  const sh = ss.getSheetByName(RESULT_SHEET);
  if (!sh || sh.getLastRow() < 2) return {saved:false};

  const values = sh.getRange(2,1,sh.getLastRow()-1,10).getValues();
  for (let i=0; i<values.length; i++) {
    if (String(values[i][1]) === submissionId) {
      return {
        saved:true,
        submissionId:submissionId,
        name:String(values[i][2]),
        noAbsen:Number(values[i][3]),
        score:Number(values[i][4]),
        correctCount:Number(values[i][5]),
        answeredCount:Number(values[i][6]),
        shortCount:Number(values[i][7]),
        longCount:Number(values[i][8]),
        status:String(values[i][9])
      };
    }
  }
  return {saved:false};
}

function safeCell_(value) {
  const text = String(value || '');
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

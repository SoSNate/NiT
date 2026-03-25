// ============================================================
//  Gemini ↔ Claude Bridge — Apps Script (גרסה 4.0)
// ============================================================

const MASTER_README_ID = '1tixVBIbk79DUY7ELYWMOee2je885-Seg';
const PDF_FOLDER_ID    = '1tV5qgmW8QBNte3TdLxygs2bE1Knj7etw';
const GEMINI_API_KEY   = 'AIzaSyA5fUjMTEjIr1JwDQfrpUyk1R-l_EpMABg';
const CACHE_FOLDER_ID  = '1fRcCFp49wbLYwQpUcr-q1ulGQZ_kkgpf';
const GEMINI_MODEL     = 'gemini-2.0-flash';

// ============================================================
//  נקודת כניסה — טריגר כל דקה
// ============================================================
function runAgentSyncCycle() {
  const now = getTime();

  try {
    const readmeFile    = DriveApp.getFileById(MASTER_README_ID);
    let   readmeContent = readmeFile.getBlob().getDataAsString();
    Logger.log('README DUMP: ' + readmeContent.substring(0, 300));

    const claudeRequest = extractClaudeRequest(readmeContent);

    if (!claudeRequest) {
      Logger.log('😴 אין בקשה פעילה מקלוד.');
      updateStatus(readmeFile, readmeContent, `🟢 @Gemini זמין וממתין | עודכן: ${now}`);
      return;
    }

    Logger.log(`🎯 בקשה: סוג=${claudeRequest.type} | נושא=${claudeRequest.topic}`);
    updateStatus(readmeFile, readmeContent, `🟠 @Gemini מעבד: "${claudeRequest.topic}" (${now})`);
    readmeContent = readmeFile.getBlob().getDataAsString();

    const pdfKnowledge = getRelevantPdfContent(claudeRequest);
    const systemPrompt = buildSystemPrompt(claudeRequest);
    const aiResponse   = callGeminiAPI(systemPrompt, pdfKnowledge, claudeRequest);

    if (aiResponse) {
      const updatedContent = writeFullResponse(readmeContent, aiResponse, claudeRequest, now);
      readmeFile.setContent(updatedContent);
      Logger.log('✅ תשובה נכתבה בהצלחה.');
    } else {
      updateStatus(readmeFile, readmeContent, `🔴 גמיני לא הצליח להחזיר תשובה (${now})`);
    }

  } catch (e) {
    Logger.log('❌ שגיאה: ' + e.message);
    try {
      const f = DriveApp.getFileById(MASTER_README_ID);
      updateStatus(f, f.getBlob().getDataAsString(), `🔴 שגיאה: ${e.message}`);
    } catch (_) {}
  }
}

// ============================================================
//  זיהוי בקשת קלוד
// ============================================================
function extractClaudeRequest(content) {
  // שלב 1: רשימת נושאים שכבר טופלו
  const handledTopics = [];
  const handledRegex = /✅ טופל[^\n]*—\s*([^\n]+)/g;
  let m;
  while ((m = handledRegex.exec(content)) !== null) {
    handledTopics.push(m[1].trim());
  }
  Logger.log('📋 טופלו: ' + (handledTopics.join(', ') || 'אין'));

  // שלב 2: חלץ את אזור "סל דרישות"
  const sectionMatch = content.match(/## 🛒 סל דרישות\n([\s\S]*?)(?=\n---|\n## |$)/);
  if (!sectionMatch) { Logger.log('❌ סל דרישות לא נמצא'); return null; }

  const sectionBody = sectionMatch[1];
  Logger.log('SECTION: ' + sectionBody.substring(0, 200));

  // שלב 3: מצא בקשה לא מטופלת
  const requestRegex = /@Gemini\s*\[סוג:\s*(\w+)\]([\s\S]*?)(?=@Gemini|\n---|\n## |$)/g;
  while ((m = requestRegex.exec(sectionBody)) !== null) {
    const block       = m[2];
    const topicMatch   = block.match(/נושא:\s*([^\n]+)/);
    const requestMatch = block.match(/בקשה:\s*([^\n]+)/);
    const fileMatch    = block.match(/קובץ:\s*([^\n]+)/);
    const priorityMatch = block.match(/עדיפות:\s*([^\n]+)/);

    if (topicMatch && requestMatch) {
      const topic = topicMatch[1].trim();
      if (!handledTopics.includes(topic)) {
        Logger.log(`🎯 נמצאה בקשה חדשה: ${topic}`);
        return {
          type:     m[1].trim(),
          topic,
          request:  requestMatch[1].trim(),
          file:     fileMatch    ? fileMatch[1].trim()    : null,
          priority: priorityMatch ? priorityMatch[1].trim() : 'רגיל',
        };
      }
    }
  }

  Logger.log('😴 כל הבקשות טופלו.');
  return null;
}

// ============================================================
//  System Prompt
// ============================================================
function buildSystemPrompt(request) {
  const typeInstructions = {
    INFO: `קלוד מבקש מידע עובדתי מה-PDF.
- חלץ הגדרות, נוסחאות, עמודים רלוונטיים
- ציין מקור מדויק (שם קובץ + עמוד) לכל טענה
- אם אין מידע: כתוב "לא קיים במאגר"`,

    CLARIFY: `קלוד מבקש הבהרה על משהו שגמיני כתב קודם.
- הבהר, הרחב, תקן אם צריך
- היה קצר וממוקד`,

    CONTENT: `קלוד מבקש חומר פדגוגי מובנה לבניית מודול למידה אינטרקטיבי.

🎓 הקהל: נתנאל — סטודנט שנה א' סמסטר ב' הנדסה ב-HIT.
   הקושי העיקרי: הבנה קונספטואלית, לא חישובים טכניים.

חובה להחזיר בדיוק 4 סקציות:

🔵 CORE — הגדרות ונוסחאות מרכזיות
   • ציטוט מדויק מה-PDF + עמוד
   • מה חייבים לדעת בעל פה לבחינה

🟡 PATTERN — 3 סוגי שאלות שחוזרות בבחינות HIT
   • לכל סוג: שם + מבנה טיפוסי + צעדי פתרון ממוספרים

🔴 TRAP — 2-3 טעויות נפוצות של סטודנטים שנה א'
   • לכל טעות: דוגמה שגויה ← תיקון + הסבר

🟢 EXAM — שאלה אחת מלאה מהבחינה שצוינה
   • פתרון צעד-צעד מפורט + רמת קושי 1-5

לכל section: תוכן מה-PDF בלבד, אין המצאות.`,

    SUMMARY: `קלוד מבקש סיכום נושא לסטודנט שנה א' לפני בחינה.
- מבנה: הגדרה → נוסחאות → דוגמה → מה לבחינה
- קומפקטי — לא יותר מ-300 מילים`
  };

  return `אתה "ארכיטקט הידע" של נתנאל — מומחה שקורא חומר HIT רשמי ומזקק ממנו ידע לקלוד.

🏛️ כללי ברזל:
• אל תמציא. כל טענה — מקור מה-PDF (שם קובץ + עמוד).
• אם אין מידע: "לא קיים במאגר".
• ענה לבקשה של קלוד בדיוק.
• בסוף תמיד: "✅ בקשה טופלה".

🎯 סוג הבקשה: ${request.type}
${typeInstructions[request.type] || typeInstructions['INFO']}

📋 פורמט תשובה חובה:
**נושא:** [שם הנושא]
**סוג:** [INFO | CLARIFY | CONTENT | SUMMARY]

[תוכן התשובה]

✅ בקשה טופלה

---

## 🎮 משימה לקלוד
1. **מה לבנות:** [quiz / simulator / step-by-step / flashcards]
2. **כמה שאלות/שלבים:** [מספר מומלץ]
3. **נושא הבא מומלץ:** [הנושא הבא שכדאי לקלוד לבקש]

---

## 📝 הערות למורה
[תלויות, פערי ידע, דגשים — או "אין הערות"]`;
}

// ============================================================
//  כתיבת תשובה מלאה ל-README — ללא כפילויות
// ============================================================
function writeFullResponse(content, aiResponse, request, timestamp) {
  // 1. עדכון שורת סטטוס
  const statusLine = `### סטטוס מערכת: 🟢 @Gemini זמין וממתין | עודכן: ${timestamp}`;
  let updated = content.replace(/^### סטטוס מערכת:.*$/m, statusLine);

  // 2. הסרת כל שורות "✅ טופל" ישנות + הוספת אחת חדשה נקייה
  updated = updated.replace(/✅ טופל[^\n]*\n?/g, '');
  updated = updated.replace(/(## 🛒 סל דרישות\n)/, `$1\n✅ טופל ב-${timestamp} — ${request.topic}\n`);

  // 3. חלץ רק את החלק הסטטי (כותרת + הנחיות + סל דרישות)
  const staticMatch = updated.match(/([\s\S]*?## 🛒 סל דרישות[\s\S]*?)(?:\n---\n|\n## 📩|$)/);
  const staticPart  = staticMatch ? staticMatch[1].trimEnd() : updated.split('\n---\n')[0].trimEnd();

  return `${staticPart}

---

## 📩 תשובת גמיני האחרונה → קלוד

${aiResponse.trim()}
`;
}

// ============================================================
//  שליפת PDF — רק שמות קבצים (ללא OCR — Drive Advanced Service לא פעיל)
// ============================================================
function getRelevantPdfContent(request) {
  const rootFolder = DriveApp.getFolderById(PDF_FOLDER_ID);
  let allFiles = [];
  getFilesRecursively(rootFolder, allFiles, '');

  // לבקשת INFO ללא קובץ ספציפי — החזר רשימת שמות בלבד
  const explicitFiles = request.file
    ? request.file.split(',').map(f => f.trim().toLowerCase()).filter(f => f && f !== 'כל הקבצים שיש לך גישה')
    : [];

  if (explicitFiles.length === 0) {
    // החזר רשימת כל הקבצים לגמיני כדי שידע מה קיים
    const fileList = allFiles.map(item =>
      `📄 ${item.folder} / ${item.file.getName()}`
    ).join('\n');
    Logger.log(`📂 נמצאו ${allFiles.length} קבצים`);
    return `רשימת כל הקבצים ב-PDF_FOLDER:\n${fileList}`;
  }

  // אם יש קבצים מפורשים — טען cache (ובנה אם לא קיים)
  let textContent = '';
  const cacheFolder = DriveApp.getFolderById(CACHE_FOLDER_ID);

  allFiles.forEach(item => {
    const fileName      = item.file.getName();
    const fileNameLower = fileName.toLowerCase();
    const matches = explicitFiles.some(ef => fileNameLower.includes(ef.replace('.pdf', '').trim()));

    if (matches) {
      const fileId        = item.file.getId();
      const cacheFileName = `cache_${fileId}.txt`;
      const cachedFiles   = cacheFolder.getFilesByName(cacheFileName);

      if (cachedFiles.hasNext()) {
        Logger.log(`🚀 cache hit: ${fileName}`);
        textContent += `\n\n--- [${item.folder} / ${fileName}] ---\n` + cachedFiles.next().getBlob().getDataAsString();
      } else {
        // בנה cache עכשיו לפי דרישה
        Logger.log(`🔨 בונה cache לפי דרישה: ${fileName}`);
        try {
          const blob    = item.file.getBlob();
          const docFile = Drive.Files.insert(
            { title: `ocr_tmp_${fileId}`, mimeType: 'application/vnd.google-apps.document' },
            blob,
            { convert: true }
          );
          const doc  = DocumentApp.openById(docFile.id);
          const text = doc.getBody().getText();
          cacheFolder.createFile(cacheFileName, text, MimeType.PLAIN_TEXT);
          DriveApp.getFileById(docFile.id).setTrashed(true);
          Logger.log(`✅ cache נוצר: ${fileName} (${text.length} תווים)`);
          textContent += `\n\n--- [${item.folder} / ${fileName}] ---\n` + text;
        } catch (e) {
          Logger.log(`❌ OCR נכשל עבור ${fileName}: ${e.message}`);
          textContent += `\n\n--- [${item.folder} / ${fileName}] ---\n[OCR נכשל]`;
        }
      }
    }
  });

  return textContent || 'לא נמצאו קבצים תואמים';
}

function getFilesRecursively(folder, fileList, folderPath) {
  const path = folderPath ? folderPath + '/' + folder.getName() : folder.getName();
  const files = folder.getFilesByType('application/pdf');
  while (files.hasNext()) {
    fileList.push({ file: files.next(), folder: path });
  }
  const subs = folder.getFolders();
  while (subs.hasNext()) {
    getFilesRecursively(subs.next(), fileList, path);
  }
}

// ============================================================
//  קריאה ל-Gemini API
// ============================================================
function callGeminiAPI(systemPrompt, pdfKnowledge, request) {
  const url = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const safePdfText = pdfKnowledge.length > 80000
    ? pdfKnowledge.substring(0, 80000) + '\n...[נחתך]...'
    : pdfKnowledge;

  const payload = {
    contents: [{
      parts: [{
        text: `${systemPrompt}

---

בקשת קלוד:
סוג: ${request.type}
נושא: ${request.topic}
בקשה: ${request.request}
קובץ: ${request.file || 'לא צוין'}
עדיפות: ${request.priority}

---
PDF_KNOWLEDGE:
${safePdfText}`
      }]
    }],
    generationConfig: { maxOutputTokens: 8192, temperature: 0.1 }
  };

  const res = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  const code = res.getResponseCode();

  if (code === 200) {
    Logger.log(`✅ תשובה התקבלה מ-${GEMINI_MODEL}`);
    return JSON.parse(res.getContentText()).candidates[0].content.parts[0].text;
  }
  if (code === 429) { Logger.log('⏳ קוטה — ינסה מחר'); return null; }
  if (code === 503) { Logger.log('⏳ שרתים עמוסים — ינסה בעוד דקה'); return null; }

  Logger.log(`🔴 שגיאה ${code}: ${res.getContentText().substring(0, 300)}`);
  return null;
}

// ============================================================
//  בניית cache — קריאת PDF עם OCR ושמירה כ-txt
// ============================================================
function buildCacheForAllFiles() {
  const rootFolder  = DriveApp.getFolderById(PDF_FOLDER_ID);
  const cacheFolder = DriveApp.getFolderById(CACHE_FOLDER_ID);
  let allFiles = [];
  getFilesRecursively(rootFolder, allFiles, '');

  Logger.log(`📂 נמצאו ${allFiles.length} קבצים — מתחיל OCR...`);

  let built = 0, skipped = 0, failed = 0;

  allFiles.forEach(item => {
    const file         = item.file;
    const fileId       = file.getId();
    const fileName     = file.getName();
    const cacheFileName = `cache_${fileId}.txt`;

    // בדוק אם cache קיים
    const existing = cacheFolder.getFilesByName(cacheFileName);
    if (existing.hasNext()) {
      Logger.log(`⏭️ דילוג (cache קיים): ${fileName}`);
      skipped++;
      return;
    }

    try {
      // העתק את ה-PDF ל-Google Docs — Drive ממיר אוטומטית (OCR)
      const blob    = file.getBlob();
      const docFile = Drive.Files.insert(
        { title: `ocr_tmp_${fileId}`, mimeType: 'application/vnd.google-apps.document' },
        blob,
        { convert: true }
      );
      const docId = docFile.id;

      // קרא את הטקסט מה-Doc
      const doc  = DocumentApp.openById(docId);
      const text = doc.getBody().getText();

      // שמור ל-cache
      cacheFolder.createFile(cacheFileName, text, MimeType.PLAIN_TEXT);
      Logger.log(`✅ cache נוצר: ${fileName} (${text.length} תווים)`);
      built++;

      // מחק את ה-Doc הזמני
      DriveApp.getFileById(docId).setTrashed(true);

    } catch (e) {
      Logger.log(`❌ שגיאה ב-${fileName}: ${e.message}`);
      failed++;
    }
  });

  Logger.log(`🏁 סיום: ${built} נבנו, ${skipped} דולגו, ${failed} נכשלו`);
}

// ============================================================
//  סריקת קבצים ישירה ל-README (ללא Gemini)
// ============================================================
function scanFilesToReadme() {
  const readmeFile = DriveApp.getFileById(MASTER_README_ID);
  const rootFolder = DriveApp.getFolderById(PDF_FOLDER_ID);
  const now = getTime();

  let allFiles = [];
  getFilesRecursively(rootFolder, allFiles, '');

  // בנה רשימה מסודרת לפי תיקייה
  const byFolder = {};
  allFiles.forEach(item => {
    const folder = item.folder.split('/').pop(); // שם התיקייה האחרונה
    if (!byFolder[folder]) byFolder[folder] = [];
    byFolder[folder].push(item.file.getName());
  });

  let report = `**נושא:** מיפוי קבצים אמיתי — כל הקורסים\n**סוג:** INFO\n**עודכן:** ${now}\n\n`;
  report += `סה"כ ${allFiles.length} קבצי PDF:\n\n`;

  Object.keys(byFolder).sort().forEach(folder => {
    report += `**📁 ${folder}** (${byFolder[folder].length} קבצים)\n`;
    byFolder[folder].forEach(name => {
      report += `- ${name}\n`;
    });
    report += '\n';
  });

  report += '✅ סריקה הושלמה';

  const content = readmeFile.getBlob().getDataAsString();
  const updated = content.replace(
    /## 📩 תשובת גמיני האחרונה → קלוד\n[\s\S]*$/,
    `## 📩 תשובת גמיני האחרונה → קלוד\n\n${report}\n`
  );

  readmeFile.setContent(updated.replace(/^### סטטוס מערכת:.*$/m,
    `### סטטוס מערכת: 🟢 סריקה הושלמה | עודכן: ${now}`
  ));

  Logger.log(`✅ סריקה הושלמה — ${allFiles.length} קבצים נמצאו`);
}

// ============================================================
//  עזרים
// ============================================================
function getTime() {
  return new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
}

function updateStatus(file, content, status) {
  const line = `### סטטוס מערכת: ${status}`;
  const newContent = content.includes('### סטטוס מערכת:')
    ? content.replace(/^### סטטוס מערכת: .*$/m, line)
    : line + '\n\n' + content;
  file.setContent(newContent);
}

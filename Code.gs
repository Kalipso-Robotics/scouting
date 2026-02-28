// ============================================
// Google Apps Script
// ============================================
// 1. Open Google Sheet > Extensions > Apps Script
// 2. Replace Code.gs with this file
// 3. Deploy > Manage deployments > Edit > New version
//    Execute as: Me, Who has access: Anyone
// ============================================

// Called by stats.html via fetch GET to retrieve all scouting data
function doGet(e) {
  var json = getData();
  return ContentService.createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

// Called by index.html via hidden iframe form POST to submit data
function doPost(e) {
  var rowsJson = e.parameter.data;
  var result = submitRows(rowsJson);
  return ContentService.createTextOutput(result);
}

// Get all scouting data from the sheet
function getData() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return '[]';
  var range = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn());
  var values = range.getValues();
  var rows = [];
  for (var i = 0; i < values.length; i++) {
    var v = values[i];
    rows.push({
      timestamp: v[0],
      match: v[1],
      scouter: v[2],
      alliance: v[3],
      position: v[4],
      team: v[5],
      auto_near_shoots: Number(v[6]) || 0,
      auto_near_balls: Number(v[7]) || 0,
      auto_far_shoots: Number(v[8]) || 0,
      auto_far_balls: Number(v[9]) || 0,
      auto_total_shoots: Number(v[10]) || 0,
      auto_total_balls: Number(v[11]) || 0,
      auto_lever: v[12],
      teleop_near_shoots: Number(v[13]) || 0,
      teleop_near_balls: Number(v[14]) || 0,
      teleop_far_shoots: Number(v[15]) || 0,
      teleop_far_balls: Number(v[16]) || 0,
      teleop_total_shoots: Number(v[17]) || 0,
      teleop_total_balls: Number(v[18]) || 0,
      total_shoots: Number(v[19]) || 0,
      total_balls: Number(v[20]) || 0,
      team_score: Number(v[21]) || 0,
      alliance_score: Number(v[22]) || 0,
      comment: v[23] || '',
      session: v[24] || ''
    });
  }
  return JSON.stringify(rows);
}

// Write rows to the sheet
function submitRows(rowsJson) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var rows = JSON.parse(rowsJson);

  if (sheet.getLastRow() === 0) {
    var headers = [
      'Timestamp', 'Match', 'Scouter', 'Alliance', 'Position', 'Team',
      'Auto Near Shoots', 'Auto Near Balls', 'Auto Far Shoots', 'Auto Far Balls',
      'Auto Total Shoots', 'Auto Total Balls', 'Auto Lever Hit',
      'Teleop Near Shoots', 'Teleop Near Balls', 'Teleop Far Shoots', 'Teleop Far Balls',
      'Teleop Total Shoots', 'Teleop Total Balls',
      'Total Shoots', 'Total Balls', 'Team Score', 'Alliance Score', 'Comment', 'Session'
    ];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  // Remove existing rows with the same session ID (re-submit = update)
  var sid = rows.length > 0 ? (rows[0].session || '') : '';
  if (sid) {
    var lastRow = sheet.getLastRow();
    if (lastRow >= 2) {
      var sessionCol = 25; // Column Y = Session
      var sessions = sheet.getRange(2, sessionCol, lastRow - 1, 1).getValues();
      for (var i = sessions.length - 1; i >= 0; i--) {
        if (sessions[i][0] === sid) {
          sheet.deleteRow(i + 2);
        }
      }
    }
  }

  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    sheet.appendRow([
      r.timestamp, r.match, r.scouter, r.alliance, r.position, r.team,
      r.auto_near_shoots, r.auto_near_balls, r.auto_far_shoots, r.auto_far_balls,
      r.auto_total_shoots, r.auto_total_balls, r.auto_lever,
      r.teleop_near_shoots, r.teleop_near_balls, r.teleop_far_shoots, r.teleop_far_balls,
      r.teleop_total_shoots, r.teleop_total_balls,
      r.total_shoots, r.total_balls, r.team_score, r.alliance_score, r.comment || '',
      r.session || ''
    ]);
  }

  return rows.length + ' rows saved';
}

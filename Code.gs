// ============================================
// Google Apps Script
// ============================================
// 1. Open Google Sheet > Extensions > Apps Script
// 2. Replace Code.gs with this file
// 3. Add HTML files: "Index" (scouting) and "Stats" (analytics)
// 4. Deploy > New deployment > Web app
//    Execute as: Me, Who has access: Anyone
// 5. Scouting: deployed URL
//    Stats:    deployed URL?page=stats
// ============================================

// Route pages
function doGet(e) {
  var page = (e && e.parameter && e.parameter.page) || 'index';
  if (page === 'stats') {
    return HtmlService.createHtmlOutputFromFile('Stats')
      .setTitle('Kalipso Stats Dashboard')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
  }
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Kalipso Decode Scouting')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, user-scalable=no');
}

// Called from Stats page to get all scouting data
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
      alliance_score: Number(v[22]) || 0
    });
  }
  return JSON.stringify(rows);
}

// Called from scouting page to submit data
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
      'Total Shoots', 'Total Balls', 'Team Score', 'Alliance Score'
    ];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    sheet.appendRow([
      r.timestamp, r.match, r.scouter, r.alliance, r.position, r.team,
      r.auto_near_shoots, r.auto_near_balls, r.auto_far_shoots, r.auto_far_balls,
      r.auto_total_shoots, r.auto_total_balls, r.auto_lever,
      r.teleop_near_shoots, r.teleop_near_balls, r.teleop_far_shoots, r.teleop_far_balls,
      r.teleop_total_shoots, r.teleop_total_balls,
      r.total_shoots, r.total_balls, r.team_score, r.alliance_score
    ]);
  }

  return rows.length + ' rows added';
}

// Calendar Premaker (BD PRO - Stable Version)
// Horizontal Orientation
// Bangladesh Style (Sunday first)

// version 1.00
// (c) MAMUN
// joynalabmamun@gmail.com 


var sMS = "January,February,March,April,May,June,July,August,September,October,November,December";
var sDS = "Sun,Mon,Tue,Wed,Thu,Fri,Sat";
var sHS = "21/02,17/03,20/03,19/03,20/03,21/03,22/03,23/03,26/03,14/04,01/05,01/05,26/05,27/05,28/05,29/05,30/05,31/05,26/06,05/08,26/08";

var pStart = "Enter first day (Sun,Mon,...)";
var pWeekend = "Enter weekend (Fri,Sat)";

// -------- INPUT --------
var Year = prompt("Enter Year", 2026);
if(!Year) exit();

var MC = prompt("Months", sMS).split(',');
var DC = prompt("Days", sDS).split(',');

var StartDayName = prompt(pStart, "Sun");
var WeekendInput = prompt(pWeekend, "Fri,Sat");

var HC = prompt("Holidays D/M, Default BD Holiday 2026", sHS).split(',');

// GRID
var useGrid = (prompt("Add Grid? (yes/no)", "no").toLowerCase() == "yes");

// -------- UTILS --------
function trim(str){ return str.replace(/^\s+|\s+$/g, ''); }

function getIndex(arr, val){
    val = trim(val);
    for(var i=0;i<arr.length;i++){
        if(trim(arr[i]) == val) return i;
    }
    return -1;
}

// -------- HOLIDAY --------
var HD = [];
for(var i=0;i<HC.length;i++){
    var DM = HC[i].split('/');
    HD.push(parseInt(DM[0]), parseInt(DM[1]));
}

// -------- WEEKEND --------
var weekend = [];
var wArr = WeekendInput.split(',');

for(var i=0;i<wArr.length;i++){
    var idx = getIndex(DC, wArr[i]);
    if(idx != -1) weekend.push(idx);
}

// -------- START DAY --------
var startIndex = getIndex(DC, StartDayName);
if(startIndex == -1){
    alert("Invalid Start Day!");
    exit();
}

function getShiftedIndex(day){
    return (day - startIndex + 7) % 7;
}

// -------- GRID --------
function drawCell(docRef, left, top, w, h){
    var rect = docRef.pathItems.rectangle(top, left, w, h);
    rect.stroked = true;
    rect.filled = false;
    rect.strokeWidth = 0.5;
}

// -------- MAIN --------
makeCalendar();

function makeCalendar(){

    var CellHeight = 20;
    var CellWidth  = 30;

    var MN = [31,(Year%4==0)?29:28,31,30,31,30,31,31,30,31,30,31];

    var FirstDay = new Date(Year, 0, 1).getDay();
    var FD = FirstDay;

    var DocTop = CellHeight*52;

    var docRef = documents.add(DocumentColorSpace.CMYK, CellWidth*18, DocTop+CellHeight*4);

    var nColor = new CMYKColor();
    var nSpotColor = new SpotColor();

    // BLACK weekday
    var DefaultSpot = docRef.spots.add();
    nColor.cyan=0; nColor.magenta=0; nColor.yellow=0; nColor.black=100;
    DefaultSpot.color = nColor;

    // RED weekend
    var HolidaySpot = docRef.spots.add();
    nColor.cyan=0; nColor.magenta=100; nColor.yellow=100; nColor.black=40;
    HolidaySpot.color = nColor;

    var DefaultStyle = docRef.characterStyles.add("Weekday");
    var HolidayStyle = docRef.characterStyles.add("Holiday");

    nSpotColor.spot = DefaultSpot;
    DefaultStyle.characterAttributes.fillColor = nSpotColor;

    nSpotColor.spot = HolidaySpot;
    HolidayStyle.characterAttributes.fillColor = nSpotColor;

    var LeftMargin = CellWidth;

    // =========================
    // 🔥 YEAR TITLE
    var yearText = docRef.textFrames.add();
    yearText.contents = Year;

    yearText.kind = TextType.POINTTEXT;
    yearText.left = (CellWidth*18)/2;
    yearText.top  = DocTop + CellHeight*3;

    yearText.textRange.paragraphAttributes.justification = Justification.CENTER;
    yearText.textRange.characterAttributes.size = 24;
    // =========================

    // ===== MONTH LOOP =====
    for(var m=0; m<12; m++){

        if(m==6) LeftMargin = CellWidth*9;

        var rowOffset = (m<6)? m : (m-6);

        // ---- MONTH NAME ----
        var textRef = docRef.textFrames.add();
        textRef.contents = MC[m];

        textRef.top = DocTop - rowOffset*9*CellHeight + CellHeight*2.2;

        var totalWidth = 7 * CellWidth;
        textRef.left = LeftMargin + (totalWidth/2) - (textRef.width/2);

        // ---- DAY NAME ----
        for(var i=0;i<7;i++){
            var idx = (i + startIndex) % 7;

            textRef = docRef.textFrames.add();
            textRef.contents = DC[idx];

            textRef.top = DocTop - rowOffset*9*CellHeight + CellHeight;
            textRef.left = i*CellWidth + LeftMargin;
        }

        // ---- DATES ----
        var base = getShiftedIndex(FD);

        for(var d=0; d<MN[m]; d++){

            var pos = base + d;

            var row = Math.floor(pos / 7);
            var col = pos % 7;

            var leftPos = col * CellWidth + LeftMargin;
            var topPos = DocTop - (row * CellHeight + rowOffset*9*CellHeight);

            if(useGrid){
                drawCell(docRef, leftPos, topPos, CellWidth, CellHeight);
            }

            var rawIndex = (FD + d) % 7;

            // TEXT
            textRef = docRef.textFrames.add();
            textRef.contents = d+1;

            textRef.kind = TextType.POINTTEXT;
            textRef.left = leftPos + (CellWidth / 2);
            textRef.top  = topPos - (CellHeight * 0.3);

            textRef.textRange.paragraphAttributes.justification = Justification.CENTER;

            // WEEKEND
            var isWeekend = false;
            for(var w=0; w<weekend.length; w++){
                if(weekend[w] == rawIndex){
                    isWeekend = true;
                    break;
                }
            }

            if(isWeekend)
                HolidayStyle.applyTo(textRef.textRange);
            else
                DefaultStyle.applyTo(textRef.textRange);

            if(isHoliday(d+1,m+1))
                HolidayStyle.applyTo(textRef.textRange);
        }

        FD = (FD + MN[m]) % 7;
    }
}

// -------- HOLIDAY --------
function isHoliday(day,month){
    for(var i=0;i<HD.length;i+=2){
        if(day==HD[i] && month==HD[i+1]) return true;
    }
    return false;
}
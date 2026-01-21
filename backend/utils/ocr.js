const Tesseract = require('tesseract.js');
const sharp = require('sharp');

/**
 * 画像をOCRで処理して、スコアカードの情報を抽出
 */
async function extractScoreCardData(imagePath) {
  try {
    // 画像をプリプロセッシング（コントラスト強化など）
    const processedImagePath = imagePath + '.processed.png';
    await sharp(imagePath)
      .grayscale()
      .normalise()
      .toFile(processedImagePath);

    // OCRの実行
    const { data: { text } } = await Tesseract.recognize(
      processedImagePath,
      'jpn+eng'
    );

    // テキストをパース
    const parsedData = parseScoreCardText(text);
    
    return {
      success: true,
      rawText: text,
      parsedData: parsedData
    };
  } catch (error) {
    console.error('OCR processing error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * スコアカード画像から抽出したテキストをパースして構造化データに変換
 */
function parseScoreCardText(text) {
  const lines = text.split('\n').filter(l => l.trim());
  
  const result = {
    courseName: null,
    playDate: null,
    holes: {}
  };

  // コース名と日付を抽出する簡易ロジック
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // コース名検出（複数行で可能性あり）
    if (!result.courseName && i < 5) {
      // コース名らしきテキストを検出
      if (line.length > 3 && line.length < 50 && !line.match(/\d{4}|\d{1,2}\/\d{1,2}/)) {
        result.courseName = line.trim();
      }
    }

    // 日付検出
    const dateMatch = line.match(/(\d{1,4})[\/\-](\d{1,2})[\/\-](\d{1,4})/);
    if (dateMatch && !result.playDate) {
      result.playDate = formatDate(dateMatch[0]);
    }

    // ホール番号と数値の抽出
    const holeMatch = line.match(/ホール\s*(\d{1,2})|H\s*(\d{1,2})|^(\d{1,2})\s/i);
    if (holeMatch) {
      const holeNum = parseInt(holeMatch[1] || holeMatch[2] || holeMatch[3]);
      
      // 同じ行またはその後の行からスコア情報を取得
      const scoreData = extractHoleScore(line, lines.slice(i + 1, i + 5));
      if (scoreData) {
        result.holes[holeNum] = scoreData;
      }
    }
  }

  return result;
}

/**
 * 1ホール分のスコア情報を抽出
 */
function extractHoleScore(line, nextLines = []) {
  const allText = [line, ...nextLines].join(' ');
  
  const hole = {
    score: null,
    putts: null,
    firstClub: null,
    fairwayKept: null,
    greenOn: null,
    bogeyOn: null,
    obCount: 0,
    bunkerCount: 0,
    onePenalty: 0
  };

  // スコア抽出（Par の後の数字）
  const scoreMatch = allText.match(/(?:Par|par)\s*(\d)\s+(?:Score|score)\s*(\d)/i) || 
                     allText.match(/(\d)\s+(?:点|スコア|Score)/i);
  if (scoreMatch) {
    hole.score = parseInt(scoreMatch[scoreMatch.length - 1]);
  }

  // パット数抽出
  const puttMatch = allText.match(/(?:パット|Putt|put)\s*:?\s*(\d)/i);
  if (puttMatch) {
    hole.putts = parseInt(puttMatch[1]);
  }

  // 1打目クラブ抽出
  const clubMatch = allText.match(/(ドライバー|アイアン|ウッド|パター|Driver|Iron|Wood|Putter|DR|AW|FW)/i);
  if (clubMatch) {
    hole.firstClub = clubMatch[1];
  }

  // FWキープ判定
  if (allText.match(/FW\s*キープ|FWキープ|fairway\s*kept/i)) {
    hole.fairwayKept = true;
  }

  // OB, バンカー, ペナ数抽出
  const obMatch = allText.match(/OB|アウトオブバウンズ/i);
  if (obMatch) hole.obCount = (allText.match(/OB|アウトオブバウンズ/gi) || []).length;

  const bunkerMatch = allText.match(/バンカー|Bunker/i);
  if (bunkerMatch) hole.bunkerCount = (allText.match(/バンカー|Bunker/gi) || []).length;

  const penaltyMatch = allText.match(/ペナ|ペナルティ|1打罰/i);
  if (penaltyMatch) hole.onePenalty = (allText.match(/ペナ|ペナルティ|1打罰/gi) || []).length;

  return hole;
}

/**
 * 日付文字列をフォーマット
 */
function formatDate(dateStr) {
  const match = dateStr.match(/(\d{1,4})[\/\-](\d{1,2})[\/\-](\d{1,4})/);
  if (!match) return new Date().toISOString().split('T')[0];
  
  let [, year, month, day] = match.map(Number);
  
  // 2桁の年を4桁に変換
  if (year < 100) {
    year = year < 50 ? 2000 + year : 1900 + year;
  }

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

module.exports = {
  extractScoreCardData,
  parseScoreCardText,
  extractHoleScore,
  formatDate
};

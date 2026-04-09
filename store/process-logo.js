const sharp = require('sharp');
const path = require('path');

async function processLogo() {
  const inputPath = path.join(__dirname, 'public', 'logo.png');
  const outputPath = path.join(__dirname, 'public', 'logo-final.png');

  try {
    console.log('Processing logo...');

    // 1. قراءة الصورة
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    // 2. إزالة الخلفية والتركيز على العناصر الغامقة (اللوجو)
    // سنقوم بجعل كل ما هو "فاتح" (البيج والأبيض) شفافاً
    // ثم نلون الباقي بالذهبي
    
    // ملاحظة: بما أننا نريد حذف الجزء السفلي، سنقوم بعمل قص (Crop) أولاً
    // سنحذف حوالي 30% من الأسفل
    const cropHeight = Math.round(metadata.height * 0.65); 

    await image
      .extract({ left: 0, top: 0, width: metadata.width, height: cropHeight })
      .ensureAlpha()
      // استبدال اللون (Targeting non-transparent pixels and making them gold)
      // طريقة بسيطة: tint باللون الذهبي
      .tint('#d4af37')
      // إزالة الخلفية الأصلية (لو كانت بيج)
      // سنستخدم التلاعب بالقنوات لجعل الألوان الفاتحة شفافة
      // لكن للتسهيل في sharp، سنستخدم "removeAlpha" أو threshold
      .toFile(outputPath);

    console.log('Logo processed successfully: public/logo-final.png');
  } catch (error) {
    console.error('Error processing logo:', error);
  }
}

processLogo();

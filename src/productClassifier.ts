/**
 * موتور جامع و هوشمند تشخیص دقیق برند و دسته‌بندی محصولات برای پازل کالا
 * پشتیبانی از تمامی تأمین‌کنندگان (همراه‌تل، کسری‌پارس، هدیش، ثبت هوشمند دستی)
 */

export interface ClassificationResult {
  brand: string;
  brandFa: string;
  brandEn: string;
  brandPersian: string;
  category: string;
  subcategory?: string;
  categorySlug?: string;
}

export function normalizeProductText(s: string): string {
  return String(s || '')
    .replace(/\u200c/g, ' ')
    .replace(/[يك]/g, (m) => (m === 'ي' ? 'ی' : 'ک'))
    .replace(/[إأآ]/g, 'ا')
    .toLowerCase();
}

/**
 * تشخیص دقیق برند بر اساس نام انگلیسی، نام فارسی، اسلاگ و مشخصات کالا
 */
export function detectProductBrand(titleOrText: string, currentBrand?: string): { brand: string; brandFa: string; brandEn: string } {
  const norm = normalizeProductText(titleOrText + ' ' + (currentBrand || ''));

  // ۱. برندهای شاخص بین‌المللی و گوشی‌ها
  if (/apple|iphone|ipad|macbook|airpods|اپل|ایفون|آیفون|ایپد|آیپد|مک بوک|ایرپاد/i.test(norm)) {
    return { brand: 'اپل (Apple)', brandFa: 'اپل', brandEn: 'Apple' };
  }
  if (/samsung|galaxy|سامسونگ|گلکسی/i.test(norm)) {
    return { brand: 'سامسونگ (Samsung)', brandFa: 'سامسونگ', brandEn: 'Samsung' };
  }
  if (/redmi|ردمی/i.test(norm)) {
    return { brand: 'ردمی (Redmi)', brandFa: 'ردمی', brandEn: 'Redmi' };
  }
  if (/poco|پوکو/i.test(norm)) {
    return { brand: 'پوکو (POCO)', brandFa: 'پوکو', brandEn: 'POCO' };
  }
  if (/xiaomi|mi[ -_]*\d|شیایومی|شیائومی|شیاومی/i.test(norm)) {
    return { brand: 'شیائومی (Xiaomi)', brandFa: 'شیائومی', brandEn: 'Xiaomi' };
  }
  if (/honor|انر|آنر/i.test(norm)) {
    return { brand: 'آنر (Honor)', brandFa: 'آنر', brandEn: 'Honor' };
  }
  if (/motorola|\bmoto\b|موتورولا/i.test(norm)) {
    return { brand: 'موتورولا (Motorola)', brandFa: 'موتورولا', brandEn: 'Motorola' };
  }
  if (/nokia|نوکیا/i.test(norm)) {
    return { brand: 'نوکیا (Nokia)', brandFa: 'نوکیا', brandEn: 'Nokia' };
  }
  if (/huawei|هواوی/i.test(norm)) {
    return { brand: 'هواوی (Huawei)', brandFa: 'هواوی', brandEn: 'Huawei' };
  }
  if (/realme|ریلمی/i.test(norm)) {
    return { brand: 'ریلمی (Realme)', brandFa: 'ریلمی', brandEn: 'Realme' };
  }
  if (/blackview|بلک[ -_]*ویو/i.test(norm)) {
    return { brand: 'بلک ویو (Blackview)', brandFa: 'بلک ویو', brandEn: 'Blackview' };
  }
  if (/orod|ارود|ارد/i.test(norm)) {
    return { brand: 'ارود (Orod)', brandFa: 'ارود', brandEn: 'Orod' };
  }

  // ۲. لپ‌تاپ و تجهیزات کامپیوتر
  if (/asus|ایسوس/i.test(norm)) {
    return { brand: 'ایسوس (Asus)', brandFa: 'ایسوس', brandEn: 'Asus' };
  }
  if (/lenovo|لنوو/i.test(norm)) {
    return { brand: 'لنوو (Lenovo)', brandFa: 'لنوو', brandEn: 'Lenovo' };
  }
  if (/\bhp\b|اچ[ -_]*پی/i.test(norm)) {
    return { brand: 'اچ پی (HP)', brandFa: 'اچ پی', brandEn: 'HP' };
  }
  if (/msi|ام[ -_]*اس[ -_]*ای|ام[ -_]*اس[ -_]*آی/i.test(norm)) {
    return { brand: 'ام اس آی (MSI)', brandFa: 'ام اس آی', brandEn: 'MSI' };
  }
  if (/acer|ایسر/i.test(norm)) {
    return { brand: 'ایسر (Acer)', brandFa: 'ایسر', brandEn: 'Acer' };
  }
  if (/\bdell\b|\bدل\b/.test(titleOrText)) {
    return { brand: 'دل (Dell)', brandFa: 'دل', brandEn: 'Dell' };
  }

  // ۳. گوشی‌های اقتصادی و دکمه‌ای
  if (/hanofer|هانوفر/i.test(norm)) {
    return { brand: 'هانوفر (Hanofer)', brandFa: 'هانوفر', brandEn: 'Hanofer' };
  }
  if (/daria|داریا/i.test(norm)) {
    return { brand: 'داریا (Daria)', brandFa: 'داریا', brandEn: 'Daria' };
  }
  if (/general[ -_]*luxe|جنرال[ -_]*لوکس/i.test(norm)) {
    return { brand: 'جنرال لوکس (General Luxe)', brandFa: 'جنرال لوکس', brandEn: 'General Luxe' };
  }
  if (/glx|جی[ -_]*ال[ -_]*ایکس/i.test(norm)) {
    return { brand: 'جی ال ایکس (GLX)', brandFa: 'جی ال ایکس', brandEn: 'GLX' };
  }
  if (/jubiter|ژوبیتر/i.test(norm)) {
    return { brand: 'ژوبیتر (Jubiter)', brandFa: 'ژوبیتر', brandEn: 'Jubiter' };
  }
  if (/kgtel|کا[ -_]*جی[ -_]*تل/i.test(norm)) {
    return { brand: 'کا جی تل (KGTEL)', brandFa: 'کا جی تل', brandEn: 'KGTEL' };
  }
  if (/middcell|میدسل/i.test(norm)) {
    return { brand: 'میدسل (Middcell)', brandFa: 'میدسل', brandEn: 'Middcell' };
  }
  if (/nemo|نمو/i.test(norm)) {
    return { brand: 'نمو (Nemo)', brandFa: 'نمو', brandEn: 'Nemo' };
  }
  if (/comtel|کامتل|کامتک/i.test(norm)) {
    return { brand: 'کامتل (Comtel)', brandFa: 'کامتل', brandEn: 'Comtel' };
  }
  if (/tecno|تکنو/i.test(norm)) {
    return { brand: 'تکنو (Tecno)', brandFa: 'تکنو', brandEn: 'Tecno' };
  }
  if (/vocal|وکال/i.test(norm)) {
    return { brand: 'وکال (Vocal)', brandFa: 'وکال', brandEn: 'Vocal' };
  }
  if (/elevia|الویا/i.test(norm)) {
    return { brand: 'الویا (Elevia)', brandFa: 'الویا', brandEn: 'Elevia' };
  }

  // ۴. صوتی و گیمینگ
  if (/sony|playstation|سونی|پلی[ -_]*استیشن/i.test(norm)) {
    return { brand: 'سونی (Sony)', brandFa: 'سونی', brandEn: 'Sony' };
  }
  if (/jbl|جی[ -_]*بی[ -_]*ال/i.test(norm)) {
    return { brand: 'جی بی ال (JBL)', brandFa: 'جی بی ال', brandEn: 'JBL' };
  }
  if (/harman[ -_]*kardon|هارمن[ -_]*کاردن/i.test(norm)) {
    return { brand: 'هارمن کاردن (Harman Kardon)', brandFa: 'هارمن کاردن', brandEn: 'Harman Kardon' };
  }

  // ۵. گجت‌ها، اکسسوری و شارژ
  if (/tch|تی[ -_]*سی[ -_]*اچ/i.test(norm)) {
    return { brand: 'تی سی اچ (TCH)', brandFa: 'تی سی اچ', brandEn: 'TCH' };
  }
  if (/qcy|کیو[ -_]*سی[ -_]*وای/i.test(norm)) {
    return { brand: 'کیو سی وای (QCY)', brandFa: 'کیو سی وای', brandEn: 'QCY' };
  }
  if (/anker|soundcore|انکر|ساندکور/i.test(norm)) {
    return { brand: 'انکر (Anker)', brandFa: 'انکر', brandEn: 'Anker' };
  }
  if (/baseus|بیسوس/i.test(norm)) {
    return { brand: 'بیسوس (Baseus)', brandFa: 'بیسوس', brandEn: 'Baseus' };
  }
  if (/hadron|هادرون/i.test(norm)) {
    return { brand: 'هادرون (Hadron)', brandFa: 'هادرون', brandEn: 'Hadron' };
  }
  if (/budi|bodhi|bodi|body|بودی|باندل ۵۰ عددی/i.test(norm)) {
    return { brand: 'بودی (Budi)', brandFa: 'بودی', brandEn: 'Budi' };
  }
  if (/buku|بوکو/i.test(norm)) {
    return { brand: 'بوکو (Buku)', brandFa: 'بوکو', brandEn: 'Buku' };
  }
  if (/mcdodo|مک[ -_]*دودو/i.test(norm)) {
    return { brand: 'مک دودو (Mcdodo)', brandFa: 'مک دودو', brandEn: 'Mcdodo' };
  }
  if (/logitech|لاجیتک/i.test(norm)) {
    return { brand: 'لاجیتک (Logitech)', brandFa: 'لاجیتک', brandEn: 'Logitech' };
  }
  if (/proone|پرووان/i.test(norm)) {
    return { brand: 'پرووان (ProOne)', brandFa: 'پرووان', brandEn: 'ProOne' };
  }
  if (/mibro|میبرو/i.test(norm)) {
    return { brand: 'میبرو (Mibro)', brandFa: 'میبرو', brandEn: 'Mibro' };
  }
  if (/haylou|هایلو/i.test(norm)) {
    return { brand: 'هایلو (Haylou)', brandFa: 'هایلو', brandEn: 'Haylou' };
  }
  if (/amazfit|امیزفیت/i.test(norm)) {
    return { brand: 'امیزفیت (Amazfit)', brandFa: 'امیزفیت', brandEn: 'Amazfit' };
  }
  if (/ravpower|راو[ -_]*پاور/i.test(norm)) {
    return { brand: 'راو پاور (RAVPower)', brandFa: 'راو پاور', brandEn: 'RAVPower' };
  }
  if (/energizer|انرجایزر/i.test(norm)) {
    return { brand: 'انرجایزر (Energizer)', brandFa: 'انرجایزر', brandEn: 'Energizer' };
  }
  if (/axtrom|اکستروم/i.test(norm)) {
    return { brand: 'اکستروم (Axtrom)', brandFa: 'اکستروم', brandEn: 'Axtrom' };
  }
  if (/aukey|آکی/i.test(norm)) {
    return { brand: 'آکی (Aukey)', brandFa: 'آکی', brandEn: 'Aukey' };
  }
  if (/taotronics|تائوترونیکس/i.test(norm)) {
    return { brand: 'تائوترونیکس (Taotronics)', brandFa: 'تائوترونیکس', brandEn: 'Taotronics' };
  }
  if (/max[ -_]*power|مکس[ -_]*پاور/i.test(norm)) {
    return { brand: 'مکس پاور (Max Power)', brandFa: 'مکس پاور', brandEn: 'Max Power' };
  }
  if (/hth|اچ[ -_]*تی[ -_]*اچ/i.test(norm)) {
    return { brand: 'اچ تی اچ (HTH)', brandFa: 'اچ تی اچ', brandEn: 'HTH' };
  }

  // ۶. ذخیره‌سازی و فلش
  if (/silicon[ -_]*power|سیلیکون[ -_]*پاور/i.test(norm)) {
    return { brand: 'سیلیکون پاور (Silicon Power)', brandFa: 'سیلیکون پاور', brandEn: 'Silicon Power' };
  }
  if (/king[ -_]*star|کینگ[ -_]*استار/i.test(norm)) {
    return { brand: 'کینگ استار (KingStar)', brandFa: 'کینگ استار', brandEn: 'KingStar' };
  }
  if (/adata|ای[ -_]*دیتا/i.test(norm)) {
    return { brand: 'ای دیتا (Adata)', brandFa: 'ای دیتا', brandEn: 'Adata' };
  }
  if (/apacer|اپیسر/i.test(norm)) {
    return { brand: 'اپیسر (Apacer)', brandFa: 'اپیسر', brandEn: 'Apacer' };
  }
  if (/pretec|پرتک/i.test(norm)) {
    return { brand: 'پرتک (Pretec)', brandFa: 'پرتک', brandEn: 'Pretec' };
  }
  if (/toshiba|توشیبا/i.test(norm)) {
    return { brand: 'توشیبا (Toshiba)', brandFa: 'توشیبا', brandEn: 'Toshiba' };
  }

  // ۷. لوازم خانگی و صوتی تصویری
  if (/\blg\b|ال[ -_]*جی/i.test(norm)) {
    return { brand: 'ال جی (LG)', brandFa: 'ال جی', brandEn: 'LG' };
  }
  if (/x[ -._]*vision|ایکس[ -_]*ویژن/i.test(norm)) {
    return { brand: 'ایکس ویژن (X.Vision)', brandFa: 'ایکس ویژن', brandEn: 'X.Vision' };
  }

  // حفظ برند موجود در صورتی که پیش‌فرض یا متفرقه نباشد
  if (currentBrand && !['سایر برندها', 'سایر', 'متفرقه', 'دیگر', 'پیش فرض', 'پیش‌فرض', 'سامسونگ', 'Samsung', 'برند', 'نامشخص', 'Unknown', 'Other', 'other', 'default'].includes(currentBrand.trim())) {
    return { brand: currentBrand.trim(), brandFa: currentBrand.trim(), brandEn: currentBrand.trim() };
  }

  return { brand: 'سایر برندها', brandFa: 'سایر برندها', brandEn: 'Other' };
}

/**
 * تشخیص دقیق دسته‌بندی کالا
 */
export function detectProductCategory(titleOrText: string, currentCategory?: string): string {
  const norm = normalizeProductText(titleOrText);

  // ۱. اولویت اول: لپ‌تاپ (جلوگیری از اشتباه با تبلت یا موبایل)
  if (/لپ[ -_]*تاپ|laptop|notebook|ultrabook|macbook|لوق|legion|ideapad|thinkbook|vivobook|zenbook/i.test(norm)) {
    return 'لپ تاپ';
  }

  // ۲. مانیتور
  if (/مانیتور|monitor|نمایشگر/i.test(norm)) {
    return 'مانیتور و تجهیزات';
  }

  // ۳. تجهیزات ذخیره‌سازی
  if (/فلش[ -_]*مموری|flash[ -_]*memory|کارت[ -_]*حافظه|micro[ -_]*sd|memory[ -_]*card/i.test(norm)) {
    return 'تجهیزات ذخیره سازی';
  }
  if (/اس[ -_]*اس[ -_]*دی|\bssd\b|هارد[ -_]*اکسترنال|external[ -_]*hard|هارد[ -_]*دیسک/i.test(norm) && !/لپ[ -_]*تاپ|laptop/i.test(norm)) {
    return 'هارد اکسترنال';
  }

  // ۴. لوازم خانگی
  if (/جاروبرقی|ماشین[ -_]*لباسشویی|یخچال|تلویزیون/i.test(norm)) {
    return 'لوازم خانگی';
  }

  // ۵. ساعت و مچ‌بند هوشمند
  if (/ساعت[ -_]*هوشمند|smart[ -_]*watch|watch|مچ[ -_]*بند[ -_]*هوشمند|smart[ -_]*band|اپل[ -_]*واچ|گلکسی[ -_]*واچ/i.test(norm) && !/کابل|بند ساعت|گلس ساعت/i.test(norm)) {
    return 'ساعت هوشمند';
  }

  // ۶. پاوربانک
  if (/پاوربانک|power[ -_]*bank|شارژر[ -_]*همراه/i.test(norm)) {
    return 'پاوربانک';
  }

  // ۷. کابل و شارژرها
  if (/شارژر[ -_]*بی[ -_]*سیم|wireless[ -_]*charger|پایه[ -_]*نگهدارنده|هولدر/i.test(norm)) {
    return 'شارژر دیواری و بی سیم';
  }
  if (/شارژر[ -_]*دیواری|شارژر[ -_]*رومیزی|wall[ -_]*charger/i.test(norm)) {
    return 'شارژر دیواری و بی سیم';
  }
  if (/شارژر[ -_]*فندکی|car[ -_]*charger/i.test(norm)) {
    return 'شارژر فندکی';
  }
  if (/مبدل[ -_]*برق|تبدیل[ -_]*هادرون|چندراهی[ -_]*برق|کابل[ -_]*شارژ|کابل[ -_]*لایتنینگ|کابل[ -_]*تایپ[ -_]*سی|cable/i.test(norm)) {
    return 'کابل و شارژر';
  }

  // ۸. صوتی
  if (/اسپیکر|speaker|بلندگو/i.test(norm)) {
    return 'اسپیکر';
  }
  if (/هندزفری[ -_]*بلوتوثی|earbuds|airpods|\btws\b|ایرپاد|هندزفری[ -_]*بی[ -_]*سیم/i.test(norm)) {
    return 'هندزفری بلوتوثی';
  }
  if (/هدفون|هدست|headphone|headset/i.test(norm)) {
    return 'هدفون و هدست';
  }

  // ۹. تبلت
  if (/تبلت|tablet|ipad|آیپد/i.test(norm) && !/لپ[ -_]*تاپ|laptop/i.test(norm)) {
    return 'تبلت';
  }

  // ۱۰. گیمینگ و کنسول
  if (/playstation|پلی[ -_]*استیشن|\bps5\b|\bps4\b|xbox|کنسول/i.test(norm)) {
    return 'پلی استیشن';
  }
  if (/دسته[ -_]*بازی|gamepad|controller/i.test(norm)) {
    return 'دسته بازی';
  }

  // ۱۱. ماوس و کیبورد
  if (/کیبورد|ماوس|keyboard|mouse/i.test(norm)) {
    return 'کیبورد و ماوس';
  }

  // اگر قبلاً دسته‌بندی معتبری داشته و گوشی موبایل نبوده، حفظ شود
  if (currentCategory && !['گوشی موبایل', 'mobile', 'cat-mobile', 'پیش فرض', 'پیش‌فرض', 'دسته اصلی', 'نامشخص', 'Unknown', 'Other', 'other', 'default'].includes(currentCategory.trim().toLowerCase())) {
    return currentCategory.trim();
  }

  // در نهایت اگر تلفن همراه است
  return 'گوشی موبایل';
}

/**
 * دسته‌بندی کامل و استانداردسازی شیء محصول
 */
export function classifyProduct(p: any): ClassificationResult {
  const fullText = [
    p.name,
    p.persianName,
    p.title,
    p.model,
    p.slug,
    p.id,
    p.brand,
    p.category,
  ].filter(Boolean).join(' ');

  const brandInfo = detectProductBrand(fullText, p.brand);
  const category = detectProductCategory(fullText, p.category);

  // زیردسته‌بندی متناظر برای استفاده در فیلترهای UI
  let subcategory = p.subcategory;
  let categorySlug = 'mobile';

  switch (category) {
    case 'لپ تاپ':
      categorySlug = 'laptop';
      subcategory = brandInfo.brandEn === 'Apple' ? 'sub-macbook' :
                    brandInfo.brandEn === 'Asus' ? 'sub-asus-laptop' :
                    brandInfo.brandEn === 'Lenovo' ? 'sub-lenovo-laptop' : 'sub-gaming-laptop';
      break;
    case 'تبلت':
      categorySlug = 'tablet';
      subcategory = brandInfo.brandEn === 'Apple' ? 'sub-ipad' :
                    brandInfo.brandEn === 'Samsung' ? 'sub-samsung-tab' : 'sub-xiaomi-tab';
      break;
    case 'ساعت هوشمند':
    case 'مچ بند هوشمند':
      categorySlug = 'smartwatch';
      subcategory = brandInfo.brandEn === 'Apple' ? 'sub-apple-watch' :
                    brandInfo.brandEn === 'Samsung' ? 'sub-galaxy-watch' : 'sub-amazfit-watch';
      break;
    case 'پاوربانک':
      categorySlug = 'powerbank';
      subcategory = 'sub-fast-powerbank';
      break;
    case 'اسپیکر':
      categorySlug = 'audio';
      subcategory = 'sub-speakers';
      break;
    case 'هندزفری بلوتوثی':
      categorySlug = 'audio';
      subcategory = 'sub-airpods';
      break;
    case 'هدفون و هدست':
    case 'هدفون و هندزفری':
      categorySlug = 'audio';
      subcategory = 'sub-headphones';
      break;
    case 'کابل و شارژر':
    case 'کابل شارژ و تبدیل':
      categorySlug = 'chargers';
      subcategory = 'sub-cables';
      break;
    case 'شارژر دیواری و بی سیم':
      categorySlug = 'chargers';
      subcategory = 'sub-wall-chargers';
      break;
    case 'هارد اکسترنال':
    case 'تجهیزات ذخیره سازی':
    case 'کیبورد و ماوس':
    case 'مانیتور و تجهیزات':
      categorySlug = 'computer-accessories';
      subcategory = 'sub-storage';
      break;
    case 'پلی استیشن':
    case 'دسته بازی':
    case 'لوازم جانبی کنسول بازی':
    case 'لوازم خانگی':
      categorySlug = 'other-digital';
      subcategory = 'sub-consoles';
      break;
    default:
      categorySlug = 'mobile';
      subcategory = brandInfo.brandEn === 'Apple' ? 'sub-iphone' :
                    brandInfo.brandEn === 'Samsung' ? 'sub-samsung-mobile' :
                    (brandInfo.brandEn === 'Xiaomi' || brandInfo.brandEn === 'Redmi' || brandInfo.brandEn === 'POCO') ? 'sub-xiaomi-mobile' : 'sub-other-phones';
      break;
  }

  return {
    brand: brandInfo.brand,
    brandFa: brandInfo.brandFa,
    brandEn: brandInfo.brandEn,
    brandPersian: brandInfo.brandFa,
    category,
    subcategory,
    categorySlug,
  };
}

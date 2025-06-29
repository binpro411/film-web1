// Utility functions for URL slug generation
export const removeVietnameseDiacritics = (str: string): string => {
  const diacriticsMap: { [key: string]: string } = {
    'à': 'a', 'á': 'a', 'ạ': 'a', 'ả': 'a', 'ã': 'a', 'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ậ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ặ': 'a', 'ẳ': 'a', 'ẵ': 'a',
    'è': 'e', 'é': 'e', 'ẹ': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ê': 'e', 'ề': 'e', 'ế': 'e', 'ệ': 'e', 'ể': 'e', 'ễ': 'e',
    'ì': 'i', 'í': 'i', 'ị': 'i', 'ỉ': 'i', 'ĩ': 'i',
    'ò': 'o', 'ó': 'o', 'ọ': 'o', 'ỏ': 'o', 'õ': 'o', 'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ộ': 'o', 'ổ': 'o', 'ỗ': 'o', 'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ợ': 'o', 'ở': 'o', 'ỡ': 'o',
    'ù': 'u', 'ú': 'u', 'ụ': 'u', 'ủ': 'u', 'ũ': 'u', 'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ự': 'u', 'ử': 'u', 'ữ': 'u',
    'ỳ': 'y', 'ý': 'y', 'ỵ': 'y', 'ỷ': 'y', 'ỹ': 'y',
    'đ': 'd',
    'À': 'A', 'Á': 'A', 'Ạ': 'A', 'Ả': 'A', 'Ã': 'A', 'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ậ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ặ': 'A', 'Ẳ': 'A', 'Ẵ': 'A',
    'È': 'E', 'É': 'E', 'Ẹ': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ệ': 'E', 'Ể': 'E', 'Ễ': 'E',
    'Ì': 'I', 'Í': 'I', 'Ị': 'I', 'Ỉ': 'I', 'Ĩ': 'I',
    'Ò': 'O', 'Ó': 'O', 'Ọ': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ộ': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ợ': 'O', 'Ở': 'O', 'Ỡ': 'O',
    'Ù': 'U', 'Ú': 'U', 'Ụ': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ự': 'U', 'Ử': 'U', 'Ữ': 'U',
    'Ỳ': 'Y', 'Ý': 'Y', 'Ỵ': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y',
    'Đ': 'D'
  };

  return str.replace(/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/g, (match) => diacriticsMap[match] || match);
};

// CRITICAL: This MUST match the server-side createSeriesSlug function exactly
export const createSlug = (title: string): string => {
  if (!title) return '';
  
  console.log(`🔧 Creating slug for: "${title}"`);
  
  const slug = removeVietnameseDiacritics(title)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  
  console.log(`🔧 Generated slug: "${slug}"`);
  return slug;
};

// NEW: Function to find series by slug from database
export const findSeriesBySlug = (seriesList: any[], targetSlug: string): any | null => {
  if (!targetSlug || !seriesList) return null;
  
  const normalizedTarget = targetSlug.toLowerCase().trim();
  console.log(`🔍 Finding series by slug: "${normalizedTarget}"`);
  console.log(`📊 Searching through ${seriesList.length} series`);
  
  for (const series of seriesList) {
    const generatedSlug = createSlug(series.title);
    const match = generatedSlug === normalizedTarget;
    
    console.log(`🔗 "${series.title}" → "${generatedSlug}" ${match ? '✅ MATCH!' : '❌'}`);
    
    if (match) {
      console.log(`✅ Found series: ${series.title} (ID: ${series.id})`);
      return series;
    }
  }
  
  console.log(`❌ No series found for slug: "${normalizedTarget}"`);
  console.log(`🔍 Available slugs:`, seriesList.map(s => createSlug(s.title)));
  return null;
};

// NEW: Function to validate and normalize slug
export const normalizeSlug = (slug: string): string => {
  if (!slug) return '';
  return slug.toLowerCase().trim();
};

// NEW: Test slug against known video path
export const testSlugAgainstVideoPath = (title: string, expectedPath: string) => {
  const generatedSlug = createSlug(title);
  console.log(`🧪 Testing: "${title}"`);
  console.log(`🔧 Generated slug: "${generatedSlug}"`);
  console.log(`📁 Expected path: "${expectedPath}"`);
  console.log(`✅ Match: ${expectedPath.includes(generatedSlug)}`);
  return expectedPath.includes(generatedSlug);
};

// Test function to verify slug generation
export const testSlugGeneration = () => {
  const testCases = [
    { title: 'Phàm Nhân Tu Tiên', expectedSlug: 'pham-nhan-tu-tien' },
    { title: 'Đấu Phá Thương Khung', expectedSlug: 'dau-pha-thuong-khung' },
    { title: 'Đấu La Đại Lục', expectedSlug: 'dau-la-dai-luc' }
  ];

  console.log('🧪 Testing slug generation:');
  testCases.forEach(({ title, expectedSlug }) => {
    const generatedSlug = createSlug(title);
    const match = generatedSlug === expectedSlug;
    console.log(`"${title}" → "${generatedSlug}" ${match ? '✅' : '❌ Expected: ' + expectedSlug}`);
  });
};

// NEW: Debug function to check slug consistency
export const debugSlugMapping = (seriesList: any[]) => {
  console.log('🔍 Debug: Series slug mapping');
  seriesList.forEach((series, index) => {
    const slug = createSlug(series.title);
    console.log(`${index + 1}. "${series.title}" → "${slug}" (ID: ${series.id})`);
  });
};
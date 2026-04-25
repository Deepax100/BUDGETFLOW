const CATEGORY_KEYWORDS = {
  'Food & Dining': ['restaurant', 'food', 'lunch', 'dinner', 'breakfast', 'coffee', 'cafe', 'pizza', 'burger', 'grocery', 'groceries', 'meal', 'snack', 'eat', 'drink', 'bar', 'pub', 'uber eats', 'doordash', 'grubhub'],
  'Transportation': ['uber', 'lyft', 'gas', 'fuel', 'parking', 'bus', 'metro', 'train', 'taxi', 'car', 'toll', 'transit', 'flight', 'airline'],
  'Shopping': ['amazon', 'walmart', 'target', 'clothes', 'shoes', 'mall', 'store', 'purchase', 'buy', 'ebay', 'shop', 'retail'],
  'Entertainment': ['netflix', 'spotify', 'movie', 'game', 'concert', 'theater', 'hulu', 'disney', 'youtube', 'twitch', 'music', 'ticket'],
  'Bills & Utilities': ['electric', 'water', 'internet', 'phone', 'bill', 'utility', 'cable', 'insurance', 'subscription', 'wifi', 'rent', 'mortgage'],
  'Healthcare': ['doctor', 'hospital', 'pharmacy', 'medicine', 'health', 'dental', 'medical', 'clinic', 'prescription', 'therapy'],
  'Education': ['book', 'course', 'tuition', 'school', 'university', 'class', 'training', 'udemy', 'coursera', 'learn'],
  'Personal Care': ['salon', 'haircut', 'spa', 'gym', 'fitness', 'beauty', 'cosmetic', 'skincare'],
  'Travel': ['hotel', 'airbnb', 'booking', 'vacation', 'trip', 'resort', 'travel'],
  'Salary': ['salary', 'paycheck', 'wage', 'income', 'pay'],
  'Freelance': ['freelance', 'contract', 'gig', 'project', 'client'],
  'Investment': ['dividend', 'interest', 'investment', 'stock', 'return', 'crypto', 'bond'],
  'Gift': ['gift', 'present', 'donation', 'charity'],
  'Other': []
};

const suggestCategory = (description, type) => {
  if (!description) return type === 'income' ? 'Salary' : 'Other';
  const lower = description.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => lower.includes(keyword))) {
      return category;
    }
  }
  return type === 'income' ? 'Salary' : 'Other';
};

const EXPENSE_CATEGORIES = ['Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Bills & Utilities', 'Healthcare', 'Education', 'Personal Care', 'Travel', 'Subscriptions', 'Payment', 'Rent', 'EMI', 'Transfer', 'Gift', 'Other'];
const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Rental Income', 'Business', 'Gift', 'Transfer', 'Other'];

module.exports = { suggestCategory, EXPENSE_CATEGORIES, INCOME_CATEGORIES, CATEGORY_KEYWORDS };

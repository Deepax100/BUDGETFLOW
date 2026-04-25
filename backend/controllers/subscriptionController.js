const Subscription = require('../models/Subscription');
const Transaction = require('../models/Transaction');

// Known subscription keywords to help auto-detect from transactions
const SUBSCRIPTION_KEYWORDS = [
  // ─── Streaming (Video) ───
  { keyword: 'netflix', name: 'Netflix', icon: '🎬', category: 'streaming', color: '#E50914' },
  { keyword: 'prime video', name: 'Amazon Prime', icon: '📦', category: 'streaming', color: '#FF9900' },
  { keyword: 'amazon prime', name: 'Amazon Prime', icon: '📦', category: 'streaming', color: '#FF9900' },
  { keyword: 'disney', name: 'Disney+', icon: '🏰', category: 'streaming', color: '#0063E5' },
  { keyword: 'hbo', name: 'HBO Max', icon: '🎭', category: 'streaming', color: '#6B2BD6' },
  { keyword: 'hulu', name: 'Hulu', icon: '📺', category: 'streaming', color: '#1CE783' },
  { keyword: 'apple tv', name: 'Apple TV+', icon: '', category: 'streaming', color: '#000000' },
  { keyword: 'peacock', name: 'Peacock', icon: '🦚', category: 'streaming', color: '#000000' },
  { keyword: 'paramount', name: 'Paramount+', icon: '⛰️', category: 'streaming', color: '#0064FF' },
  { keyword: 'crunchyroll', name: 'Crunchyroll', icon: '🦊', category: 'streaming', color: '#F47521' },
  { keyword: 'fubo', name: 'FuboTV', icon: '⚽', category: 'streaming', color: '#FF3F00' },
  { keyword: 'starz', name: 'Starz', icon: '⭐', category: 'streaming', color: '#000000' },
  { keyword: 'showtime', name: 'Showtime', icon: '🎬', category: 'streaming', color: '#FF0000' },
  { keyword: 'discovery', name: 'Discovery+', icon: '🌍', category: 'streaming', color: '#112233' },

  // ─── Music & Audio ───
  { keyword: 'spotify', name: 'Spotify', icon: '🎵', category: 'music', color: '#1DB954' },
  { keyword: 'youtube premium', name: 'YouTube Premium', icon: '▶️', category: 'streaming', color: '#FF0000' },
  { keyword: 'apple music', name: 'Apple Music', icon: '🍎', category: 'music', color: '#FC3C44' },
  { keyword: 'pandora', name: 'Pandora', icon: '📻', category: 'music', color: '#005483' },
  { keyword: 'tidal', name: 'Tidal', icon: '🌊', category: 'music', color: '#000000' },
  { keyword: 'soundcloud', name: 'SoundCloud', icon: '☁️', category: 'music', color: '#FF5500' },
  { keyword: 'siriusxm', name: 'SiriusXM', icon: '📡', category: 'music', color: '#0000EB' },
  { keyword: 'audible', name: 'Audible', icon: '🎧', category: 'music', color: '#F3A847' },

  // ─── Productivity & Software ───
  { keyword: 'microsoft', name: 'Microsoft 365', icon: '💼', category: 'productivity', color: '#D83B01' },
  { keyword: 'office 365', name: 'Microsoft 365', icon: '💼', category: 'productivity', color: '#D83B01' },
  { keyword: 'adobe', name: 'Adobe Creative Cloud', icon: '🎨', category: 'productivity', color: '#FF0000' },
  { keyword: 'github', name: 'GitHub Pro', icon: '🐙', category: 'productivity', color: '#333333' },
  { keyword: 'notion', name: 'Notion', icon: '📝', category: 'productivity', color: '#000000' },
  { keyword: 'figma', name: 'Figma', icon: '🎯', category: 'productivity', color: '#F24E1E' },
  { keyword: 'slack', name: 'Slack', icon: '💬', category: 'productivity', color: '#4A154B' },
  { keyword: 'zoom', name: 'Zoom', icon: '📹', category: 'productivity', color: '#2D8CFF' },
  { keyword: 'canva', name: 'Canva Pro', icon: '🖌️', category: 'productivity', color: '#00C4CC' },
  { keyword: 'evernote', name: 'Evernote', icon: '🐘', category: 'productivity', color: '#00A82D' },
  { keyword: 'trello', name: 'Trello', icon: '📋', category: 'productivity', color: '#0079BF' },
  { keyword: 'asana', name: 'Asana', icon: '✅', category: 'productivity', color: '#F06A6A' },
  { keyword: 'grammarly', name: 'Grammarly', icon: '✍️', category: 'productivity', color: '#15C39A' },
  { keyword: 'chatgpt', name: 'ChatGPT Plus', icon: '🤖', category: 'productivity', color: '#10A37F' },
  { keyword: 'openai', name: 'OpenAI API', icon: '⚙️', category: 'productivity', color: '#000000' },
  { keyword: 'midjourney', name: 'Midjourney', icon: '⛵', category: 'productivity', color: '#000000' },
  { keyword: 'copilot', name: 'GitHub Copilot', icon: '✈️', category: 'productivity', color: '#333333' },

  // ─── Cloud & Web Services ───
  { keyword: 'dropbox', name: 'Dropbox', icon: '📁', category: 'cloud', color: '#0061FF' },
  { keyword: 'google one', name: 'Google One', icon: '☁️', category: 'cloud', color: '#4285F4' },
  { keyword: 'icloud', name: 'iCloud', icon: '☁️', category: 'cloud', color: '#007AFF' },
  { keyword: 'aws', name: 'AWS Cloud', icon: '☁️', category: 'cloud', color: '#FF9900' },
  { keyword: 'amazon web services', name: 'AWS', icon: '☁️', category: 'cloud', color: '#FF9900' },
  { keyword: 'digitalocean', name: 'DigitalOcean', icon: '💧', category: 'cloud', color: '#0080FF' },
  { keyword: 'heroku', name: 'Heroku', icon: '🏢', category: 'cloud', color: '#430098' },
  { keyword: 'vercel', name: 'Vercel', icon: '▲', category: 'cloud', color: '#000000' },
  { keyword: 'netlify', name: 'Netlify', icon: '🌐', category: 'cloud', color: '#00C7B7' },
  { keyword: 'cloudflare', name: 'Cloudflare', icon: '🛡️', category: 'cloud', color: '#F38020' },
  { keyword: 'nordvpn', name: 'NordVPN', icon: '🔐', category: 'cloud', color: '#000000' },
  { keyword: 'expressvpn', name: 'ExpressVPN', icon: '🔒', category: 'cloud', color: '#DA251D' },
  { keyword: '1password', name: '1Password', icon: '🔑', category: 'productivity', color: '#333333' },

  // ─── Gaming ───
  { keyword: 'xbox', name: 'Xbox Game Pass', icon: '🎮', category: 'gaming', color: '#107C10' },
  { keyword: 'playstation', name: 'PlayStation Plus', icon: '🕹️', category: 'gaming', color: '#003791' },
  { keyword: 'nintendo', name: 'Nintendo Switch Online', icon: '🍄', category: 'gaming', color: '#E60012' },
  { keyword: 'ea play', name: 'EA Play', icon: '⚽', category: 'gaming', color: '#FF4747' },
  { keyword: 'discord', name: 'Discord Nitro', icon: '🎧', category: 'gaming', color: '#5865F2' },
  { keyword: 'twitch', name: 'Twitch Sub', icon: '👾', category: 'gaming', color: '#9146FF' },
  { keyword: 'world of warcraft', name: 'World of Warcraft', icon: '⚔️', category: 'gaming', color: '#F8B700' },
  { keyword: 'geforce now', name: 'GeForce NOW', icon: '☁️', category: 'gaming', color: '#76B900' },

  // ─── Education & Reading ───
  { keyword: 'duolingo', name: 'Duolingo', icon: '🦉', category: 'education', color: '#58CC02' },
  { keyword: 'coursera', name: 'Coursera', icon: '📚', category: 'education', color: '#0056D2' },
  { keyword: 'udemy', name: 'Udemy', icon: '🎓', category: 'education', color: '#A435F0' },
  { keyword: 'skillshare', name: 'Skillshare', icon: '🧠', category: 'education', color: '#002A3A' },
  { keyword: 'masterclass', name: 'MasterClass', icon: '🎟️', category: 'education', color: '#000000' },
  { keyword: 'codecademy', name: 'Codecademy', icon: '💻', category: 'education', color: '#1F2937' },
  { keyword: 'nytimes', name: 'NY Times', icon: '📰', category: 'news', color: '#121212' },
  { keyword: 'new york times', name: 'NY Times', icon: '📰', category: 'news', color: '#121212' },
  { keyword: 'washington post', name: 'Washington Post', icon: '🗞️', category: 'news', color: '#000000' },
  { keyword: 'wsj', name: 'Wall Street Journal', icon: '📈', category: 'news', color: '#000000' },
  { keyword: 'medium', name: 'Medium', icon: '✍️', category: 'news', color: '#000000' },
  { keyword: 'patreon', name: 'Patreon', icon: '💖', category: 'other', color: '#FF424D' },

  // ─── Health, Fitness & Lifestyle ───
  { keyword: 'peloton', name: 'Peloton', icon: '🚴', category: 'fitness', color: '#DF1C2F' },
  { keyword: 'strava', name: 'Strava', icon: '🏃', category: 'fitness', color: '#FC4C02' },
  { keyword: 'myfitnesspal', name: 'MyFitnessPal', icon: '🥗', category: 'fitness', color: '#0066EE' },
  { keyword: 'calm', name: 'Calm', icon: '🧘', category: 'fitness', color: '#7AA3D4' },
  { keyword: 'headspace', name: 'Headspace', icon: '🧠', category: 'fitness', color: '#FF7A59' },
  { keyword: 'whoop', name: 'WHOOP', icon: '⌚', category: 'fitness', color: '#000000' },
  { keyword: 'planet fitness', name: 'Planet Fitness', icon: '🏋️', category: 'fitness', color: '#FFDE00' },
  { keyword: 'anytime fitness', name: 'Anytime Fitness', icon: '🏋️', category: 'fitness', color: '#5C2D91' },
  
  // ─── Delivery & E-Commerce ───
  { keyword: 'uber one', name: 'Uber One', icon: '🚗', category: 'other', color: '#000000' },
  { keyword: 'dashpass', name: 'DashPass', icon: '🍔', category: 'other', color: '#FF3008' },
  { keyword: 'doordash', name: 'DoorDash', icon: '🍔', category: 'other', color: '#FF3008' },
  { keyword: 'instacart', name: 'Instacart+', icon: '🥕', category: 'other', color: '#0AAD0A' },
  { keyword: 'grubhub', name: 'Grubhub+', icon: '🍕', category: 'other', color: '#FF8000' },
  { keyword: 'postmates', name: 'Postmates Unlimited', icon: '🚲', category: 'other', color: '#000000' },
  { keyword: 'shipt', name: 'Shipt', icon: '🛒', category: 'other', color: '#A020F0' },
  { keyword: 'hellofresh', name: 'HelloFresh', icon: '🥦', category: 'other', color: '#94C93D' },
  { keyword: 'blue apron', name: 'Blue Apron', icon: '🍳', category: 'other', color: '#002C73' },
  
  // ─── Telecom & Utilities ───
  { keyword: 't-mobile', name: 'T-Mobile', icon: '📱', category: 'other', color: '#E20074' },
  { keyword: 'verizon', name: 'Verizon', icon: '📱', category: 'other', color: '#CD040B' },
  { keyword: 'at&t', name: 'AT&T', icon: '📱', category: 'other', color: '#00A8E0' },
  { keyword: 'xfinity', name: 'Xfinity', icon: '🌐', category: 'other', color: '#000000' },
  { keyword: 'comcast', name: 'Comcast', icon: '🌐', category: 'other', color: '#000000' },
  { keyword: 'spectrum', name: 'Spectrum', icon: '🌐', category: 'other', color: '#0099D8' }
];

// @desc  Get all subscriptions
// @route GET /api/subscriptions
exports.getSubscriptions = async (req, res) => {
  try {
    const subs = await Subscription.find({ user: req.user._id, isActive: true }).sort({ nextBillingDate: 1 });

    // Compute stats
    const totalMonthly = subs.reduce((sum, s) => sum + s.monthlyCost, 0);
    const totalAnnual = +(totalMonthly * 12).toFixed(2);
    const underused = subs.filter((s) => s.usageThisMonth === 0).length;

    res.json({
      success: true,
      data: subs,
      stats: {
        totalMonthly: +totalMonthly.toFixed(2),
        totalAnnual,
        count: subs.length,
        underused,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Create subscription
// @route POST /api/subscriptions
exports.createSubscription = async (req, res) => {
  try {
    const payload = { ...req.body, user: req.user._id };
    if (!payload.startDate) delete payload.startDate;
    const sub = await Subscription.create(payload);
    res.status(201).json({ success: true, data: sub });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc  Update subscription
// @route PUT /api/subscriptions/:id
exports.updateSubscription = async (req, res) => {
  try {
    const sub = await Subscription.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });
    res.json({ success: true, data: sub });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc  Delete subscription
// @route DELETE /api/subscriptions/:id
exports.deleteSubscription = async (req, res) => {
  try {
    const sub = await Subscription.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });
    res.json({ success: true, message: 'Subscription deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Log a usage session
// @route POST /api/subscriptions/:id/log-usage
exports.logUsage = async (req, res) => {
  try {
    const sub = await Subscription.findOne({ _id: req.params.id, user: req.user._id });
    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });

    // Prevent double-log on same day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const alreadyLogged = sub.usageLogs.some((l) => {
      const d = new Date(l.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });

    if (alreadyLogged) {
      return res.status(200).json({ success: true, message: 'Already logged today', data: sub });
    }

    sub.usageLogs.push({ date: new Date(), note: req.body.note || '' });
    await sub.save();
    res.json({ success: true, data: sub });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Auto-detect subscriptions from transaction history
// @route GET /api/subscriptions/detect
exports.detectFromTransactions = async (req, res) => {
  try {
    // Get last 3 months of expense transactions
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const transactions = await Transaction.find({
      userId: req.user._id,
      type: 'expense',
      date: { $gte: threeMonthsAgo },
    }).select('description amount date');

    const existingSubs = await Subscription.find({ user: req.user._id }).select('name transactionKeyword');
    const existingKeywords = existingSubs.map((s) => s.transactionKeyword?.toLowerCase()).filter(Boolean);
    const existingNames = existingSubs.map((s) => s.name?.toLowerCase());

    const detected = [];

    for (const kw of SUBSCRIPTION_KEYWORDS) {
      // Skip if already added
      if (existingKeywords.includes(kw.keyword) || existingNames.includes(kw.name.toLowerCase())) continue;

      // Find matching transactions
      const matches = transactions.filter((t) =>
        t.description?.toLowerCase().includes(kw.keyword)
      );

      if (matches.length >= 1) {
        // Use the most recent amount
        const latest = matches.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        detected.push({
          ...kw,
          suggestedCost: latest.amount,
          matchCount: matches.length,
          lastSeen: latest.date,
        });
      }
    }

    res.json({ success: true, data: detected });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get usage history for a subscription
// @route GET /api/subscriptions/:id/usage
exports.getUsageHistory = async (req, res) => {
  try {
    const sub = await Subscription.findOne({ _id: req.params.id, user: req.user._id });
    if (!sub) return res.status(404).json({ success: false, message: 'Not found' });

    // Last 6 months broken down by month
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const month = d.getMonth();
      const count = sub.usageLogs.filter((l) => {
        const ld = new Date(l.date);
        return ld.getFullYear() === year && ld.getMonth() === month;
      }).length;
      months.push({
        label: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
        count,
      });
    }

    res.json({ success: true, data: months });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

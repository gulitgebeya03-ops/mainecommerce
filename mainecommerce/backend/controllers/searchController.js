const SearchHistory = require('../models/SearchHistory');

exports.addSearch = async (req, res) => {
  try {
    const { query, sessionId } = req.body;
    if (!query || !query.trim()) return res.status(400).json({ message: 'query is required' });

    const entry = await SearchHistory.create({
      query: query.trim(),
      userId: req.user?.id || null,
      sessionId: sessionId || null,
    });
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRecentSearches = async (req, res) => {
  try {
    const userId = req.user?.id;
    const sessionId = req.query.sessionId;
    const filter = userId ? { userId } : sessionId ? { sessionId } : {};
    const searches = await SearchHistory.find(filter).sort({ createdAt: -1 }).limit(10).select('query createdAt');
    res.json(searches.map((s) => s.query));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

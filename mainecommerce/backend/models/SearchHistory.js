const mongoose = require('mongoose');

const SearchHistorySchema = new mongoose.Schema({
  query: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  sessionId: { type: String, default: null },
}, { timestamps: true });

SearchHistorySchema.index({ userId: 1, createdAt: -1 });
SearchHistorySchema.index({ sessionId: 1, createdAt: -1 });

module.exports = mongoose.model('SearchHistory', SearchHistorySchema);

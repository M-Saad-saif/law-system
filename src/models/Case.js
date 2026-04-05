import mongoose from 'mongoose';

const proceedingSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  notes: { type: String, required: true },
  nextDate: { type: Date },
  addedBy: { type: String },
}, { timestamps: true });

const citationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  text: { type: String },
  documentUrl: { type: String },
}, { timestamps: true });

const accusedSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bailStatus: { type: String, enum: ['granted', 'refused', 'pending', 'not_applicable'], default: 'not_applicable' },
  bailAmount: { type: Number },
  bailApplicationDate: { type: Date },
  notes: { type: String },
});

const documentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String },
  size: { type: Number },
  uploadedAt: { type: Date, default: Date.now },
});

const noteSchema = new mongoose.Schema({
  content: { type: String, required: true },
  color: { type: String, default: '#fef3c7' },
  createdAt: { type: Date, default: Date.now },
});

const caseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    caseTitle: { type: String, required: true, trim: true },
    caseNumber: { type: String, trim: true },
    suitNo: { type: String, trim: true },
    courtType: {
      type: String,
      enum: ['District Court', 'High Court', 'Supreme Court', 'Tribunal', 'Sessions Court', 'Family Court', 'Labour Court', 'Anti-Corruption Court', 'Special Court', 'Other'],
      required: true,
    },
    courtName: { type: String, trim: true },
    phone: { type: String, trim: true },
    caseType: {
      type: String,
      enum: ['Civil', 'Criminal', 'Family', 'Corporate', 'Tax', 'Constitutional', 'Labour', 'Banking', 'Property', 'Other'],
      required: true,
    },
    counselFor: {
      type: String,
      enum: ['Plaintiff', 'Defendant', 'Appellant', 'Respondent', 'Petitioner', 'Accused', 'Other'],
      required: true,
    },
    oppositeCounsel: {
      name: { type: String, trim: true },
      contact: { type: String, trim: true },
    },
    provisions: [{ type: String, trim: true }],
    filingDate: { type: Date },
    nextHearingDate: { type: Date },
    nextProceedingDate: { type: Date },
    status: {
      type: String,
      enum: ['Active', 'Closed', 'Pending', 'Adjourned', 'Disposed'],
      default: 'Active',
    },
    judgeName: { type: String, trim: true },
    firNo: { type: String, trim: true },
    clientName: { type: String, trim: true },
    clientContact: { type: String, trim: true },
    proceedings: [proceedingSchema],
    citations: [citationSchema],
    accused: [accusedSchema],
    documents: [documentSchema],
    notes: [noteSchema],
  },
  { timestamps: true }
);

caseSchema.index({ userId: 1, status: 1 });
caseSchema.index({ userId: 1, nextHearingDate: 1 });
caseSchema.index({ userId: 1, nextProceedingDate: 1 });
caseSchema.index({ caseNumber: 1 });

export default mongoose.models.Case || mongoose.model('Case', caseSchema);

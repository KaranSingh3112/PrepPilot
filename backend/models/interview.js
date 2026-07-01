import mongoose, { Schema } from "mongoose";

const questionSchema = new Schema({
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        default: ""
    },
    score: {
        type: Number,
        default: null
    },
    feedback: {
        type: String,
        default: ''
    },
},{ _id: false })

const interviewSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true 
    },
    jobRole: {
        type: String,
        required: true
    },
    skills: [
        {type: String}
    ],
    resumeName: {type: String},
    qaList: { type: [questionSchema], default: [] },
    totalScore: {
        type: Number,
        default: null
    },
    recomendation: {
        type: String,
        enum: ['Strong Hire', 'Hire', 'Maybe', 'No Hire', null],
        default: null
    },
    strengths: [{type: String}],
    weakness: [{type: String}],
    suggestions: [{type: String}],
    detailesFeedback: {
        type: String,
        default: ''
    },
    completed: { type: Boolean, default: false }
},{timestamps: true})

// Index user for faster history queries
interviewSchema.index({ user: 1, createdAt: -1 });

const Interview = mongoose.model("Interview", interviewSchema);

export default Interview;

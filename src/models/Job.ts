import mongoose, { Schema, Document } from "mongoose";

export interface IJob extends Document {
    title: string;
    company: string;
    location: string;
    country: string;    // e.g. "US", "IN", "GB" — used for location-based filtering
    remote: boolean;
    description: string;
    applyUrl: string;
    role: string;       // normalized role bucket (e.g. "Frontend Developer")
    source: string;     // e.g. "jsearch"
    postedAt: Date;
    fetchedAt: Date;
}

const JobSchema = new Schema<IJob>(
    {
        title: { type: String, required: true },
        company: { type: String, required: true },
        location: { type: String, default: "" },
        country: { type: String, default: "", index: true },
        remote: { type: Boolean, default: false },
        description: { type: String, default: "" },
        applyUrl: { type: String, required: true, unique: true },
        role: { type: String, required: true, index: true },
        source: { type: String, default: "jsearch" },
        postedAt: { type: Date, default: Date.now },
        fetchedAt: { type: Date, default: Date.now },
    },
    { timestamps: false }
);

// TTL index — auto-delete jobs older than 3 days to keep the collection fresh
JobSchema.index({ fetchedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 3 });

if (mongoose.models.Job) {
    delete (mongoose.models as Record<string, unknown>)["Job"];
}

const Job = mongoose.model<IJob>("Job", JobSchema);
export default Job;

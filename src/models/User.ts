import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    password: string;
    skills: string[];
    role: string;
    experience: string;
    resumeUrl: string;
    bio: string;
    jobPreferences: {
        workMode: "remote" | "hybrid" | "onsite" | "any";
        preferredCountries: string[];  // empty = any country
        jobType: "full-time" | "contract" | "any";
    };
    // Gmail OAuth tokens (stored when user connects their Gmail)
    gmailAccessToken: string;
    gmailRefreshToken: string;
    gmailTokenExpiry: number;   // Unix ms timestamp
    // Auto-apply quota
    dailyAutoAppliesCount: number;
    lastAppliedDate: Date;
    lastAutoSentAt: Date;
    lastSyncedAt: Date;  // for inbox reply sync throttling
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            maxlength: [100, "Name cannot exceed 100 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
        },
        password: {
            type: String, // Optional for OAuth users
        },
        skills: { type: [String], default: [] },
        role: { type: String, default: "", trim: true },
        experience: { type: String, default: "", trim: true },
        resumeUrl: { type: String, default: "" },
        bio: { type: String, default: "", maxlength: [2000, "Bio cannot exceed 2000 characters"] },
        jobPreferences: {
            workMode: { type: String, enum: ["remote", "hybrid", "onsite", "any"], default: "any" },
            preferredCountries: { type: [String], default: [] },
            jobType: { type: String, enum: ["full-time", "contract", "any"], default: "any" },
        },
        gmailAccessToken: { type: String, default: "" },
        gmailRefreshToken: { type: String, default: "" },
        gmailTokenExpiry: { type: Number, default: 0 },
        dailyAutoAppliesCount: { type: Number, default: 0 },
        lastAppliedDate: { type: Date, default: null },
        lastAutoSentAt: { type: Date, default: null },
        lastSyncedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

// Delete cached model to always re-register with the current schema.
// This avoids the hot-reload issue where Mongoose silently keeps the old
// schema (without gmailRefreshToken etc.) and ignores writes to new fields.
if (mongoose.models.User) {
    delete (mongoose.models as Record<string, unknown>)["User"];
}

const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default User;

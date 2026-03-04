import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRecruiter {
    email: string;
    name: string;
}

export interface IOutreach extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    companyName: string;
    recruiters: IRecruiter[];
    jobTitle: string;
    jobLink: string;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}

const RecruiterSchema = new Schema<IRecruiter>(
    {
        email: {
            type: String,
            required: [true, "Recruiter email is required"],
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
        },
        name: {
            type: String,
            default: "",
            trim: true,
        },
    },
    { _id: false }
);

const OutreachSchema = new Schema<IOutreach>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        companyName: {
            type: String,
            required: [true, "Company name is required"],
            trim: true,
        },
        recruiters: {
            type: [RecruiterSchema],
            required: [true, "At least one recruiter is required"],
            validate: {
                validator: (v: IRecruiter[]) => v.length > 0,
                message: "At least one recruiter email is required",
            },
        },
        jobTitle: {
            type: String,
            required: [true, "Job title is required"],
            trim: true,
        },
        jobLink: {
            type: String,
            default: "",
            trim: true,
        },
        notes: {
            type: String,
            default: "",
            maxlength: [500, "Notes cannot exceed 500 characters"],
        },
    },
    { timestamps: true }
);

const Outreach: Model<IOutreach> =
    mongoose.models.Outreach || mongoose.model<IOutreach>("Outreach", OutreachSchema);

export default Outreach;

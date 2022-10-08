"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const PatientSymptomSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Types.ObjectId,
        ref: 'users',
    },
    patient: new mongoose_1.Schema({
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        dob: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
    }, { _id: false }),
    selectedSymptoms: [
        new mongoose_1.Schema({
            symptom: {
                type: mongoose_1.Types.ObjectId,
                ref: 'symptoms',
            },
            selectedOptions: [{
                    type: String,
                    required: true,
                }],
            details: String,
        }, { _id: false }),
    ],
}, { timestamps: true });
exports.default = PatientSymptomSchema;

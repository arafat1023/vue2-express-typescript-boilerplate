"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const SymptomSchema = new mongoose_1.Schema({
    order: {
        type: Number,
        required: true,
    },
    question: {
        type: String,
        required: true,
    },
    options: [{
            type: String,
            required: true,
        }],
}, { timestamps: true });
exports.default = SymptomSchema;

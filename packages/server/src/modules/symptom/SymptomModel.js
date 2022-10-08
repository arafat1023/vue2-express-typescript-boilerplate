"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const SymptomSchema_1 = __importDefault(require("./SymptomSchema"));
class SymptomModel {
    static async createSymptom(symptomData) {
        const symptom = await SymptomModel.BaseModel.create(symptomData);
        return symptom.toObject();
    }
    static async getSymptoms() {
        const symptoms = await SymptomModel.BaseModel.find({})
            .sort({ order: -1 })
            .lean()
            .exec();
        return symptoms;
    }
}
exports.default = SymptomModel;
SymptomModel.BaseModel = mongoose_1.model('symptoms', SymptomSchema_1.default);

"use strict";
/*
 * Ankur Mursalin
 *
 * https://encryptioner.github.io/
 *
 * Created on Mon Jul 18 2022
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const PatientSymptomSchema_1 = __importDefault(require("./PatientSymptomSchema"));
const helpers_1 = require("../../helpers");
class PatientSymptomModel {
    static async createPatientSymptom(symptomData) {
        let patientSymptom = await PatientSymptomModel.BaseModel
            .create(symptomData);
        patientSymptom = await patientSymptom.populate({
            path: 'selectedSymptoms',
            populate: [
                { path: 'symptom', select: ['_id', 'order', 'question', 'options'] },
            ],
        });
        return patientSymptom.toObject();
    }
    static async updatePatientSymptomById(id, symptomData) {
        const patientSymptom = await PatientSymptomModel
            .BaseModel
            .findByIdAndUpdate(id, symptomData, { new: true })
            .populate({
            path: 'selectedSymptoms',
            populate: [
                { path: 'symptom', select: ['_id', 'order', 'question', 'options'] },
            ],
        }).lean().exec();
        return patientSymptom;
    }
    static async getPatientSymptoms(filterData, populateUser = false, populateSelectedSymptoms = false) {
        const cursor = PatientSymptomModel.BaseModel
            .find(filterData)
            .sort({ createdAt: -1 });
        if (populateUser) {
            cursor.populate({ path: 'user', select: helpers_1.DEFAULT_USER_PROJECTION_FIELDS });
        }
        if (populateSelectedSymptoms) {
            cursor.populate({
                path: 'selectedSymptoms',
                populate: [
                    { path: 'symptom', select: ['_id', 'order', 'question', 'options'] },
                ],
            });
        }
        const patientSymptoms = await cursor.lean().exec();
        return patientSymptoms;
    }
    static async deletePatientSymptomById(id) {
        const deletedPatientSymptom = await PatientSymptomModel
            .BaseModel
            .deleteOne({ _id: id });
        return !!deletedPatientSymptom.deletedCount;
    }
}
exports.default = PatientSymptomModel;
PatientSymptomModel.BaseModel = mongoose_1.model('patient-symptoms', PatientSymptomSchema_1.default);

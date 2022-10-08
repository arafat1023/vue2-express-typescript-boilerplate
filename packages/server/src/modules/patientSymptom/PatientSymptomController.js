"use strict";
/* eslint-disable jest/require-hook */
/*
 * Ankur Mursalin
 *
 * https://encryptioner.github.io/
 *
 * Created on Mon Jul 18 2022
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const express_1 = require("express");
const dto_1 = require("dto");
const PatientSymptomModel_1 = __importDefault(require("./PatientSymptomModel"));
const helpers_1 = require("../../helpers");
const router = express_1.Router();
router.get('/', getPatientSymptoms);
router.post('/', createPatientSymptom);
router.put('/:id', updatePatientSymptomById);
router.delete('/:id', deletePatientSymptomById);
exports.default = router;
async function getPatientSymptoms(req, res) {
    try {
        const isPatient = req.user?.role === 'patient';
        const userId = req.user?._id;
        const patientSymptoms = await PatientSymptomModel_1.default.getPatientSymptoms({
            ...(isPatient && {
                user: userId,
            }),
        }, !isPatient, true);
        res.json({ patientSymptoms });
    }
    catch (e) {
        helpers_1.sendErrorResponse(res, e);
    }
}
async function createPatientSymptom(req, res) {
    try {
        const isPatient = req.user?.role === 'patient';
        const userId = req.user?._id;
        if (!isPatient) {
            throw new helpers_1.AuthorizationError('Role needs to be patient');
        }
        class TransformMutatePatientSymptomDto extends dto_1.MutatePatientSymptomDto {
        }
        __decorate([
            class_transformer_1.Type(() => dto_1.SelectedSymptomDto)
        ], TransformMutatePatientSymptomDto.prototype, "selectedSymptoms", void 0);
        __decorate([
            class_transformer_1.Type(() => dto_1.PatientDto)
        ], TransformMutatePatientSymptomDto.prototype, "patient", void 0);
        const payload = class_transformer_1.plainToClass(TransformMutatePatientSymptomDto, req.body);
        await class_validator_1.validateOrReject(payload, {
            whitelist: true,
            forbidNonWhitelisted: true,
            forbidUnknownValues: true,
        });
        const patientSymptom = await PatientSymptomModel_1.default.createPatientSymptom({
            user: userId,
            ...payload,
        });
        res.status(201);
        res.json({ patientSymptom });
    }
    catch (e) {
        helpers_1.sendErrorResponse(res, e);
    }
}
async function updatePatientSymptomById(req, res) {
    try {
        const isPatient = req.user?.role === 'patient';
        const userId = req.user?._id;
        if (!isPatient) {
            throw new helpers_1.AuthorizationError('Role needs to be patient');
        }
        class TransformMutatePatientSymptomDto extends dto_1.MutatePatientSymptomDto {
        }
        __decorate([
            class_transformer_1.Type(() => dto_1.SelectedSymptomDto)
        ], TransformMutatePatientSymptomDto.prototype, "selectedSymptoms", void 0);
        __decorate([
            class_transformer_1.Type(() => dto_1.PatientDto)
        ], TransformMutatePatientSymptomDto.prototype, "patient", void 0);
        const payload = class_transformer_1.plainToClass(TransformMutatePatientSymptomDto, req.body);
        await class_validator_1.validateOrReject(payload, {
            whitelist: true,
            forbidNonWhitelisted: true,
            forbidUnknownValues: true,
        });
        const patientSymptom = await PatientSymptomModel_1.default.updatePatientSymptomById(req.params.id, {
            user: userId,
            ...payload,
        });
        if (!patientSymptom) {
            throw new helpers_1.NotFoundError();
        }
        res.json({ patientSymptom });
    }
    catch (e) {
        helpers_1.sendErrorResponse(res, e);
    }
}
async function deletePatientSymptomById(req, res) {
    try {
        const isPatient = req.user?.role === 'patient';
        if (!isPatient) {
            throw new helpers_1.AuthorizationError('Role needs to be patient');
        }
        const isDeleted = await PatientSymptomModel_1.default.deletePatientSymptomById(req.params.id);
        if (!isDeleted) {
            throw new helpers_1.NotFoundError();
        }
        res.sendStatus(200);
    }
    catch (e) {
        helpers_1.sendErrorResponse(res, e);
    }
}

"use strict";
/* eslint-disable jest/require-hook */
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
const express_1 = require("express");
const SymptomModel_1 = __importDefault(require("./SymptomModel"));
const helpers_1 = require("../../helpers");
const router = express_1.Router();
router.get('/', getSymptoms);
async function getSymptoms(req, res) {
    try {
        const symptoms = await SymptomModel_1.default.getSymptoms();
        res.json({ symptoms });
    }
    catch (e) {
        helpers_1.sendErrorResponse(res, e);
    }
}
exports.default = router;

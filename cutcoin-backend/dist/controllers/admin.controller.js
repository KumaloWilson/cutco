"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const admin_service_1 = require("../services/admin.service");
class AdminController {
    constructor() {
        this.adminService = new admin_service_1.AdminService();
        this.login = async (req, res, next) => {
            try {
                const result = await this.adminService.login(req.body);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.createAdmin = async (req, res, next) => {
            try {
                if (!req.admin) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const result = await this.adminService.createAdmin(req.body);
                res.status(201).json(result);
                return;
            }
            catch (error) {
                next(error);
            }
        };
        this.getAdminProfile = async (req, res, next) => {
            try {
                if (!req.admin || !req.admin.id) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const adminId = req.admin.id;
                const result = await this.adminService.getAdminProfile(adminId);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.updateAdminProfile = async (req, res, next) => {
            try {
                if (!req.admin || !req.admin.id) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const adminId = req.admin.id;
                const result = await this.adminService.updateAdminProfile(adminId, req.body);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.getAllUsers = async (req, res, next) => {
            try {
                const result = await this.adminService.getAllUsers(req.query);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.getUserDetails = async (req, res, next) => {
            try {
                const userId = Number(req.params.userId);
                const result = await this.adminService.getUserDetails(userId);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.updateUserStatus = async (req, res, next) => {
            try {
                const userId = Number(req.params.userId);
                const result = await this.adminService.updateUserStatus(userId, req.body);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.getAllMerchants = async (req, res, next) => {
            try {
                const result = await this.adminService.getAllMerchants(req.query);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.getMerchantDetails = async (req, res, next) => {
            try {
                const merchantId = Number(req.params.merchantId);
                const result = await this.adminService.getMerchantDetails(merchantId);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.updateMerchantStatus = async (req, res, next) => {
            try {
                const merchantId = Number(req.params.merchantId);
                const result = await this.adminService.updateMerchantStatus(merchantId, req.body);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.getSystemStats = async (req, res, next) => {
            try {
                const result = await this.adminService.getSystemStats();
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.getSystemConfig = async (req, res, next) => {
            try {
                const result = await this.adminService.getSystemConfig();
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.updateSystemConfig = async (req, res, next) => {
            try {
                const result = await this.adminService.updateSystemConfig(req.body);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.getAuditLogs = async (req, res, next) => {
            try {
                const result = await this.adminService.getAuditLogs(req.query);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.AdminController = AdminController;
//# sourceMappingURL=admin.controller.js.map
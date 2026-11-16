"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapMatrixConflict = mapMatrixConflict;
const common_1 = require("@nestjs/common");
function mapMatrixConflict(error) {
    if (error?.code === '23505' && String(error?.constraint || error?.detail || '').toLowerCase().includes('matrix')) {
        throw new common_1.ConflictException('La empresa ya tiene una sucursal matriz. Una empresa solo puede tener una.');
    }
    throw error;
}
//# sourceMappingURL=branch-matrix.util.js.map
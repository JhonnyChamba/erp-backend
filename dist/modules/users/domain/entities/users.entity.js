"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Users = void 0;
class Users {
    id;
    num_document;
    name_user;
    last_name_user;
    email;
    password;
    companyId;
    developer;
    multi_company;
    enabled;
    deleted;
    createdAt;
    theme_color;
    super_admin;
    companyIds;
    roleId;
    roleName;
    companyRoles;
    birth_date;
    photo_url;
    constructor(id, num_document, name_user, last_name_user, email, password, companyId, developer, multi_company, enabled, deleted, createdAt, theme_color = 'Blue_Theme', super_admin = false, companyIds = [], roleId, roleName, companyRoles = [], birth_date = null, photo_url = null) {
        this.id = id;
        this.num_document = num_document;
        this.name_user = name_user;
        this.last_name_user = last_name_user;
        this.email = email;
        this.password = password;
        this.companyId = companyId;
        this.developer = developer;
        this.multi_company = multi_company;
        this.enabled = enabled;
        this.deleted = deleted;
        this.createdAt = createdAt;
        this.theme_color = theme_color;
        this.super_admin = super_admin;
        this.companyIds = companyIds;
        this.roleId = roleId;
        this.roleName = roleName;
        this.companyRoles = companyRoles;
        this.birth_date = birth_date;
        this.photo_url = photo_url;
    }
}
exports.Users = Users;
//# sourceMappingURL=users.entity.js.map
export declare class Module {
    readonly id: number | null;
    code: string;
    desc_icon: string;
    description: string;
    enabled: boolean;
    readonly createdAt?: Date;
    readonly createdById?: number;
    constructor(id: number | null, code: string, desc_icon: string, description: string, enabled: boolean, createdAt?: Date, createdById?: number);
}

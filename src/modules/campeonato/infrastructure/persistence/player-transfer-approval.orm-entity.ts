import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PlayerTransferOrmEntity } from './player-transfer.orm-entity';
import { TransferApprovalRole, TransferApprovalStatus } from '../../common/enum/campeonato.enum';

@Entity('tab_campeonato_player_transfer_approvals')
export class PlayerTransferApprovalOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'company_id', type: 'int', nullable: true })
  companyId: number;

  @Column({ name: 'transfer_id', type: 'int' })
  transferId: number;

  @ManyToOne(() => PlayerTransferOrmEntity, (t) => t.approvals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'transfer_id' })
  transfer: PlayerTransferOrmEntity;

  @Column({ type: 'varchar', length: 50 })
  role: TransferApprovalRole;

  @Column({ name: 'approver_user_id', type: 'int', nullable: true })
  approverUserId: number;

  @Column({ name: 'approver_name', type: 'varchar', length: 200, nullable: true })
  approverName: string;

  @Column({ type: 'varchar', length: 50, default: TransferApprovalStatus.PENDING })
  status: TransferApprovalStatus;

  @Column({ name: 'action_date', type: 'timestamp', nullable: true })
  actionDate: Date;

  @Column({ type: 'text', nullable: true })
  comments: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

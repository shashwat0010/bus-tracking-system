import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Route } from './Route';

@Entity('trips')
export class Trip {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Route, (route) => route.id)
    route!: Route;

    @Column()
    routeId!: string;

    @Column()
    busId!: string;

    @Column({ type: 'timestamp', nullable: true })
    startTime!: Date;

    @Column({ type: 'timestamp', nullable: true })
    endTime!: Date;

    @Column({ default: 'scheduled' }) // scheduled, active, completed
    status!: string;

    @CreateDateColumn()
    created_at!: Date;
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('routes')
export class Route {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    name!: string;

    @Column({ nullable: true })
    description!: string;

    @Column({ default: '#000000' })
    color!: string;

    @Column({
        type: 'geometry',
        spatialFeatureType: 'LineString',
        srid: 4326,
        nullable: true
    })
    path: any; // GeoJSON LineString

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
